# Backend/crud.py
# CHANGE: funciones CRUD claras y tipadas.

from sqlalchemy.orm import Session
from . import models, schemas

def get_items(db: Session) -> list[models.Item]:
    return db.query(models.Item).order_by(models.Item.id.desc()).all()

def get_item(db: Session, item_id: int) -> models.Item | None:
    return db.query(models.Item).filter(models.Item.id == item_id).first()

def create_item(db: Session, item: schemas.ItemCreate) -> models.Item:
    obj = models.Item(
        title=item.title.strip(),
        description=(item.description or "").strip() or None,
        image_url=str(item.image_url) if item.image_url else None,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def delete_item(db: Session, item_id: int) -> bool:
    obj = get_item(db, item_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True

def get_items_cleaned(db: Session) -> list[models.ItemCleaned]:
    return db.query(models.ItemCleaned).order_by(models.ItemCleaned.id.desc()).all()

