# Backend/main.py
# CHANGE: API REST completa y coherente con el frontend.

import os, atexit
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from . import models, database, crud, schemas
from .pipeline import run_pipeline

USE_APSCHEDULER = os.getenv("USE_APSCHEDULER", "0") == "1"  # CHANGE: opcional

app = FastAPI(title="Proyecto Web - Final")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # CHANGE: restringe en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Estáticos (sirve /static y /)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

models.Base.metadata.create_all(bind=database.engine)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", include_in_schema=False)
def serve_index():
    index_html = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_html):
        return FileResponse(index_html)
    return {"ok": True, "message": "API running. Visita /docs"}

# ===== CRUD RAW =====
@app.get("/api/items", response_model=list[schemas.Item])
def list_items(db: Session = Depends(get_db)):
    return crud.get_items(db)

@app.post("/api/items", response_model=schemas.Item, status_code=201)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    return crud.create_item(db, item)

@app.delete("/api/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_item(db, item_id)
    if not ok:
        raise HTTPException(404, "Ítem no encontrado")

# ===== CLEANED =====
@app.get("/api/cleaned", response_model=list[schemas.ItemCleaned])
def get_cleaned(db: Session = Depends(get_db)):
    return crud.get_items_cleaned(db)

# ===== PIPELINE (manual) =====
@app.post("/api/pipeline/run")
def run_pipeline_now():
    return run_pipeline()

# ===== Scheduler opcional mientras migras a Prefect =====
if USE_APSCHEDULER:
    from apscheduler.schedulers.background import BackgroundScheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_pipeline, "interval", minutes=10)
    scheduler.start()
    atexit.register(lambda: scheduler.shutdown(wait=False))
