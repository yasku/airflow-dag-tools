from airflow import DAG agustinnnnnnnnnnnnnnnnnnnnn
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

def example_function():
    print("Hello from the example function!")

with DAG(
    'example_dag',
    default_args=default_args,
    description='An example DAG',
    schedule_interval=timedelta(days=1),
    catchup=False,
) as dag:

    task = PythonOperator(
        task_id='example_task',
        python_callable=example_function,
    )