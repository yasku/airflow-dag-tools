from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email': ['example@email.com'],
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

def task_1():
    """
    Esta tarea realiza la extracción de datos.
    Conecta con la fuente y obtiene los datos crudos.
    """
    print("Ejecutando extracción...")

def task_2():
    """
    Esta tarea transforma los datos extraídos.
    Aplica limpieza y transformaciones necesarias.
    """
    print("Ejecutando transformación...")

def task_3():
    """
    Esta tarea carga los datos transformados.
    Guarda los datos en su destino final.
    """
    print("Ejecutando carga...")

with DAG(
    'example_etl_dag',
    default_args=default_args,
    description='Un DAG de ejemplo que implementa un proceso ETL',
    schedule_interval='@daily',
    catchup=False,
) as dag:

    extract = PythonOperator(
        task_id='extract_data',
        python_callable=task_1,
    )

    transform = PythonOperator(
        task_id='transform_data',
        python_callable=task_2,
    )

    load = PythonOperator(
        task_id='load_data',
        python_callable=task_3,
    )

    extract >> transform >> load 