from datetime import date, datetime, time
from decimal import Decimal
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import MagicMock, patch

from app.services.daily_status_service import recalculate_student_daily_status
from app.services.geolocation_service import process_check_in


class GeolocationServiceCommitModeTests(TestCase):
    def setUp(self) -> None:
        self.db = MagicMock()
        self.student = SimpleNamespace(id=42, is_active=True)
        self.assignment = SimpleNamespace(
            id=7,
            enterprise_id=11,
            allowed_start_time=time(9, 0),
            allowed_end_time=time(12, 0),
        )
        self.enterprise = SimpleNamespace(
            id=11,
            latitude=Decimal("53.2145000"),
            longitude=Decimal("63.6243000"),
            allowed_radius_m=100,
        )
        self.payload = SimpleNamespace(
            student_id=42,
            source="student_web",
            latitude=Decimal("53.2145000"),
            longitude=Decimal("63.6243000"),
            accuracy_m=Decimal("10.00"),
            sent_at=datetime(2026, 4, 15, 10, 30),
        )
        self.db.get.side_effect = [self.student, self.enterprise]

    @patch("app.services.geolocation_service._find_active_assignment")
    def test_commit_false_flushes_log_and_check_without_commit(
        self,
        assignment_mock,
    ) -> None:
        assignment_mock.return_value = self.assignment

        process_check_in(self.db, payload=self.payload, commit=False)

        self.assertEqual(self.db.flush.call_count, 2)
        self.db.commit.assert_not_called()
        self.db.refresh.assert_not_called()

    @patch("app.services.geolocation_service._find_active_assignment")
    def test_default_mode_preserves_commit_and_refresh(
        self,
        assignment_mock,
    ) -> None:
        assignment_mock.return_value = self.assignment

        process_check_in(self.db, payload=self.payload)

        self.assertEqual(self.db.flush.call_count, 2)
        self.db.commit.assert_called_once_with()
        self.db.refresh.assert_called_once()


class DailyStatusServiceCommitModeTests(TestCase):
    def setUp(self) -> None:
        self.db = MagicMock()
        self.student = SimpleNamespace(id=42, is_active=True)
        self.assignment = SimpleNamespace(id=7, required_checkins_per_day=1)
        self.existing_status = SimpleNamespace()
        self.db.get.return_value = self.student
        self.db.scalar.return_value = self.existing_status

    @patch("app.services.daily_status_service._determine_status_color")
    @patch("app.services.daily_status_service._get_logs_for_student_on_date")
    @patch("app.services.daily_status_service._find_assignment_for_student_on_date")
    def test_commit_false_flushes_status_without_commit(
        self,
        assignment_mock,
        logs_mock,
        determine_mock,
    ) -> None:
        assignment_mock.return_value = self.assignment
        logs_mock.return_value = []
        determine_mock.return_value = ("red", False, "no check-ins")

        result = recalculate_student_daily_status(
            self.db,
            student_id=self.student.id,
            target_date=date(2026, 4, 15),
            commit=False,
        )

        self.assertIs(result, self.existing_status)
        self.db.flush.assert_called_once_with()
        self.db.commit.assert_not_called()
        self.db.refresh.assert_not_called()

    @patch("app.services.daily_status_service._determine_status_color")
    @patch("app.services.daily_status_service._get_logs_for_student_on_date")
    @patch("app.services.daily_status_service._find_assignment_for_student_on_date")
    def test_default_mode_preserves_commit_and_refresh(
        self,
        assignment_mock,
        logs_mock,
        determine_mock,
    ) -> None:
        assignment_mock.return_value = self.assignment
        logs_mock.return_value = []
        determine_mock.return_value = ("red", False, "no check-ins")

        recalculate_student_daily_status(
            self.db,
            student_id=self.student.id,
            target_date=date(2026, 4, 15),
        )

        self.db.flush.assert_called_once_with()
        self.db.commit.assert_called_once_with()
        self.db.refresh.assert_called_once_with(self.existing_status)
