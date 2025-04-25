import { useState } from 'react';
import DagList from '../components/DagList';
import DagDocForm from '../components/admin/DagDocForm';
import { showToast } from '../utils/toast.jsx';
import MarkdownViewer from '../components/MarkdownViewer';
import { motion, AnimatePresence } from 'framer-motion';

function DagDocumentationV2() {
  const [selectedDag, setSelectedDag] = useState(null);
  const [documentation, setDocumentation] = useState(null);

  const handleDagSelect = async (dagName) => {
    setSelectedDag(dagName);
    setDocumentation(null);
    
    try {
      const response = await fetch(`/get_dag_diagram/${dagName}`);
      if (!response.ok) throw new Error('Error al cargar el diagrama');
      const data = await response.json();
    } catch (error) {
      console.error('Error:', error);
      showToast.error('Error al cargar el diagrama');
    }
  };

  const handleDocSubmit = async (formData) => {
    try {
      const response = await fetch(`/generate_dag_doc/${selectedDag}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error al generar la documentación');
      
      const data = await response.json();
      setDocumentation(data.documentation);
      
      showToast.success('Documentación generada y guardada correctamente');
    } catch (error) {
      console.error('Error:', error);
      showToast.error('Error al generar la documentación');
    }
  };

  const features = [
    {
      title: "Documentación Estructurada",
      description: "Genera documentación clara y organizada para tus DAGs",
      icon: "📝"
    },
    {
      title: "Diagramas Automáticos",
      description: "Visualiza el flujo de trabajo de tus DAGs",
      icon: "📊"
    },
    {
      title: "Información Detallada",
      description: "Documenta dependencias, programación y responsables",
      icon: "ℹ️"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="p-6">
        <div className="card">
          <div className="bg-[#2A1810] rounded-lg border border-orange-900/50 p-4 mb-8">
            <h2 className="text-2xl font-semibold text-orange-500/90 flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Documentación de DAG
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Sidebar con DagList - Corregido para evitar duplicación */}
              <div className="col-span-3">
                <DagList onDagSelect={handleDagSelect} />
              </div>

              {/* Contenido principal */}
              <div className="col-span-9">
                <div className="space-y-6">
                  {selectedDag && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-react-darker/50 rounded-lg p-6 border border-react-blue/30 max-w-2xl mx-auto mb-8"
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center">
                          <span className="mr-3 text-xl">📋</span>
                          <span className="text-2xl font-semibold text-react-blue">Documentación para {selectedDag}</span>
                        </div>
                        <p className="text-gray-400 mt-2">Completa la información para generar la documentación del DAG</p>
                      </div>
                    </motion.div>
                  )}

                  {selectedDag ? (
                    <AnimatePresence mode="wait">
                      {documentation ? (
                        <motion.div
                          key="documentation"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="section-container"
                        >
                          <h3 className="section-header">
                            <svg className="h-5 w-5 text-react-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Documentación Generada
                          </h3>
                          <MarkdownViewer 
                            content={documentation}
                            dagName={selectedDag}
                            onDownload={() => {
                              const element = document.createElement('a');
                              const file = new Blob([documentation], {type: 'text/markdown'});
                              element.href = URL.createObjectURL(file);
                              element.download = `${selectedDag}_documentation.md`;
                              document.body.appendChild(element);
                              element.click();
                              document.body.removeChild(element);
                            }}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="form"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <DagDocForm 
                            dagName={selectedDag} 
                            onSubmit={handleDocSubmit}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto p-6"
                    >
                      {features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-react-darker/50 rounded-lg p-6 border border-react-blue/30 hover:border-react-blue/50 hover:bg-react-blue/5 transition-all duration-200"
                        >
                          <div className="flex flex-col h-full">
                            <span className="text-2xl mb-4">{feature.icon}</span>
                            <h3 className="text-lg font-medium text-white mb-2">
                              {feature.title}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {feature.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="md:col-span-3 bg-react-darker/50 rounded-lg p-6 border border-react-blue/30 hover:border-react-blue/50 hover:bg-react-blue/5 transition-all duration-200 text-center"
                      >
                        <span className="text-lg text-white">
                          Selecciona un DAG para comenzar
                        </span>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DagDocumentationV2; 