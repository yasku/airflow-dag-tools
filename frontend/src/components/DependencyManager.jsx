import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from "react-hot-toast";
import ModuleDocEditor from './admin/ModuleDocEditor';

function DependencyManager({ 
  onToggleUseCustom, 
  useCustomDependencies, 
  dagCode, 
  onDependenciesChange,
  readOnly = false,
  initialDependencies = null, // Prop para recibir dependencias del componente padre
  onSaveDependencies = null,  // Función para guardar dependencias desde el modo admin
  isAdminMode = false,         // Indicador de modo administrador
  simplifiedMode = true,       // Nueva prop para mostrar solo módulos
  hideControls = false         // Nueva prop para ocultar los controles duplicados
}) {
  const [dependencies, setDependencies] = useState({ modules_paths: [] });
  const [newModulePath, setNewModulePath] = useState("");
  const [loadingDependencies, setLoadingDependencies] = useState(false);
  const [detectedDependencies, setDetectedDependencies] = useState([]);
  const [showModulesManager, setShowModulesManager] = useState(isAdminMode); // Mantenemos este estado pero solo lo usamos en modo admin
  const [customModules, setCustomModules] = useState([]);
  const [moduleFile, setModuleFile] = useState(null);
  const [loadingModules, setLoadingModules] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  
  // Nuevos estados para edición de rutas
  const [editingPathIndex, setEditingPathIndex] = useState(-1);
  const [editingPathValue, setEditingPathValue] = useState("");

  // Nuevos estados para la documentación
  const [selectedModuleForDocs, setSelectedModuleForDocs] = useState(null);
  const [showingDocEditor, setShowingDocEditor] = useState(false);
  const [modulesWithDocs, setModulesWithDocs] = useState([]);
  const [loadingModulesDocs, setLoadingModulesDocs] = useState(false);

  // Definimos la ruta base para los módulos personalizados
  const CUSTOM_MODULES_PATH = '/usr/local/airflow/custom_modules';

  // Cargar módulos disponibles
  const fetchAvailableModules = async () => {
    // Si hay dependencias iniciales proporcionadas, usarlas directamente
    if (initialDependencies && isAdminMode) {
      setDependencies(initialDependencies);
      return;
    }

    try {
      setLoadingDependencies(true);
      // Mantenemos el endpoint original para compatibilidad
      const response = await fetch("http://127.0.0.1:8000/dependencies/");
      if (!response.ok) {
        throw new Error("Error al cargar los módulos disponibles");
      }
      const data = await response.json();
      
      // Asegurarnos que los datos tienen el formato correcto
      // Si modules_paths es un array de strings, convertirlos a objetos
      if (data.modules_paths && Array.isArray(data.modules_paths)) {
        data.modules_paths = data.modules_paths.map(path => {
          if (typeof path === 'string') {
            return { path: path, description: "Ruta de módulos personalizados" };
          }
          return path;
        });
      }
      
      // Solo nos interesa modules_paths, pero mantenemos la estructura para compatibilidad
      setDependencies({
        modules_paths: data.modules_paths || [],
        packages: [] // Array vacío para mantener compatibilidad
      });
      
      // Notificar al componente padre de los cambios
      if (onDependenciesChange) {
        onDependenciesChange(data);
      }
    } catch (error) {
      console.error("Error al cargar módulos disponibles:", error);
      toast.error("Error al cargar la lista de módulos disponibles");
    } finally {
      setLoadingDependencies(false);
    }
  };

  // Función para guardar los módulos (modo administrador)
  const handleSaveModules = async () => {
    if (!isAdminMode || !onSaveDependencies) return;
    
    try {
      setSavingChanges(true);
      // Simplificamos para guardar solo las rutas de módulos
      const modulesData = {
        modules_paths: dependencies.modules_paths
      };
      
      await onSaveDependencies(modulesData);
      toast.success("Módulos guardados correctamente");
    } catch (error) {
      console.error("Error al guardar módulos:", error);
      toast.error("Error al guardar módulos");
    } finally {
      setSavingChanges(false);
    }
  };

  // Añadir una ruta de módulo
  const handleAddModulePath = async () => {
    if (!newModulePath.trim()) {
      toast.error("La ruta del módulo es requerida");
      return;
    }

    // En modo administrador, sólo actualizar el estado local
    if (isAdminMode) {
      const newPathObj = {
        path: newModulePath.trim(),
        description: "Ruta de módulos personalizados"
      };
      
      setDependencies(prev => ({
        ...prev,
        modules_paths: [...prev.modules_paths, newPathObj]
      }));
      
      setNewModulePath("");
      toast.success("Ruta añadida. Recuerda guardar los cambios.");
      return;
    }

    try {
      setLoadingDependencies(true);
      const response = await fetch("http://127.0.0.1:8000/dependencies/module_path/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: newModulePath,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Error al añadir ruta de módulo");
      }

      toast.success(data.message);
      // Limpiar formulario y recargar dependencias
      setNewModulePath("");
      fetchAvailableModules();
    } catch (error) {
      console.error("Error al añadir ruta de módulo:", error);
      toast.error(error.message || "Error al añadir ruta de módulo");
    } finally {
      setLoadingDependencies(false);
    }
  };

  // Nueva función para iniciar la edición de una ruta
  const handleStartEditPath = (index, path) => {
    setEditingPathIndex(index);
    setEditingPathValue(typeof path === 'string' ? path : path.path);
  };

  // Nueva función para guardar la edición de una ruta
  const handleSaveEditPath = (index) => {
    if (!editingPathValue.trim()) {
      toast.error("La ruta del módulo no puede estar vacía");
      return;
    }

    // Actualizar en el estado local
    setDependencies(prev => {
      const updatedPaths = [...prev.modules_paths];
      if (typeof updatedPaths[index] === 'string') {
        updatedPaths[index] = editingPathValue.trim();
      } else {
        updatedPaths[index] = {
          ...updatedPaths[index],
          path: editingPathValue.trim()
        };
      }
      return {
        ...prev,
        modules_paths: updatedPaths
      };
    });

    // Limpiar el estado de edición
    setEditingPathIndex(-1);
    setEditingPathValue("");
    toast.success("Ruta actualizada. Recuerda guardar los cambios.");
  };

  // Nueva función para cancelar la edición
  const handleCancelEditPath = () => {
    setEditingPathIndex(-1);
    setEditingPathValue("");
  };

  // Eliminar una ruta de módulo (mantenemos la implementación para compatibilidad, pero no la usaremos en la UI)
  const handleRemoveModulePath = async (value) => {
    // En modo administrador, sólo actualizar el estado local
    if (isAdminMode) {
      setDependencies(prev => ({
        ...prev,
        modules_paths: prev.modules_paths.filter(pathItem => 
          typeof pathItem === 'string'
            ? pathItem !== value
            : pathItem.path !== value
        )
      }));
      
      toast.success(`Ruta eliminada. Recuerda guardar los cambios.`);
      return;
    }

    try {
      setLoadingDependencies(true);
      const response = await fetch(`http://127.0.0.1:8000/dependencies/module_path/${encodeURIComponent(value)}`, {
        method: "DELETE",
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Error al eliminar ruta de módulo");
      }

      toast.success(data.message);
      fetchAvailableModules();
    } catch (error) {
      console.error("Error al eliminar ruta de módulo:", error);
      toast.error(error.message || "Error al eliminar ruta de módulo");
    } finally {
      setLoadingDependencies(false);
    }
  };

  // Analizar módulos importados en el código DAG
  const analyzeModuleImports = async () => {
    if (!dagCode || !dagCode.trim()) {
      toast.error("No hay código DAG para analizar");
      return;
    }

    try {
      setLoadingDependencies(true);
      const formData = new FormData();
      const dagBlob = new Blob([dagCode], { type: 'text/x-python' });
      formData.append("file", dagBlob, "temp_analysis.py");

      const response = await fetch("http://127.0.0.1:8000/analyze_dag_dependencies/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || "Error al analizar importaciones");
      }

      if (result.success) {
        setDetectedDependencies(result.dependencies);
        toast.success("Importaciones analizadas correctamente");
      } else {
        toast.error("Error al analizar importaciones del DAG");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al analizar importaciones");
    } finally {
      setLoadingDependencies(false);
    }
  };

  // Cargar lista de módulos personalizados
  const fetchCustomModules = async () => {
    try {
      setLoadingModules(true);
      const response = await fetch("http://127.0.0.1:8000/list_custom_modules/");
      if (!response.ok) {
        throw new Error("Error al cargar los módulos personalizados");
      }
      const data = await response.json();
      
      // Asegurarnos que los datos tienen el formato correcto
      if (data.modules && Array.isArray(data.modules)) {
        setCustomModules(data.modules);
      } else {
        setCustomModules([]);
      }
    } catch (error) {
      console.error("Error al cargar módulos:", error);
      toast.error("Error al cargar la lista de módulos disponibles");
    } finally {
      setLoadingModules(false);
    }
  };

  // Subir un nuevo módulo personalizado
  const handleUploadModule = async () => {
    if (!moduleFile) {
      toast.error("Selecciona un archivo para subir");
      return;
    }

    try {
      setLoadingModules(true);
      const formData = new FormData();
      formData.append("file", moduleFile);

      const response = await fetch("http://127.0.0.1:8000/upload_custom_module/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Error al subir el módulo");
      }

      toast.success(data.message);
      // Limpiar selección y recargar módulos
      setModuleFile(null);
      fetchCustomModules();
      // Recargar dependencias para ver la nueva ruta registrada
      fetchAvailableModules();
      // Resetear el input file
      const fileInput = document.getElementById('moduleFileInput');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error("Error al subir módulo:", error);
      toast.error(error.message || "Error al subir módulo");
    } finally {
      setLoadingModules(false);
    }
  };

  // Eliminar un módulo personalizado
  const handleDeleteModule = async (moduleName) => {
    try {
      setLoadingModules(true);
      const response = await fetch(`http://127.0.0.1:8000/delete_custom_module/${encodeURIComponent(moduleName)}`, {
        method: "DELETE",
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Error al eliminar el módulo");
      }

      toast.success(data.message);
      fetchCustomModules();
    } catch (error) {
      console.error("Error al eliminar módulo:", error);
      toast.error(error.message || "Error al eliminar módulo");
    } finally {
      setLoadingModules(false);
    }
  };

  // Nueva función para obtener módulos con documentación
  const fetchModulesWithDocs = async () => {
    try {
      setLoadingModulesDocs(true);
      const response = await fetch("http://127.0.0.1:8000/modules_with_documentation/");
      if (!response.ok) {
        throw new Error("Error al cargar los módulos con documentación");
      }
      const data = await response.json();
      
      // Guardar los módulos con documentación
      if (data.modules && Array.isArray(data.modules)) {
        setModulesWithDocs(data.modules.map(m => m.module_name));
      } else {
        setModulesWithDocs([]);
      }
    } catch (error) {
      console.error("Error al cargar módulos con documentación:", error);
      // No mostramos toast para no sobrecargar al usuario con mensajes
    } finally {
      setLoadingModulesDocs(false);
    }
  };

  // Nueva función para manejar la edición de documentación
  const handleEditDocumentation = (moduleName) => {
    setSelectedModuleForDocs(moduleName);
    setShowingDocEditor(true);
  };

  // Nueva función para manejar el cierre del editor de documentación
  const handleCloseDocEditor = () => {
    setShowingDocEditor(false);
    setSelectedModuleForDocs(null);
  };

  // Nueva función para manejar cuando se guarda la documentación
  const handleDocumentationSaved = () => {
    fetchModulesWithDocs();
    setShowingDocEditor(false);
    // No eliminamos selectedModuleForDocs para mantener el contexto
  };

  // Modificamos el useEffect para cargar también los módulos con documentación
  useEffect(() => {
    fetchAvailableModules();
    fetchCustomModules();
    if (isAdminMode) {
      fetchModulesWithDocs();
    }
  }, [initialDependencies, isAdminMode]);

  return (
    <div>
      {/* Si no es modo admin y no se ocultan los controles, mostrar el botón para mostrar/ocultar */}
      {!isAdminMode && !hideControls && (
        <div className="flex justify-between items-center mb-4">
          <motion.button
            onClick={() => setShowModulesManager(!showModulesManager)}
            className="btn-secondary flex items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showModulesManager ? "Ocultar Módulos" : "Mostrar Módulos"}
          </motion.button>
          
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer mr-3">
              <input 
                type="checkbox" 
                checked={useCustomDependencies} 
                onChange={() => onToggleUseCustom && onToggleUseCustom(!useCustomDependencies)} 
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-300">Usar módulos personalizados</span>
            </label>
            
            {!readOnly && (
              <motion.button
                onClick={analyzeModuleImports}
                className="btn-secondary flex items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Analizar módulos importados en el código"
                disabled={loadingDependencies || !dagCode}
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Analizar importaciones
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Panel del gestor de módulos - si hideControls es true, siempre mostramos el contenido */}
      <AnimatePresence>
        {(showModulesManager || isAdminMode || hideControls) && (
          <motion.div
            initial={isAdminMode || hideControls ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={isAdminMode || hideControls ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`${!hideControls ? "mb-6" : ""} overflow-hidden`}
          >
            <div className="section-container">
              {isAdminMode && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="section-header">
                    <svg className="h-5 w-5 text-react-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Gestión de Módulos
                  </h3>
                  
                  <motion.button
                    onClick={handleSaveModules}
                    className="btn-primary flex items-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={savingChanges}
                  >
                    {savingChanges ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Guardar Cambios
                      </>
                    )}
                  </motion.button>
                </div>
              )}
              
              {!isAdminMode && !hideControls && (
                <h3 className="section-header mb-4">
                  <svg className="h-5 w-5 text-react-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Módulos Disponibles
                </h3>
              )}
              
              {/* Este div muestra información sobre la ruta de módulos personalizados - solo mostramos si NO estamos en modo simplificado */}
              {isAdminMode && !simplifiedMode && (
                <div className="bg-react-dark/20 p-4 rounded-lg mb-4 border border-react-border/20">
                  <h4 className="text-react-blue text-sm font-medium mb-2">Ruta de Módulos Personalizados</h4>
                  <p className="text-sm text-gray-400">
                    Los módulos personalizados se almacenan en esta ruta en el sistema: 
                    <code className="ml-2 px-2 py-1 bg-black/30 rounded text-amber-400 font-mono text-xs">
                      {CUSTOM_MODULES_PATH}
                    </code>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Esta ruta está configurada en Airflow para permitir la importación de los módulos personalizados.
                    Los módulos subidos a través de esta interfaz se guardarán automáticamente en esta ubicación.
                  </p>
                </div>
              )}
              
              {/* Si es modo admin y no es readOnly, mostrar formulario para añadir rutas - solo mostramos si NO estamos en modo simplificado */}
              {isAdminMode && !readOnly && !simplifiedMode && (
                <div className="mb-6">
                  <div className="bg-react-darker/30 p-4 rounded-lg border border-react-border/30">
                    <h4 className="text-react-blue text-sm font-medium mb-3">Añadir Ruta de Módulo</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Ruta del módulo</label>
                        <input
                          type="text"
                          value={newModulePath}
                          onChange={(e) => setNewModulePath(e.target.value)}
                          className="input-field w-full"
                          placeholder="/ruta/a/mi/modulo"
                        />
                      </div>
                      <motion.button
                        onClick={handleAddModulePath}
                        disabled={loadingDependencies || !newModulePath.trim()}
                        className="btn-primary w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loadingDependencies ? "Añadiendo..." : "Añadir Ruta"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Lista de rutas de módulos - modificamos para solo mostrar si NO estamos en modo simplificado */}
              {!simplifiedMode && (
                <div className="mt-6">
                  <h4 className="text-react-blue text-sm font-medium mb-2">Rutas de Módulos</h4>
                  {dependencies.modules_paths.length === 0 ? (
                    <p className="text-sm text-gray-400">No hay rutas registradas</p>
                  ) : (
                    <ul className="space-y-2 mt-2">
                      {dependencies.modules_paths.map((pathItem, index) => (
                        <li key={index} className="bg-react-dark/40 px-3 py-2 rounded text-sm">
                          {editingPathIndex === index ? (
                            // Modo edición
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editingPathValue}
                                onChange={(e) => setEditingPathValue(e.target.value)}
                                className="input-field flex-1 py-1 px-2 text-sm"
                                autoFocus
                              />
                              <div className="flex space-x-1">
                                <motion.button
                                  onClick={() => handleSaveEditPath(index)}
                                  className="text-green-500 hover:text-green-400 p-1"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Guardar cambios"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </motion.button>
                                <motion.button
                                  onClick={handleCancelEditPath}
                                  className="text-gray-400 hover:text-gray-300 p-1"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Cancelar"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </motion.button>
                              </div>
                            </div>
                          ) : (
                            // Modo visualización
                            <div className="flex items-center justify-between">
                              <div className="flex-1 mr-2">
                                <span className="text-gray-300 truncate block">
                                  {typeof pathItem === 'string' ? pathItem : pathItem.path}
                                </span>
                                <p className="text-xs text-gray-500">
                                  {typeof pathItem === 'string' ? "Ruta de módulos" : (pathItem.description || "Ruta de módulos")}
                                </p>
                              </div>
                              {!readOnly && (
                                <motion.button
                                  onClick={() => handleStartEditPath(index, pathItem)}
                                  className="text-blue-400 hover:text-blue-300 flex-shrink-0"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Editar ruta"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </motion.button>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              
              {/* Módulos importados detectados */}
              {detectedDependencies.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-react-blue text-sm font-medium mb-2">Módulos Importados</h4>
                  <div className="bg-react-dark/40 p-3 rounded">
                    <div className="flex flex-wrap gap-2">
                      {detectedDependencies.map((dep, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800/30"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sección de módulos disponibles */}
              <div className={isAdminMode || !hideControls ? "mt-6" : "mt-0"}>
                {/* Solo mostramos el título si no estamos ocultando los controles */}
                {(!hideControls || isAdminMode) && (
                  <h3 className="text-react-blue text-sm font-medium mb-4">Módulos Disponibles</h3>
                )}
                
                {!readOnly && (
                  <div className="bg-react-darker/30 p-4 rounded-lg border border-react-border/30 mb-4">
                    <h4 className="text-react-blue text-sm font-medium mb-3">Subir Módulo Python</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Archivo del módulo (.py)</label>
                        <input
                          type="file"
                          id="moduleFileInput"
                          accept=".py"
                          onChange={(e) => setModuleFile(e.target.files[0])}
                          className="block w-full text-sm text-gray-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-900/50 file:text-blue-200
                            hover:file:bg-blue-900"
                        />
                      </div>
                      <motion.button
                        onClick={handleUploadModule}
                        disabled={loadingModules || !moduleFile}
                        className="btn-primary w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loadingModules ? "Subiendo..." : "Subir Módulo"}
                      </motion.button>
                    </div>
                  </div>
                )}
                
                <div>
                  {customModules.length === 0 ? (
                    <p className="text-sm text-gray-400">No hay módulos disponibles</p>
                  ) : (
                    <ul className="space-y-2 mt-2">
                      {customModules.map((module, index) => {
                        const moduleName = typeof module === 'string' ? module : module.name;
                        const hasDocumentation = modulesWithDocs.includes(moduleName);
                        
                        return (
                          <li key={index} className="flex items-center justify-between bg-react-dark/40 px-3 py-2 rounded">
                            <div className="flex items-center">
                              {hasDocumentation && (
                                <span className="text-green-500 mr-2" title="Tiene documentación">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </span>
                              )}
                              <div>
                                <span className="text-sm text-gray-300">
                                  {moduleName}
                                </span>
                                <p className="text-xs text-gray-500">
                                  {typeof module === 'string' ? "Módulo Python personalizado" : (module.description || "Módulo Python personalizado")}
                                </p>
                              </div>
                            </div>
                            {!readOnly && (
                              <div className="flex items-center space-x-2">
                                {isAdminMode && (
                                  <motion.button
                                    onClick={() => handleEditDocumentation(moduleName)}
                                    className="text-blue-400 hover:text-blue-300"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title={hasDocumentation ? "Editar documentación" : "Añadir documentación"}
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </motion.button>
                                )}
                                <motion.button
                                  onClick={() => handleDeleteModule(moduleName)}
                                  className="text-red-400 hover:text-red-300"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Eliminar módulo"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </motion.button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mostrar un indicador si hay módulos disponibles */}
      {!showModulesManager && !isAdminMode && !hideControls && customModules.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          <span className="flex items-center">
            <svg className="h-3 w-3 text-green-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {customModules.length} {customModules.length === 1 ? 'módulo disponible' : 'módulos disponibles'}
          </span>
        </div>
      )}

      {/* Modal para editar documentación (solo en modo admin) */}
      {isAdminMode && showingDocEditor && selectedModuleForDocs && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-react-darker rounded-lg border border-react-border/50 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-200">
                  Documentación: {selectedModuleForDocs}
                </h2>
                <motion.button
                  onClick={handleCloseDocEditor}
                  className="text-gray-400 hover:text-gray-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              <ModuleDocEditor 
                moduleName={selectedModuleForDocs}
                onSaved={handleDocumentationSaved}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DependencyManager; 