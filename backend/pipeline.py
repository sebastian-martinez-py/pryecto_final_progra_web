# Backend/pipeline.py
# CHANGE: pipeline ETL minimalista pero completo con backup y log.

import os, json, csv, datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from .database import SessionLocal
from . import models

BACKUP_DIR = os.path.join(os.path.dirname(__file__), "backups")
os.makedirs(BACKUP_DIR, exist_ok=True)

def _clean_text(s: str | None) -> str | None:
    if not s:
        return None
    s = s.strip()
    # CHANGE: normalización simple; puedes ampliar (lower, quitar HTML, etc.)
    return " ".join(s.split())

def _etl_unit(raw: models.Item) -> Dict[str, Any]:
    return {
        "title": _clean_text(raw.title) or "Sin título",
        "description": _clean_text(raw.description),
        "image_url": _clean_text(raw.image_url),
        "source_id": raw.id,
    }

def run_pipeline() -> Dict[str, Any]:
    db: Session = SessionLocal()
    try:
        raws = db.query(models.Item).all()
        cleaned_count = 0
        rows_for_csv = []

        for r in raws:
            payload = _etl_unit(r)

            # Evita duplicados (uno a uno por source_id)
            existing = db.query(models.ItemCleaned).filter(
                models.ItemCleaned.source_id == r.id
            ).first()
            if existing:
                # UPDATE si cambió algo
                changed = False
                if existing.title != payload["title"]:
                    existing.title = payload["title"]; changed = True
                if existing.description != payload["description"]:
                    existing.description = payload["description"]; changed = True
                if existing.image_url != payload["image_url"]:
                    existing.image_url = payload["image_url"]; changed = True
                if changed:
                    db.add(existing)
                    cleaned_count += 1
            else:
                obj = models.ItemCleaned(**payload)
                db.add(obj)
                cleaned_count += 1

            rows_for_csv.append({
                "id": r.id,
                "title": payload["title"],
                "description": payload["description"] or "",
                "image_url": payload["image_url"] or "",
                "created_at": r.created_at.isoformat() if r.created_at else "",
            })

        db.commit()

        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_path = os.path.join(BACKUP_DIR, f"raw_backup_{ts}.csv")
        log_path = os.path.join(BACKUP_DIR, f"pipeline_log_{ts}.json")

        # BACKUP CSV
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["id", "title", "description", "image_url", "created_at"])
            writer.writeheader()
            writer.writerows(rows_for_csv)

        # LOG JSON
        summary = {
            "timestamp": ts,
            "raw_count": len(raws),
            "affected": cleaned_count,
            "csv_backup": os.path.basename(csv_path),
        }
        with open(log_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)

        return summary
    finally:
        db.close()
