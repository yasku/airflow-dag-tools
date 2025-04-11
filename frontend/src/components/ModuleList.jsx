import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';

const ModuleList = forwardRef(({ onModuleSelect, selectedModule }, ref) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/list_custom_modules/');
      const data = await response.json();
      
      // La API de módulos personalizados devuelve un array de objetos,
      // así que adaptamos el formato correspondiente
      setModules(data.modules || []);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener los módulos personalizados:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // Exponer la función de refresco
  useImperativeHandle(ref, () => ({
    refreshList: fetchModules
  }));

  return (
    <div className="h-full">
      <div className="h-full overflow-auto">
        <div className="section-container">
          <h3 className="section-header">
            <svg className="h-5 w-5 text-react-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Módulos Personalizados
          </h3>
          
          <div className="space-y-2">
            {loading ? (
              <div className="text-gray-400 text-sm">Cargando módulos...</div>
            ) : modules.length > 0 ? (
              modules.map((module, index) => {
                // Extraer el nombre del módulo (podría ser un string o un objeto con propiedad name)
                const moduleName = typeof module === 'string' ? module : module.name;
                const isSelected = selectedModule === moduleName;
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => onModuleSelect(moduleName)}
                    className="w-full group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`flex items-center px-3 py-2 rounded-lg border transition-colors duration-200 
                      ${isSelected 
                        ? 'bg-react-blue/10 border-react-blue/50 text-react-blue' 
                        : 'bg-[#1A1D23] border-react-border/30 hover:border-react-blue/30 hover:bg-react-blue/5'}`}
                    >
                      <svg 
                        className={`h-4 w-4 mr-2 ${isSelected ? 'text-react-blue' : 'text-react-blue/70 group-hover:text-react-blue'}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className={`text-base truncate ${isSelected ? 'text-react-blue' : 'text-gray-200 group-hover:text-react-blue'}`}>
                        {moduleName}
                      </span>
                    </div>
                  </motion.button>
                );
              })
            ) : (
              <div className="text-gray-400 text-sm">No hay módulos personalizados disponibles</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ModuleList; 