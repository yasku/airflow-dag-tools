from airflow import DAG
from airflow.operators.nonexistent import FakeOperator  
from datetime import datetime

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "start_date": datetime(2024, 2, 20),
    "retries": 1,
}

with DAG( 
    default_args=default_args,
    schedule_interval="@daily",
    catchup=False,
) as dag:

    task1 = FakeOperator(  
        task_id="fake_task"
    )

    task1
