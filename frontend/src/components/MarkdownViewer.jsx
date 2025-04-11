import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// Estilos específicos para Markdown, tomados de ModuleDocumentation
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
`;

function MarkdownViewer({ content, onDownload }) {
  return (
    <div className="markdown-viewer">
      <style>{markdownStyles}</style>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-react-blue">
          Documentación Generada
        </h2>
        <button 
          onClick={onDownload}
          className="px-4 py-2 bg-react-blue/20 hover:bg-react-blue/40 text-react-blue border border-react-blue/30 rounded-md flex items-center transition-all"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Descargar
        </button>
      </div>
      
      <div className="markdown-content prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default MarkdownViewer; 