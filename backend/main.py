# backend/main.py
import os, atexit, pathlib
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend import database, crud, schemas, models
from backend.pipeline import run_pipeline

USE_APSCHEDULER = os.getenv("USE_APSCHEDULER", "0") == "1"

app = FastAPI(title="Proyecto Final – Programación Web")

# CORS (si usas front aparte)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB dependency ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Tablas al arranque ---
@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=database.engine)

# --- Static (frontend mínimo en backend/static) ---
static_dir = pathlib.Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/", include_in_schema=False)
def serve_index():
    return FileResponse(static_dir / "index.html")

# --- CRUD /api/items ---
@app.get("/api/items")
def list_items(db: Session = Depends(get_db)):
    return crud.get_items(db)

@app.post("/api/items")
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    return crud.create_item(db, item)

@app.delete("/api/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_item(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Item not found")
    return

# --- Vista de cleaned ---
@app.get("/api/cleaned")
def list_cleaned(db: Session = Depends(get_db)):
    return crud.get_items_cleaned(db)

# --- Pipeline manual ---
@app.post("/api/pipeline/run")
def run_pipeline_now():
    return run_pipeline()

# --- Scheduler opcional ---
if USE_APSCHEDULER:
    from apscheduler.schedulers.background import BackgroundScheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_pipeline, "interval", minutes=10)
    scheduler.start()
    atexit.register(lambda: scheduler.shutdown(wait=False))
