# Estándar de Desarrollo para Rutinas de Big Data & Analytics

## Introducción

El presente documento establece los criterios y estándares a seguir durante el desarrollo de rutinas que se implementarán en ambientes productivos. El cumplimiento de estos lineamientos es **obligatorio** para garantizar un pasaje exitoso a Producción.

> ⚠️ **Importante**: Las rutinas que no cumplan con este estándar serán devueltas al área de desarrollo de Big Data & Analytics para realizar los ajustes necesarios.

## 1. Nomenclatura de Rutinas

Las rutinas deben seguir este formato estandarizado:

```
GRUPO_proceso_prefijo_nnx.sql
```

### Descripción de componentes:

| Componente | Obligatorio | Descripción |
|------------|:-----------:|-------------|
| **grupo** | ✅ | Número de grupo asignado al proceso. Debe solicitarse vía HP Service Manager al grupo ARQUITECTURA-DW durante la etapa de análisis. |
| **proceso** | ✅ | Identifica el proceso en desarrollo. |
| **prefijo** | ❌ | Opcional. Identifica la operación que se realiza. |
| **nn** | ✅ | Nivel de actualización del script (valores aceptados: 01, 05). |
| **x** | ✅ | Orden de ejecución (a-z, excluyendo ch-ñ-ll). |

### Tipos de grupos:
- **Grupos tipo A**: Procesos desarrollados en Airflow.
- **Grupos tipo C**: Procesos desarrollados en Cloudera (pueden ser migrados a Airflow).
- **Grupos tipo G**: Procesos desarrollados en RAC8/Ctrl-m (pueden ser migrados a Airflow).

### Niveles de actualización (nn):
- **01**: Creación de objetos (tablas, índices, particiones) o sentencias DML.
- **05**: Eliminación de tablas auxiliares del proceso o truncate. Debe ubicarse al principio y fin de la secuencia.

### Ejemplo:
```
A0323_trafico_clientes_pec_mes_01a.sql
```

> 📝 **Observación**: Los nombres de los scripts deben estar en minúsculas, excepto la letra del grupo.

## 2. Comandos para Operaciones DDL

### DROP TABLE en RAC8:
```sql
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE {{esquema_rac8}}.{{table_name}} PURGE';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
```

### DROP VIEW en RAC8:
```sql
BEGIN
    EXECUTE IMMEDIATE 'DROP VIEW {{esquema_rac8}}.{{view_name}}';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
```

### DROP TABLE en Cloudera:
```sql
DROP TABLE IF EXISTS {{esquema_impala}}.{{table_name}} PURGE;
```

### DROP VIEW en Cloudera:
```sql
DROP VIEW IF EXISTS {{esquema_impala}}.{{view_name}};
```

## 3. Arquitectura/Nomenclatura de Directorios

La nomenclatura de los directorios y la arquitectura en Airflow está definida en el "Estándar Airflow v2.5".

## 4. Arquitectura del Ciclo de Ejecución de Airflow

### 4.1 Estructura de Scripts SQL

Todo script SQL debe incluir un encabezado con la siguiente estructura:

```sql
-- ****************************************************************
-- Archivo....: A0323_trafico_clientes_pec_mes_01f.sql
-- Autor......: Waisman Gabriel
--
-- Descripción: Inserta los datos de la tabla
--              CONSUMO_TRAFICO_NAV_MB_MES para la fecha indicada
--
-- ****************************************************************
-- Historia del Proceso
--
-- Fecha      Por               Descripción
-- ********** ***************   ***********************************
-- 24/04/2023 Waisman Gabriel   Creación del Script
--
-- ****************************************************************
-- Parámetros
-- ****************************************************************
-- Parametro: [ESQUEMA]     - Valor: [{{params.esquema_rac8}}]
-- Parametro: [FECHA]       - Valor: [{{ds}}]
-- Parametro: [PAIS]        - Valor: [{{params.pais}}]
-- ****************************************************************
-- Inserta los datos en la tabla CONSUMO_TRAFICO_NAV_MB_MES
-- ****************************************************************
```

### 4.2 Estructura de DAGs

Los DAGs deben estructurarse siguiendo este patrón:

#### 4.2.1 Definición inicial de módulos o librerías

```python
# -*- coding: utf-8 -*-
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.dummy_operator import DummyOperator
from mod_oracle_query import Run_Oracle
from mod_cloudera_query import Run_Cloudera
import os
import pendulum
```

#### 4.2.2 Definición y parametrización del DAG

```python
"""
Definicion y parametrizacion del Dag
"""
DAG_ID = os.path.basename(__file__).replace(".pyc", "").replace(".py", "")
# How often to Run. @daily - Once a day at Midnight
SCHEDULE_INTERVAL = "@daily"
DAG_OWNER_NAME = "Nombre del Autor"
# List of email address to send email alerts to if this job fails
ALERT_EMAIL_ADDRESSES = ["correos@claro.com.ar"]
TIMEZONE = Variable.get("timezone_AR")
START_DATE=pendulum.datetime(yyyy,mm,dd, tz=TIMEZONE)

default_args = {
    'owner': DAG_OWNER_NAME,
    'depends_on_past': True,
    'wait_for_downstream': True,
    'start_date':  SCHEDULE_INTERVAL,
    'email': ALERT_EMAIL_ADDRESSES,
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 3,
    'retry_delay': timedelta(minutes=10),
    'catchup': True
}

dag = DAG(
        DAG_ID,
        default_args=default_args,
        schedule_interval=SCHEDULE_INTERVAL,
        tags=['Carpeta: DataWarehouse', 'DW'],
        max_active_runs=1,
        concurrency=1,
        is_paused_upon_creation=False
)
```

#### 4.2.3 Parámetros adicionales (Opcional)

```python
# Parametros
variables_etl_a = {
    'esquema_impala': 'prod_AR',
    'esquema_rac8': 'RACING.',
    'pais': 'AR',
    'table_name': 'AUX_A0323_CONS_TRAF_CLI_A'
}
```

#### 4.2.4 Definición de Operadores

```python
"""
Operadores e implementación del flujo de ejecución
"""
def dummy_task(task_id,dag):
    task = DummyOperator(
        task_id='{t}'.format(t=task_id),
        depends_on_past=True,
        wait_for_downstream=True,
        dag=dag)
    return task

def eliminarTablasAuxiliares():
    drop_AUX_A0323_CONS_TRAF_CLI_A = Run_Cloudera.generate_etl_operator_ar('DROP_AUX_A0323_CONS_TRAF_CLI_A','A0323_trafico_clientes_pec_mes_05a.sql',variables_etl_a,sql_files_path)
    drop_AUX_A0323_CONS_TRAF_CLI_B = Run_Cloudera.generate_etl_operator_ar('DROP_AUX_A0323_CONS_TRAF_CLI_B','A0323_trafico_clientes_pec_mes_05a.sql',variables_etl_b,sql_files_path)
    drop_AUX_A0323_CONS_TRAF_CLI_C = Run_Cloudera.generate_etl_operator_ar('DROP_AUX_A0323_CONS_TRAF_CLI_C','A0323_trafico_clientes_pec_mes_05a.sql',variables_etl_c,sql_files_path)
    truncate_CONSUMO_TRAFICO_NAV_MB_MES = Run_Cloudera.generate_etl_operator_ar('TRUNCATE_CONSUMO_TRAFICO_NAV_MB_MES','A0323_trafico_clientes_pec_mes_05b.sql',variables_etl,sql_files_path)
    endDrop = dummy_task('endDrop',dag)
    [drop_AUX_A0323_CONS_TRAF_CLI_A, drop_AUX_A0323_CONS_TRAF_CLI_B, drop_AUX_A0323_CONS_TRAF_CLI_C, truncate_CONSUMO_TRAFICO_NAV_MB_MES] >> endDrop
    return endDrop
```

#### 4.2.5 Flujo de ejecución

```python
"""
Flujo de ejecución
"""
with dag:
    start = dummy_task('start',dag)
    end = dummy_task('end',dag)
    ejecucionDrop = eliminarTablasAuxiliares()
    ejecucionDrop >> start
    ejecucionProc = ejecutarProceso(start)
    ejecucionProc >> end
```

## 5. Módulos para Ejecución de Sentencias SQL

### 5.1 RAC8: `mod_oracle_query.Run_Oracle`

#### 5.1.1 `generate_etl_operation(nom_task, files, connection_id, carpeta, variables_etl)`

Ejecuta una sentencia SQL de Oracle desde un archivo.

| Parámetro | Descripción |
|-----------|-------------|
| `nom_task` | Nombre de la tarea |
| `files` | Nombre del archivo SQL |
| `connection_id` | Conexión a la base de datos |
| `carpeta` | Variable que contiene la ubicación de los archivos SQL |
| `variables_etl` | Variables extras (no macros de Airflow) |

#### 5.1.2 `generate_etl_query(nom_task, sql_query, connection_id)`

Ejecuta una sentencia SQL de Oracle directamente.

| Parámetro | Descripción |
|-----------|-------------|
| `nom_task` | Nombre de la tarea |
| `sql_query` | Consulta SQL a realizar |
| `connection_id` | Conexión a la base de datos |

#### 5.1.3 `insert_dataframe_oracle(df_fin, table, connection_id)`

Inserta un dataframe en una tabla de Oracle.

| Parámetro | Descripción |
|-----------|-------------|
| `df_fin` | Dataframe a insertar |
| `table` | Tabla destino |
| `connection_id` | Conexión a la base de datos |

### 5.2 CLOUDERA: `mod_cloudera_query.Run_Cloudera`

#### 5.2.1 `generate_etl_operator_PAIS(nom_tarea, files, etl_args, carpeta)`

Ejecuta una sentencia SQL en Cloudera para un país específico (AR, UY, PY).

| Parámetro | Descripción |
|-----------|-------------|
| `nom_tarea` | Nombre de la tarea |
| `files` | Nombre del archivo SQL |
| `etl_args` | Variables extras (no macros de Airflow) |
| `carpeta` | Variable que contiene la ubicación de los archivos SQL |

### 5.3 Dependencias: `mod_dependencia.Run_Sensor`

#### 5.3.1 `operator_sensor_cloudera_sql(nom_tarea, sql, esquema_pais, poke_interval, timeout)`

Sensor tipo PythonSensor para ejecutar consultas SQL en Cloudera.

| Parámetro | Descripción |
|-----------|-------------|
| `nom_tarea` | Nombre de la tarea |
| `sql` | Consulta SQL a ejecutar (debe retornar True o False) |
| `esquema_pais` | Esquema del país para la ejecución |
| `poke_interval` | Duración en segundos entre reintentos (típicamente 1800s) |
| `timeout` | Tiempo máximo de espera para reintentos (típicamente 5400s) |

**Ejemplo de script SQL:**
```sql
SELECT CASE WHEN CONDICION_AFIRMATIVA THEN true
       ELSE false END
FROM NOMBRE_TABLA
WHERE (Si es que hace falta) 
GROUP BY (Si es que hace falta)  
HAVING (Si es que hace falta);
```

#### 5.3.2 `operator_sensor_oracle(filename, nom_tarea, connection_id, parametros, carpeta, poke_interval, timeout)`

Sensor tipo SqlSensor para ejecutar scripts SQL en Oracle.

| Parámetro | Descripción |
|-----------|-------------|
| `filename` | Nombre del archivo de control |
| `nom_tarea` | Nombre de la tarea |
| `connection_id` | Conexión a la base de datos Oracle |
| `parametros` | Parámetros para el script |
| `carpeta` | Variable de ruta |
| `poke_interval` | Duración en segundos entre reintentos (típicamente 1800s) |
| `timeout` | Tiempo máximo de espera para reintentos (típicamente 5400s) |

## 6. Etiquetas (TAGS)

Para una mejor organización, búsqueda y soporte, se deben definir etiquetas en dos categorías:

### 6.1 Estructura/área de trabajo

**Prefijos:**
- **DataWarehouse**: DW
- **ArqDW**: ArqDW
- **Replica**: RP
- **Otro**: OT

### 6.2 Carpeta

Indica la ubicación del DAG en la estructura de directorios:
- Carpeta: DataWarehouse
- Carpeta: Replica
- Carpeta: ArqDW
- Carpeta: AplicacionesIT

### 6.3 Origen y Destino

Se debe especificar el origen y destino de la información:
- BDOri: PROD
- BDDes: RAC8

### Ejemplo de definición de TAGs:

```python
dag = DAG(
        DAG_ID,
        default_args=default_args,
        schedule_interval=SCHEDULE_INTERVAL,
        tags=['Carpeta: Replica','RP','BDOri: PROD','BDDes: RAC8'],
        max_active_runs=1,
        concurrency=1,
        is_paused_upon_creation=False)
```

## 7. Actualización de Diccionario de Datos

### 7.1 RAC8

Después de actualizar una tabla, se debe actualizar la tabla del diccionario de datos:

```sql
UPDATE actualizacion_racing
SET act_actualiz_date = SYSDATE
   ,act_old_date = act_actualiz_date
WHERE act_table_name = 'CUSTOMER_BASE_NUEVO'
/
```

### 7.2 GEN8

```sql
UPDATE ACTUALIZACION_GENESIS
SET act_actualiz_date = SYSDATE
   ,act_old_date = act_actualiz_date
WHERE act_table_name = 'B_ASE_INGRESOS_PP_CR'
/
```

---

## Historial de Versiones

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 1.0 | 25/04/2023 | Documento inicial creado por Nicolas Nuñez y Gabriel Waisman |
| 2.0 | 17/10/2023 | Agregado librería Pendulum para configuración UTC, más módulos |
| 3.0 | 15/08/2024 | Agregado actualización de diccionario en RAC8 |
