import { useState } from 'react';
import DagList from '../components/DagList';
import DagDocForm from '../components/admin/DagDocForm';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import MarkdownViewer from '../components/MarkdownViewer';
import DagDiagram from '../components/DagDiagram';

function DagDocumentation() {
  const [selectedDag, setSelectedDag] = useState(null);
  const [documentation, setDocumentation] = useState(null);
  const [diagram, setDiagram] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDagSelect = async (dagName) => {
    setSelectedDag(dagName);
    setDocumentation(null);
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/get_dag_diagram/${dagName}`);
      if (!response.ok) throw new Error('Error al cargar el diagrama');
      const data = await response.json();
      setDiagram(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el diagrama');
    }
  };

  const handleDocSubmit = async (formData) => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/generate_dag_doc/${selectedDag}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error al generar la documentación');
      
      const data = await response.json();
      setDocumentation(data.documentation);
      toast.success('Documentación generada correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar la documentación');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([documentation], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedDag}_documentation.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-72 p-4 border-r border-react-border/30">
        <DagList onDagSelect={handleDagSelect} />
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="card p-8">
            <div className="bg-[#2A1810] rounded-lg border border-orange-900/50 p-4 mb-8">
              <h2 className="text-2xl font-semibold text-orange-500/90 flex items-center">
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentación de DAG
              </h2>
            </div>

            {selectedDag ? (
              <div className="space-y-8">
                {documentation ? (
                  <div className="card p-4">
                    <h3 className="text-lg font-medium text-gray-200 mb-4">Documentación</h3>
                    <MarkdownViewer 
                      content={documentation} 
                      onDownload={handleDownload}
                    />
                  </div>
                ) : (
                  <DagDocForm dagName={selectedDag} onSubmit={handleDocSubmit} />
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <span className="text-4xl mb-4 block">📋</span>
                Selecciona un DAG para comenzar
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DagDocumentation; 