"""
Incident report endpoints.

Only create + get-by-id exist in this increment. A "list nearby
incidents" endpoint is intentionally NOT included yet — that requires
the coordinate-fuzzing rule from ux-spec.md §1 ("no public sensitive
coordinates") and role-based access (auth doesn't exist yet), so
shipping it now would mean serving exact reporter GPS to anyone who
calls the API. Add it once auth + a fuzzing layer land.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.incident import Incident
from app.schemas.incident import IncidentCreate, IncidentRead

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.post("", response_model=IncidentRead, status_code=status.HTTP_201_CREATED)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)) -> Incident:
    incident = Incident(**payload.model_dump())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/{incident_id}", response_model=IncidentRead)
def get_incident(incident_id: str, db: Session = Depends(get_db)) -> Incident:
    incident = db.get(Incident, incident_id)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return incident
