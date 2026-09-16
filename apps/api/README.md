# CyberLab API

FastAPI backend + PostgreSQL schema, scaffolded from
[`docs/blueprint.md`](../../docs/blueprint.md) §13–14.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then point DATABASE_URL at your Postgres instance
```

## Run migrations

```bash
alembic upgrade head
```

## Run the API

```bash
uvicorn app.main:app --reload
```

`GET /api/health` should return `{"status": "ok"}`.

## Schema

All 15 tables from the blueprint's data model (§14) are defined under
`app/models/` and captured in the single `alembic/versions/*_initial_schema.py`
migration: `users` (with `role`), `plans`, `subscriptions`, `labs`,
`lab_steps`, `lab_variants`, `lab_sessions`, `submissions`,
`telemetry_events`, `tradecraft_scores`, `mentor_interactions`, `reports`,
`credentials`, `progress`, `audit_events`.

`app/db/base.py` imports every model module so `Base.metadata` is complete —
add new models there or `alembic revision --autogenerate` will silently miss
them.
