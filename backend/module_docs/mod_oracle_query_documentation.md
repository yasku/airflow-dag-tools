# Documento Funcional de mod_oracle_query.py

## Descripción General

El módulo `mod_oracle_query.py` contiene la clase `Run_Oracle` que proporciona funcionalidades para interactuar con bases de datos Oracle desde Airflow. Permite ejecutar consultas SQL, insertar datos de DataFrames, y gestionar conexiones a Oracle.

## Funciones Disponibles

### path_or_string(str_or_path)

**Descripción:** Lee contenido de un archivo si la entrada es una ruta válida, o devuelve el texto tal cual si es una cadena.

**Parámetros:**
- `str_or_path` (str): Ruta a un archivo o texto SQL directo.

**Retorna:**
- El contenido del archivo como cadena si es una ruta, o la cadena original.

**Uso:**
```python
sql_content = Run_Oracle.path_or_string('/ruta/al/archivo.sql')
# O
sql_content = Run_Oracle.path_or_string('SELECT * FROM tabla')
```

### generate_etl_operation(nom_task, files, connection_id, carpeta, parametros)

**Descripción:** Crea un operador Oracle para ejecutar SQL desde un archivo.

**Parámetros:**
- `nom_task` (str): Nombre de la tarea en Airflow.
- `files` (str): Nombre del archivo SQL a ejecutar.
- `connection_id` (str): ID de conexión Oracle configurada en Airflow.
- `carpeta` (str): Variable de Airflow que contiene el directorio de archivos SQL.
- `parametros` (dict): Parámetros a pasar al SQL.

**Retorna:**
- Un operador OracleOperator configurado.

**Uso:**
```python
etl_task = Run_Oracle.generate_etl_operation(
    'task_cargar_datos',
    'insert_data.sql',
    'oracle_conn',
    'directorio_sql',
    {'fecha': '2023-01-01'}
)
```

### generate_etl_query(nom_task, sql_query, connection_id)

**Descripción:** Crea un operador Oracle para ejecutar SQL en forma de cadena.

**Parámetros:**
- `nom_task` (str): Nombre de la tarea en Airflow.
- `sql_query` (str): Consulta SQL a ejecutar.
- `connection_id` (str): ID de conexión Oracle configurada en Airflow.

**Retorna:**
- Un operador OracleOperator configurado.

**Uso:**
```python
etl_query = Run_Oracle.generate_etl_query(
    'tarea_consulta',
    'SELECT * FROM tabla WHERE fecha = TO_DATE(\'2023-01-01\', \'YYYY-MM-DD\')',
    'oracle_conn'
)
```

### execute_query(sql_query, connection_id)

**Descripción:** Ejecuta una consulta SQL y devuelve los resultados.

**Parámetros:**
- `sql_query` (str): Consulta SQL a ejecutar.
- `connection_id` (str): ID de conexión Oracle configurada en Airflow.

**Retorna:**
- Resultados de la consulta como una lista de tuplas.

**Uso:**
```python
resultados = Run_Oracle.execute_query(
    'SELECT id, nombre FROM clientes WHERE region = \'NORTE\'',
    'oracle_conn'
)
```

### insert_dataframe_oracle(df_fin, table, connection_id, partition_size=100000)

**Descripción:** Inserta un DataFrame en una tabla Oracle.

**Parámetros:**
- `df_fin` (DataFrame): DataFrame con los datos a insertar.
- `table` (str): Nombre de la tabla destino.
- `connection_id` (str): ID de conexión Oracle configurada en Airflow.
- `partition_size` (int, opcional): Tamaño máximo de cada lote de inserción, por defecto 100,000.

**Uso:**
```python
import pandas as pd

df = pd.DataFrame({
    'id': [1, 2, 3],
    'nombre': ['Ana', 'Juan', 'María']
})

Run_Oracle.insert_dataframe_oracle(
    df,
    'TABLA_CLIENTES',
    'oracle_conn'
)
```

### insert_dataframe_oracle2(df_fin, table, connection_id, partition_size=100000)

**Descripción:** Versión alternativa para insertar un DataFrame en una tabla Oracle (funcionalidad idéntica a la anterior).

**Parámetros y uso:** Igual que `insert_dataframe_oracle`.

### get_conection_params(connection_id)

**Descripción:** Obtiene los parámetros de conexión (usuario, contraseña, host, etc.) de una conexión de Airflow.

**Parámetros:**
- `connection_id` (str): ID de conexión configurada en Airflow.

**Retorna:**
- Diccionario con los parámetros de conexión.

**Uso:**
```python
params = Run_Oracle.get_conection_params('oracle_conn')
print(params['username'], params['host'])
```

### oracle_connection()

**Descripción:** Crea una conexión directa a Oracle con credenciales fijas (hardcoded).

**Retorna:**
- Objeto de conexión Oracle.

**Observaciones:** Esta función usa credenciales codificadas directamente en el código, por lo que no se recomienda su uso en entornos productivos. Usar `oracle_connection_fwa` es preferible.

### oracle_connection_fwa(conn_id)

**Descripción:** Crea una conexión a Oracle utilizando una conexión configurada en Airflow.

**Parámetros:**
- `conn_id` (str): ID de conexión Oracle configurada en Airflow.

**Retorna:**
- Objeto de conexión Oracle.

**Uso:**
```python
connection = Run_Oracle.oracle_connection_fwa('oracle_conn')
cursor = connection.cursor()
# Usar cursor...
cursor.close()
connection.close()
```

## Ejemplo Completo de Uso

A continuación se muestra un ejemplo de cómo se podría utilizar este módulo en un DAG de Airflow:

```python
from airflow import DAG
from datetime import datetime, timedelta
from backend.custom_modules.mod_oracle_query import Run_Oracle
import pandas as pd

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2023, 1, 1),
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'ejemplo_oracle_query',
    default_args=default_args,
    schedule_interval='@daily',
    catchup=False
) as dag:
    
    # Ejecutar una consulta directa
    consulta = Run_Oracle.execute_query(
        'SELECT COUNT(*) FROM TABLA_DATOS WHERE FECHA = TRUNC(SYSDATE)',
        'oracle_connection_id'
    )
    
    # Crear una tarea que ejecuta SQL desde un archivo
    tarea_sql = Run_Oracle.generate_etl_operation(
        'procesar_datos',
        'proceso_etl.sql',
        'oracle_connection_id',
        'carpeta_sql',
        {'fecha': '{{ ds }}'}
    )
    
    # Ejemplo de inserción de datos (esto sería parte de un PythonOperator)
    def insertar_datos_ejemplo():
        df = pd.DataFrame({
            'id': range(1, 101),
            'fecha': datetime.now(),
            'valor': [i * 1.5 for i in range(1, 101)]
        })
        
        Run_Oracle.insert_dataframe_oracle(
            df,
            'TABLA_RESULTADOS',
            'oracle_connection_id'
        )
    
    # Las tareas se organizarían aquí...
```

## Notas Importantes

1. Asegúrese de que las conexiones de Oracle estén configuradas correctamente en Airflow.
2. Los archivos SQL deben estar ubicados en la ruta definida por la variable de Airflow especificada.
3. Para operaciones con grandes volúmenes de datos, ajuste el parámetro `partition_size` en las funciones de inserción.
4. Para debugging, todas las funciones imprimen información en los logs de Airflow.
