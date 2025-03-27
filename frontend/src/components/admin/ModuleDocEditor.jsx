import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import toast from 'react-hot-toast';

// Importamos los mismos estilos que usamos en ModuleDocumentation
const markdownStyles = `
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
`;

function ModuleDocEditor({ moduleName, onSaved = () => {} }) {
  const [documentation, setDocumentation] = useState('');
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!moduleName) return;
    
    const fetchDocumentation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/module_documentation/${moduleName}`);
        
        if (!response.ok) {
          throw new Error(`Error al cargar la documentación: ${response.statusText}`);
        }
        
        const data = await response.json();
        setDocumentation(data.content || getDefaultDocumentation(moduleName));
      } catch (error) {
        console.error('Error al cargar la documentación:', error);
        toast.error('Error al cargar la documentación');
        setDocumentation(getDefaultDocumentation(moduleName));
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentation();
  }, [moduleName]);

  const getDefaultDocumentation = (name) => {
    return `# Documentación de ${name}\n\n## Descripción\n\nEste módulo proporciona funcionalidades para...\n\n## Uso\n\n\`\`\`python\nfrom custom_modules.${name.replace('.py', '')} import *\n\n# Ejemplo de uso\n\`\`\`\n\n## Funciones\n\n### función_ejemplo(param1, param2)\n\nDescripción de la función y sus parámetros.\n`;
  };

  const handleSave = async () => {
    if (!moduleName) {
      toast.error('No hay módulo seleccionado');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`http://127.0.0.1:8000/module_documentation/${moduleName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: documentation,
          author: 'Admin' // Podría ser dinámico si hay sistema de usuarios
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la documentación');
      }

      const data = await response.json();
      toast.success('Documentación guardada correctamente');
      onSaved(data);
    } catch (error) {
      console.error('Error al guardar la documentación:', error);
      toast.error('Error al guardar la documentación');
    } finally {
      setSaving(false);
    }
  };

  if (!moduleName) {
    return (
      <div className="bg-react-darker/50 rounded-lg border border-react-border/30 p-4">
        <p className="text-gray-400">Selecciona un módulo para editar su documentación.</p>
      </div>
    );
  }

  return (
    <div className="bg-react-darker/50 rounded-lg border border-react-border/30 p-4">
      {/* Estilos para el markdown */}
      <style>{markdownStyles}</style>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-200">
          {preview ? 'Vista previa' : 'Editar'} documentación: {moduleName}
        </h3>
        
        <div className="flex space-x-2">
          <motion.button
            onClick={() => setPreview(!preview)}
            className="btn-secondary text-sm py-1 px-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {preview ? 'Editar' : 'Vista previa'}
          </motion.button>
          
          <motion.button
            onClick={handleSave}
            disabled={saving || loading}
            className="btn-primary text-sm py-1 px-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <svg className="animate-spin h-6 w-6 text-react-blue" viewBox="0 0 24 24">
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-3 text-gray-300">Cargando...</span>
        </div>
      ) : preview ? (
        <div className="bg-react-dark/50 rounded-lg overflow-hidden border border-react-border/30 p-6">
          <div className="markdown-content text-gray-300">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {documentation}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <textarea
          value={documentation}
          onChange={(e) => setDocumentation(e.target.value)}
          className="w-full h-96 bg-react-dark/70 text-gray-300 p-4 rounded-lg font-mono text-sm border border-react-border/30 focus:outline-none focus:ring-1 focus:ring-react-blue"
          placeholder="# Documentación del módulo en formato Markdown"
        ></textarea>
      )}
      
      <div className="mt-4 bg-[#1A1D23]/50 rounded-lg p-4 border border-react-border/30">
        <div className="flex justify-between items-start">
          <h4 className="text-react-blue text-sm font-medium mb-2">Guía de formato Markdown</h4>
          <a 
            href="https://www.markdownguide.org/cheat-sheet/" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Guía completa
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
          <div>
            <p className="mb-1"><code># Título</code> - Título principal</p>
            <p className="mb-1"><code>## Subtítulo</code> - Subtítulo</p>
            <p className="mb-1"><code>**texto**</code> - <strong>Texto en negrita</strong></p>
            <p className="mb-1"><code>*texto*</code> - <em>Texto en cursiva</em></p>
            <p className="mb-1"><code>[enlace](url)</code> - <a href="#" className="text-blue-400">Enlace</a></p>
          </div>
          <div>
            <p className="mb-1"><code>- item</code> - Lista con viñetas</p>
            <p className="mb-1"><code>1. item</code> - Lista numerada</p>
            <p className="mb-1"><code>```python</code> - Bloque de código</p>
            <p className="mb-1"><code>`código`</code> - <code>Código en línea</code></p>
            <p className="mb-1"><code>---</code> - Línea horizontal</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModuleDocEditor; 