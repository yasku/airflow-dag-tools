import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import toast from 'react-hot-toast';

// Estilos específicos para Markdown - movidos a una constante para no recrearlos en cada render
const markdownStyles = `
  .markdown-content {
    background-color: #1A1D23; /* Fondo más oscuro */
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(55, 65, 81, 0.3);
  }
  
  .markdown-content h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: #e2e8f0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(59, 130, 246, 0.3);
  }
  
  .markdown-content h2 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: #e2e8f0;
  }
  
  .markdown-content h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-top: 1.25rem;
    margin-bottom: 0.75rem;
    color: #e2e8f0;
  }
  
  .markdown-content p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }
  
  .markdown-content ul {
    list-style-type: disc;
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .markdown-content ol {
    list-style-type: decimal;
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .markdown-content li {
    margin-bottom: 0.25rem;
  }
  
  .markdown-content a {
    color: #60a5fa;
    text-decoration: underline;
  }
  
  .markdown-content code {
    font-family: monospace;
    background-color: rgba(0, 0, 0, 0.3);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.9em;
    color: #f59e0b;
  }
  
  .markdown-content pre {
    background-color: rgba(0, 0, 0, 0.3);
    padding: 1rem;
    border-radius: 0.375rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  
  .markdown-content pre code {
    background-color: transparent;
    padding: 0;
    font-size: 0.9em;
    color: #d1d5db;
  }
  
  .markdown-content blockquote {
    border-left: 4px solid #60a5fa;
    padding-left: 1rem;
    margin-left: 0;
    margin-bottom: 1rem;
    font-style: italic;
    color: #9ca3af;
  }
  
  .markdown-content table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }
  
  .markdown-content th {
    background-color: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(55, 65, 81, 0.5);
    padding: 0.5rem;
    text-align: left;
  }
  
  .markdown-content td {
    border: 1px solid rgba(55, 65, 81, 0.5);
    padding: 0.5rem;
  }
  
  .markdown-content tr:nth-child(even) {
    background-color: rgba(30, 41, 59, 0.3);
  }

  /* Estilos específicos para cuando es una sección o un módulo */
  .section-doc .markdown-content {
    background-color: #1A1D23; /* El mismo color oscuro para secciones */
  }
  
  .module-doc .markdown-content {
    background-color: #1A1D23; /* El mismo color oscuro para módulos */
  }
`;

// URL base para las solicitudes API - extraída para su fácil modificación
const API_BASE_URL = '';

// Componente de Spinner para el estado de carga
const LoadingSpinner = () => (
  <div className="py-8 text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-react-blue mx-auto"></div>
  </div>
);

// Componente de Error
const ErrorMessage = ({ message }) => (
  <div className="bg-red-900/20 text-red-400 p-4 rounded-lg">
    {message}
  </div>
);

function ModuleDocumentation({ moduleName, customContent, isSection = false, documentMetadata = null }) {
  const [docContent, setDocContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);

  // Efecto para cargar el contenido
  useEffect(() => {
    // Reiniciar el estado de error cuando cambian las props principales
    setError(null);
    
    // Si se proporciona contenido personalizado, úsalo directamente
    if (customContent) {
      setDocContent(customContent);
      // Si también se proporciona documentMetadata, usarlo en lugar de cargar metadatos
      if (documentMetadata && documentMetadata.metadata) {
        setMetadata(documentMetadata.metadata);
      }
      setLoading(false);
      return;
    }
    
    // De lo contrario, cargar documentación del módulo
    if (moduleName) {
      loadModuleDocumentation(moduleName);
    } else {
      // Si no hay ni contenido ni moduleName, limpiar el contenido
      setDocContent('');
      setMetadata(null);
    }
  }, [moduleName, customContent, documentMetadata]);

  // Función para cargar la documentación del módulo
  const loadModuleDocumentation = async (module) => {
    if (!module) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/module_documentation/${module}`);
      if (!response.ok) {
        throw new Error(`Error al cargar la documentación: ${response.statusText}`);
      }
      const data = await response.json();
      setDocContent(data.content || '');
      setMetadata(data.metadata || null);
    } catch (err) {
      console.error("Error cargando documentación:", err);
      setError(`Error: ${err.message}`);
      toast.error(`Error al cargar la documentación: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Contenido del markdown memoizado para evitar re-renders innecesarios
  const markdownContent = useMemo(() => (
    <div className="markdown-content prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {docContent}
      </ReactMarkdown>
    </div>
  ), [docContent]);

  // Renderizado condicional basado en el estado
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !customContent) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className={`documentation-container ${isSection ? 'section-doc' : 'module-doc'}`}>
      {/* Agregar los estilos de Markdown */}
      <style>{markdownStyles}</style>
      
      {/* Contenido Markdown - usando el componente memoizado */}
      {markdownContent}
    </div>
  );
}

export default ModuleDocumentation; 