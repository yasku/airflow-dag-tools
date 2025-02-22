import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function DagManager() {
  const [dags, setDags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDag, setSelectedDag] = useState(null);
  const [dagContent, setDagContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchDags = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/list_dags/');
      const data = await response.json();
      setDags(data.dags);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener los DAGs:', error);
      toast.error('Error al cargar los DAGs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDags();
  }, []);

  const handleDagSelect = async (dagName) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/get_dag_content/${dagName}`);
      const data = await response.json();
      setDagContent(data.content);
      setSelectedDag(dagName);
    } catch (error) {
      console.error('Error al cargar el DAG:', error);
      toast.error('Error al cargar el contenido del DAG');
    }
  };

  const handleDeleteDag = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/delete_dag/${selectedDag}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('DAG eliminado correctamente');
        setSelectedDag(null);
        setDagContent('');
        fetchDags();
      } else {
        throw new Error('Error al eliminar el DAG');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar el DAG');
    }
    setShowDeleteConfirm(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8000/save_dag/', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast.success('DAG subido correctamente');
        fetchDags();
      } else {
        const data = await response.json();
        throw new Error(data.detail || 'Error al subir el DAG');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Gestionar DAGs</h2>
        <label className="btn-primary cursor-pointer">
          <input
            type="file"
            accept=".py"
            onChange={handleFileUpload}
            className="hidden"
          />
          Subir DAG
        </label>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Lista de DAGs */}
        <div className="col-span-4">
          <div className="card p-4">
            <h3 className="text-lg font-medium text-gray-200 mb-4">DAGs Disponibles</h3>
            <div className="space-y-2">
              {loading ? (
                <div className="text-gray-400">Cargando DAGs...</div>
              ) : dags.length > 0 ? (
                dags.map((dag) => (
                  <motion.button
                    key={dag}
                    onClick={() => handleDagSelect(dag)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
                      selectedDag === dag
                        ? 'bg-react-blue/10 text-react-blue'
                        : 'text-gray-200 hover:bg-react-blue/5 hover:text-react-blue'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {dag}
                  </motion.button>
                ))
              ) : (
                <div className="text-gray-400">No hay DAGs disponibles</div>
              )}
            </div>
          </div>
        </div>

        {/* Visualización y acciones */}
        <div className="col-span-8">
          {selectedDag ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-200">{selectedDag}</h3>
                <motion.button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-400/5 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Eliminar DAG
                </motion.button>
              </div>
              
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-react-border/30">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                </div>
                <SyntaxHighlighter
                  language="python"
                  style={atomOneDark}
                  customStyle={{
                    margin: 0,
                    padding: 20,
                    background: '#1A1D23',
                  }}
                >
                  {dagContent}
                </SyntaxHighlighter>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Selecciona un DAG para ver su contenido
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
                  ¿Estás seguro de que deseas eliminar el DAG "{selectedDag}"? Esta acción no se puede deshacer.
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
                    onClick={handleDeleteDag}
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
    </div>
  );
}

export default DagManager; 