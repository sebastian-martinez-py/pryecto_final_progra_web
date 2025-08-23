# pipeline/flow.py
# NEW: flujo Prefect que reusa el pipeline legacy.

from prefect import flow, task
from Backend.pipeline import run_pipeline

@task
def etl_task():
    return run_pipeline()

@flow(name="etl-clean-items")
def etl_flow():
    return etl_task()

if __name__ == "__main__":
    etl_flow()
