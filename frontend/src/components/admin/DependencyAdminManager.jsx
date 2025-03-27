import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DependencyManager from '../DependencyManager';

function DependencyAdminManager({ simplifiedMode = true }) {
  // Estados para gestión administrativa de módulos
  const [modulesData, setModulesData] = useState({ modules_paths: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Nuevo estado para rastrear los módulos con documentación
  const [modulesWithDocs, setModulesWithDocs] = useState([]);

  // Cargar módulos al montar el componente
  useEffect(() => {
    fetchAvailableModules();
    fetchModulesWithDocs();
  }, []);

  // Función para cargar los módulos disponibles del backend
  const fetchAvailableModules = async () => {
    try {
      setIsLoading(true);
      // Mantenemos la URL original para compatibilidad
      const response = await fetch('http://127.0.0.1:8000/dependencies/');
      if (!response.ok) {
        throw new Error('Error al cargar módulos disponibles');
      }
      const data = await response.json();
      
      // Simplificamos para enfocarnos en modules_paths
      setModulesData({
        modules_paths: data.modules_paths || []
      });
      
    } catch (error) {
      console.error('Error al cargar módulos:', error);
      toast.error('Error al cargar los módulos disponibles');
    } finally {
      setIsLoading(false);
    }
  };

  // Nueva función para cargar los módulos que tienen documentación
  const fetchModulesWithDocs = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/modules_with_documentation/');
      if (!response.ok) {
        throw new Error('Error al cargar módulos con documentación');
      }
      const data = await response.json();
      
      if (data.modules && Array.isArray(data.modules)) {
        setModulesWithDocs(data.modules.map(m => m.module_name));
      }
    } catch (error) {
      console.error('Error al cargar módulos con documentación:', error);
      // No mostramos toast para no sobrecargar al usuario con mensajes
    }
  };

  // Función para guardar módulos
  const saveModules = async (updatedData) => {
    try {
      setIsSaving(true);
      
      // Conservamos solo modules_paths para guardar
      const dataToSave = {
        modules_paths: updatedData.modules_paths || []
      };
      
      // Usamos el endpoint correcto
      const response = await fetch('http://127.0.0.1:8000/available_modules/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        throw new Error('Error al guardar módulos');
      }

      await fetchAvailableModules(); // Recargar después de guardar
      toast.success('Módulos guardados correctamente');
      
    } catch (error) {
      console.error('Error al guardar módulos:', error);
      toast.error('Error al guardar los módulos');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Nueva función para manejar cuando se guarda la documentación
  const handleDocumentationSaved = () => {
    fetchModulesWithDocs();
  };

  // Mejorar el texto descriptivo para mencionar la documentación
  const descriptionText = `
    Esta sección permite gestionar los módulos personalizados 
    que serán utilizados para validar los DAGs en toda la aplicación.
    Puedes subir, editar y eliminar módulos Python, así como añadir documentación 
    para cada módulo que estará disponible para todos los usuarios.
  `;

  return (
    <div>
      <h3 className="text-xl font-medium text-gray-200 mb-4">Administración de Módulos</h3>
      
      <p className="text-gray-400 mb-6">
        {descriptionText}
      </p>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <svg className="animate-spin h-8 w-8 text-react-blue" viewBox="0 0 24 24">
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-3 text-gray-300">Cargando módulos disponibles...</span>
        </div>
      ) : (
        <DependencyManager
          readOnly={false}
          useCustomDependencies={true}
          onToggleUseCustom={() => {}}
          initialDependencies={modulesData}
          onSaveDependencies={saveModules}
          isAdminMode={true}
          simplifiedMode={simplifiedMode}
          modulesWithDocs={modulesWithDocs}
          onDocumentationSaved={handleDocumentationSaved}
        />
      )}
      
      {/* Información adicional sobre la documentación */}
      <div className="mt-8 bg-react-dark/20 p-4 rounded-lg border border-react-border/20">
        <h4 className="text-react-blue text-sm font-medium mb-2">Documentación de módulos</h4>
        <p className="text-sm text-gray-400">
          La documentación que escribas para cada módulo será visible para todos los usuarios
          en la sección de "Módulos Personalizados" de la documentación. Utiliza formato Markdown
          para crear documentación rica e informativa.
        </p>
        <div className="mt-2 flex items-center">
          <span className="text-xs text-gray-500 flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {modulesWithDocs.length} {modulesWithDocs.length === 1 ? 'módulo con documentación' : 'módulos con documentación'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DependencyAdminManager;
