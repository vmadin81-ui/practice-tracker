from __future__ import annotations

import time as monotonic_time
import unittest
import uuid
from concurrent.futures import Future, ThreadPoolExecutor
from datetime import date, datetime, time
from decimal import Decimal
from pathlib import Path
from queue import Queue
from threading import Barrier
from unittest.mock import patch

from postgres_harness import EphemeralPostgresHarness


CONCURRENT_SCENARIO_TIMEOUT_SECONDS = 20
LOCK_OBSERVATION_TIMEOUT_SECONDS = 5


class StudentCheckinPostgresIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        project_root = Path(__file__).resolve().parents[2]
        cls.harness = EphemeralPostgresHarness(project_root)
        try:
            cls.harness.start()
            cls.harness.apply_migrations()

            from sqlalchemy import create_engine, select, text
            from sqlalchemy.orm import sessionmaker

            from app.models.enterprise import Enterprise
            from app.models.geolocation_check import GeolocationCheck
            from app.models.geolocation_log import GeolocationLog
            from app.models.practice_assignment import PracticeAssignment
            from app.models.specialty import Specialty
            from app.models.student import Student
            from app.models.student_daily_status import StudentDailyStatus
            from app.models.student_data_consent import StudentDataConsent
            from app.models.study_group import StudyGroup
            from app.schemas.student_checkin import StudentCheckinSubmitRequest
            from app.services.student_checkin_service import submit_student_checkin

            cls.select = staticmethod(select)
            cls.text = staticmethod(text)
            cls.Enterprise = Enterprise
            cls.GeolocationCheck = GeolocationCheck
            cls.GeolocationLog = GeolocationLog
            cls.PracticeAssignment = PracticeAssignment
            cls.Specialty = Specialty
            cls.Student = Student
            cls.StudentDailyStatus = StudentDailyStatus
            cls.StudentDataConsent = StudentDataConsent
            cls.StudyGroup = StudyGroup
            cls.StudentCheckinSubmitRequest = StudentCheckinSubmitRequest
            cls.submit_student_checkin = staticmethod(submit_student_checkin)

            cls.harness.assert_safe_database_url(cls.harness.database_url)
            cls.engine = create_engine(
                cls.harness.database_url,
                pool_pre_ping=True,
                hide_parameters=True,
            )
            cls.Session = sessionmaker(
                bind=cls.engine,
                autoflush=False,
                autocommit=False,
            )
            cls.status_date = date(2026, 4, 15)
        except BaseException as exc:
            cleanup_exc: BaseException | None = None
            try:
                cls.harness.close()
            except BaseException as close_exc:
                cleanup_exc = close_exc
            if cleanup_exc is not None:
                exc.add_note(
                    "setUpClass cleanup failure (original exception preserved): "
                    + cls.harness.exception_diagnostic(
                        cleanup_exc,
                        stage="setUpClass-cleanup",
                    )
                    + f"; {cls.harness.safe_diagnostics()}"
                )
            raise

    @classmethod
    def tearDownClass(cls) -> None:
        engine = getattr(cls, "engine", None)
        if engine is not None:
            engine.dispose()
        harness = getattr(cls, "harness", None)
        if harness is not None:
            harness.close()

    def setUp(self) -> None:
        self._truncate_test_data()
        self.student_id = self._seed_test_data()

    def tearDown(self) -> None:
        self._truncate_test_data()

    def test_successful_registration_is_atomic(self) -> None:
        response = self._submit_at(time(10, 0))
        self.assertEqual(response.status_color, "green")

        with self.Session() as session:
            logs = session.query(self.GeolocationLog).all()
            checks = session.query(self.GeolocationCheck).all()
            statuses = session.query(self.StudentDailyStatus).all()

            self.assertEqual(len(logs), 1)
            self.assertEqual(len(checks), 1)
            self.assertEqual(len(statuses), 1)
            self.assertEqual(checks[0].geolocation_log_id, logs[0].id)
            self.assertEqual(statuses[0].student_id, self.student_id)
            self.assertEqual(statuses[0].status_date, self.status_date)
            self.assertEqual(statuses[0].status_color, "green")
            self.assertEqual(statuses[0].checkins_count, 1)
            self.assertEqual(statuses[0].last_geolocation_log_id, logs[0].id)
            self.assertEqual(statuses[0].last_check_id, checks[0].id)

    def test_recalculation_failure_rolls_back_log_and_check(self) -> None:
        with patch(
            "app.services.student_checkin_service.recalculate_student_daily_status",
            side_effect=RuntimeError("forced integration rollback"),
        ):
            with self.assertRaisesRegex(RuntimeError, "forced integration rollback"):
                self._submit_at(time(10, 0))

        self._assert_no_checkin_records()

    def test_commit_failure_after_daily_status_flush_rolls_back_everything(self) -> None:
        status_was_flushed = False

        with self.Session() as session:
            student = session.get(self.Student, self.student_id)
            original_flush = session.flush

            def track_flush(*args, **kwargs) -> None:
                nonlocal status_was_flushed
                original_flush(*args, **kwargs)
                status_was_flushed = status_was_flushed or any(
                    isinstance(instance, self.StudentDailyStatus)
                    for instance in session.identity_map.values()
                )

            def fail_final_commit() -> None:
                if not status_was_flushed:
                    self.fail("StudentDailyStatus was not flushed before the final commit")
                raise RuntimeError("forced final commit failure")

            with (
                patch.object(session, "flush", side_effect=track_flush),
                patch.object(session, "commit", side_effect=fail_final_commit),
            ):
                with self.assertRaisesRegex(RuntimeError, "forced final commit failure"):
                    self.submit_student_checkin(
                        session,
                        student=student,
                        payload=self._payload_at(time(10, 0)),
                    )

        self.assertTrue(status_was_flushed)
        self._assert_no_checkin_records()

    def test_repeated_checkins_update_one_daily_status(self) -> None:
        self._submit_at(time(10, 0))
        self._submit_at(time(10, 5))

        with self.Session() as session:
            logs = (
                session.query(self.GeolocationLog)
                .order_by(self.GeolocationLog.sent_at.asc())
                .all()
            )
            checks = session.query(self.GeolocationCheck).all()
            statuses = session.query(self.StudentDailyStatus).all()

            self.assertEqual(len(logs), 2)
            self.assertEqual(len(checks), 2)
            self.assertEqual(len(statuses), 1)
            self.assertEqual(statuses[0].checkins_count, 2)
            self.assertEqual(statuses[0].last_geolocation_log_id, logs[-1].id)
            last_check = (
                session.query(self.GeolocationCheck)
                .filter(self.GeolocationCheck.geolocation_log_id == logs[-1].id)
                .one()
            )
            self.assertEqual(statuses[0].last_check_id, last_check.id)

    def test_concurrent_checkins_are_serialized_per_student(self) -> None:
        barrier = Barrier(2, timeout=5)

        def submit(minute: int) -> str:
            with self.Session() as session:
                student = session.get(self.Student, self.student_id)
                barrier.wait()
                response = self.submit_student_checkin(
                    session,
                    student=student,
                    payload=self._payload_at(time(10, minute)),
                )
                return response.status_color

        executor = ThreadPoolExecutor(max_workers=2)
        futures: list[Future] = []
        deadline = monotonic_time.monotonic() + CONCURRENT_SCENARIO_TIMEOUT_SECONDS
        try:
            futures = [executor.submit(submit, minute) for minute in (10, 11)]
            results = [
                future.result(timeout=self._remaining_time(deadline)) for future in futures
            ]
        finally:
            for future in futures:
                future.cancel()
            executor.shutdown(wait=False, cancel_futures=True)

        self.assertEqual(results, ["green", "green"])
        with self.Session() as session:
            self.assertEqual(session.query(self.GeolocationLog).count(), 2)
            self.assertEqual(session.query(self.GeolocationCheck).count(), 2)
            statuses = session.query(self.StudentDailyStatus).all()
            self.assertEqual(len(statuses), 1)
            self.assertEqual(statuses[0].checkins_count, 2)

    def test_second_checkin_waits_for_student_row_lock(self) -> None:
        worker_pid: Queue[int] = Queue(maxsize=1)
        executor = ThreadPoolExecutor(max_workers=1)
        future: Future | None = None
        locker = self.Session()
        deadline = monotonic_time.monotonic() + CONCURRENT_SCENARIO_TIMEOUT_SECONDS

        def submit_while_locked() -> str:
            with self.Session() as session:
                pid = session.scalar(self.text("SELECT pg_backend_pid()"))
                worker_pid.put(pid, timeout=5)
                student = session.get(self.Student, self.student_id)
                response = self.submit_student_checkin(
                    session,
                    student=student,
                    payload=self._payload_at(time(10, 15)),
                )
                return response.status_color

        try:
            locked_student = locker.scalar(
                self.select(self.Student)
                .where(self.Student.id == self.student_id)
                .with_for_update()
            )
            self.assertIsNotNone(locked_student)

            future = executor.submit(submit_while_locked)
            pid = worker_pid.get(timeout=self._remaining_time(deadline))
            self.assertTrue(self._wait_until_backend_is_lock_blocked(pid))
            self.assertFalse(future.done())

            locker.commit()
            result = future.result(timeout=self._remaining_time(deadline))
            self.assertEqual(result, "green")
        finally:
            if locker.in_transaction():
                locker.rollback()
            locker.close()
            if future is not None:
                future.cancel()
            executor.shutdown(wait=False, cancel_futures=True)

        with self.Session() as session:
            self.assertEqual(session.query(self.GeolocationLog).count(), 1)
            self.assertEqual(session.query(self.GeolocationCheck).count(), 1)
            statuses = session.query(self.StudentDailyStatus).all()
            self.assertEqual(len(statuses), 1)
            self.assertEqual(statuses[0].checkins_count, 1)

    def _wait_until_backend_is_lock_blocked(self, backend_pid: int) -> bool:
        deadline = monotonic_time.monotonic() + LOCK_OBSERVATION_TIMEOUT_SECONDS
        statement = self.text(
            """
            SELECT wait_event_type, wait_event
            FROM pg_stat_activity
            WHERE pid = :backend_pid
            """
        )
        while monotonic_time.monotonic() < deadline:
            with self.Session() as monitor:
                row = monitor.execute(statement, {"backend_pid": backend_pid}).one_or_none()
            if row is not None and row.wait_event_type == "Lock":
                return True
            monotonic_time.sleep(0.05)
        return False

    @staticmethod
    def _remaining_time(deadline: float) -> float:
        remaining = deadline - monotonic_time.monotonic()
        if remaining <= 0:
            raise TimeoutError("Concurrent integration scenario exceeded its total timeout")
        return remaining

    def _submit_at(self, sent_time: time):
        with self.Session() as session:
            student = session.get(self.Student, self.student_id)
            return self.submit_student_checkin(
                session,
                student=student,
                payload=self._payload_at(sent_time),
            )

    def _payload_at(self, sent_time: time):
        return self.StudentCheckinSubmitRequest(
            latitude=Decimal("10.0000000"),
            longitude=Decimal("20.0000000"),
            accuracy_m=Decimal("10.00"),
            device_time=datetime.combine(self.status_date, sent_time),
        )

    def _assert_no_checkin_records(self) -> None:
        with self.Session() as session:
            self.assertEqual(session.query(self.GeolocationLog).count(), 0)
            self.assertEqual(session.query(self.GeolocationCheck).count(), 0)
            self.assertEqual(session.query(self.StudentDailyStatus).count(), 0)

    def _seed_test_data(self) -> int:
        suffix = uuid.uuid4().hex
        with self.Session() as session:
            specialty = self.Specialty(
                code=f"IT-{suffix[:8]}",
                name=f"Integration Specialty {suffix}",
            )
            session.add(specialty)
            session.flush()

            group = self.StudyGroup(
                name=f"IT-GROUP-{suffix}",
                course=3,
                specialty_id=specialty.id,
            )
            session.add(group)
            session.flush()

            student = self.Student(
                last_name="Integration",
                first_name="Student",
                middle_name="Test",
                full_name=f"Integration Student {suffix}",
                group_id=group.id,
                specialty_id=specialty.id,
                is_active=True,
            )
            enterprise = self.Enterprise(
                name=f"Integration Enterprise {suffix}",
                address="Fictional integration-test address",
                latitude=Decimal("10.0000000"),
                longitude=Decimal("20.0000000"),
                allowed_radius_m=200,
                is_active=True,
            )
            session.add_all([student, enterprise])
            session.flush()

            assignment = self.PracticeAssignment(
                student_id=student.id,
                enterprise_id=enterprise.id,
                start_date=self.status_date,
                end_date=self.status_date,
                monitoring_mode="daily_once",
                required_checkins_per_day=1,
                allowed_start_time=time(9, 0),
                allowed_end_time=time(12, 0),
                is_active=True,
            )
            consent = self.StudentDataConsent(
                student_id=student.id,
                consent_type="geolocation",
                consent_text_version="v1",
                is_accepted=True,
                device_id="integration-device",
                device_label="integration-test",
                user_agent="integration-test-agent",
            )
            session.add_all([assignment, consent])
            session.commit()
            return student.id

    def _truncate_test_data(self) -> None:
        self.harness.verify_database_identity()
        self.harness.assert_safe_database_url(self.harness.database_url)
        tables = (
            "student_data_consents, student_checkin_sessions, student_access_links, "
            "user_group_access, student_daily_statuses, geolocation_checks, "
            "geolocation_logs, practice_assignments, students, study_groups, "
            "specialties, enterprises, users"
        )
        with self.engine.begin() as connection:
            self.harness.verify_sqlalchemy_connection_identity(connection)
            connection.execute(
                self.text(f"TRUNCATE TABLE {tables} RESTART IDENTITY CASCADE")
            )


if __name__ == "__main__":
    unittest.main(verbosity=2)
