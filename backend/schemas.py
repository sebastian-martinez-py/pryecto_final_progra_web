from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl, EmailStr

Kind = Literal["ADOPT", "LOST"]

class ItemBase(BaseModel):
    kind: Kind = "ADOPT"
    pet_name: Optional[str] = None
    zone: Optional[str] = None

    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = None  # HttpUrl | None si quieres validar url

    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None

class ItemCreate(ItemBase):
    pass

class ItemOut(ItemBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class ItemContactUpdate(BaseModel):
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None

class InterestCreate(BaseModel):
    person_name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    message: Optional[str] = None

class InterestOut(InterestCreate):
    id: int
    item_id: int
    created_at: datetime
    class Config:
        orm_mode = True
