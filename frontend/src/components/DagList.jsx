import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';

const DagList = forwardRef(({ onDagSelect }, ref) => {
  const [dags, setDags] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDags = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/list_dags/');
      const data = await response.json();
      setDags(data.dags);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener los DAGs:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDags();
  }, []);

  // Exponer la función de refresco
  useImperativeHandle(ref, () => ({
    refreshList: fetchDags
  }));

  return (
    <div className="h-full">
      <div className="h-full overflow-auto">
        <div className="section-container">
          <h3 className="section-header">
            <svg className="h-5 w-5 text-react-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            DAGs Disponibles
          </h3>
          
          <div className="space-y-2">
            {loading ? (
              <div className="text-gray-400 text-sm">Cargando DAGs...</div>
            ) : dags.length > 0 ? (
              dags.map((dag) => (
                <motion.button
                  key={dag}
                  onClick={() => onDagSelect(dag)}
                  className="w-full group"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center px-3 py-2 rounded-lg bg-[#1A1D23] border border-react-border/30 transition-colors duration-200 hover:border-react-blue/30 hover:bg-react-blue/5">
                    <svg 
                      className="h-4 w-4 text-react-blue/70 mr-2 group-hover:text-react-blue" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-base text-gray-200 group-hover:text-react-blue truncate">
                      {dag}
                    </span>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="text-gray-400 text-sm">No hay DAGs disponibles</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default DagList; 