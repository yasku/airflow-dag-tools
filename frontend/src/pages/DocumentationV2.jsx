import { useState, useRef } from 'react';
import { useConfig } from '../context/ConfigContext';
import { motion } from 'framer-motion';
import ModuleList from '../components/ModuleList';
import ModuleViewer from '../components/ModuleViewer';
import ModuleDocumentation from '../components/ModuleDocumentation';
import ReactMarkdown from 'react-markdown';

function DocumentationV2() {
  const { docSections, loading } = useConfig();
  
  // Estados para la sección de módulos personalizados
  const [selectedModule, setSelectedModule] = useState(null);
  const moduleListRef = useRef(null);
  const [activeTab, setActiveTab] = useState('code'); // 'code' o 'docs'
  
  // Nuevos estados para la visualización de documentos
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [showDocument, setShowDocument] = useState(false);
  const [documentMetadata, setDocumentMetadata] = useState(null);

  // Función para manejar la selección de módulos
  const handleModuleSelect = (moduleName) => {
    setSelectedModule(moduleName);
  };
  
  // Función para cargar y mostrar documentos de sección
  const handleSectionDocumentSelect = (sectionId, cardIndex) => {
    const section = docSections.find(s => s.id === sectionId);
    if (section && section.cards[cardIndex]) {
      setSelectedSection(sectionId);
      setSelectedCard(cardIndex);
      
      // Si hay contenido markdown, lo usamos directamente
      if (section.cards[cardIndex].markdownContent) {
        setDocumentContent(section.cards[cardIndex].markdownContent);
        setDocumentMetadata({
          title: section.cards[cardIndex].title,
          section: section.title
        });
        setShowDocument(true);
      } else {
        // En caso contrario, generamos markdown básico a partir del content
        const basicMarkdown = `# ${section.cards[cardIndex].title}\n\n${section.cards[cardIndex].content}`;
        setDocumentContent(basicMarkdown);
        setDocumentMetadata({
          title: section.cards[cardIndex].title,
          section: section.title
        });
        setShowDocument(true);
      }
    }
  };
  
  // Función para cerrar el documento
  const closeDocument = () => {
    setShowDocument(false);
    setDocumentContent('');
    setDocumentMetadata(null);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-react-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="p-6">
        <div className="card mb-8">
          <div className="bg-[#2A1810] rounded-lg border border-orange-900/50 p-4 mb-8">
            <h2 className="text-2xl font-semibold text-orange-500/90 flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Documentación
            </h2>
          </div>

          <div className="p-6">
            {showDocument ? (
              <div className="relative">
                <div className="flex justify-between items-center mb-6">
                  {documentMetadata && (
                    <div>
                      <div className="text-gray-400 text-sm mb-1">{documentMetadata.section}</div>
                      <h3 className="text-xl font-semibold text-white">{documentMetadata.title}</h3>
                    </div>
                  )}
                  <button 
                    onClick={closeDocument}
                    className="bg-react-dark hover:bg-react-hover p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="bg-react-darker/50 rounded-lg border border-react-border/30 p-6">
                  <div className="bg-react-dark/80 rounded-lg p-6">
                    <ModuleDocumentation 
                      moduleName={null} 
                      customContent={documentContent}
                      isSection={true}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-1 bg-react-darker/50 rounded-lg border border-react-border/30 p-4">
                  <h3 className="text-lg font-medium text-gray-200 mb-4">Documentos</h3>
                  {docSections.map((section) => (
                    <div key={section.id} className="mb-4">
                      <div className="flex items-center space-x-2 text-gray-300 mb-2">
                        <svg className="h-4 w-4 text-react-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                        </svg>
                        <h4 className="font-medium">{section.title}</h4>
                      </div>
                      <ul className="ml-6 space-y-1">
                        {section.cards.map((card, index) => (
                          <li key={index}>
                            <button 
                              onClick={() => handleSectionDocumentSelect(section.id, index)}
                              className={`text-left text-sm w-full px-2 py-1 rounded ${
                                selectedSection === section.id && selectedCard === index
                                  ? 'bg-react-blue/20 text-react-blue'
                                  : 'text-gray-400 hover:text-gray-300 hover:bg-react-darker'
                              }`}
                            >
                              {card.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                
                <div className="col-span-3">
                  <div className="space-y-6">
                    {docSections.map((section) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-react-darker/50 rounded-lg border border-react-border/30"
                      >
                        <div className="p-4 border-b border-react-border/20">
                          <div className="flex items-center space-x-3">
                            <svg className="h-5 w-5 text-react-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-200">{section.title}</h3>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.cards.map((card, index) => (
                              <motion.div
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                className="bg-react-dark rounded-lg border border-react-border/20 p-4 hover:border-react-blue/30 transition-colors cursor-pointer"
                                onClick={() => handleSectionDocumentSelect(section.id, index)}
                              >
                                <h4 className="text-lg font-medium text-gray-200 mb-2">{card.title}</h4>
                                <p className="text-gray-400 text-sm line-clamp-2">{card.content}</p>
                                <div className="mt-3 text-react-blue text-xs flex items-center">
                                  <span>Leer más</span>
                                  <svg className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="bg-[#2A1810] rounded-lg border border-orange-900/50 p-4 mb-8">
            <h2 className="text-2xl font-semibold text-orange-500/90 flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Módulos Personalizados
            </h2>
          </div>

          <div className="p-6">
            <p className="text-gray-400 mb-6">
              Esta sección muestra los módulos Python personalizados configurados en el sistema. 
              Estos módulos pueden ser importados y utilizados en tus DAGs para implementar funcionalidades específicas.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-1">
                <ModuleList 
                  ref={moduleListRef}
                  onModuleSelect={handleModuleSelect}
                  selectedModule={selectedModule}
                />
              </div>
              
              <div className="lg:col-span-4">
                {selectedModule ? (
                  <div>
                    <div className="flex border-b border-react-border/20 mb-6">
                      <button
                        onClick={() => setActiveTab('code')}
                        className={`px-4 py-2 font-medium text-sm ${
                          activeTab === 'code' 
                            ? 'text-react-blue border-b-2 border-react-blue' 
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        Código
                      </button>
                      <button
                        onClick={() => setActiveTab('docs')}
                        className={`px-4 py-2 font-medium text-sm ${
                          activeTab === 'docs' 
                            ? 'text-react-blue border-b-2 border-react-blue' 
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        Documentación
                      </button>
                    </div>

                    <div className="lg:grid lg:grid-cols-1 gap-6">
                      {activeTab === 'code' ? (
                        <ModuleViewer moduleName={selectedModule} />
                      ) : (
                        <ModuleDocumentation moduleName={selectedModule} />
                      )}
                    </div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 bg-react-darker/50 rounded-lg border border-react-border/30 p-4"
                    >
                      <h4 className="text-lg font-medium text-gray-200 mb-2">Uso del módulo</h4>
                      <div className="text-gray-400 text-sm">
                        <p className="mb-2">
                          Para utilizar este módulo en tus DAGs, importalo de la siguiente manera:
                        </p>
                        <div className="bg-react-dark/80 rounded-lg p-3 font-mono text-amber-400/90 text-xs mb-4">
                          <code>from {selectedModule.replace('.py', '')} import *</code>
                        </div>
                        <p>
                          Los módulos personalizados están disponibles en el path que ha sido configurado por el administrador.
                          Estos módulos permiten reutilizar código común, implementar operaciones personalizadas o definir funciones
                          específicas para tu flujo de trabajo en Airflow.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="bg-react-darker/50 rounded-lg border border-react-border/30 p-6 text-center">
                    <p className="text-gray-400">Selecciona un módulo para ver sus detalles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentationV2; 