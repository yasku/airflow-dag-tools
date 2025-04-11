import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { configService } from '../services/configService';

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  // Estado para las secciones de documentación
  const [docSections, setDocSections] = useState([]);
  const [dagTemplate, setDagTemplate] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar configuración inicial
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const [docsData, templateData] = await Promise.all([
          configService.getDocSections(),
          configService.getDagTemplate()
        ]);
        
        // Validar y normalizar la estructura de los datos de documentación
        if (docsData && docsData.sections) {
          if (Array.isArray(docsData.sections)) {
            // Formato correcto
            setDocSections(docsData.sections);
          } else if (typeof docsData.sections === 'object' && docsData.sections.sections && Array.isArray(docsData.sections.sections)) {
            // Formato anidado incorrecto que podría ocurrir
            console.warn('Formato de datos anidado detectado. Normalizando...');
            setDocSections(docsData.sections.sections);
          } else {
            // Formato desconocido
            console.error('Formato de datos de documentación inesperado:', docsData);
            setDocSections([]);
            toast.error('Error en el formato de la documentación');
          }
        } else {
          // No hay datos o formato inválido
          console.error('Datos de documentación inválidos:', docsData);
          setDocSections([]);
        }
        
        setDagTemplate(templateData.template);
      } catch (error) {
        console.error('Error al cargar la configuración:', error);
        toast.error('Error al cargar la configuración');
        setDocSections([]); // Establecer un valor predeterminado seguro
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Funciones para actualizar la configuración
  const updateDocSections = async (newSections) => {
    try {
      // Guardar copia del estado actual para restaurar en caso de error
      const currentSections = [...docSections];
      
      // Actualizar inmediatamente el UI para mejor experiencia
      setDocSections(Array.isArray(newSections) ? newSections : newSections.sections || []);
      
      // Enviar al backend
      await configService.updateDocSections(newSections);
      
      toast.success('Documentación actualizada');
    } catch (error) {
      // Si hay error, restaurar estado anterior
      setDocSections(currentSections);
      
      console.error('Error al actualizar la documentación:', error);
      toast.error('Error al actualizar la documentación');
      throw error;
    }
  };

  const updateDagTemplate = async (newTemplate) => {
    try {
      await configService.updateDagTemplate(newTemplate);
      setDagTemplate(newTemplate);
      toast.success('Template actualizado');
    } catch (error) {
      console.error('Error al actualizar el template:', error);
      toast.error('Error al actualizar el template');
      throw error;
    }
  };

  return (
    <ConfigContext.Provider 
      value={{ 
        docSections, 
        updateDocSections, 
        dagTemplate, 
        updateDagTemplate,
        loading 
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig debe ser usado dentro de un ConfigProvider');
  }
  return context;
}; 