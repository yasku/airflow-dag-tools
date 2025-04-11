#Descripción:
#Este módulo se encarga de la validación de los DAGs. Utiliza: ✅ ast para verificar si el código Python tiene errores de sintaxis.
#✅ DagBag de Airflow para validar la estructura del DAG sin ejecutar Airflow.
#✅ Devuelve errores detallados si el DAG no es válido.
#✅ Permite validar DAGs con módulos personalizados disponibles.
from airflow.models.dagbag import DagBag
import ast
import re
import sys
import os
import tempfile
import json
import importlib
import subprocess
from contextlib import contextmanager

# Ruta para almacenar la configuración de módulos disponibles
MODULES_CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'available_modules.json')
CUSTOM_MODULES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'custom_modules')

# Cargar módulos disponibles
def load_available_modules():
    """
    Carga la lista de módulos disponibles desde el archivo de configuración.
    Si el archivo no existe, crea uno nuevo con una lista vacía.
    """
    try:
        if os.path.exists(MODULES_CONFIG_PATH):
            with open(MODULES_CONFIG_PATH, 'r') as f:
                return json.load(f)
        else:
            # Estructura inicial para compatibilidad con el código existente
            # Posteriormente la simplificaremos
            default_data = {"modules_paths": [os.path.abspath(CUSTOM_MODULES_DIR)]}
            with open(MODULES_CONFIG_PATH, 'w') as f:
                json.dump(default_data, f)
            return default_data
    except Exception as e:
        print(f"Error al cargar módulos disponibles: {str(e)}")
        return {"modules_paths": [os.path.abspath(CUSTOM_MODULES_DIR)]}

# Guardar módulos disponibles
def save_available_modules(modules_data):
    """
    Guarda la lista de módulos disponibles en el archivo de configuración.
    """
    try:
        with open(MODULES_CONFIG_PATH, 'w') as f:
            json.dump(modules_data, f)
        return True
    except Exception as e:
        print(f"Error al guardar módulos disponibles: {str(e)}")
        return False

# Para mantener compatibilidad con el código existente
def load_dependencies():
    """
    Función de compatibilidad que llama a load_available_modules.
    """
    modules_data = load_available_modules()
    # Asegurar estructura compatible con el código existente
    if "packages" not in modules_data:
        modules_data["packages"] = []
    return modules_data

# Para mantener compatibilidad con el código existente
def save_dependencies(dependencies):
    """
    Función de compatibilidad que llama a save_available_modules.
    """
    return save_available_modules(dependencies)

# Función para obtener la ruta del directorio de módulos personalizados
def get_custom_modules_dir():
    """
    Retorna la ruta absoluta del directorio de módulos personalizados.
    """
    return os.path.abspath(CUSTOM_MODULES_DIR)

# Función para añadir un módulo personalizado
def add_custom_module_path(path=None):
    """
    Registra la ruta del directorio de módulos personalizados si no está ya registrada.
    """
    if path is None:
        path = get_custom_modules_dir()
    
    if not os.path.exists(path):
        return {"success": False, "message": f"La ruta {path} no existe"}
    
    modules_data = load_available_modules()
    
    # Verificar si ya existe
    if path in modules_data["modules_paths"]:
        return {"success": True, "message": f"La ruta {path} ya está registrada"}
    
    modules_data["modules_paths"].append(path)
    save_available_modules(modules_data)
    return {"success": True, "message": f"Ruta de módulos {path} registrada correctamente"}

# Eliminar una ruta de módulo
def remove_module_path(path):
    """
    Elimina una ruta de módulo de la lista de módulos disponibles.
    """
    modules_data = load_available_modules()
    
    if path in modules_data["modules_paths"]:
        modules_data["modules_paths"].remove(path)
        save_available_modules(modules_data)
        return {"success": True, "message": f"Ruta {path} eliminada correctamente"}
    
    return {"success": False, "message": f"Ruta {path} no encontrada"}

# Función obsoleta - mantener para compatibilidad
def add_package_dependency(package_name, version=None):
    """
    Función obsoleta que no realiza ninguna acción.
    Se mantiene para compatibilidad con el código existente.
    """
    return {"success": True, "message": "Función obsoleta, no se añaden paquetes"}

# Función obsoleta - mantener para compatibilidad
def add_module_path(path):
    """
    Función de compatibilidad que llama a add_custom_module_path.
    """
    return add_custom_module_path(path)

# Función simplificada para reemplazar remove_dependency
def remove_dependency(dependency_type, value):
    """
    Función de compatibilidad para eliminar una dependencia.
    Solo procesa el tipo 'module_path'.
    """
    if dependency_type == "module_path":
        return remove_module_path(value)
    elif dependency_type == "package":
        # No hacemos nada con los paquetes ahora
        return {"success": True, "message": "Función obsoleta, no se eliminan paquetes"}
    
    return {"success": False, "message": "Tipo de dependencia no válido"}

# Contexto para modificar temporalmente sys.path
@contextmanager
def modified_sys_path(additional_paths=None):
    """
    Contexto que modifica temporalmente sys.path para incluir rutas adicionales.
    Restaura el sys.path original al salir del contexto.
    """
    original_path = sys.path.copy()
    
    if additional_paths:
        for path in additional_paths:
            if path not in sys.path and os.path.exists(path):
                sys.path.insert(0, path)
    
    try:
        yield
    finally:
        sys.path = original_path

def validate_python_syntax(file_path):
    """
    Verifica si el archivo tiene errores de sintaxis en Python puro.
    Retorna un JSON estructurado con detalles del error.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            source_code = f.read()
        ast.parse(source_code)  # Intenta parsear el código
        return {"valid_python": True, "errors": None}
    except SyntaxError as e:
        return {
            "valid_python": False,
            "errors": {
                "type": "SyntaxError",
                "file": file_path,
                "line": e.lineno,
                "message": e.msg
            }
        }

def clean_traceback(traceback_message):
    """
    Procesa el traceback de Airflow para extraer solo la parte útil.
    """
    # Buscar la última línea del error que indica el problema real
    lines = traceback_message.strip().split("\n")
    last_error_line = lines[-1] if lines else "Error desconocido"
    
    # Intentar extraer información de la línea del error
    match = re.search(r'File "(.*?)", line (\d+), in', traceback_message)
    if match:
        file_path, line_number = match.groups()
        return {
            "file": file_path,
            "line": int(line_number),
            "message": last_error_line
        }
    
    return {
        "message": last_error_line
    }

def validate_dag(file_path, use_custom_dependencies=True):
    """
    Valida un DAG utilizando el parser de Airflow y `DagBag`.
    Retorna un JSON estructurado con detalles del error.
    El parámetro use_custom_dependencies se mantiene para compatibilidad.
    """
    # Primero validamos la sintaxis de Python
    python_validation = validate_python_syntax(file_path)
    if not python_validation["valid_python"]:
        return {"valid": False, "error": python_validation["errors"]}

    # Obtenemos las rutas de módulos disponibles
    # Siempre usamos los módulos disponibles independientemente del valor de use_custom_dependencies
    modules_data = load_available_modules()
    additional_paths = modules_data["modules_paths"]
    
    # Validación con Airflow DagBag usando el contexto modificado
    with modified_sys_path(additional_paths):
        dag_bag = DagBag(file_path, include_examples=False)

        if dag_bag.import_errors:
            errors_list = []
            for file, error in dag_bag.import_errors.items():
                clean_error = clean_traceback(error)  # Procesar error
                clean_error["file"] = file  # Agregar nombre del archivo DAG
                errors_list.append(clean_error)
            
            return {
                "valid": False,
                "error": {
                    "type": "Airflow DAG ImportError",
                    "details": errors_list
                }
            }

    return {"valid": True, "message": "El DAG es válido."}

# Función para analizar dependencias en un archivo DAG
def analyze_dag_dependencies(file_path):
    """
    Analiza un archivo DAG para detectar posibles módulos importados.
    Retorna una lista de módulos importados en el DAG.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            source_code = f.read()
        
        tree = ast.parse(source_code)
        imports = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    imports.append(name.name)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.append(node.module)
        
        return {"success": True, "dependencies": list(set(imports))}
    
    except Exception as e:
        return {"success": False, "message": str(e)}

# Renombrar función para mayor claridad pero mantener compatibilidad
def get_dependencies():
    """
    Retorna la lista completa de módulos disponibles registrados.
    Se mantiene el nombre para compatibilidad con el código existente.
    """
    return load_available_modules()

# Nueva función específica para módulos
def get_available_modules():
    """
    Retorna la lista completa de módulos disponibles registrados.
    """
    return load_available_modules()
