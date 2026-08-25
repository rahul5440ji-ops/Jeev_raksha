"""
Incident model — a single animal-encounter report.

Field choices map directly to docs/ux-spec.md §3.2 (Emergency/Report Flow):
  Step 1 -> needs_immediate_help
  Step 2 -> category
  Step 3 -> latitude/longitude (nullable) + location_description fallback
            (per spec: never block submission on missing GPS)
  Step 4 -> photo_url (nullable placeholder; real upload lands with the
            storage adapter — see README "Storage" section)
  Step 5 -> notes

No reporter/user link yet — there is no User model or auth in this repo
yet. Once auth lands, add a nullable `reporter_id` FK rather than making
it required, so anonymous reporting (if the product wants to keep
supporting it) isn't broken by the change.

SENSITIVE DATA NOTE (README point 4 / ux-spec §1): exact latitude and
longitude are reporter/authority-only data. This model stores the real
values; any public-facing read path must fuzz or omit them rather than
adding a public "list incidents" endpoint against this table as-is.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class IncidentCategory(str, enum.Enum):
    ANIMAL_SIGHTING = "animal_sighting"
    ANIMAL_IN_DISTRESS = "animal_in_distress"
    ANIMAL_BLOCKING_PATH = "animal_blocking_path"
    AGGRESSIVE_BEHAVIOR = "aggressive_behavior"
    OTHER = "other"


class IncidentStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    QUEUED_OFFLINE = "queued_offline"  # client-side queued, synced later
    VERIFIED = "verified"
    CLOSED = "closed"


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )

    needs_immediate_help: Mapped[bool] = mapped_column(default=False)
    category: Mapped[IncidentCategory] = mapped_column(
        Enum(IncidentCategory, native_enum=False, length=32)
    )
    status: Mapped[IncidentStatus] = mapped_column(
        Enum(IncidentStatus, native_enum=False, length=16),
        default=IncidentStatus.SUBMITTED,
    )

    # Location — nullable by design; spec requires submission to succeed
    # even without a GPS fix, falling back to a free-text description.
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location_accuracy_low: Mapped[bool] = mapped_column(default=False)

    photo_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
