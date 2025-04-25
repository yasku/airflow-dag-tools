# Descripción: Este archivo inicializa FastAPI, define las rutas principales y permite interactuar con la API.
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dag_validator import (
    validate_dag, 
    add_module_path,           # Mantener para compatibilidad
    remove_dependency,         # Mantener para compatibilidad
    get_available_modules,     # Nueva función
    get_dependencies,          # Función renombrada pero mantenida para compatibilidad
    analyze_dag_dependencies,
    get_custom_modules_dir     # Nueva función
)
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
from datetime import datetime

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

# Add to main.py constants
TEMPLATES_DIR = "templates"
os.makedirs(TEMPLATES_DIR, exist_ok=True)  # Create directory if it doesn't exist

# Añadir a las constantes de directorios en main.py
CUSTOM_MODULES_DIR = "custom_modules"
os.makedirs(CUSTOM_MODULES_DIR, exist_ok=True)  # Crear carpeta si no existe

# Después de las definiciones de directorios existentes, añadir este nuevo directorio
MODULE_DOCS_DIR = "module_docs"
os.makedirs(MODULE_DOCS_DIR, exist_ok=True)  # Crear la carpeta si no existe

# Añadir a las constantes de directorios en main.py
DAG_DOCS_DIR = "dag_docs"
os.makedirs(DAG_DOCS_DIR, exist_ok=True)  # Crear la carpeta si no existe

# @app.get("/")
# def read_root():
#     """
#     Ruta principal de prueba.
#     Retorna un mensaje confirmando que el servidor está corriendo.
#     """
#     return {"message": "API de Validación de DAGs en Airflow"}

@app.post("/validate_dag/")
async def validate_dag_endpoint(
    file: UploadFile = File(...),
    use_custom_dependencies: bool = True
):
    """
    Valida un DAG usando un archivo temporal con nombre único.
    No persiste el archivo si es válido.
    El parámetro use_custom_dependencies se mantiene para compatibilidad,
    pero ahora siempre se utilizan los módulos disponibles.
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
            # Nota: use_custom_dependencies se ignora internamente, pero se mantiene para compatibilidad
            validation_result = validate_dag(file_location, use_custom_dependencies)
            
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
            data = json.load(f)
            
        # Normalizar la estructura de datos para manejar casos incorrectos
        if "sections" in data:
            if isinstance(data["sections"], dict) and "sections" in data["sections"]:
                # Estructura anidada incorrecta - corregir
                data = {"sections": data["sections"]["sections"]}
            elif isinstance(data["sections"], list):
                # Estructura correcta
                pass
            else:
                # Estructura desconocida - usar predeterminado
                data = DEFAULT_DOCUMENTATION
        else:
            # Sin secciones - usar predeterminado
            data = DEFAULT_DOCUMENTATION
            
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/config/documentation/")
async def update_documentation(sections: dict):
    try:
        # Verificar y normalizar la estructura de datos
        if "sections" in sections:
            # Si recibimos un objeto con propiedad 'sections'
            if isinstance(sections["sections"], dict) and "sections" in sections["sections"]:
                # Corregir anidamiento incorrecto
                data_to_save = {"sections": sections["sections"]["sections"]}
            elif isinstance(sections["sections"], list):
                # Estructura correcta
                data_to_save = {"sections": sections["sections"]}
            else:
                # Otro tipo de dato, probablemente incorrecto - usar array vacío
                data_to_save = {"sections": []}
        else:
            # Si no tiene propiedad 'sections', asumimos que es directamente el array
            # de secciones o que es un objeto con estructura incorrecta
            if isinstance(sections, list):
                data_to_save = {"sections": sections}
            else:
                # Objeto con estructura desconocida - usar array vacío
                data_to_save = {"sections": []}
            
        with open(DOC_CONFIG_FILE, 'w') as f:
            json.dump(data_to_save, f, indent=2)
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

@app.post("/save_dag_documentation")
async def save_dag_documentation(request: dict):
    """
    Guarda la documentación del DAG en una carpeta específica con el nombre del DAG.
    """
    try:
        dag_name = request.get("dag_name")
        content = request.get("content")
        
        if not dag_name or not content:
            raise HTTPException(status_code=400, detail="El nombre del DAG y el contenido son requeridos")
        
        # Crear directorio para este DAG si no existe
        dag_doc_dir = os.path.join(DAG_DOCS_DIR, dag_name)
        os.makedirs(dag_doc_dir, exist_ok=True)
        
        # Ruta del archivo
        filepath = os.path.join(dag_doc_dir, f"{dag_name}_documentation.md")
        
        # Guardar el contenido en el archivo
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        
        return {
            "success": True,
            "filepath": filepath
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

        # Guardar el markdown en un archivo (mantener para compatibilidad)
        doc_path = os.path.join(DAGS_DIR, f"{dag_name}_documentation.md")
        with open(doc_path, "w", encoding='utf-8') as f:
            f.write(markdown)
            
        # Guardar también en la carpeta específica del DAG
        dag_doc_dir = os.path.join(DAG_DOCS_DIR, dag_name)
        os.makedirs(dag_doc_dir, exist_ok=True)
        
        # Ruta del archivo en la carpeta específica
        filepath = os.path.join(dag_doc_dir, f"{dag_name}_documentation.md")
        
        # Guardar el contenido en el archivo
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(markdown)

        return {"documentation": markdown, "filepath": filepath}
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

@app.get("/list_templates/")
async def list_templates():
    """
    Lists all available DAG templates.
    """
    try:
        templates_dir = TEMPLATES_DIR
        templates = [f.replace('.py', '') for f in os.listdir(templates_dir) if f.endswith('.py')]
        return {"templates": templates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_template/{template_name}")
async def get_template_by_name(template_name: str):
    """
    Returns the content of a specific template.
    """
    try:
        template_path = os.path.join(TEMPLATES_DIR, f"{template_name}.py")
        if not os.path.exists(template_path):
            raise HTTPException(status_code=404, detail=f"Template {template_name} not found")
            
        with open(template_path, "r") as file:
            content = file.read()
        return {"template": content}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save_template/")
async def save_template(template_data: dict):
    """
    Saves a new template.
    """
    try:
        if not template_data.get("name") or not template_data.get("content"):
            raise HTTPException(status_code=400, detail="Name and content are required")
            
        template_path = os.path.join(TEMPLATES_DIR, f"{template_data['name']}.py")
        
        # Check if template already exists
        if os.path.exists(template_path) and not template_data.get("overwrite", False):
            raise HTTPException(status_code=400, detail=f"Template {template_data['name']} already exists")
            
        # Save template
        with open(template_path, "w") as file:
            file.write(template_data["content"])
            
        return {"message": f"Template {template_data['name']} saved successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete_template/{template_name}")
async def delete_template(template_name: str):
    """
    Deletes a template.
    """
    try:
        template_path = os.path.join(TEMPLATES_DIR, f"{template_name}.py")
        if not os.path.exists(template_path):
            raise HTTPException(
                status_code=404,
                detail=f"No se encontró el template {template_name}"
            )
        
        os.remove(template_path)
        return {"message": f"Template {template_name} eliminado correctamente"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dependencies/")
async def list_dependencies():
    """
    Lista todos los módulos disponibles registrados.
    Se mantiene la ruta para compatibilidad con el frontend existente.
    """
    try:
        modules_data = get_dependencies()
        return modules_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/available_modules/")
async def list_available_modules():
    """
    Lista todos los módulos disponibles registrados.
    """
    try:
        modules_data = get_available_modules()
        return modules_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/dependencies/package/")
async def add_dependency_package(dependency_data: dict):
    """
    Endpoint obsoleto que no realiza ninguna acción.
    Se mantiene para compatibilidad con el frontend existente.
    """
    return {"message": "Este endpoint está obsoleto. Use /upload_custom_module/ para gestionar módulos."}

@app.post("/dependencies/module_path/")
async def add_dependency_module_path(dependency_data: dict):
    """
    Añade una ruta de módulo personalizado.
    Se mantiene la ruta para compatibilidad con el frontend existente.
    """
    try:
        if not dependency_data.get("path"):
            raise HTTPException(status_code=400, detail="La ruta del módulo es requerida")
            
        result = add_module_path(dependency_data["path"])
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])
            
        return {"message": result["message"]}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/dependencies/{dependency_type}/{value}")
async def delete_dependency_endpoint(dependency_type: str, value: str):
    """
    Elimina una ruta de módulo específica.
    Se mantiene la ruta para compatibilidad con el frontend existente.
    """
    try:
        if dependency_type not in ["package", "module_path"]:
            raise HTTPException(
                status_code=400, 
                detail="Tipo de dependencia no válido. Debe ser 'package' o 'module_path'"
            )
            
        # Si es 'package', simplemente retornar éxito
        if dependency_type == "package":
            return {"message": "La gestión de paquetes está obsoleta. Use módulos personalizados."}
            
        result = remove_dependency(dependency_type, value)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])
            
        return {"message": result["message"]}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/available_modules/")
async def save_available_modules(modules_data: dict):
    """
    Guarda la configuración completa de módulos disponibles.
    Útil para guardar cambios en bloque desde el panel de administración.
    """
    try:
        # Aseguramos que el directorio de módulos personalizados siempre esté incluido
        custom_modules_path = get_custom_modules_dir()
        
        if "modules_paths" not in modules_data:
            modules_data["modules_paths"] = []
            
        if custom_modules_path not in modules_data["modules_paths"]:
            modules_data["modules_paths"].append(custom_modules_path)
            
        # Eliminamos la sección de paquetes si existe
        if "packages" in modules_data:
            del modules_data["packages"]
            
        result = save_available_modules(modules_data)
        
        if not result:
            raise HTTPException(status_code=400, detail="Error al guardar los módulos disponibles")
            
        return {"message": "Módulos disponibles guardados correctamente"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze_dag_dependencies/")
async def analyze_dag_dependencies_endpoint(file: UploadFile = File(...)):
    """
    Analiza un archivo DAG para detectar posibles módulos importados.
    Retorna una lista de módulos importados en el DAG.
    """
    try:
        # Crear un nombre temporal único usando uuid
        temp_filename = f"temp_analyze_{uuid.uuid4().hex}.py"
        file_location = os.path.join(DAGS_DIR, temp_filename)
        
        try:
            # Guardar el archivo temporal
            with open(file_location, "wb") as buffer:
                buffer.write(await file.read())
            
            # Analizar módulos importados en el DAG
            analysis_result = analyze_dag_dependencies(file_location)
            
            return analysis_result
        finally:
            # Siempre eliminar el archivo temporal
            if os.path.exists(file_location):
                os.unlink(file_location)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload_custom_module/")
async def upload_custom_module(file: UploadFile = File(...)):
    """
    Sube un módulo Python personalizado al directorio de módulos.
    El archivo debe tener extensión .py
    """
    try:
        # Verificar que es un archivo Python
        if not file.filename.endswith('.py'):
            raise HTTPException(
                status_code=400,
                detail="El archivo debe tener extensión .py"
            )
            
        # Crear la ruta donde se guardará el módulo
        module_path = os.path.join(CUSTOM_MODULES_DIR, file.filename)
        
        # Guardar el archivo
        contents = await file.read()
        with open(module_path, "wb") as f:
            f.write(contents)
            
        # Asegurar que la ruta de módulos personalizados esté registrada
        custom_modules_dir = get_custom_modules_dir()
        add_module_path(custom_modules_dir)
            
        return {
            "success": True, 
            "message": f"Módulo {file.filename} guardado correctamente",
            "module_path": module_path
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@app.get("/list_custom_modules/")
async def list_custom_modules():
    """
    Lista todos los módulos Python personalizados disponibles.
    """
    try:
        modules = [f for f in os.listdir(CUSTOM_MODULES_DIR) if f.endswith('.py')]
        # Estructura mejorada para incluir nombre y descripción
        formatted_modules = []
        for module in modules:
            module_name = module
            formatted_modules.append({
                "name": module_name,
                "description": "Módulo Python personalizado"
            })
        return {"modules": formatted_modules}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@app.delete("/delete_custom_module/{module_name}")
async def delete_custom_module(module_name: str):
    """
    Elimina un módulo personalizado.
    """
    try:
        module_path = os.path.join(CUSTOM_MODULES_DIR, module_name)
        if not os.path.exists(module_path):
            raise HTTPException(
                status_code=404,
                detail=f"No se encontró el módulo {module_name}"
            )
            
        os.remove(module_path)
        return {"message": f"Módulo {module_name} eliminado correctamente"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_custom_module/{module_name}")
async def get_custom_module(module_name: str):
    """
    Obtiene el contenido de un módulo personalizado.
    """
    try:
        module_path = os.path.join(CUSTOM_MODULES_DIR, module_name)
        if not os.path.exists(module_path):
            raise HTTPException(
                status_code=404,
                detail=f"No se encontró el módulo {module_name}"
            )
        
        with open(module_path, "r") as file:
            content = file.read()
            
        return {
            "name": module_name,
            "content": content,
            "path": module_path
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/module_documentation/{module_name}")
async def save_module_documentation(module_name: str, doc_data: dict):
    """
    Guarda la documentación asociada a un módulo específico.
    La documentación se guarda en formato markdown.
    """
    try:
        if not doc_data.get("content"):
            raise HTTPException(status_code=400, detail="El contenido de la documentación es requerido")
            
        # Limpiar el nombre del módulo para usarlo como nombre de archivo
        safe_module_name = module_name.replace(".py", "").replace("/", "_")
        doc_file_path = os.path.join(MODULE_DOCS_DIR, f"{safe_module_name}_documentation.md")
        
        # Crear metadatos para el documento
        metadata = {
            "module_name": module_name,
            "last_updated": datetime.now().isoformat(),
            "author": doc_data.get("author", "Admin")
        }
        
        # Guardar metadatos en un archivo JSON complementario
        meta_file_path = os.path.join(MODULE_DOCS_DIR, f"{safe_module_name}_metadata.json")
        with open(meta_file_path, "w", encoding="utf-8") as meta_file:
            json.dump(metadata, meta_file, ensure_ascii=False, indent=2)
            
        # Guardar el contenido markdown
        with open(doc_file_path, "w", encoding="utf-8") as doc_file:
            doc_file.write(doc_data["content"])
            
        return {
            "success": True,
            "message": f"Documentación para {module_name} guardada correctamente",
            "metadata": metadata
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar la documentación: {str(e)}")

@app.get("/module_documentation/{module_name}")
async def get_module_documentation(module_name: str):
    """
    Obtiene la documentación asociada a un módulo específico.
    Retorna el contenido markdown y los metadatos.
    """
    try:
        # Limpiar el nombre del módulo para usarlo como nombre de archivo
        safe_module_name = module_name.replace(".py", "").replace("/", "_")
        doc_file_path = os.path.join(MODULE_DOCS_DIR, f"{safe_module_name}_documentation.md")
        meta_file_path = os.path.join(MODULE_DOCS_DIR, f"{safe_module_name}_metadata.json")
        
        # Verificar si existe documentación para este módulo
        if not os.path.exists(doc_file_path):
            return {
                "exists": False,
                "content": f"# No hay documentación disponible\n\nEste módulo ({module_name}) no tiene documentación asociada.",
                "metadata": {
                    "module_name": module_name,
                    "last_updated": None,
                    "author": None
                }
            }
            
        # Leer el contenido markdown
        with open(doc_file_path, "r", encoding="utf-8") as doc_file:
            content = doc_file.read()
            
        # Leer los metadatos si existen
        metadata = {
            "module_name": module_name,
            "last_updated": None,
            "author": None
        }
        
        if os.path.exists(meta_file_path):
            with open(meta_file_path, "r", encoding="utf-8") as meta_file:
                metadata = json.load(meta_file)
                
        return {
            "exists": True,
            "content": content,
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener la documentación: {str(e)}")

@app.delete("/module_documentation/{module_name}")
async def delete_module_documentation(module_name: str):
    """
    Elimina la documentación asociada a un módulo específico.
    """
    try:
        # Limpiar el nombre del módulo para usarlo como nombre de archivo
        safe_module_name = module_name.replace(".py", "").replace("/", "_")
        doc_file_path = os.path.join(MODULE_DOCS_DIR, f"{safe_module_name}_documentation.md")
        meta_file_path = os.path.join(MODULE_DOCS_DIR, f"{safe_module_name}_metadata.json")
        
        # Verificar si existe documentación para este módulo
        if not os.path.exists(doc_file_path):
            raise HTTPException(status_code=404, detail=f"No existe documentación para el módulo {module_name}")
            
        # Eliminar archivos
        if os.path.exists(doc_file_path):
            os.remove(doc_file_path)
        if os.path.exists(meta_file_path):
            os.remove(meta_file_path)
            
        return {
            "success": True,
            "message": f"Documentación para {module_name} eliminada correctamente"
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar la documentación: {str(e)}")

@app.get("/modules_with_documentation/")
async def list_modules_with_documentation():
    """
    Obtiene la lista de módulos que tienen documentación asociada.
    """
    try:
        modules_with_docs = []
        
        # Listar todos los archivos en el directorio de documentación
        for filename in os.listdir(MODULE_DOCS_DIR):
            if filename.endswith("_documentation.md"):
                # Extraer el nombre del módulo del nombre del archivo
                module_base_name = filename.replace("_documentation.md", "")
                
                # Reconstruir el nombre del módulo
                module_name = f"{module_base_name}.py"
                
                # Obtener metadatos si existen
                meta_file_path = os.path.join(MODULE_DOCS_DIR, f"{module_base_name}_metadata.json")
                metadata = {
                    "module_name": module_name,
                    "last_updated": None,
                    "author": None
                }
                
                if os.path.exists(meta_file_path):
                    with open(meta_file_path, "r", encoding="utf-8") as meta_file:
                        metadata = json.load(meta_file)
                        
                modules_with_docs.append({
                    "module_name": module_name,
                    "metadata": metadata
                })
                
        return {
            "modules": modules_with_docs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar módulos con documentación: {str(e)}")


# Ruta al directorio de build
FRONTEND_DIST_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "frontend", "dist"))
ROUTE_PREFIXES_TO_IGNORE = (
    "api/",
    "config/",
    "validate_dag",
    "list_dags",
    "get_dag_content",
    "save_dag",
    "delete_dag",
    "generate_dag_doc",
    "get_dag_diagram",
)

# Servir archivos estÃ¡ticos (assets de Vite)
app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST_PATH, "assets")), name="assets")

# Servir index.html en la raÃ­z
@app.get("/")
async def root_router(request: Request):
    # Si es navegador, servÃ­ el frontend
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        return FileResponse(os.path.join(FRONTEND_DIST_PATH, "index.html"))
    # Si es una API (ej: llamada con curl o fetch), respondÃ© JSON
    return JSONResponse({"message": "API de ValidaciÃ³n de DAGs en Airflow"})

# (opcional) Servir rutas de SPA
@app.get("/{full_path:path}")
async def catch_all_routes(request: Request, full_path: str):
    for prefix in ROUTE_PREFIXES_TO_IGNORE:
        if full_path.startswith(prefix):
            return JSONResponse(
                status_code=404,
                content={"detail": f"No se encontrÃ³ la ruta: /{full_path}"}
            )
    return FileResponse(os.path.join(FRONTEND_DIST_PATH, "index.html"))
