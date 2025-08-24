from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from backend import models, schemas

# ---------- Items ----------
def get_items(db: Session) -> List[models.Item]:
    return db.execute(select(models.Item).order_by(models.Item.id.desc())).scalars().all()

def get_item(db: Session, item_id: int) -> Optional[models.Item]:
    return db.get(models.Item, item_id)

def create_item(db: Session, item: schemas.ItemCreate) -> models.Item:
    obj = models.Item(
        kind=item.kind,
        pet_name=item.pet_name,
        zone=item.zone,
        title=item.title.strip(),
        description=(item.description or "").strip() or None,
        image_url=item.image_url,
        contact_name=item.contact_name,
        contact_phone=item.contact_phone,
        contact_email=item.contact_email,
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

def search_items_by_pet(db: Session, pet_name: str) -> List[models.Item]:
    q = select(models.Item).where(models.Item.pet_name.ilike(f"%{pet_name}%"))
    return db.execute(q).scalars().all()

def update_item_contact(db: Session, item_id: int, upd: schemas.ItemContactUpdate) -> Optional[models.Item]:
    obj = get_item(db, item_id)
    if not obj:
        return None
    if upd.contact_name is not None:  obj.contact_name = upd.contact_name
    if upd.contact_phone is not None: obj.contact_phone = upd.contact_phone
    if upd.contact_email is not None: obj.contact_email = upd.contact_email
    db.commit()
    db.refresh(obj)
    return obj

# ---------- Cleaned ----------
def get_items_cleaned(db: Session):
    return db.execute(select(models.ItemCleaned).order_by(models.ItemCleaned.id.desc())).scalars().all()

# ---------- Interests ----------
def create_interest(db: Session, item_id: int, interest: schemas.InterestCreate) -> models.AdoptionInterest:
    obj = models.AdoptionInterest(
        item_id=item_id,
        person_name=interest.person_name,
        phone=interest.phone,
        email=interest.email,
        message=interest.message,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_interests_for_item(db: Session, item_id: int):
    q = select(models.AdoptionInterest).where(models.AdoptionInterest.item_id == item_id)
    return db.execute(q).scalars().all()
