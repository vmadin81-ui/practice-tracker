from datetime import datetime
from decimal import Decimal
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import MagicMock, patch

from app.services.student_checkin_service import submit_student_checkin


class SubmitStudentCheckinTransactionTests(TestCase):
    def setUp(self) -> None:
        self.db = MagicMock()
        self.student = SimpleNamespace(id=42)
        self.payload = SimpleNamespace(
            latitude=Decimal("53.2145000"),
            longitude=Decimal("63.6243000"),
            accuracy_m=Decimal("10.00"),
            device_time=datetime(2026, 4, 15, 10, 30),
        )
        self.check_in_result = {
            "geolocation_log_id": 101,
            "status_color": "green",
            "distance_m": Decimal("15.25"),
            "comment": "ok",
        }

    @patch("app.services.student_checkin_service.recalculate_student_daily_status")
    @patch("app.services.student_checkin_service.process_check_in")
    @patch("app.services.student_checkin_service.has_student_geolocation_consent", return_value=True)
    def test_commits_check_in_and_daily_status_once(
        self,
        consent_mock,
        process_mock,
        recalculate_mock,
    ) -> None:
        self.db.scalar.return_value = self.student
        process_mock.return_value = self.check_in_result

        response = submit_student_checkin(
            self.db,
            student=self.student,
            payload=self.payload,
        )

        consent_mock.assert_called_once_with(self.db, student_id=self.student.id)
        process_mock.assert_called_once()
        process_call = process_mock.call_args
        self.assertIs(process_call.args[0], self.db)
        self.assertFalse(process_call.kwargs["commit"])
        self.assertEqual(process_call.kwargs["payload"].sent_at, self.payload.device_time)

        recalculate_mock.assert_called_once_with(
            self.db,
            student_id=self.student.id,
            target_date=self.payload.device_time.date(),
            commit=False,
        )
        self.db.commit.assert_called_once_with()
        self.db.rollback.assert_not_called()
        self.assertEqual(response.geolocation_log_id, 101)

        lock_statement = self.db.scalar.call_args.args[0]
        self.assertIn("FOR UPDATE", str(lock_statement))

    @patch("app.services.student_checkin_service.recalculate_student_daily_status")
    @patch("app.services.student_checkin_service.process_check_in")
    @patch("app.services.student_checkin_service.has_student_geolocation_consent", return_value=True)
    def test_rolls_back_when_daily_status_recalculation_fails(
        self,
        _consent_mock,
        process_mock,
        recalculate_mock,
    ) -> None:
        self.db.scalar.return_value = self.student
        process_mock.return_value = self.check_in_result
        recalculate_mock.side_effect = RuntimeError("recalculation failed")

        with self.assertRaisesRegex(RuntimeError, "recalculation failed"):
            submit_student_checkin(
                self.db,
                student=self.student,
                payload=self.payload,
            )

        self.db.commit.assert_not_called()
        self.db.rollback.assert_called_once_with()

    @patch("app.services.student_checkin_service.process_check_in")
    @patch("app.services.student_checkin_service.has_student_geolocation_consent", return_value=True)
    def test_rolls_back_when_check_in_fails(
        self,
        _consent_mock,
        process_mock,
    ) -> None:
        self.db.scalar.return_value = self.student
        process_mock.side_effect = RuntimeError("check-in failed")

        with self.assertRaisesRegex(RuntimeError, "check-in failed"):
            submit_student_checkin(
                self.db,
                student=self.student,
                payload=self.payload,
            )

        self.db.commit.assert_not_called()
        self.db.rollback.assert_called_once_with()
