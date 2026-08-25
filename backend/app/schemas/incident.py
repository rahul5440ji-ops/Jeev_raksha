"""
Pydantic request/response schemas for incidents.

IncidentRead is currently the "owner/authority" view (full precision
location). There is deliberately no separate public-safe schema yet
because there is no public read endpoint in this increment — add a
fuzzed-location schema when a public/nearby-alerts endpoint is built,
per ux-spec.md's "no public sensitive coordinates" rule.
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.incident import IncidentCategory, IncidentStatus


class IncidentCreate(BaseModel):
    needs_immediate_help: bool = False
    category: IncidentCategory
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    location_description: str | None = Field(default=None, max_length=2000)
    location_accuracy_low: bool = False
    photo_url: str | None = Field(default=None, max_length=1024)
    notes: str | None = Field(default=None, max_length=5000)

    @model_validator(mode="after")
    def require_some_location_info(self) -> "IncidentCreate":
        # Spec: never block submission on missing GPS, but the report
        # must carry *some* location signal (coords OR a description) —
        # otherwise it's unusable by a responder.
        has_coords = self.latitude is not None and self.longitude is not None
        has_description = bool(self.location_description and self.location_description.strip())
        if not has_coords and not has_description:
            raise ValueError(
                "Provide GPS coordinates or a location_description — at least one is required."
            )
        return self


class IncidentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    needs_immediate_help: bool
    category: IncidentCategory
    status: IncidentStatus
    latitude: float | None
    longitude: float | None
    location_description: str | None
    location_accuracy_low: bool
    photo_url: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
