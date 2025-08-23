from prefect import flow, task
from backend.pipeline import run_pipeline

@task
def etl_task():
    return run_pipeline()

@flow(name="etl-clean-items")
def etl_flow():
    return etl_task()

if __name__ == "__main__":
    etl_flow()
