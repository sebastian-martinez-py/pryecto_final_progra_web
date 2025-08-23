# Backend/schemas.py
# CHANGE: mayor validación en modelos Pydantic.

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional

class ItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    image_url: Optional[HttpUrl] = None  # CHANGE: valida URL

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

    class Config:
        orm_mode = True

class ItemCleaned(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    source_id: Optional[int] = None

    class Config:
        orm_mode = True
