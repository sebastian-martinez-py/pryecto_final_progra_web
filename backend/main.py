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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=database.engine)

static_dir = pathlib.Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/", include_in_schema=False)
def serve_index():
    return FileResponse(static_dir / "index.html")

# ------- CRUD items -------
@app.get("/api/items", response_model=list[schemas.ItemOut])
def list_items(db: Session = Depends(get_db)):
    return crud.get_items(db)

@app.post("/api/items", response_model=schemas.ItemOut)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    return crud.create_item(db, item)

@app.delete("/api/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_item(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Item not found")
    return

# ------- Cleaned -------
@app.get("/api/cleaned")
def list_cleaned(db: Session = Depends(get_db)):
    return crud.get_items_cleaned(db)

# ------- Pipeline -------
@app.post("/api/pipeline/run")
def run_pipeline_now():
    return run_pipeline()

# ------- Buscar/editar contacto -------
@app.get("/api/items/search", response_model=list[schemas.ItemOut])
def search_items(pet_name: str, db: Session = Depends(get_db)):
    return crud.search_items_by_pet(db, pet_name)

@app.patch("/api/items/{item_id}/contact", response_model=schemas.ItemOut)
def update_contact(item_id: int, body: schemas.ItemContactUpdate, db: Session = Depends(get_db)):
    obj = crud.update_item_contact(db, item_id, body)
    if not obj:
        raise HTTPException(status_code=404, detail="Item not found")
    return obj

# ------- Intereses (contactar para adoptar) -------
@app.post("/api/items/{item_id}/interest", response_model=schemas.InterestOut)
def create_interest(item_id: int, interest: schemas.InterestCreate, db: Session = Depends(get_db)):
    if not crud.get_item(db, item_id):
        raise HTTPException(status_code=404, detail="Item not found")
    return crud.create_interest(db, item_id, interest)

@app.get("/api/items/{item_id}/interest", response_model=list[schemas.InterestOut])
def list_interests(item_id: int, db: Session = Depends(get_db)):
    return crud.get_interests_for_item(db, item_id)

# ------- Scheduler opcional -------
if USE_APSCHEDULER:
    from apscheduler.schedulers.background import BackgroundScheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_pipeline, "interval", minutes=10)
    scheduler.start()
    atexit.register(lambda: scheduler.shutdown(wait=False))
