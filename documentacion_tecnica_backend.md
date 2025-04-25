# Documentación Técnica y Funcional del Backend

## 1. Introducción

Este documento describe la arquitectura, componentes y funcionalidades del backend del sistema de gestión de DAGs de Airflow. El sistema proporciona una API REST que permite a los usuarios crear, validar, gestionar y documentar flujos de trabajo (DAGs) para Apache Airflow, así como módulos personalizados que pueden ser utilizados en estos flujos.

## 2. Arquitectura General

El backend está implementado como una API REST utilizando FastAPI, un framework moderno de Python para desarrollo de APIs con alto rendimiento. La aplicación se estructura en varios componentes principales:

- **API REST**: Implementada con FastAPI, proporciona endpoints para todas las operaciones.
- **Validador de DAGs**: Valida la sintaxis y estructura de los DAGs de Airflow.
- **Gestor de módulos personalizados**: Permite cargar y utilizar módulos Python en los DAGs.
- **Sistema de plantillas**: Facilita la creación de nuevos DAGs a partir de plantillas predefinidas.
- **Sistema de documentación**: Permite documentar DAGs y módulos personalizados.

## 3. Componentes Principales

### 3.1. API REST (main.py)

El archivo `main.py` es el punto de entrada principal del backend e implementa la API REST con FastAPI. La API expone múltiples endpoints para interactuar con todas las funcionalidades del sistema.

#### Principales endpoints:

| Categoría | Endpoints | Descripción |
|-----------|-----------|-------------|
| DAGs | `/validate_dag/`, `/save_dag/`, `/list_dags/`, `/get_dag_content/{dag_name}`, `/delete_dag/{dag_name}` | Gestión completa de DAGs |
| Documentación | `/save_dag_documentation`, `/generate_dag_doc/{dag_name}` | Gestión de documentación de DAGs |
| Plantillas | `/list_templates/`, `/get_template/{template_name}`, `/save_template/`, `/delete_template/{template_name}` | Gestión de plantillas de DAGs |
| Módulos personalizados | `/upload_custom_module/`, `/list_custom_modules/`, `/get_custom_module/{module_name}`, `/delete_custom_module/{module_name}` | Gestión de módulos Python personalizados |
| Documentación de módulos | `/module_documentation/{module_name}`, `/modules_with_documentation/` | Gestión de documentación para módulos |
| Configuración | `/config/documentation/`, `/config/template/` | Gestión de configuraciones del sistema |

#### Funciones principales:

1. **Validación de DAGs**:
   - Permite verificar si un DAG tiene una sintaxis Python correcta
   - Comprueba si la estructura del DAG es válida para Airflow
   - Proporciona mensajes de error detallados

2. **Gestión de DAGs**:
   - Crear, leer, actualizar y eliminar DAGs
   - Generar diagramas de flujo para visualizar DAGs
   - Analizar dependencias de los DAGs

3. **Documentación**:
   - Generación automática de documentación para DAGs
   - Almacenamiento y gestión de documentación en formato Markdown
   - Gestión de metadatos de documentación

4. **Gestión de módulos personalizados**:
   - Carga y gestión de módulos Python para ser utilizados en DAGs
   - Documentación de módulos personalizados
   - Análisis de dependencias de módulos

### 3.2. Validador de DAGs (dag_validator.py)

El archivo `dag_validator.py` implementa la lógica para validar DAGs de Airflow sin necesidad de ejecutarlos. Este componente es fundamental para garantizar que los DAGs creados por los usuarios sean válidos antes de ser utilizados en Airflow.

#### Funcionalidades principales:

1. **Validación de sintaxis Python**:
   - Utiliza el módulo `ast` de Python para verificar errores de sintaxis
   - Proporciona información detallada sobre errores de sintaxis

2. **Validación de estructura de DAGs**:
   - Utiliza `DagBag` de Airflow para validar la estructura del DAG
   - Verifica que el DAG pueda ser importado correctamente por Airflow

3. **Gestión de módulos personalizados**:
   - Permite registrar y utilizar módulos personalizados durante la validación
   - Gestiona la configuración de rutas de módulos

4. **Análisis de dependencias**:
   - Analiza las dependencias importadas en los DAGs
   - Identifica módulos externos necesarios para el DAG

### 3.3. Módulos Personalizados (custom_modules/)

El directorio `custom_modules/` contiene módulos Python personalizados que pueden ser utilizados en los DAGs. Estos módulos proporcionan funcionalidades adicionales o específicas para determinados flujos de trabajo.

#### Ejemplos de módulos:

1. **mod_postgres_query.py**:
   - Proporciona funciones para trabajar con bases de datos PostgreSQL
   - Incluye métodos para crear conexiones, ejecutar consultas y cargar datos

2. **mod_oracle_query.py**:
   - Proporciona funciones para trabajar con bases de datos Oracle
   - Implementa métodos para consultas, operaciones ETL e inserción de datos
   - Ofrece funciones como:
     - Ejecución de consultas SQL
     - Inserción de DataFrames en tablas
     - Gestión de conexiones desde Airflow

### 3.4. DAGs (dags/)

El directorio `dags/` almacena los DAGs (Directed Acyclic Graphs) que representan flujos de trabajo en Airflow. Estos archivos son scripts Python que definen tareas y sus dependencias.

#### Estructura típica de un DAG:

```python
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
    print("Ejecutando tarea 1...")

def task_2():
    print("Ejecutando tarea 2...")

with DAG(
    'example_dag',
    default_args=default_args,
    description='Un DAG de ejemplo',
    schedule_interval='@daily',
    catchup=False,
) as dag:

    task1 = PythonOperator(
        task_id='task_1',
        python_callable=task_1,
    )

    task2 = PythonOperator(
        task_id='task_2',
        python_callable=task_2,
    )

    task1 >> task2  # Define la dependencia entre tareas
```

### 3.5. Plantillas (templates/)

El directorio `templates/` contiene plantillas predefinidas de DAGs que pueden ser utilizadas como base para crear nuevos flujos de trabajo. Estas plantillas facilitan la creación de DAGs siguiendo patrones establecidos.

#### Tipos de plantillas:

- **DAGs básicos**: Estructura mínima para un DAG funcional
- **DAGs de ETL**: Plantillas con estructura para procesos de extracción, transformación y carga
- **DAGs específicos**: Plantillas para casos de uso particulares

### 3.6. Documentación (module_docs/ y dag_docs/)

El sistema implementa una gestión de documentación para DAGs y módulos personalizados, almacenando esta documentación en formato Markdown junto con metadatos asociados.

#### Funcionalidades:

- **Documentación de DAGs**: Almacenada en `dag_docs/`, incluye descripción, tareas, dependencias y notas adicionales
- **Documentación de módulos**: Almacenada en `module_docs/`, incluye descripción de funcionalidades, ejemplos de uso y metadatos
- **Generación automática**: El sistema puede generar documentación a partir de docstrings y análisis de código
- **Gestión de metadatos**: Incluye información como autor y fecha de última modificación

## 4. Flujos de Trabajo Típicos

### 4.1. Creación y Validación de un DAG

1. El usuario crea un DAG utilizando una plantilla o código personalizado
2. El sistema valida la sintaxis Python del DAG
3. El sistema valida la estructura del DAG para Airflow
4. Si el DAG es válido, se guarda en el directorio `dags/`
5. El usuario puede generar documentación para el DAG

### 4.2. Gestión de Módulos Personalizados

1. El usuario crea un módulo Python personalizado
2. El usuario carga el módulo a través de la API
3. El sistema almacena el módulo en `custom_modules/`
4. El usuario puede documentar el módulo
5. El módulo puede ser utilizado en los DAGs

### 4.3. Generación de Documentación

1. El usuario selecciona un DAG o módulo para documentar
2. El sistema puede generar automáticamente documentación inicial basada en el código
3. El usuario puede editar y mejorar la documentación
4. El sistema almacena la documentación en formato Markdown con metadatos
5. La documentación puede ser consultada a través de la API

## 5. Tecnologías Utilizadas

- **FastAPI**: Framework de Python para desarrollo de APIs RESTful de alto rendimiento
- **Airflow**: Sistema de orquestación de flujos de trabajo
- **Python AST**: Módulo para análisis de sintaxis Python
- **Graphviz**: Biblioteca para generación de diagramas
- **Markdown**: Formato para documentación
- **JSON**: Formato para configuración y metadatos

## 6. Dependencias Principales

El sistema requiere diversas dependencias de Python, incluyendo:

- **apache-airflow**: Para la validación y estructura de DAGs
- **fastapi**: Framework para la API REST
- **uvicorn**: Servidor ASGI para FastAPI
- **graphviz**: Para generación de diagramas
- **psycopg2**: Para interacción con PostgreSQL
- **docstring_parser**: Para análisis de docstrings
- **pyment**: Para generación de docstrings

## 7. Conclusiones y Consideraciones

Este sistema proporciona una plataforma completa para la gestión de DAGs de Airflow a través de una API moderna y funcional. Las principales ventajas son:

- **Validación previa**: Garantiza que los DAGs son válidos antes de ser ejecutados
- **Modularidad**: Permite reutilizar código a través de módulos personalizados
- **Documentación integrada**: Facilita el mantenimiento y comprensión de los flujos de trabajo
- **Sistema de plantillas**: Acelera la creación de nuevos DAGs siguiendo patrones establecidos

Como consideraciones para el desarrollo futuro, se podría:

- Implementar autenticación y autorización para la API
- Mejorar la integración con sistemas de control de versiones
- Ampliar las capacidades de análisis y visualización de DAGs
- Implementar pruebas automatizadas para DAGs y módulos

---

*Este documento técnico describe la arquitectura y funcionalidades del backend del sistema de gestión de DAGs de Airflow.* 