import secrets
from datetime import datetime, timedelta, timezone
from hashlib import sha256


def generate_raw_token(length: int = 32) -> str:
    return secrets.token_urlsafe(length)


def hash_token(raw_token: str) -> str:
    return sha256(raw_token.encode("utf-8")).hexdigest()


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def expires_after_hours(hours: int) -> datetime:
    return utc_now() + timedelta(hours=hours)
