from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    # 'ADOPT' = adoptable | 'LOST' = perdido
    kind = Column(String(16), nullable=False, server_default="ADOPT")

    pet_name = Column(String(120), nullable=True)  # nombre de la mascota
    zone = Column(String(120), nullable=True)      # zona/cantón

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)

    # contacto del dueño / anunciante
    contact_name  = Column(String(120), nullable=True)
    contact_phone = Column(String(60),  nullable=True)
    contact_email = Column(String(120), nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    interests = relationship("AdoptionInterest", back_populates="item",
                             cascade="all, delete-orphan")

class ItemCleaned(Base):
    __tablename__ = "items_cleaned"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    source_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class AdoptionInterest(Base):
    __tablename__ = "adoption_interests"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"),
                     nullable=False)
    person_name = Column(String(120), nullable=False)
    phone = Column(String(60), nullable=True)
    email = Column(String(120), nullable=True)
    message = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    item = relationship("Item", back_populates="interests")
