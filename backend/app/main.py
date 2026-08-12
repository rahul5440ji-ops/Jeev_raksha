"""
JeevRaksha backend — FastAPI application entrypoint.

This is intentionally minimal at this stage of the build: it wires up
config, CORS, and a health check. Feature routers (auth, incidents,
uploads, animal-id, risk-assessment, admin, responder workflow) are
added incrementally in later steps and included here via
`app.include_router(...)`.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="JeevRaksha API",
    description=(
        "Human-Animal Conflict Prevention & Response Platform API. "
        "Decision-support only — not a substitute for trained wildlife "
        "authorities or veterinarians."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
def health_check() -> dict:
    """Liveness/readiness probe. Does not touch the database yet —
    a DB-connectivity check can be added once persistence is required
    by a real endpoint, avoiding a false sense of coverage now."""
    return {
        "status": "ok",
        "service": "jeevraksha-backend",
        "env": settings.app_env,
    }
