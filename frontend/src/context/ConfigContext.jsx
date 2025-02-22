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
        
        setDocSections(docsData.sections);
        setDagTemplate(templateData.template);
      } catch (error) {
        console.error('Error al cargar la configuración:', error);
        toast.error('Error al cargar la configuración');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Funciones para actualizar la configuración
  const updateDocSections = async (newSections) => {
    try {
      await configService.updateDocSections(newSections);
      setDocSections(newSections);
      toast.success('Documentación actualizada');
    } catch (error) {
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