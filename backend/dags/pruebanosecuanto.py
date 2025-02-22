from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email': ['your-email@example.com'],
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'my_dag_name',
    default_args=default_args,
    description='Description of your DAG',
    schedule_interval='@daily',
    catchup=False,
    tags=['example'],
) as dag:

    def sample_task():
        print("Executing sample task")

    task_1 = PythonOperator(
        task_id='sample_task',
        python_callable=sample_task,
    )

    task_1