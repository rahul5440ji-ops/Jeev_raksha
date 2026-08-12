# JeevRaksha — Human–Animal Conflict Prevention & Response Platform

## Mission

JeevRaksha helps humans stay safe around wildlife while supporting humane,
authorized, and evidence-based response. It is decision-support software,
not a substitute for trained wildlife authorities, veterinarians, or
emergency services.

## Core Principles (non-negotiable, enforced in code review)

1. **Safety first.** Every user-facing flow defaults to the safest action.
2. **Never instruct users to approach, chase, capture, poison, injure,
   tranquilize, or otherwise confront wildlife.** Safety-guidance content
   is reviewed against this rule before merge.
3. **AI is decision support, not authority.** Animal ID and risk-assessment
   outputs always carry a confidence indicator and a disclaimer, and
   high-risk cases route to human authorities — never to automated action.
4. **Protect sensitive data.** Precise wildlife locations and reporter PII
   are access-controlled, not public by default (see `docs/privacy.md`,
   added when the location/reporting features land).
5. **Prefer prevention and safe distancing.** Reporting and authorized
   response over any form of self-intervention.
6. **Build incrementally.** No unnecessary rewrites of working code.

## Architecture

```
frontend/      React + TypeScript client (scaffolded in a later step)
backend/       Python + FastAPI service — the only component that talks to
               the database directly
ml_services/   Pluggable AI/ML adapters (animal ID, risk assessment).
               Consumed by backend/ via an interface, never imported
               directly by the frontend. Models are versioned and
               swappable — no vendor/model lock-in.
```

### Boundaries

- **Frontend → Backend**: HTTP/JSON over the FastAPI REST API only. No
  direct DB or ML access from the frontend.
- **Backend → Database**: SQLAlchemy models, Alembic migrations. No
  destructive migrations — additive/backward-compatible changes preferred,
  with explicit review for anything else.
- **Backend → ML services**: through adapter interfaces
  (`backend/app/services/*_adapter.py`, added when those features land) so
  a model can be swapped without touching API or DB code.
- **Backend → Maps/GIS**: through a pluggable provider interface — no
  hard-coded vendor, no invented API keys. Defaults to an open provider
  (e.g. MapLibre/Leaflet + OSM tiles) configured via environment variables.

### Secrets & Configuration

All configuration is via environment variables (see `.env.example`).
Nothing is hard-coded. `backend/app/core/config.py` is the single source
of typed, validated settings.

## Status

This repository is being built incrementally per the working method below.
See commit/response history for what has landed so far.

## Working Method

For every change: inspect → summarize → identify risks → propose smallest
step → implement → test/lint/type-check → report changed files and
verification results.
