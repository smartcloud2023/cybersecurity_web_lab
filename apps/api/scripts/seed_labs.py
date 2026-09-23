"""Idempotent seed data for the lab catalogue. Safe to run repeatedly —
upserts by slug/seed/sequence rather than always inserting.

Usage: python -m scripts.seed_labs
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.db.session import SessionLocal  # noqa: E402
from app.models.lab import Lab, LabLevel, LabStep, LabVariant  # noqa: E402

WEB001_VARIANTS = [
    {"seed": "web001-alpha", "param": "q"},
    {"seed": "web001-bravo", "param": "search"},
    {"seed": "web001-charlie", "param": "filter"},
]


def seed_web001(db) -> None:
    lab = db.scalar(select(Lab).where(Lab.slug == "WEB001"))
    if lab is None:
        lab = Lab(slug="WEB001")
        db.add(lab)
    lab.title = "Recon & Exploitation: Employee Directory"
    lab.level = LabLevel.beginner
    lab.template = "cyberlab/web001:latest"
    lab.summary = (
        "A company directory search hides a classic SQL injection. Find the "
        "vulnerable parameter, extract the flag, and explain what you found."
    )
    lab.published = True
    db.flush()

    for spec in WEB001_VARIANTS:
        variant = db.scalar(select(LabVariant).where(LabVariant.seed == spec["seed"]))
        if variant is None:
            variant = LabVariant(seed=spec["seed"])
            db.add(variant)
        variant.lab_id = lab.id
        variant.injection_point = "/search"
        variant.param_names = [spec["param"]]
        variant.active = True

    step = db.scalar(
        select(LabStep).where(LabStep.lab_id == lab.id, LabStep.sequence == 1)
    )
    if step is None:
        step = LabStep(lab_id=lab.id, sequence=1)
        db.add(step)
    step.instruction = (
        "Explore the employee search page and find the query parameter it "
        "actually reads (it may not be the one you'd expect). Use a "
        "UNION-based SQL injection to read the flag out of the `secrets` "
        "table, then submit it."
    )
    step.points = 100


def main() -> None:
    db = SessionLocal()
    try:
        seed_web001(db)
        db.commit()
        print("Seeded WEB001 lab with 3 variants and 1 step.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
