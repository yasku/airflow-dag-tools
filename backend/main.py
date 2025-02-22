# Descripción: Este archivo inicializa FastAPI, define las rutas principales y permite interactuar con la API.
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dag_validator import validate_dag
import tempfile
import uuid
import json
import ast
import graphviz
from io import StringIO
import base64
from docstring_parser import parse as parse_docstring
from pyment import PyComment
import re

# Inicializar la aplicación FastAPI
app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directorio donde se guardarán los DAGs subidos
DAGS_DIR = "dags"
os.makedirs(DAGS_DIR, exist_ok=True)  # Crear carpeta si no existe

# Rutas para los archivos de configuración
CONFIG_DIR = "config"
DOC_CONFIG_FILE = os.path.join(CONFIG_DIR, "documentation.json")
TEMPLATE_CONFIG_FILE = os.path.join(CONFIG_DIR, "template.py")

# Asegurar que el directorio de configuración existe
os.makedirs(CONFIG_DIR, exist_ok=True)

# Configuración por defecto
DEFAULT_DOCUMENTATION = {
    "sections": [
        {
            "id": "getting-started",
            "title": "Empezando",
            "icon": "M13 10V3L4 14h7v7l9-11h-7z",
            "cards": [
                {"title": "Introducción", "content": "Contenido de introducción..."},
                {"title": "Primeros Pasos", "content": "Contenido de primeros pasos..."}
            ]
        },
        {
            "id": "best-practices",
            "title": "Buenas Prácticas",
            "icon": "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
            "cards": [
                {"title": "Mejores Prácticas", "content": "Contenido de mejores prácticas..."}
            ]
        }
    ]
}

DEFAULT_TEMPLATE = """from airflow import DAG
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
    )"""

@app.get("/")
def read_root():
    """
    Ruta principal de prueba.
    Retorna un mensaje confirmando que el servidor está corriendo.
    """
    return {"message": "API de Validación de DAGs en Airflow"}

@app.post("/validate_dag/")
async def validate_dag_endpoint(file: UploadFile = File(...)):
    """
    Valida un DAG usando un archivo temporal con nombre único.
    No persiste el archivo si es válido.
    """
    try:
        # Crear un nombre temporal único usando uuid
        temp_filename = f"temp_{uuid.uuid4().hex}.py"
        file_location = os.path.join(DAGS_DIR, temp_filename)
        
        try:
            # Guardar el archivo temporal
            with open(file_location, "wb") as buffer:
                buffer.write(await file.read())
            
            # Validar el DAG
            validation_result = validate_dag(file_location)
            
            return validation_result
        finally:
            # Siempre eliminar el archivo temporal, sin importar el resultado
            if os.path.exists(file_location):
                os.unlink(file_location)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-dag")
async def generate_dag(dag_data: dict):
    try:
        # Leer el template
        with open("dags/dag_template.py", "r") as f:
            template = f.read()
        
        # Reemplazar valores en el template
        code = template.replace("my_dag_name", dag_data["dagName"])
        code = code.replace("Description of your DAG", dag_data["description"])
        code = code.replace("your-email@example.com", dag_data["email"])
        
        # Guardar el DAG generado
        with open(f"dags/{dag_data['dagName']}.py", "w") as f:
            f.write(code)
            
        return {"code": code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/get-template")
async def get_template():
    try:
        # Usar dag_test.py como template
        with open("dags/dag_test.py", "r") as f:
            template = f.read()
            
        # Limpiar el template para uso general
        template = template.replace(
            'dag_id="simple_dag"',
            'dag_id="my_dag_name"'  # Será reemplazado con el nombre que ingrese el usuario
        ).replace(
            '"¡Este es un DAG de prueba en Airflow 2.5!"',
            '"Descripción de la tarea"'
        )
            
        return template
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/validate-dag")
async def validate_dag_code(data: dict):
    try:
        # Crear un archivo temporal para validar el código
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp_file:
            temp_file.write(data['code'])
            temp_path = temp_file.name

        # Validar el DAG
        validation_result = validate_dag(temp_path)
        
        # Limpiar el archivo temporal
        os.unlink(temp_path)
        
        return validation_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/create-temp-dag")
async def create_temp_dag(dag_data: dict):
    try:
        temp_file = f"dags/temp_{dag_data['name']}.py"
        with open(temp_file, "w") as f:
            f.write(dag_data['code'])
        
        # Validar el DAG temporal
        validation_result = validate_dag(temp_file)
        
        # Si no es válido, eliminar el archivo temporal
        if not validation_result['valid']:
            os.unlink(temp_file)
            
        return validation_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save_dag/")
async def save_dag_endpoint(file: UploadFile = File(...)):
    try:
        # Verificar si ya existe un DAG con ese nombre
        dag_path = os.path.join("dags", file.filename)
        if os.path.exists(dag_path):
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe un DAG con el nombre {file.filename}"
            )
        
        # Guardar el archivo
        contents = await file.read()
        with open(dag_path, "wb") as f:
            f.write(contents)
            
        return {"success": True, "message": "DAG guardado exitosamente"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/list_dags/")
async def list_dags():
    try:
        dags_dir = "dags"
        dags = [f for f in os.listdir(dags_dir) if f.endswith('.py')]
        return {"dags": dags}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_dag_content/{dag_name}")
async def get_dag_content(dag_name: str):
    try:
        with open(f"dags/{dag_name}", "r") as file:
            content = file.read()
        return {"content": content}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="DAG no encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoints para la documentación
@app.get("/config/documentation/")
async def get_documentation():
    try:
        if not os.path.exists(DOC_CONFIG_FILE):
            with open(DOC_CONFIG_FILE, 'w') as f:
                json.dump(DEFAULT_DOCUMENTATION, f, indent=2)
            return DEFAULT_DOCUMENTATION
        
        with open(DOC_CONFIG_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/config/documentation/")
async def update_documentation(sections: dict):
    try:
        with open(DOC_CONFIG_FILE, 'w') as f:
            json.dump(sections, f, indent=2)
        return {"message": "Documentación actualizada correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoints para el template
@app.get("/config/template/")
async def get_template():
    try:
        if not os.path.exists(TEMPLATE_CONFIG_FILE):
            with open(TEMPLATE_CONFIG_FILE, 'w') as f:
                f.write(DEFAULT_TEMPLATE)
            return {"template": DEFAULT_TEMPLATE}
        
        with open(TEMPLATE_CONFIG_FILE, 'r') as f:
            return {"template": f.read()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/config/template/")
async def update_template(template: dict):
    try:
        with open(TEMPLATE_CONFIG_FILE, 'w') as f:
            f.write(template["template"])
        return {"message": "Template actualizado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete_dag/{dag_name}")
async def delete_dag(dag_name: str):
    try:
        dag_path = os.path.join("dags", dag_name)
        if not os.path.exists(dag_path):
            raise HTTPException(
                status_code=404,
                detail=f"No se encontró el DAG {dag_name}"
            )
        
        os.remove(dag_path)
        return {"message": f"DAG {dag_name} eliminado correctamente"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def extract_python_tasks(dag_file_path):
    """Extrae las tareas y sus relaciones del archivo DAG usando ast"""
    with open(dag_file_path, 'r') as file:
        content = file.read()
        tree = ast.parse(content)
        
    tasks = []
    task_dependencies = []
    
    for node in ast.walk(tree):
        # Encontrar asignaciones de tareas (task = PythonOperator(...))
        if isinstance(node, ast.Assign):
            if isinstance(node.value, ast.Call):
                if isinstance(node.value.func, ast.Name) and 'Operator' in node.value.func.id:
                    task_id = None
                    for kw in node.value.keywords:
                        if kw.arg == 'task_id':
                            if isinstance(kw.value, ast.Str):
                                task_id = kw.value.s
                    if task_id:
                        tasks.append({
                            'id': task_id,
                            'type': node.value.func.id,
                            'var_name': node.targets[0].id
                        })
        
        # Encontrar dependencias (task1 >> task2)
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.RShift):
            left = node.left.id if isinstance(node.left, ast.Name) else None
            right = node.right.id if isinstance(node.right, ast.Name) else None
            if left and right:
                task_dependencies.append((left, right))
    
    return tasks, task_dependencies

def generate_dag_diagram(dag_file_path):
    """Genera un diagrama del DAG usando graphviz"""
    tasks, dependencies = extract_python_tasks(dag_file_path)
    
    dot = graphviz.Digraph(comment='DAG Diagram')
    dot.attr(rankdir='LR')
    
    # Agregar nodos
    for task in tasks:
        dot.node(task['var_name'], task['id'])
    
    # Agregar dependencias
    for dep in dependencies:
        dot.edge(dep[0], dep[1])
    
    # Generar imagen en formato base64
    img_data = dot.pipe(format='png')
    encoded = base64.b64encode(img_data).decode('utf-8')
    
    return f"data:image/png;base64,{encoded}"

def generate_docstrings(code):
    """Genera docstrings para funciones que no los tienen"""
    c = PyComment(code)
    output = c.proceed()
    return output[0][1]  # Retorna el código con docstrings generados

def analyze_function(node):
    """Analiza una función y extrae información relevante"""
    # Extraer argumentos y su tipo si está disponible
    args = []
    for arg in node.args.args:
        arg_info = {
            'name': arg.arg,
            'type': None
        }
        if hasattr(arg, 'annotation') and isinstance(arg.annotation, ast.Name):
            arg_info['type'] = arg.annotation.id
        args.append(arg_info)

    # Analizar el cuerpo de la función para entender qué hace
    body_info = {
        'has_print': False,
        'has_return': False,
        'modifies_data': False,
        'calls': [],
    }

    for n in ast.walk(node):
        if isinstance(n, ast.Call):
            if isinstance(n.func, ast.Name):
                body_info['calls'].append(n.func.id)
        elif isinstance(n, ast.Print):
            body_info['has_print'] = True
        elif isinstance(n, ast.Return):
            body_info['has_return'] = True
        elif isinstance(n, ast.Assign):
            body_info['modifies_data'] = True

    return args, body_info

def generate_function_description(func_name, args, body_info):
    """Genera una descripción en lenguaje natural de la función"""
    desc = f"Función que "
    
    # Describir el propósito basado en el nombre
    if "get" in func_name.lower():
        desc += "obtiene "
    elif "set" in func_name.lower():
        desc += "establece "
    elif "process" in func_name.lower():
        desc += "procesa "
    elif "validate" in func_name.lower():
        desc += "valida "
    else:
        desc += "ejecuta "

    # Agregar información sobre lo que hace
    if body_info['has_print']:
        desc += "e imprime información. "
    if body_info['has_return']:
        desc += "y retorna un resultado. "
    if body_info['modifies_data']:
        desc += "y modifica datos. "

    # Agregar información sobre argumentos
    if args:
        desc += "\n\nParámetros:\n"
        for arg in args:
            desc += f"    {arg['name']}"
            if arg['type']:
                desc += f" ({arg['type']})"
            desc += "\n"

    return desc

def extract_dag_info(dag_file_path):
    """Extrae información del DAG y genera documentación automática"""
    with open(dag_file_path, 'r') as file:
        content = file.read()
        
    # Generar docstrings si no existen
    content_with_docs = generate_docstrings(content)
    tree = ast.parse(content_with_docs)
        
    dag_info = {
        'functions': [],
        'imports': [],
        'tasks': []
    }
    
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            args, body_info = analyze_function(node)
            func_desc = generate_function_description(node.name, args, body_info)
            
            func_info = {
                'name': node.name,
                'description': func_desc,
                'args': [arg['name'] for arg in args],
                'calls': body_info['calls']
            }
            dag_info['functions'].append(func_info)
            
        # Extraer imports
        if isinstance(node, ast.Import):
            dag_info['imports'].extend(n.name for n in node.names)
        elif isinstance(node, ast.ImportFrom):
            dag_info['imports'].append(f"{node.module}.{node.names[0].name}")
            
        # Extraer tareas y dependencias
        tasks, dependencies = extract_python_tasks(dag_file_path)
        dag_info['tasks'] = {
            'nodes': tasks,
            'edges': dependencies
        }
    
    return dag_info

@app.post("/generate_dag_doc/{dag_name}")
async def generate_dag_doc(dag_name: str, doc_data: dict):
    try:
        # Generar el markdown basado en los datos del formulario
        markdown = f"""# Documentación del DAG: {dag_name}

## Información General

**Descripción:**  
{doc_data['description']}

**Programación:**  
{doc_data['schedule']}

**Responsable:**  
{doc_data['owner']}

## Tareas

"""
        # Agregar información de cada tarea
        for task in doc_data['tasks']:
            markdown += f"""### {task['name']}
{task['description']}

"""

        if doc_data['dependencies']:
            markdown += f"""## Dependencias
{doc_data['dependencies']}

"""

        if doc_data['notes']:
            markdown += f"""## Notas Adicionales
{doc_data['notes']}
"""

        # Guardar el markdown en un archivo
        doc_path = os.path.join(DAGS_DIR, f"{dag_name}_documentation.md")
        with open(doc_path, "w", encoding='utf-8') as f:
            f.write(markdown)

        return {"documentation": markdown}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_dag_diagram/{dag_name}")
async def get_dag_diagram(dag_name: str):
    try:
        dag_path = os.path.join(DAGS_DIR, dag_name)
        if not os.path.exists(dag_path):
            raise HTTPException(status_code=404, detail="DAG no encontrado")
        
        tasks, dependencies = extract_python_tasks(dag_path)
        return {
            "tasks": tasks,
            "dependencies": dependencies
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
