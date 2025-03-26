import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import TextareaCodeEditor from "@uiw/react-textarea-code-editor";

function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateContent, setTemplateContent] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Nuevos estados para la validación
  const [validationResult, setValidationResult] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);

  // Default template for new templates
  const DEFAULT_TEMPLATE = `from airflow import DAG
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
    'new_template_dag',
    default_args=default_args,
    description='An example DAG template',
    schedule_interval=timedelta(days=1),
    catchup=False,
) as dag:

    task = PythonOperator(
        task_id='example_task',
        python_callable=example_function,
    )`;

  // Fetch all templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/list_templates/');
      if (!response.ok) {
        throw new Error('Error al obtener templates');
      }
      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Error al obtener templates:', error);
      toast.error('Error al cargar los templates');
    } finally {
      setLoading(false);
    }
  };

  // Load templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Reset validation state when template content changes
  useEffect(() => {
    setValidationResult(null);
    setIsValidated(false);
  }, [templateContent]);

  // Get a specific template content
  const handleTemplateSelect = async (templateName) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/get_template/${templateName}`);
      if (!response.ok) {
        throw new Error(`Error al cargar el template ${templateName}`);
      }
      const data = await response.json();
      setTemplateContent(data.template);
      setSelectedTemplate(templateName);
      setEditMode(false);
      setIsNewTemplate(false);
      // Reset validation state when selecting a new template
      setValidationResult(null);
      setIsValidated(false);
    } catch (error) {
      console.error('Error al cargar template:', error);
      toast.error('Error al cargar el contenido del template');
    }
  };

  // Nueva función: Validar el template
  const validateTemplate = async () => {
    setValidationLoading(true);
    try {
      const formData = new FormData();
      const templateBlob = new Blob([templateContent], { type: 'text/x-python' });
      formData.append("file", templateBlob, "temp_validation.py");

      const response = await fetch("http://127.0.0.1:8000/validate_dag/", {
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
          "Error desconocido en el template"
        )
      });
      
      if (result.valid) {
        setIsValidated(true);
        toast.success("Template válido!");
      } else {
        setIsValidated(false);
        toast.error("El template contiene errores");
      }
    } catch (error) {
      console.error("Error:", error);
      setValidationResult({
        valid: false,
        error: "Error en el proceso de validación"
      });
      toast.error("Error en el proceso de validación");
    } finally {
      setValidationLoading(false);
    }
  };

  // Función modificada: Crear nuevo template (sólo inicializa el editor)
  const handleCreateNew = () => {
    setTemplateContent(DEFAULT_TEMPLATE);
    setSelectedTemplate("Nuevo Template");
    setIsNewTemplate(true);
    setEditMode(true);
    // Reset validation state for new template
    setValidationResult(null);
    setIsValidated(false);
  };

  // Función modificada: Guardar cambios del template
  const handleSaveTemplate = async () => {
    try {
      if (isNewTemplate) {
        setShowSaveAsModal(true);
        return;
      }
      
      const response = await fetch('http://127.0.0.1:8000/save_template/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedTemplate,
          content: templateContent,
          overwrite: true
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar el template');
      }
      
      toast.success('Template guardado correctamente');
      setEditMode(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al guardar el template');
    }
  };

  // Nueva función: Guardar template con nuevo nombre
  const handleSaveAsTemplate = async () => {
    try {
      if (!newTemplateName) {
        toast.error('Debes ingresar un nombre para el template');
        return;
      }
      
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(newTemplateName)) {
        toast.error('El nombre debe comenzar con una letra y solo puede contener letras, números y guiones bajos');
        return;
      }
      
      const response = await fetch('http://127.0.0.1:8000/save_template/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTemplateName,
          content: templateContent,
          overwrite: false
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar el template');
      }
      
      toast.success('Template guardado correctamente');
      setShowSaveAsModal(false);
      setNewTemplateName('');
      setIsNewTemplate(false);
      setEditMode(false);
      
      await fetchTemplates();
      handleTemplateSelect(newTemplateName);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al guardar el template');
    }
  };

  // Delete a template
  const handleDeleteTemplate = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/delete_template/${selectedTemplate}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al eliminar el template');
      }
      
      toast.success('Template eliminado correctamente');
      setSelectedTemplate(null);
      setTemplateContent('');
      setIsNewTemplate(false);
      fetchTemplates();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al eliminar el template');
      setShowDeleteConfirm(false);
    }
  };

  // Save template as DAG (se mantiene, pero solo para templates guardados)
  const handleSaveAsDAG = () => {
    try {
      if (isNewTemplate) {
        toast.error('Debes guardar el template primero');
        return;
      }
      
      const dagName = prompt('Ingresa un nombre para el DAG:', selectedTemplate);
      
      if (!dagName) return;
      
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(dagName)) {
        toast.error('El nombre debe comenzar con una letra y solo puede contener letras, números y guiones bajos');
        return;
      }
      
      const dagBlob = new Blob([templateContent], { type: 'text/plain' });
      const fileName = `${dagName}.py`;
      
      const formData = new FormData();
      formData.append('file', dagBlob, fileName);
      
      fetch('http://127.0.0.1:8000/save_dag/', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.detail || 'Error al guardar el DAG');
          });
        }
        return response.json();
      })
      .then(() => {
        toast.success(`Template guardado como DAG: ${dagName}`);
      })
      .catch(error => {
        console.error('Error:', error);
        toast.error(error.message || 'Error al guardar el DAG');
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar el template como DAG');
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    if (isNewTemplate) {
      setSelectedTemplate(null);
      setTemplateContent('');
      setIsNewTemplate(false);
      setEditMode(false);
    } else {
      handleTemplateSelect(selectedTemplate);
    }
    toast.error('Cambios descartados');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Gestionar Templates</h2>
        <motion.button
          onClick={handleCreateNew}
          className="btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Crear Nuevo Template
        </motion.button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Lista de Templates */}
        <div className="col-span-4">
          <div className="card p-4">
            <h3 className="text-lg font-medium text-gray-200 mb-4">Templates Disponibles</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="text-gray-400">Cargando templates...</div>
              ) : templates.length > 0 ? (
                templates.map((template) => (
                  <motion.button
                    key={template}
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
                      selectedTemplate === template && !isNewTemplate
                        ? 'bg-react-blue/10 text-react-blue'
                        : 'text-gray-200 hover:bg-react-blue/5 hover:text-react-blue'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {template}
                  </motion.button>
                ))
              ) : (
                <div className="text-gray-400">No hay templates disponibles</div>
              )}
            </div>
          </div>
        </div>

        {/* Visualización y acciones */}
        <div className="col-span-8">
          {selectedTemplate ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-200">
                  {isNewTemplate ? (
                    <span className="flex items-center">
                      <span className="text-yellow-400 mr-2">●</span> 
                      {selectedTemplate} <span className="text-gray-400 ml-2 text-sm">(Sin guardar)</span>
                    </span>
                  ) : (
                    selectedTemplate
                  )}
                </h3>
                <div className="flex space-x-2">
                  {!editMode ? (
                    <>
                      <motion.button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 rounded-lg text-blue-400 hover:bg-blue-400/5 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Editar
                      </motion.button>
                      {!isNewTemplate && (
                        <motion.button
                          onClick={handleSaveAsDAG}
                          className="px-4 py-2 rounded-lg text-green-400 hover:bg-green-400/5 transition-colors duration-200"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Usar como DAG
                        </motion.button>
                      )}
                      {!isNewTemplate && (
                        <motion.button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-400/5 transition-colors duration-200"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Eliminar
                        </motion.button>
                      )}
                    </>
                  ) : (
                    <>
                      <motion.button
                        onClick={handleSaveTemplate}
                        className="px-4 py-2 rounded-lg text-green-400 hover:bg-green-400/5 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Guardar Template
                      </motion.button>
                      <motion.button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-400/5 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancelar
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-react-border/30">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-400">
                    {isNewTemplate ? "template.py (sin guardar)" : `${selectedTemplate}.py`}
                  </span>
                </div>
                <TextareaCodeEditor
                  value={templateContent}
                  language="python"
                  onChange={(e) => setTemplateContent(e.target.value)}
                  disabled={!editMode}
                  style={{
                    fontSize: "14px",
                    backgroundColor: "#1A1D23",
                    fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Menlo,monospace",
                    minHeight: "400px",
                  }}
                  className="w-full border-0 focus:outline-none"
                  padding={20}
                  data-color-mode="dark"
                />
              </div>

              {/* Botón de validación */}
              <div className="flex justify-center space-x-4">
                <motion.button
                  onClick={validateTemplate}
                  disabled={validationLoading}
                  className="btn-primary flex items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {validationLoading ? (
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
                      Validar Template
                    </>
                  )}
                </motion.button>
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
                          <span className="text-green-400 font-medium">Template válido</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-red-400 font-medium">Error en el template:</span>
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
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Selecciona un template para ver su contenido
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              <div className="bg-react-darker p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h3 className="text-xl font-semibold text-white mb-4">Confirmar eliminación</h3>
                <p className="text-gray-300 mb-6">
                  ¿Estás seguro de que deseas eliminar el template "{selectedTemplate}"? Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-end space-x-4">
                  <motion.button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-lg text-gray-300 hover:bg-react-blue/5"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    onClick={handleDeleteTemplate}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Eliminar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal para guardar template con nombre */}
      <AnimatePresence>
        {showSaveAsModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowSaveAsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              <div className="bg-react-darker p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h3 className="text-xl font-semibold text-white mb-4">Guardar Template</h3>
                <div className="mb-4">
                  <label htmlFor="templateName" className="block text-gray-300 mb-2">Nombre del Template</label>
                  <input
                    id="templateName"
                    type="text"
                    className="w-full bg-react-dark border border-react-border/30 rounded-lg px-4 py-2 text-white"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="mi_nuevo_template"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <motion.button
                    onClick={() => setShowSaveAsModal(false)}
                    className="px-4 py-2 rounded-lg text-gray-300 hover:bg-react-blue/5"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    onClick={handleSaveAsTemplate}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Guardar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TemplateManager;