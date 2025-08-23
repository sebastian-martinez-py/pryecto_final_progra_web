# Backend/database.py
# CHANGE: conexión por variable de entorno y saneamiento de engine/session.

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv  # CHANGE: soporte .env

load_dotenv()  # CHANGE: carga .env si existe

# CHANGE: valor por defecto preparado para docker-compose (MySQL).
# En local puedes usar SQLite: sqlite:///./app.db
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:Coco197209@127.0.0.1:3306/TrabjoFinal"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()
