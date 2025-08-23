# Backend/models.py
# CHANGE: define modelos RAW y CLEANED en un solo archivo.

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .database import Base

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(String(1000), nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cleaned = relationship("ItemCleaned", back_populates="source", uselist=False)

class ItemCleaned(Base):
    __tablename__ = "items_cleaned"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(String(1000), nullable=True)
    image_url = Column(String(500), nullable=True)
    source_id = Column(Integer, ForeignKey("items.id"), nullable=True)  # CHANGE: traza origen
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    source = relationship("Item", back_populates="cleaned")

