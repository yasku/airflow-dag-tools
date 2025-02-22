import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import TextareaCodeEditor from "@uiw/react-textarea-code-editor";
import "@uiw/react-textarea-code-editor/dist.css";
import DagList from '../components/DagList';

function Generator() {
  const [dagName, setDagName] = useState("");
  const [dagCode, setDagCode] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [nameError, setNameError] = useState("");
  const dagListRef = React.useRef(null);

  // Cargar el template de forma independiente
  useEffect(() => {
    const defaultTemplate = `from airflow import DAG
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

with DAG(
    'my_dag_name',
    default_args=default_args,
    description='Description of your DAG',
    schedule_interval='@daily',
    catchup=False,
    tags=['example'],
) as dag:

    def sample_task():
        print("Executing sample task")

    task_1 = PythonOperator(
        task_id='sample_task',
        python_callable=sample_task,
    )

    task_1`;
    
    setDagCode(defaultTemplate);
  }, []);

  const validateDagName = (name) => {
    if (!name.trim()) {
      setNameError("El nombre del DAG es requerido");
      return false;
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      setNameError("El nombre debe comenzar con una letra y solo puede contener letras, números y guiones bajos");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setDagName(newName);
    validateDagName(newName);
  };

  const validateDAG = async () => {
    if (!validateDagName(dagName)) {
      toast.error("Por favor, corrige el nombre del DAG");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      // Usar un nombre temporal para la validación
      const dagBlob = new Blob([dagCode], { type: 'text/x-python' });
      // No usamos el nombre real del DAG para la validación
      formData.append("file", dagBlob, "temp_validation.py");

      const response = await fetch("http://127.0.0.1:8000/validate_dag/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setValidationResult(result);
      
      if (result.valid) {
        setIsValidated(true);
        toast.success("DAG válido!");
      } else {
        toast.error("El DAG contiene errores");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error en el proceso de validación");
    } finally {
      setLoading(false);
    }
  };

  const saveDAG = async () => {
    try {
      const formData = new FormData();
      const dagBlob = new Blob([dagCode], { type: 'text/plain' });
      const fileName = `${dagName}.py`;
      formData.append("file", dagBlob, fileName);

      const response = await fetch("http://127.0.0.1:8000/save_dag/", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al guardar el DAG");
      }

      toast.success("DAG guardado exitosamente");
      if (dagListRef.current) {
        dagListRef.current.refreshList();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error al guardar el DAG");
    }
  };

  const downloadDAG = () => {
    const element = document.createElement("a");
    const file = new Blob([dagCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${dagName}.py`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCodeChange = (value) => {
    setDagCode(value);
    // Resetear la validación cuando se edita el código
    setValidationResult(null);
    setIsValidated(false);
  };

  const handleDagSelect = async (dagName) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/get_dag_content/${dagName}`);
      const data = await response.json();
      setDagCode(data.content);
      setDagName(dagName.replace('.py', ''));
    } catch (error) {
      console.error('Error al cargar el DAG:', error);
      toast.error('Error al cargar el DAG');
    }
  };

  // Agregar un efecto para refrescar la lista después de guardar
  useEffect(() => {
    if (dagListRef.current) {
      dagListRef.current.refreshList();
    }
  }, []);

  return (
    <div className="page-container">
      <div className="sidebar p-6">
        <DagList ref={dagListRef} onDagSelect={handleDagSelect} />
      </div>
      
      <div className="main-content">
        <div className="content-section">
          <div className="card">
            <div className="title-container">
              <h2 className="section-title">
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Crear Nuevo DAG
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Nombre y Editor en la misma sección */}
                <div className="section-container">
                  <div className="space-y-4">
                    {/* Input del nombre */}
                    <div>
                      <h3 className="section-header">
                        <svg className="h-5 w-5 text-react-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Nombre del DAG
                      </h3>
                      <input
                        type="text"
                        value={dagName}
                        onChange={handleNameChange}
                        className="input-field w-full"
                        placeholder="mi_nuevo_dag"
                      />
                      {nameError && (
                        <p className="text-sm text-red-400 mt-2">{nameError}</p>
                      )}
                    </div>

                    {/* Editor de código */}
                    <div>
                      <h3 className="section-header">
                        <svg className="h-5 w-5 text-react-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Código del DAG
                      </h3>
                      <div className="bg-react-dark/50 rounded-lg overflow-hidden border border-react-border/30">
                        <TextareaCodeEditor
                          value={dagCode}
                          language="python"
                          onChange={(evn) => handleCodeChange(evn.target.value)}
                          padding={16}
                          style={{
                            fontSize: "14px",
                            backgroundColor: "#1A1D23",
                            fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Menlo,monospace",
                            minHeight: "400px",
                            borderRadius: "0.5rem",
                          }}
                          className="w-full border-0 focus:outline-none"
                          data-color-mode="dark"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones y validación */}
                <div className="space-y-6">
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      onClick={validateDAG}
                      disabled={loading}
                      className="btn-primary flex items-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Validando...
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Validar DAG
                        </>
                      )}
                    </motion.button>

                    {isValidated && validationResult?.valid && (
                      <>
                        <motion.button
                          onClick={saveDAG}
                          className="btn-primary flex items-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          Crear DAG
                        </motion.button>
                        <motion.button
                          onClick={downloadDAG}
                          className="btn-secondary flex items-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Descargar DAG
                        </motion.button>
                      </>
                    )}
                  </div>

                  {/* Resultado de validación */}
                  <AnimatePresence>
                    {validationResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`bg-react-darker/50 rounded-lg p-6 border ${
                          validationResult.valid
                            ? 'border-green-500/30'
                            : 'border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center">
                          {validationResult.valid ? (
                            <>
                              <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-green-400 font-medium">DAG válido</span>
                            </>
                          ) : (
                            <>
                              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span className="text-red-400 font-medium">Error en el DAG:</span>
                            </>
                          )}
                        </div>
                        {!validationResult.valid && (
                          <pre className="mt-4 p-4 bg-[#1A1D23] rounded-lg text-red-400 text-sm overflow-x-auto">
                            {validationResult.error}
                          </pre>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Generator; 