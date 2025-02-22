from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

# Configuración por defecto del DAG
default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "start_date": datetime(2024, 1, 1),
    "email": ["your-email@example.com"],
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}

# Definición del DAG
with DAG(
    "my_dag_name",  # Nombre del DAG
    default_args=default_args,
    description="Description of your DAG",
    schedule_interval="@daily",
    catchup=False,
    tags=["example"],
) as dag:

    # Función de ejemplo
    def sample_task():
        print("Executing sample task")

    # Tarea de ejemplo
    task_1 = PythonOperator(
        task_id="sample_task",
        python_callable=sample_task,
    )

    # Aquí puedes agregar más tareas y definir sus dependencias
    task_1 