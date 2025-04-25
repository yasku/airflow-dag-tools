import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TextareaCodeEditor from "@uiw/react-textarea-code-editor";
import "@uiw/react-textarea-code-editor/dist.css";

function ModuleViewer({ moduleName }) {
  const [moduleContent, setModuleContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModuleContent = async () => {
      if (!moduleName) {
        setModuleContent('# Selecciona un módulo para ver su contenido');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/get_custom_module/${moduleName}`);
        
        if (!response.ok) {
          throw new Error(`Error al cargar el módulo: ${response.statusText}`);
        }
        
        const data = await response.json();
        setModuleContent(data.content || '# Este módulo está vacío');
      } catch (err) {
        console.error('Error al cargar el contenido del módulo:', err);
        setError(`No se pudo cargar el módulo: ${err.message}`);
        setModuleContent('');
      } finally {
        setLoading(false);
      }
    };

    fetchModuleContent();
  }, [moduleName]);

  return (
    <div className="section-container">
      <div className="flex justify-between items-center mb-4">
        <h3 className="section-header">
          <svg className="h-5 w-5 text-react-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          {moduleName ? `Módulo: ${moduleName}` : 'Código del Módulo'}
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <svg className="animate-spin h-8 w-8 text-react-blue" viewBox="0 0 24 24">
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-3 text-gray-300">Cargando módulo...</span>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4 text-red-400">
          {error}
        </div>
      ) : (
        <div className="bg-react-dark/50 rounded-lg overflow-hidden border border-react-border/30">
          <TextareaCodeEditor
            value={moduleContent}
            language="python"
            padding={16}
            style={{
              fontSize: "14px",
              backgroundColor: "#1A1D23",
              fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Menlo,monospace",
              minHeight: "400px",
              borderRadius: "0.5rem",
            }}
            className="w-full border-0 focus:outline-none"
            data-color-mode="dark"
            readOnly={true}
            disabled={true}
          />
        </div>
      )}
    </div>
  );
}

export default ModuleViewer; 