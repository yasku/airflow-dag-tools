import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from "react-hot-toast";
import TextareaCodeEditor from "@uiw/react-textarea-code-editor";
import "@uiw/react-textarea-code-editor/dist.css";
import DagList from '../components/DagList';
import DependencyManager from '../components/DependencyManager';

function GeneratorV2() {
  // Estados de Generator.jsx
  const [dagName, setDagName] = useState("");
  const [dagCode, setDagCode] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [nameError, setNameError] = useState("");
  const dagListRef = useRef(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  
  // Estados para gestión de módulos (renombrados para mayor claridad)
  const [useCustomModules, setUseCustomModules] = useState(true);
  const [showModulesManager, setShowModulesManager] = useState(false);
  
  // Eliminamos los estados que ya no necesitamos manejar directamente en este componente
  // ya que se gestionarán dentro del componente DependencyManager
  // const [dependencies, setDependencies] = useState({ packages: [], modules_paths: [] });
  // const [newPackage, setNewPackage] = useState({ name: "", version: "" });
  // const [newModulePath, setNewModulePath] = useState("");
  // const [loadingDependencies, setLoadingDependencies] = useState(false);
  // const [detectedDependencies, setDetectedDependencies] = useState([]);

  // Función para cargar el template desde el backend
  const fetchTemplate = async () => {
    try {
      // Fetch the template from the backend
      const response = await fetch("/config/template/");
      if (!response.ok) {
        throw new Error("Error al cargar el template");
      }
      const data = await response.json();
      
      // Simply set the template code without adding cursor position marker
      setDagCode(data.template);
    } catch (error) {
      console.error("Error al cargar el template:", error);
      toast.error("Error al cargar el template del DAG");
      
      // Fallback to a basic template if fetch fails
      setDagCode(`from airflow import DAG
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

    task_1`);
    }
  };

  // New function to fetch all templates
  const fetchTemplates = async () => {
    try {
      const response = await fetch("/list_templates/");
      if (!response.ok) {
        throw new Error("Error al cargar las plantillas");
      }
      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error("Error al cargar las plantillas:", error);
      toast.error("Error al cargar las plantillas disponibles");
    }
  };

  // Function to handle template selection
  const handleTemplateSelect = async (templateName) => {
    if (!templateName) return;
    
    try {
      const response = await fetch(`/get_template/${templateName}`);
      if (!response.ok) {
        throw new Error(`Error al cargar la plantilla ${templateName}`);
      }
      const data = await response.json();
      
      // Update code with selected template
      setDagCode(data.template);
      setSelectedTemplate(templateName);
      
      // Reset validation state
      setValidationResult(null);
      setIsValidated(false);
      
      toast.success(`Plantilla "${templateName}" cargada correctamente`);
    } catch (error) {
      console.error(`Error al cargar la plantilla ${templateName}:`, error);
      toast.error(`Error al cargar la plantilla ${templateName}`);
    }
  };

  // Eliminamos funciones relacionadas con la gestión de dependencias que ya no necesitamos
  // fetchDependencies, handleAddPackage, handleAddModulePath, handleRemoveDependency
  
  // Función para analizar importaciones de módulos en el código DAG
  const analyzeModuleImports = async () => {
    if (!dagCode.trim()) {
      toast.error("No hay código DAG para analizar");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      const dagBlob = new Blob([dagCode], { type: 'text/x-python' });
      formData.append("file", dagBlob, "temp_analysis.py");

      const response = await fetch("/analyze_dag_dependencies/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || "Error al analizar importaciones");
      }

      if (result.success) {
        toast.success("Importaciones analizadas correctamente");
      } else {
        toast.error("Error al analizar importaciones del DAG");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al analizar importaciones");
    } finally {
      setLoading(false);
    }
  };

  // Simplificamos useEffect para enfocarnos en cargar templates
  useEffect(() => {
    fetchTemplates();
    fetchTemplate();
  }, []);

  // Resto de funciones existentes...
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

  const handleDagSelect = async (dagName) => {
    try {
      const response = await fetch(`/get_dag_content/${dagName}`);
      const data = await response.json();
      setDagCode(data.content);
      setDagName(dagName.replace('.py', ''));
      // Resetear estados de validación cuando se selecciona un nuevo DAG
      setValidationResult(null);
      setIsValidated(false);
      setNameError('');
    } catch (error) {
      console.error('Error al cargar el DAG:', error);
      toast.error('Error al cargar el DAG');
    }
  };

  // Modificar la función de validación para usar módulos personalizados
  const validateDAG = async () => {
    if (!validateDagName(dagName)) {
      toast.error("Por favor, corrige el nombre del DAG");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      const dagBlob = new Blob([dagCode], { type: 'text/x-python' });
      formData.append("file", dagBlob, "temp_validation.py");

      // URL con parámetro para usar módulos personalizados (mantenemos el nombre del parámetro para compatibilidad)
      const url = `/validate_dag/?use_custom_dependencies=${useCustomModules}`;

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      // Asegurarnos de que el resultado tenga la estructura correcta
      setValidationResult({
        valid: result.valid,
        error: result.valid ? null : (
          result.error?.details?.[0]?.message || 
          result.error?.message || 
          "Error desconocido en el DAG"
        )
      });
      
      if (result.valid) {
        setIsValidated(true);
        toast.success("DAG válido!");
      } else {
        setIsValidated(false);
        toast.error("El DAG contiene errores");
      }
    } catch (error) {
      console.error("Error:", error);
      setValidationResult({
        valid: false,
        error: "Error en el proceso de validación"
      });
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

      const response = await fetch("/save_dag/", {
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
    setValidationResult(null);
    setIsValidated(false);
  };

  // Estructura basada en Admin.jsx pero con contenido de Generator.jsx
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="p-6">
        <div className="card">
          <div className="bg-[#2A1810] rounded-lg border border-orange-900/50 p-4 mb-8">
            <h2 className="text-2xl font-semibold text-orange-500/90 flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Crear DAG
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Sidebar con DagList actualizado */}
              <div className="col-span-3">
                <DagList 
                  ref={dagListRef} 
                  onDagSelect={handleDagSelect}
                />
              </div>

              {/* Contenido principal */}
              <div className="col-span-9">
                <div className="space-y-6">
                  {/* Input del nombre */}
                  <div className="section-container">
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

                  {/* Template Selector */}
                  <div className="section-container mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="section-header">
                        <svg className="h-5 w-5 text-react-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        Plantilla DAG
                      </h3>
                      
                      <div className="flex items-center">
                        <select
                          className="input-field mr-2"
                          value={selectedTemplate}
                          onChange={(e) => handleTemplateSelect(e.target.value)}
                        >
                          <option value="">Seleccionar plantilla</option>
                          {templates.map(template => (
                            <option key={template} value={template}>{template}</option>
                          ))}
                        </select>
                        
                        <motion.button
                          onClick={() => fetchTemplate()}
                          className="btn-secondary flex items-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          title="Cargar plantilla predeterminada"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Sección de módulos disponibles (antes "dependencias") */}
                  <div className="section-container mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="section-header">
                        <svg className="h-5 w-5 text-react-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Módulos Disponibles
                      </h3>
                      
                      <div className="flex items-center">
                        <label className="inline-flex items-center cursor-pointer mr-3">
                          <input 
                            type="checkbox" 
                            checked={useCustomModules} 
                            onChange={() => setUseCustomModules(!useCustomModules)} 
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ms-3 text-sm font-medium text-gray-300">Usar módulos personalizados</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Descripción informativa */}
                    <p className="text-sm text-gray-400 mb-4">
                      Este DAG puede utilizar módulos Python personalizados que han sido configurados por los administradores del sistema.
                      Puedes activar o desactivar el uso de estos módulos durante la validación.
                    </p>
                    
                    {/* Botón para mostrar/ocultar módulos - MANTENEMOS ESTE DROPDOWN */}
                    <motion.button
                      onClick={() => setShowModulesManager(!showModulesManager)}
                      className="btn-secondary flex items-center w-full justify-center"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {showModulesManager ? "Ocultar lista de módulos" : "Mostrar lista de módulos"}
                    </motion.button>
                    
                    {/* Componente DependencyManager que se muestra solo cuando showModulesManager es true */}
                    <AnimatePresence>
                      {showModulesManager && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4"
                        >
                          <DependencyManager 
                            onToggleUseCustom={(value) => setUseCustomModules(value)}
                            useCustomDependencies={useCustomModules}
                            dagCode={dagCode}
                            readOnly={true}
                            simplifiedMode={true} // Mostrar versión simplificada
                            hideControls={true}  // Nueva propiedad para ocultar los controles duplicados
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Editor de código */}
                  <div className="section-container">
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
                    
                    {/* Botón para analizar módulos importados del código */}
                    <div className="flex justify-end mt-2">
                      <motion.button
                        onClick={analyzeModuleImports}
                        className="btn-secondary flex items-center text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        title="Analizar módulos requeridos por este código"
                        disabled={loading}
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Analizar módulos requeridos
                      </motion.button>
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
                              {typeof validationResult.error === 'string' 
                                ? validationResult.error 
                                : JSON.stringify(validationResult.error, null, 2)
                              }
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
    </div>
  );
}

export default GeneratorV2; 