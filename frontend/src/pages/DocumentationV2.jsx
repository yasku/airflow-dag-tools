import { useState, useRef, useMemo, useCallback } from 'react';
import { useConfig } from '../context/ConfigContext';
import { motion } from 'framer-motion';
import ModuleList from '../components/ModuleList';
import ModuleViewer from '../components/ModuleViewer';
import ModuleDocumentation from '../components/ModuleDocumentation';

function DocumentationV2() {
  const { docSections, loading } = useConfig();
  
  // Estados para la sección de módulos personalizados
  const [selectedModule, setSelectedModule] = useState(null);
  const moduleListRef = useRef(null);
  const [activeTab, setActiveTab] = useState('code'); // 'code' o 'docs'
  
  // Estados para la visualización de documentos
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [showDocument, setShowDocument] = useState(false);
  const [documentMetadata, setDocumentMetadata] = useState(null);

  // Función para manejar la selección de módulos (memoizada para evitar re-renders)
  const handleModuleSelect = useCallback((moduleName) => {
    setSelectedModule(moduleName);
  }, []);
  
  // Función para formatear fechas de manera consistente
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);
  
  // Función utilitaria para crear un objeto de metadata consistente
  const createMetadataObject = useCallback((title, sectionTitle, author = 'Admin', lastUpdated = new Date().toISOString()) => {
    return {
      title: title,
      section: sectionTitle,
      author: author,
      last_updated: lastUpdated,
      metadata: {
        author: author,
        last_updated: lastUpdated
      }
    };
  }, []);
  
  // Función utilitaria para formatear el contenido markdown
  const formatMarkdownContent = useCallback((markdown) => {
    if (!markdown) return '';
    
    // Aseguramos que los encabezados tengan espacio después de #
    let formattedMarkdown = markdown.replace(/^(#{1,6})([^#\s])/gm, '$1 $2');
    
    // Aseguramos que las listas tengan salto de línea antes
    formattedMarkdown = formattedMarkdown.replace(/([^\n])([\n])([-*+]|\d+\.)\s/g, '$1\n\n$3 ');
    
    // Aseguramos que los bloques de código tengan formato adecuado
    formattedMarkdown = formattedMarkdown.replace(/```([^\n])/g, '```\n$1');
    
    return formattedMarkdown;
  }, []);
  
  // Función para cargar y mostrar documentos de sección (optimizada)
  const handleSectionDocumentSelect = useCallback((sectionId, cardIndex) => {
    const section = docSections.find(s => s.id === sectionId);
    if (!section || !section.cards[cardIndex]) return;
    
    setSelectedSection(sectionId);
    setSelectedCard(cardIndex);
    
    const card = section.cards[cardIndex];
    
    // Determinar el contenido a mostrar (markdown o contenido básico)
    let content;
    if (card.markdownContent) {
      content = formatMarkdownContent(card.markdownContent);
    } else {
      content = `# ${card.title}\n\n${card.content}`;
    }
    
    setDocumentContent(content);
    
    // Crear los metadatos usando la función utilitaria
    setDocumentMetadata(createMetadataObject(
      card.title, 
      section.title, 
      card.author || 'Admin', 
      card.last_updated || new Date().toISOString()
    ));
    
    setShowDocument(true);
  }, [docSections, formatMarkdownContent, createMetadataObject]);
  
  // Función para cerrar el documento (memoizada)
  const closeDocument = useCallback(() => {
    setShowDocument(false);
    setDocumentContent('');
    setSelectedSection(null);
    setSelectedCard(null);
    setDocumentMetadata(null);
  }, []);

  // Función para cambiar entre la vista de grid y la vista individual de documento (memoizada)
  const toggleDocumentView = useCallback((show = true) => {
    if (!show) {
      closeDocument();
    } else {
      setShowDocument(true);
    }
  }, [closeDocument]);

  // Función para verificar si un documento está seleccionado (memoizada)
  const isDocumentSelected = useCallback((sectionId, cardIndex) => {
    return selectedSection === sectionId && selectedCard === cardIndex;
  }, [selectedSection, selectedCard]);

  // Componente memoizado para el spinner de carga
  const LoadingSpinner = useMemo(() => (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-react-blue"></div>
    </div>
  ), []);

  // Componente memoizado para mostrar un error de formato de datos
  const DataFormatError = useMemo(() => (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-6 text-center">
        <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-xl font-medium text-red-400 mb-2">Error al cargar la documentación</h3>
        <p className="text-gray-400 mb-4">Se ha producido un error en la estructura de datos. Por favor, contacte con el administrador del sistema.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-800/50 hover:bg-red-700/50 text-white px-4 py-2 rounded transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  ), []);

  // Componente para el mensaje de "Selecciona un documento"
  const EmptyDocumentMessage = useMemo(() => (
    <div className="bg-react-darker/50 rounded-lg border border-react-border/30 p-6 text-center h-full flex items-center justify-center">
      <div>
        <svg className="h-12 w-12 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-400">Selecciona un documento para ver sus detalles</p>
      </div>
    </div>
  ), []);

  // Componente memoizado para la barra lateral de documentos
  const DocumentsSidebar = useCallback(({ className = '' }) => (
    <div className={`h-full bg-react-darker/50 rounded-lg border border-react-border/30 p-4 ${className}`}>
      <h3 className="section-header flex items-center text-lg font-medium text-gray-200 mb-4">
        <svg className="h-5 w-5 text-react-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Documentos
      </h3>
      <div className="space-y-2">
        {Array.isArray(docSections) ? (
          docSections.length > 0 ? (
            docSections.map((section) => (
              <div key={section.id} className="mb-4">
                <div className="flex items-center space-x-2 text-gray-300 mb-2">
                  <svg className="h-4 w-4 text-react-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                  </svg>
                  <h4 className="font-medium">{section.title}</h4>
                </div>
                <ul className="ml-6 space-y-1">
                  {Array.isArray(section.cards) ? (
                    section.cards.map((card, index) => (
                      <li key={index}>
                        <button 
                          onClick={() => handleSectionDocumentSelect(section.id, index)}
                          className={`w-full text-left group flex items-center px-2 py-1 rounded ${
                            isDocumentSelected(section.id, index)
                              ? 'bg-react-blue/10 text-react-blue'
                              : 'text-gray-400 hover:text-gray-300 hover:bg-react-darker'
                          }`}
                        >
                          <span className="truncate text-sm">{card.title}</span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm italic">No hay documentos disponibles</li>
                  )}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-sm italic">No hay secciones de documentación configuradas</div>
          )
        ) : (
          <div className="bg-red-900/20 border border-red-800/30 rounded p-2 text-red-400 text-sm">
            Error en el formato de los datos. Por favor, contacte al administrador.
          </div>
        )}
      </div>
    </div>
  ), [docSections, handleSectionDocumentSelect, isDocumentSelected]);

  if (loading) {
    return LoadingSpinner;
  }

  // Validación adicional para asegurarse de que docSections es un array
  if (!Array.isArray(docSections)) {
    return DataFormatError;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="p-6">
        {/* Sección de Documentación */}
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
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Sidebar en vista detallada */}
                <div className="lg:col-span-1">
                  <DocumentsSidebar />
                </div>
                
                {/* Contenido principal en vista detallada */}
                <div className="lg:col-span-4">
                  {selectedSection && selectedCard !== null ? (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        {documentMetadata && (
                          <div>
                            <div className="text-gray-400 text-sm mb-1">{documentMetadata.section}</div>
                            <h3 className="text-xl font-semibold text-white">{documentMetadata.title}</h3>
                          </div>
                        )}
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => toggleDocumentView(false)}
                            className="bg-react-dark hover:bg-react-hover p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Volver a la vista de grid"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                          </button>
                          <button 
                            onClick={closeDocument}
                            className="bg-react-dark hover:bg-react-hover p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Cerrar documento"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Metadatos del documento */}
                      {documentMetadata && (
                        <div className="bg-react-darker/40 rounded-lg border border-react-border/30 p-3 mb-4 flex justify-between items-center">
                          <div>
                            {documentMetadata.author && (
                              <div className="text-sm text-gray-400 flex items-center">
                                <svg className="h-4 w-4 text-react-blue/70 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-gray-300">{documentMetadata.author}</span>
                              </div>
                            )}
                            {documentMetadata.last_updated && (
                              <div className="text-sm text-gray-400 flex items-center mt-1">
                                <svg className="h-4 w-4 text-react-blue/70 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-300">{formatDate(documentMetadata.last_updated)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Contenido del documento */}
                      <div className="bg-react-darker/60 rounded-lg border border-react-border/40 p-5 shadow-sm">
                        <div className="bg-react-dark/80 rounded-lg p-6">
                          <ModuleDocumentation 
                            moduleName={null} 
                            customContent={documentContent}
                            isSection={false}
                            documentMetadata={documentMetadata}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    EmptyDocumentMessage
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {/* Sidebar en vista de grid */}
                <div className="col-span-1">
                  <DocumentsSidebar />
                </div>
                
                {/* Vista de grid de documentos */}
                <div className="col-span-3 lg:col-span-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Vista general de documentación</h3>
                    {selectedSection && selectedCard !== null && (
                      <button 
                        onClick={() => toggleDocumentView(true)}
                        className="bg-react-dark hover:bg-react-hover p-2 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center"
                        title="Ver documento seleccionado"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-sm">Ver documento</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Cards de secciones */}
                  <div className="space-y-6">
                    {Array.isArray(docSections) && docSections.map((section) => (
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
                            {section.cards && Array.isArray(section.cards) && section.cards.map((card, index) => (
                              <motion.div
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                className={`bg-react-dark rounded-lg border ${
                                  isDocumentSelected(section.id, index)
                                    ? 'border-react-blue/40'
                                    : 'border-react-border/20 hover:border-react-blue/30'
                                } p-4 transition-colors cursor-pointer`}
                                onClick={() => handleSectionDocumentSelect(section.id, index)}
                              >
                                <h4 className={`text-lg font-medium mb-2 ${
                                  isDocumentSelected(section.id, index)
                                    ? 'text-react-blue'
                                    : 'text-gray-200'
                                }`}>{card.title}</h4>
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

        {/* Sección de Módulos Personalizados */}
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
                        <div className="bg-react-darker/60 rounded-lg border border-react-border/40 p-5 shadow-sm">
                          <div className="bg-react-dark/80 rounded-lg p-6">
                            <ModuleDocumentation 
                              moduleName={selectedModule}
                              documentMetadata={null}
                            />
                          </div>
                        </div>
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