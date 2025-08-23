# backend/crud.py
from sqlalchemy.orm import Session
from backend import models, schemas

def get_items(db: Session):
    return db.query(models.Item).order_by(models.Item.id.desc()).all()

def get_item(db: Session, item_id: int):
    return db.query(models.Item).filter(models.Item.id == item_id).first()

def create_item(db: Session, item: schemas.ItemCreate):
    obj = models.Item(
        title=item.title.strip(),
        description=(item.description or "").strip() or None,
        image_url=item.image_url,
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

def get_items_cleaned(db: Session):
    return db.query(models.ItemCleaned).order_by(models.ItemCleaned.id.desc()).all()
