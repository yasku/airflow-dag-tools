#Descripción:
#Este módulo se encarga de la validación de los DAGs. Utiliza: ✅ ast para verificar si el código Python tiene errores de sintaxis.
#✅ DagBag de Airflow para validar la estructura del DAG sin ejecutar Airflow.
#✅ Devuelve errores detallados si el DAG no es válido.
from airflow.models.dagbag import DagBag
import ast
import re

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

def validate_dag(file_path):
    """
    Valida un DAG utilizando el parser de Airflow y `DagBag`.
    Retorna un JSON estructurado con detalles del error.
    """
    # Primero validamos la sintaxis de Python
    python_validation = validate_python_syntax(file_path)
    if not python_validation["valid_python"]:
        return {"valid": False, "error": python_validation["errors"]}

    # Validación con Airflow DagBag
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
