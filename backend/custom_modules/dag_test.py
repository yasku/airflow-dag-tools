from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

# Función que se ejecutará en el DAG
def hello_airflow():
    print("¡Este es un DAG de prueba en Airflow 2.5!")

# Definición del DAG
default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "start_date": datetime(2024, 2, 20),
    "retries": 1,
}

with DAG(
    dag_id="simple_dag",
    default_args=default_args,
    schedule_interval="@daily",  # Se ejecuta diariamente
    catchup=False,
) as dag:

    # Tarea que ejecuta la función hello_airflow
    task1 = PythonOperator(
        task_id="hello_task",
        python_callable=hello_airflow,
    )

    task1  # Ejecutar la tarea

