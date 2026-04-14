from datetime import datetime
from decimal import Decimal

from pydantic import Field, model_validator

from app.schemas.common import ORMBaseSchema


class EnterpriseBase(ORMBaseSchema):
    name: str = Field(..., min_length=2, max_length=255)
    address: str | None = None
    contact_person: str | None = Field(default=None, max_length=255)
    contact_phone: str | None = Field(default=None, max_length=50)
    latitude: Decimal = Field(..., ge=-90, le=90)
    longitude: Decimal = Field(..., ge=-180, le=180)
    allowed_radius_m: int = Field(default=200, ge=1, le=5000)
    is_active: bool = True

    @model_validator(mode="before")
    @classmethod
    def normalize_strings(cls, data):
        if not isinstance(data, dict):
            return data

        for key in ("name", "address", "contact_person", "contact_phone"):
            value = data.get(key)
            if isinstance(value, str):
                value = value.strip()
                data[key] = value or None

        return data


class EnterpriseCreate(EnterpriseBase):
    pass


class EnterpriseUpdate(ORMBaseSchema):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    address: str | None = None
    contact_person: str | None = Field(default=None, max_length=255)
    contact_phone: str | None = Field(default=None, max_length=50)
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)
    allowed_radius_m: int | None = Field(default=None, ge=1, le=5000)
    is_active: bool | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_strings(cls, data):
        if not isinstance(data, dict):
            return data

        for key in ("name", "address", "contact_person", "contact_phone"):
            value = data.get(key)
            if isinstance(value, str):
                value = value.strip()
                data[key] = value or None

        return data


class EnterpriseRead(EnterpriseBase):
    id: int
    created_at: datetime
    updated_at: datetime
