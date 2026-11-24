"""Safety harness for an isolated, disposable PostgreSQL 18 cluster.

Normal exceptions and ``KeyboardInterrupt`` are handled by the test suite and
trigger a guarded shutdown. A hard process kill or power loss cannot execute
Python cleanup; in that case the marked temporary directory is intentionally
left in place for manual inspection instead of being deleted speculatively.
"""

from __future__ import annotations

import atexit
import os
import re
import secrets
import socket
import stat
import subprocess
import sys
import tempfile
import time
import uuid
from ipaddress import IPv4Address, ip_address
from pathlib import Path

import psycopg
from psycopg import sql
from sqlalchemy.engine import URL, make_url


RUN_GUARD_ENV = "PRACTICE_TRACKER_INTEGRATION_RUN"
RUN_GUARD_VALUE = "isolated-postgres-only"
PG_BIN_ENV = "PRACTICE_TRACKER_PG_BIN"
ROOT_PREFIX = "practice-tracker-it-"
DATABASE_PREFIX = "practice_tracker_it_"
LOOPBACK_HOST = "127.0.0.1"
LOOPBACK_ADDRESS = IPv4Address(LOOPBACK_HOST)
FORBIDDEN_PORTS = {5432}
POSTGRES_MAJOR_VERSION = 18
LOCK_TIMEOUT = "8s"
STATEMENT_TIMEOUT = "20s"
IDLE_TRANSACTION_TIMEOUT = "20s"
CONNECT_TIMEOUT_SECONDS = 5


class SafetyError(RuntimeError):
    """Raised when the integration environment cannot be proven isolated."""


class HarnessCommandError(SafetyError):
    """A sanitized subprocess failure tied to a harness lifecycle stage."""

    def __init__(
        self,
        *,
        stage: str,
        command_name: str,
        returncode: int | None,
        detail: str,
    ) -> None:
        self.stage = stage
        self.command_name = command_name
        self.returncode = returncode
        return_code_text = str(returncode) if returncode is not None else "not-available"
        super().__init__(
            f"stage={stage}; command={command_name}; return_code={return_code_text}; "
            f"detail={detail}"
        )


class EphemeralPostgresHarness:
    def __init__(self, project_root: Path) -> None:
        self.project_root = project_root.resolve()
        self.run_id = uuid.uuid4().hex
        self.temp_root = Path(tempfile.gettempdir()).resolve()
        self.root_dir: Path | None = None
        self.data_dir: Path | None = None
        self.runtime_dir: Path | None = None
        self.log_file: Path | None = None
        self.marker_file: Path | None = None
        self.pg_bin: Path | None = None
        self.port: int | None = None
        self.database_name = f"{DATABASE_PREFIX}{self.run_id}"
        self.username = "practice_tracker_it_admin"
        self._password = secrets.token_urlsafe(32)
        self._postmaster_pid: int | None = None
        self._system_identifier: str | None = None
        self._server_may_be_running = False
        self._started = False
        self._migrated = False
        self._original_cwd = Path.cwd()
        self._saved_environment: dict[str, str | None] = {}
        self._project_path_inserted = False
        self._commands: dict[str, str] = {}
        self._atexit_registered = False
        self._stage = "not-started"
        self._root_identity: tuple[int, int] | None = None
        self._marker_created = False
        self._cleanup_in_progress = False
        self._cleanup_complete = False

    @property
    def connection_options(self) -> str:
        return (
            f"-c lock_timeout={LOCK_TIMEOUT} "
            f"-c statement_timeout={STATEMENT_TIMEOUT} "
            f"-c idle_in_transaction_session_timeout={IDLE_TRANSACTION_TIMEOUT}"
        )

    @property
    def database_url(self) -> str:
        if self.port is None:
            raise SafetyError("Test PostgreSQL port is not initialized")
        return URL.create(
            drivername="postgresql+psycopg",
            username=self.username,
            password=self._password,
            host=LOOPBACK_HOST,
            port=self.port,
            database=self.database_name,
            query={
                "connect_timeout": str(CONNECT_TIMEOUT_SECONDS),
                "options": self.connection_options,
            },
        ).render_as_string(hide_password=False)

    def safe_diagnostics(self) -> str:
        root = str(self.root_dir) if self.root_dir is not None else "not-created"
        pid = str(self._postmaster_pid) if self._postmaster_pid is not None else "unknown"
        port = str(self.port) if self.port is not None else "unknown"
        return (
            f"run_id={self.run_id}; root={root}; pid={pid}; port={port}; "
            f"database={self.database_name}"
        )

    def redact_diagnostic(self, value: object) -> str:
        """Return diagnostic text with credentials and connection URLs removed."""
        return self._redact_sensitive_text(str(value))

    def exception_diagnostic(
        self,
        exc: BaseException,
        *,
        stage: str | None = None,
    ) -> str:
        return_code = getattr(exc, "returncode", None)
        return_code_text = str(return_code) if return_code is not None else "not-applicable"
        return (
            f"stage={stage or self._stage}; exception={type(exc).__name__}; "
            f"return_code={return_code_text}; "
            f"message={self._redact_sensitive_text(str(exc))}"
        )

    def start(self) -> None:
        self._assert_explicit_run_guard()
        self._assert_application_not_imported()
        if not self._atexit_registered:
            atexit.register(self._atexit_close)
            self._atexit_registered = True

        try:
            self._stage = "discover-postgresql-binaries"
            self._discover_commands()
            self._stage = "create-temporary-cluster-directory"
            self._create_directories()
            self._stage = "allocate-loopback-port"
            self.port = self._choose_nonstandard_port()
            self._stage = "initdb"
            self._initialize_cluster()
            self._stage = "start-postgresql"
            self._start_cluster()
            self._stage = "create-test-database"
            self._create_database()
            self._stage = "configure-isolated-application"
            self._configure_isolated_application_environment()
            self._stage = "verify-test-database"
            self.verify_database_identity()
            self._stage = "ready"
        except BaseException as exc:
            failure_stage = self._stage
            cleanup_error: BaseException | None = None
            try:
                self.close()
            except BaseException as close_exc:
                cleanup_error = close_exc

            exc.add_note(
                "Integration harness failure: "
                + self.exception_diagnostic(exc, stage=failure_stage)
            )
            if cleanup_error is not None:
                exc.add_note(
                    "Integration cleanup failure (original exception preserved): "
                    + self.exception_diagnostic(cleanup_error, stage="startup-cleanup")
                    + f"; {self.safe_diagnostics()}"
                )
            raise

    def apply_migrations(self) -> None:
        self._stage = "pre-migration-identity-check"
        self._assert_cluster_identity(require_running=True)
        self.verify_database_identity()
        self._assert_isolated_working_directory()

        if "app.core.config" in sys.modules:
            raise SafetyError(
                "Application settings were imported before isolated Alembic configuration"
            )

        from alembic import command
        from alembic.config import Config

        original_url = self.database_url
        configparser_url = self._escape_configparser_value(original_url)
        previous_environment_url = os.environ.get("DATABASE_URL")
        config = Config()
        try:
            self._stage = "alembic-config"
            config.set_main_option(
                "script_location",
                str((self.project_root / "alembic").resolve()),
            )
            config.set_main_option("sqlalchemy.url", configparser_url)
            if config.get_main_option("sqlalchemy.url") != original_url:
                raise SafetyError("Alembic URL did not survive ConfigParser interpolation")

            # alembic/env.py sets sqlalchemy.url again from settings.DATABASE_URL.
            # It must receive the ConfigParser-escaped form and will decode it
            # back to the original URL before SQLAlchemy creates its engine.
            os.environ["DATABASE_URL"] = configparser_url
            self._stage = "alembic-migrations"
            command.upgrade(config, "head")
            if config.get_main_option("sqlalchemy.url") != original_url:
                raise SafetyError("Alembic env.py produced an unexpected database URL")
        except (KeyboardInterrupt, SystemExit):
            raise
        except ValueError as exc:
            message = self._redact_sensitive_text(str(exc))
            raise ValueError(
                f"stage={self._stage}; isolated Alembic configuration failed: {message}"
            ) from None
        except Exception as exc:
            message = self._redact_sensitive_text(str(exc))
            raise SafetyError(
                f"stage={self._stage}; isolated Alembic migration failed: {message}"
            ) from None
        finally:
            if previous_environment_url is None:
                os.environ.pop("DATABASE_URL", None)
            else:
                os.environ["DATABASE_URL"] = previous_environment_url
            settings_module = sys.modules.get("app.core.config")
            if settings_module is not None and hasattr(settings_module, "settings"):
                settings_module.settings.DATABASE_URL = original_url
        self._migrated = True
        self._stage = "post-migration-identity-check"
        self.verify_database_identity()

    @staticmethod
    def _escape_configparser_value(value: str) -> str:
        return value.replace("%", "%%")

    def verify_database_identity(self) -> None:
        self._verify_server_identity(expected_database=self.database_name)

    def verify_sqlalchemy_connection_identity(self, connection) -> None:
        """Verify the exact SQLAlchemy connection before destructive test SQL."""
        self._assert_cluster_identity(require_running=True)
        self.assert_safe_database_url(self.database_url)
        try:
            row = connection.exec_driver_sql(
                """
                SELECT
                    current_database(),
                    inet_server_addr(),
                    inet_server_port(),
                    current_setting('data_directory'),
                    (pg_control_system()).system_identifier::text,
                    pg_read_file('postmaster.pid', 0, 512)
                """
            ).one()
        except (KeyboardInterrupt, SystemExit):
            raise
        except Exception as exc:
            message = self._redact_sensitive_text(str(exc))
            raise SafetyError(
                f"Could not verify destructive-SQL connection identity: {message}"
            ) from None
        self._validate_server_identity(self.database_name, *row)

    def assert_safe_database_url(self, value: str) -> None:
        parsed = make_url(value)
        if parsed.drivername != "postgresql+psycopg":
            raise SafetyError("Integration tests require the psycopg PostgreSQL driver")
        self._assert_safe_connection_parameters(
            host=parsed.host,
            port=parsed.port,
            username=parsed.username,
            password=parsed.password,
        )
        if parsed.database != self.database_name:
            raise SafetyError("Integration database name does not match the harness database")
        if not parsed.database or not parsed.database.startswith(DATABASE_PREFIX):
            raise SafetyError("Integration database name has an unsafe prefix")
        if parsed.query.get("connect_timeout") != str(CONNECT_TIMEOUT_SECONDS):
            raise SafetyError("Integration database connect timeout is missing")
        if parsed.query.get("options") != self.connection_options:
            raise SafetyError("Integration database safety timeouts are missing")

    def close(self) -> None:
        if self._cleanup_complete:
            return
        if self._cleanup_in_progress:
            raise SafetyError("Integration cleanup is already in progress")

        self._cleanup_in_progress = True
        try:
            try:
                self._stage = "cleanup-stop-postgresql"
                if self._server_may_be_running or self._started:
                    self._stop_cluster_if_owned()
            finally:
                self._restore_process_state()

            self._stage = "cleanup-temporary-cluster"
            if self.root_dir is not None and self.root_dir.exists():
                self._remove_cluster_root_marker_last()
            self._cleanup_complete = True
            if self._atexit_registered:
                atexit.unregister(self._atexit_close)
                self._atexit_registered = False
        finally:
            self._cleanup_in_progress = False

    def _atexit_close(self) -> None:
        try:
            self.close()
        except BaseException as exc:
            message = self._redact_sensitive_text(str(exc))
            print(
                "Integration PostgreSQL cleanup was not safe; temporary state was "
                f"preserved. {message}. {self.safe_diagnostics()}",
                file=sys.stderr,
            )

    def _verify_server_identity(self, *, expected_database: str) -> None:
        self._assert_cluster_identity(require_running=True)
        if expected_database == self.database_name:
            self.assert_safe_database_url(self.database_url)
        elif expected_database != "postgres":
            raise SafetyError("Unsafe administrative database name")

        try:
            with self._connect(expected_database) as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT
                            current_database(),
                            inet_server_addr(),
                            inet_server_port(),
                            current_setting('data_directory'),
                            (pg_control_system()).system_identifier::text,
                            pg_read_file('postmaster.pid', 0, 512)
                        """
                    )
                    (
                        database,
                        host,
                        port,
                        data_directory,
                        system_identifier,
                        server_pid_file,
                    ) = cursor.fetchone()
        except (KeyboardInterrupt, SystemExit):
            raise
        except Exception as exc:
            message = self._redact_sensitive_text(str(exc))
            raise SafetyError(f"Could not verify isolated PostgreSQL identity: {message}") from None

        self._validate_server_identity(
            expected_database,
            database,
            host,
            port,
            data_directory,
            system_identifier,
            server_pid_file,
        )

    def _validate_server_identity(
        self,
        expected_database: str,
        database: str,
        host: object,
        port: int,
        data_directory: str,
        system_identifier: str,
        server_pid_file: str,
    ) -> None:
        local_metadata = self._read_postmaster_metadata()
        server_metadata = self._parse_postmaster_pid_text(server_pid_file)
        expected_data_dir = self._canonical_path(self.data_dir)
        actual_data_dir = self._canonical_path(Path(data_directory))

        if database != expected_database:
            raise SafetyError("Connected database name does not match the expected test database")
        if not self._is_expected_ipv4_loopback_address(host):
            raise SafetyError("Test database is not bound to the IPv4 loopback address")
        if port != self.port:
            raise SafetyError("Connected PostgreSQL port does not match the harness port")
        if actual_data_dir != expected_data_dir:
            raise SafetyError("PostgreSQL data_directory is not the harness data directory")
        if local_metadata != server_metadata:
            raise SafetyError("Server postmaster.pid does not match the harness PID file")
        if server_metadata[0] != self._postmaster_pid:
            raise SafetyError("Server PID does not match the recorded harness PID")
        if server_metadata[1] != expected_data_dir:
            raise SafetyError("Server PID metadata references a different data directory")
        if server_metadata[2] != self.port:
            raise SafetyError("Server PID metadata references a different port")
        if not self._process_exists(server_metadata[0]):
            raise SafetyError("Verified PostgreSQL PID is not running")
        self._assert_expected_postgres_process(server_metadata[0])

        if self._system_identifier is None:
            self._system_identifier = system_identifier
        elif system_identifier != self._system_identifier:
            raise SafetyError("PostgreSQL system_identifier changed during the test run")

    def _connect(self, database: str):
        self._assert_safe_connection_parameters(
            host=LOOPBACK_HOST,
            port=self.port,
            username=self.username,
            password=self._password,
        )
        return psycopg.connect(
            host=LOOPBACK_HOST,
            port=self.port,
            dbname=database,
            user=self.username,
            password=self._password,
            connect_timeout=CONNECT_TIMEOUT_SECONDS,
            options=self.connection_options,
        )

    @staticmethod
    def _is_expected_ipv4_loopback_address(value: object) -> bool:
        if isinstance(value, IPv4Address):
            address = value
        elif isinstance(value, str):
            try:
                address = ip_address(value)
            except ValueError:
                return False
        else:
            return False
        return isinstance(address, IPv4Address) and address == LOOPBACK_ADDRESS

    def _assert_explicit_run_guard(self) -> None:
        if os.environ.get(RUN_GUARD_ENV) != RUN_GUARD_VALUE:
            raise SafetyError(
                f"Set {RUN_GUARD_ENV} to the documented integration-test guard value"
            )

    def _assert_application_not_imported(self) -> None:
        imported = [name for name in sys.modules if name == "app" or name.startswith("app.")]
        if imported:
            raise SafetyError("Application modules were imported before test isolation was active")

    def _discover_commands(self) -> None:
        configured_bin = os.environ.get(PG_BIN_ENV)
        if not configured_bin:
            raise SafetyError(f"{PG_BIN_ENV} must identify one PostgreSQL 18 bin directory")

        configured_path = Path(configured_bin)
        if configured_path.is_symlink():
            raise SafetyError("PostgreSQL bin path must not be a symbolic link")
        pg_bin = configured_path.resolve()
        if not pg_bin.is_dir():
            raise SafetyError("PostgreSQL bin path is missing or is a symbolic link")
        self.pg_bin = pg_bin

        suffix = ".exe" if os.name == "nt" else ""
        required = ("postgres", "initdb", "pg_ctl", "pg_isready")
        for name in required:
            executable_path = pg_bin / f"{name}{suffix}"
            if executable_path.is_symlink():
                raise SafetyError(f"PostgreSQL executable {name} must not be a symbolic link")
            executable = executable_path.resolve()
            if executable.parent != pg_bin or not executable.is_file():
                raise SafetyError(f"Unsafe PostgreSQL executable path for {name}")
            self._commands[name] = str(executable)

        detected_versions: dict[str, str] = {}
        for name, executable in self._commands.items():
            completed = self._run(
                f"verify-postgresql-binary-{name}",
                [executable, "--version"],
                timeout=10,
            )
            version_text = f"{completed.stdout} {completed.stderr}"
            if completed.returncode != 0:
                raise SafetyError(f"Could not verify PostgreSQL executable {name}")
            match = re.search(r"PostgreSQL\)?\s+(\d+(?:\.\d+)*)", version_text)
            if match is None or int(match.group(1).split(".")[0]) != POSTGRES_MAJOR_VERSION:
                raise SafetyError(f"PostgreSQL executable {name} is not version 18")
            detected_versions[name] = match.group(1)
        if len(set(detected_versions.values())) != 1:
            raise SafetyError("PostgreSQL executables report incompatible versions")

    def _create_directories(self) -> None:
        root = (self.temp_root / f"{ROOT_PREFIX}{self.run_id}").resolve()
        self.root_dir = root
        self.data_dir = (root / "data").resolve()
        self.runtime_dir = (root / "runtime").resolve()
        self.log_file = (root / "postgres.log").resolve()
        self.marker_file = (root / ".practice_tracker_integration_cluster").resolve()

        self._assert_safe_root_path(root)
        root_mode = 0o755 if os.name == "nt" else 0o700
        root.mkdir(mode=root_mode, exist_ok=False)
        root_stat = root.stat(follow_symlinks=False)
        self._root_identity = (root_stat.st_dev, root_stat.st_ino)
        with self.marker_file.open("x", encoding="utf-8") as marker:
            marker.write(self.run_id)
        self._marker_created = True
        self.data_dir.mkdir()
        self.runtime_dir.mkdir()

    def _choose_nonstandard_port(self) -> int:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            probe.bind((LOOPBACK_HOST, 0))
            port = int(probe.getsockname()[1])
        if port in FORBIDDEN_PORTS or port < 1024:
            raise SafetyError("Failed to allocate a safe nonstandard PostgreSQL port")
        return port

    def _initialize_cluster(self) -> None:
        self._assert_cluster_paths()
        password_file = (self.runtime_dir / "initdb-password.txt").resolve()
        self._assert_direct_child(password_file, self.runtime_dir)
        password_file.write_text(self._password, encoding="utf-8")
        try:
            self._run(
                "initdb",
                [
                    self._commands["initdb"],
                    "-D",
                    str(self.data_dir),
                    "--username",
                    self.username,
                    "--pwfile",
                    str(password_file),
                    "--auth-local=trust",
                    "--auth-host=scram-sha-256",
                    "--encoding=UTF8",
                    "--no-locale",
                ]
            )
        finally:
            if password_file.exists():
                password_file.unlink()

    def _start_cluster(self) -> None:
        self._assert_cluster_paths()
        if self.port is None or self.port in FORBIDDEN_PORTS:
            raise SafetyError("Unsafe PostgreSQL port")

        server_options = (
            f"-h {LOOPBACK_HOST} -p {self.port} "
            "-c fsync=off -c synchronous_commit=off -c full_page_writes=off"
        )
        self._server_may_be_running = True
        self._run_pg_ctl_start(
            "pg_ctl-start",
            [
                self._commands["pg_ctl"],
                "-D",
                str(self.data_dir),
                "-l",
                str(self.log_file),
                "-w",
                "start",
                "-o",
                server_options,
            ]
        )

        pid, data_directory, port = self._read_postmaster_metadata()
        if data_directory != self._canonical_path(self.data_dir) or port != self.port:
            raise SafetyError("Started PostgreSQL metadata does not belong to the harness cluster")
        if not self._process_exists(pid):
            raise SafetyError("Recorded PostgreSQL process is not running")
        self._assert_expected_postgres_process(pid)
        self._postmaster_pid = pid
        self._started = True

        self._run(
            "pg_isready",
            [
                self._commands["pg_isready"],
                "-h",
                LOOPBACK_HOST,
                "-p",
                str(self.port),
                "-d",
                "postgres",
                "-U",
                self.username,
            ]
        )

    def _create_database(self) -> None:
        self._assert_cluster_identity(require_running=True)
        if not self.database_name.startswith(DATABASE_PREFIX):
            raise SafetyError("Unsafe integration database name")

        try:
            with self._connect("postgres") as connection:
                connection.autocommit = True
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT
                            current_database(),
                            inet_server_addr(),
                            inet_server_port(),
                            current_setting('data_directory'),
                            (pg_control_system()).system_identifier::text,
                            pg_read_file('postmaster.pid', 0, 512)
                        """
                    )
                    self._validate_server_identity("postgres", *cursor.fetchone())
                connection.execute(
                    sql.SQL("CREATE DATABASE {}").format(sql.Identifier(self.database_name))
                )
        except (KeyboardInterrupt, SystemExit):
            raise
        except Exception as exc:
            message = self._redact_sensitive_text(str(exc))
            raise SafetyError(f"Could not create isolated test database: {message}") from None

    def _configure_isolated_application_environment(self) -> None:
        self._assert_cluster_identity(require_running=True)
        self._assert_isolated_working_directory(change_directory=True)

        values = {
            "APP_NAME": "Practice Tracker Integration Tests",
            "APP_ENV": "test",
            "APP_DEBUG": "False",
            "DB_HOST": LOOPBACK_HOST,
            "DB_PORT": str(self.port),
            "DB_NAME": self.database_name,
            "DB_USER": self.username,
            "DB_PASSWORD": self._password,
            "DATABASE_URL": self.database_url,
            "SECRET_KEY": "integration-test-only-secret",
            "ALGORITHM": "HS256",
            "ACCESS_TOKEN_EXPIRE_MINUTES": "60",
        }
        for key, value in values.items():
            if key not in self._saved_environment:
                self._saved_environment[key] = os.environ.get(key)
            os.environ[key] = value

        project_value = str(self.project_root)
        if project_value not in sys.path:
            sys.path.insert(0, project_value)
            self._project_path_inserted = True

        self.assert_safe_database_url(os.environ["DATABASE_URL"])

    def _stop_cluster_if_owned(self) -> None:
        pid_file = self.data_dir / "postmaster.pid"
        if not pid_file.is_file():
            self._server_may_be_running = False
            self._started = False
            return

        pid, data_directory, port = self._read_postmaster_metadata()
        if data_directory != self._canonical_path(self.data_dir):
            raise SafetyError("Refusing to stop PostgreSQL with a different data directory")
        if port != self.port:
            raise SafetyError("Refusing to stop PostgreSQL with a different port")
        if self._postmaster_pid is not None and pid != self._postmaster_pid:
            raise SafetyError("Refusing to stop PostgreSQL with a different PID")
        if not self._process_exists(pid):
            raise SafetyError("PostgreSQL PID file exists but its process cannot be confirmed")
        self._assert_expected_postgres_process(pid)

        self._postmaster_pid = pid
        self._run(
            "pg_ctl-stop",
            [
                self._commands["pg_ctl"],
                "-D",
                str(self.data_dir),
                "-w",
                "stop",
                "-m",
                "fast",
            ]
        )

        deadline = time.monotonic() + 10
        while self._process_exists(pid):
            if time.monotonic() >= deadline:
                raise SafetyError("PostgreSQL process did not stop within the safety timeout")
            time.sleep(0.1)
        if pid_file.exists():
            raise SafetyError("postmaster.pid remains after PostgreSQL shutdown")

        self._server_may_be_running = False
        self._started = False

    def _assert_cluster_identity(self, *, require_running: bool) -> None:
        self._assert_cluster_paths()
        if self.port is None or self.port in FORBIDDEN_PORTS or self.port < 1024:
            raise SafetyError("Unsafe or missing PostgreSQL port")
        if not self.database_name.startswith(DATABASE_PREFIX):
            raise SafetyError("Unsafe integration database name")
        if self.marker_file is None or not self.marker_file.is_file():
            raise SafetyError("Integration-cluster marker is missing")
        if self._is_reparse_point(self.marker_file):
            raise SafetyError("Integration-cluster marker must not be a symbolic link")
        if self.marker_file.read_text(encoding="utf-8") != self.run_id:
            raise SafetyError("Integration-cluster marker does not match this run")

        if require_running:
            pid, data_directory, port = self._read_postmaster_metadata()
            if self._postmaster_pid is None or pid != self._postmaster_pid:
                raise SafetyError("PostgreSQL PID does not match the harness process")
            if data_directory != self._canonical_path(self.data_dir) or port != self.port:
                raise SafetyError("PostgreSQL PID metadata does not match the harness cluster")
            if not self._process_exists(pid):
                raise SafetyError("Harness PostgreSQL process is not running")

    def _assert_cluster_paths(self) -> None:
        if self.root_dir is None or self.data_dir is None or self.runtime_dir is None:
            raise SafetyError("Integration cluster directories are not initialized")
        self._assert_safe_root_path(self.root_dir)
        self._assert_direct_child(self.data_dir, self.root_dir)
        self._assert_direct_child(self.runtime_dir, self.root_dir)
        if any(
            self._is_reparse_point(path)
            for path in (self.root_dir, self.data_dir, self.runtime_dir)
        ):
            raise SafetyError("Integration cluster paths must not be symbolic links")

    def _assert_safe_connection_parameters(
        self,
        *,
        host: str | None,
        port: int | None,
        username: str | None,
        password: str | None,
    ) -> None:
        if host != LOOPBACK_HOST:
            raise SafetyError("Integration database host must be 127.0.0.1")
        if port != self.port or port in FORBIDDEN_PORTS:
            raise SafetyError("Integration database port is not the isolated harness port")
        if username != self.username or password != self._password:
            raise SafetyError("Integration database credentials do not belong to this harness")

    def _assert_safe_root_path(self, root: Path) -> None:
        resolved = root.resolve()
        if resolved.parent != self.temp_root:
            raise SafetyError("Integration root is not a direct child of the system temp directory")
        if not resolved.name.startswith(ROOT_PREFIX):
            raise SafetyError("Integration root has an unsafe name")
        if resolved == self.temp_root or resolved == self.project_root:
            raise SafetyError("Refusing to use a broad or project directory as integration root")

    @staticmethod
    def _assert_direct_child(path: Path, parent: Path) -> None:
        if path.resolve().parent != parent.resolve():
            raise SafetyError("Integration path escaped its expected parent")

    def _assert_isolated_working_directory(self, *, change_directory: bool = False) -> None:
        if self.runtime_dir is None or self.root_dir is None:
            raise SafetyError("Integration runtime directory is not initialized")
        self._assert_direct_child(self.runtime_dir, self.root_dir)
        if (self.runtime_dir / ".env").exists():
            raise SafetyError("Unexpected .env exists in the integration runtime directory")
        if change_directory:
            os.chdir(self.runtime_dir)
        if Path.cwd().resolve() != self.runtime_dir.resolve():
            raise SafetyError("Application imports are not isolated from the project working directory")

    def _read_postmaster_metadata(self) -> tuple[int, str, int]:
        if self.data_dir is None:
            raise SafetyError("PostgreSQL data directory is not initialized")
        pid_file = self.data_dir / "postmaster.pid"
        if not pid_file.is_file() or self._is_reparse_point(pid_file):
            raise SafetyError("PostgreSQL PID file is missing or unsafe")
        return self._parse_postmaster_pid_text(pid_file.read_text(encoding="utf-8"))

    def _parse_postmaster_pid_text(self, value: str) -> tuple[int, str, int]:
        lines = value.splitlines()
        if len(lines) < 4:
            raise SafetyError("PostgreSQL PID metadata is incomplete")
        try:
            pid = int(lines[0].strip())
            port = int(lines[3].strip())
        except ValueError as exc:
            raise SafetyError("PostgreSQL PID metadata is invalid") from exc
        if pid <= 0 or port <= 0:
            raise SafetyError("PostgreSQL PID metadata contains invalid values")
        data_directory = self._canonical_path(Path(lines[1].strip()))
        return pid, data_directory, port

    @staticmethod
    def _canonical_path(path: Path) -> str:
        return os.path.normcase(str(path.resolve()))

    @staticmethod
    def _process_exists(pid: int) -> bool:
        if os.name == "nt":
            import ctypes
            from ctypes import wintypes

            process_query_limited_information = 0x1000
            still_active = 259
            kernel32 = ctypes.windll.kernel32
            kernel32.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
            kernel32.OpenProcess.restype = wintypes.HANDLE
            kernel32.GetExitCodeProcess.argtypes = [
                wintypes.HANDLE,
                ctypes.POINTER(wintypes.DWORD),
            ]
            kernel32.GetExitCodeProcess.restype = wintypes.BOOL
            kernel32.CloseHandle.argtypes = [wintypes.HANDLE]
            kernel32.CloseHandle.restype = wintypes.BOOL
            handle = kernel32.OpenProcess(
                process_query_limited_information,
                False,
                pid,
            )
            if not handle:
                return False
            try:
                exit_code = wintypes.DWORD()
                if not kernel32.GetExitCodeProcess(
                    handle,
                    ctypes.byref(exit_code),
                ):
                    return False
                return exit_code.value == still_active
            finally:
                kernel32.CloseHandle(handle)

        try:
            os.kill(pid, 0)
        except ProcessLookupError:
            return False
        except PermissionError:
            return True
        return True

    def _assert_expected_postgres_process(self, pid: int) -> None:
        expected = self._commands.get("postgres")
        if expected is None:
            raise SafetyError("Expected PostgreSQL executable is not initialized")
        actual = self._process_executable(pid)
        if actual is None:
            raise SafetyError("PostgreSQL process executable could not be confirmed")
        if self._canonical_path(actual) != self._canonical_path(Path(expected)):
            raise SafetyError("PID belongs to a different executable; refusing process control")

    @staticmethod
    def _process_executable(pid: int) -> Path | None:
        if os.name == "nt":
            import ctypes
            from ctypes import wintypes

            process_query_limited_information = 0x1000
            kernel32 = ctypes.windll.kernel32
            kernel32.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
            kernel32.OpenProcess.restype = wintypes.HANDLE
            kernel32.QueryFullProcessImageNameW.argtypes = [
                wintypes.HANDLE,
                wintypes.DWORD,
                wintypes.LPWSTR,
                ctypes.POINTER(wintypes.DWORD),
            ]
            kernel32.QueryFullProcessImageNameW.restype = wintypes.BOOL
            kernel32.CloseHandle.argtypes = [wintypes.HANDLE]
            kernel32.CloseHandle.restype = wintypes.BOOL
            handle = kernel32.OpenProcess(
                process_query_limited_information,
                False,
                pid,
            )
            if not handle:
                return None
            try:
                buffer = ctypes.create_unicode_buffer(32768)
                size = wintypes.DWORD(len(buffer))
                if not kernel32.QueryFullProcessImageNameW(
                    handle,
                    0,
                    buffer,
                    ctypes.byref(size),
                ):
                    return None
                return Path(buffer.value)
            finally:
                kernel32.CloseHandle(handle)

        executable_link = Path(f"/proc/{pid}/exe")
        if not executable_link.exists():
            return None
        try:
            return executable_link.resolve(strict=True)
        except OSError:
            return None

    def _assert_safe_to_remove_root(self) -> None:
        self._assert_root_identity()
        if self.data_dir is None or self.runtime_dir is None:
            raise SafetyError("Integration cluster paths are not initialized")
        self._assert_direct_child(self.data_dir, self.root_dir)
        self._assert_direct_child(self.runtime_dir, self.root_dir)
        for path in (self.data_dir, self.runtime_dir):
            if path.exists() and self._is_reparse_point(path):
                raise SafetyError("Integration cluster paths must not be reparse points")
        if self._server_may_be_running or self._started:
            raise SafetyError("Refusing to remove a potentially running PostgreSQL cluster")
        if self._postmaster_pid and self._process_exists(self._postmaster_pid):
            raise SafetyError("Refusing to remove data for a running PostgreSQL process")
        if (self.data_dir / "postmaster.pid").exists():
            raise SafetyError("Refusing to remove data while postmaster.pid exists")
        if self.marker_file is None or not self.marker_file.is_file():
            raise SafetyError("Refusing cleanup because the ownership marker is missing")
        if self._is_reparse_point(self.marker_file):
            raise SafetyError("Refusing cleanup because the ownership marker is unsafe")
        if self.marker_file.read_text(encoding="utf-8") != self.run_id:
            raise SafetyError("Refusing to remove a directory with a mismatched marker")

    def _assert_root_identity(self) -> None:
        if self.root_dir is None or self._root_identity is None:
            raise SafetyError("Temporary-cluster root identity was not recorded")
        self._assert_safe_root_path(self.root_dir)
        if self._is_reparse_point(self.root_dir):
            raise SafetyError("Temporary-cluster root must not be a reparse point")
        root_stat = self.root_dir.stat(follow_symlinks=False)
        actual_identity = (root_stat.st_dev, root_stat.st_ino)
        if actual_identity != self._root_identity:
            raise SafetyError("Temporary-cluster root identity changed")

    def _remove_cluster_root_marker_last(self) -> None:
        self._assert_root_identity()
        if self.marker_file is None:
            raise SafetyError("Temporary-cluster marker path is not initialized")

        if not self.marker_file.exists():
            if self._marker_created:
                raise SafetyError("Ownership marker disappeared before cleanup")
            if any(self.root_dir.iterdir()):
                raise SafetyError(
                    "Marker creation failed and the temporary root is not empty; "
                    "cleanup was refused"
                )
            self.root_dir.rmdir()
            return

        self._assert_safe_to_remove_root()
        for child in list(self.root_dir.iterdir()):
            if child == self.marker_file:
                continue
            self._remove_owned_path(child)

        remaining = list(self.root_dir.iterdir())
        if remaining != [self.marker_file]:
            raise SafetyError("Temporary-cluster root changed during guarded cleanup")

        self.marker_file.unlink()
        self._marker_created = False
        try:
            self.root_dir.rmdir()
        except BaseException as removal_exc:
            try:
                self._assert_root_identity()
                with self.marker_file.open("x", encoding="utf-8") as marker:
                    marker.write(self.run_id)
                self._marker_created = True
            except BaseException as marker_exc:
                removal_exc.add_note(
                    "Ownership marker could not be restored after root removal failed: "
                    + self.exception_diagnostic(
                        marker_exc,
                        stage="cleanup-restore-marker",
                    )
                )
            raise

    def _remove_owned_path(self, path: Path) -> None:
        self._assert_path_within_root(path)
        if self._is_reparse_point(path):
            raise SafetyError("Refusing to remove a reparse point from the test cluster")
        if path.is_dir():
            for child in list(path.iterdir()):
                self._remove_owned_path(child)
            path.rmdir()
            return
        if path.is_file():
            path.unlink()
            return
        raise SafetyError("Refusing to remove an unknown filesystem object")

    def _assert_path_within_root(self, path: Path) -> None:
        if self.root_dir is None:
            raise SafetyError("Temporary-cluster root is not initialized")
        root = self.root_dir.resolve()
        resolved = path.resolve()
        try:
            resolved.relative_to(root)
        except ValueError as exc:
            raise SafetyError("Cleanup path escaped the temporary-cluster root") from exc
        if resolved == root:
            raise SafetyError("Recursive cleanup cannot target the cluster root directly")

    @staticmethod
    def _is_reparse_point(path: Path) -> bool:
        stat_result = path.lstat()
        file_attributes = getattr(stat_result, "st_file_attributes", 0)
        reparse_attribute = getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0x400)
        return path.is_symlink() or bool(file_attributes & reparse_attribute)

    def _restore_process_state(self) -> None:
        if Path.cwd() != self._original_cwd and self._original_cwd.exists():
            os.chdir(self._original_cwd)
        for key, old_value in self._saved_environment.items():
            if old_value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = old_value
        self._saved_environment.clear()
        if self._project_path_inserted:
            project_value = str(self.project_root)
            if project_value in sys.path:
                sys.path.remove(project_value)
            self._project_path_inserted = False

    def _redact_sensitive_text(self, value: str) -> str:
        redacted = value.replace(self._password, "<redacted>")
        if self.port is not None:
            redacted = redacted.replace(self.database_url, "<redacted-database-url>")
        redacted = re.sub(
            r"postgres(?:ql)?(?:\+[a-z0-9_]+)?://[^\s'\"]+",
            "<redacted-database-url>",
            redacted,
            flags=re.IGNORECASE,
        )
        redacted = re.sub(
            r"(?i)(password|token|secret)\s*[=:]\s*[^\s,;]+",
            r"\1=<redacted>",
            redacted,
        )
        return redacted

    def _run(
        self,
        stage: str,
        arguments: list[str],
        *,
        timeout: int = 60,
    ) -> subprocess.CompletedProcess[str]:
        self._stage = stage
        command_name = Path(arguments[0]).name
        try:
            completed = subprocess.run(
                arguments,
                check=False,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
        except subprocess.TimeoutExpired as exc:
            detail = self._sanitized_subprocess_detail(exc.stderr, exc.stdout)
            raise HarnessCommandError(
                stage=stage,
                command_name=command_name,
                returncode=None,
                detail=f"timed out after {timeout}s; {detail}",
            ) from None
        except OSError as exc:
            raise HarnessCommandError(
                stage=stage,
                command_name=command_name,
                returncode=None,
                detail=self._redact_sensitive_text(str(exc)),
            ) from None

        if completed.returncode != 0:
            raise HarnessCommandError(
                stage=stage,
                command_name=command_name,
                returncode=completed.returncode,
                detail=self._sanitized_subprocess_detail(
                    completed.stderr,
                    completed.stdout,
                ),
            )
        return completed

    def _sanitized_subprocess_detail(
        self,
        stderr: str | bytes | None,
        stdout: str | bytes | None,
    ) -> str:
        raw = stderr or stdout or "no subprocess output"
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8", errors="replace")
        redacted = self._redact_sensitive_text(raw)
        compact = re.sub(r"\s+", " ", redacted).strip()
        if len(compact) > 1500:
            compact = compact[-1500:]
        return compact

    def _run_pg_ctl_start(
        self,
        stage: str,
        arguments: list[str],
        *,
        timeout: int = 60,
    ) -> None:
        """Run pg_ctl start without PIPE handles inherited by postgres.exe."""
        self._stage = stage
        self._assert_cluster_paths()
        output_path = (self.runtime_dir / "pg_ctl-start-output.log").resolve()
        self._assert_direct_child(output_path, self.runtime_dir)
        command_name = Path(arguments[0]).name

        try:
            with output_path.open("x+b") as output_file:
                try:
                    process = subprocess.Popen(
                        arguments,
                        stdin=subprocess.DEVNULL,
                        stdout=output_file,
                        stderr=subprocess.STDOUT,
                        close_fds=True,
                    )
                except OSError as exc:
                    raise HarnessCommandError(
                        stage=stage,
                        command_name=command_name,
                        returncode=None,
                        detail=self._redact_sensitive_text(str(exc)),
                    ) from None

                try:
                    returncode = process.wait(timeout=timeout)
                except subprocess.TimeoutExpired:
                    termination_detail = self._terminate_command_process(process)
                    server_state = self._inspect_server_after_start_failure()
                    detail = self._read_sanitized_command_output(output_file)
                    raise HarnessCommandError(
                        stage=stage,
                        command_name=command_name,
                        returncode=None,
                        detail=(
                            f"timed out after {timeout}s; {termination_detail}; "
                            f"{server_state}; {detail}"
                        ),
                    ) from None
                except BaseException:
                    self._terminate_command_process(process)
                    raise

                if returncode != 0:
                    server_state = self._inspect_server_after_start_failure()
                    detail = self._read_sanitized_command_output(output_file)
                    raise HarnessCommandError(
                        stage=stage,
                        command_name=command_name,
                        returncode=returncode,
                        detail=f"{server_state}; {detail}",
                    )
        except HarnessCommandError:
            raise
        except OSError as exc:
            raise HarnessCommandError(
                stage=stage,
                command_name=command_name,
                returncode=None,
                detail=self._redact_sensitive_text(str(exc)),
            ) from None

    def _terminate_command_process(self, process: subprocess.Popen) -> str:
        if process.poll() is not None:
            return f"pg_ctl already exited with return code {process.returncode}"
        try:
            process.kill()
        except OSError as exc:
            return "pg_ctl termination failed: " + self._redact_sensitive_text(str(exc))
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            return "pg_ctl did not terminate within 5s after kill"
        return f"pg_ctl terminated with return code {process.returncode}"

    def _inspect_server_after_start_failure(self) -> str:
        try:
            pid, data_directory, port = self._read_postmaster_metadata()
            if data_directory != self._canonical_path(self.data_dir):
                raise SafetyError("postmaster.pid references a different data directory")
            if port != self.port:
                raise SafetyError("postmaster.pid references a different port")
            if not self._process_exists(pid):
                raise SafetyError("postmaster.pid process is not running")
            self._assert_expected_postgres_process(pid)
            self._postmaster_pid = pid
            return f"server_process=confirmed; pid={pid}; port={port}"
        except Exception as exc:
            return (
                "server_process=unconfirmed; reason="
                + self._redact_sensitive_text(str(exc))
            )

    def _read_sanitized_command_output(self, output_file) -> str:
        try:
            output_file.flush()
            output_file.seek(0)
            return self._sanitized_subprocess_detail(output_file.read(), None)
        except OSError as exc:
            return "command output unavailable: " + self._redact_sensitive_text(str(exc))
