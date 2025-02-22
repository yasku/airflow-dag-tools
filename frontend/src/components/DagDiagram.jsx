import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  flowchart: {
    curve: 'basis',
    padding: 20,
    nodeSpacing: 50,
    rankSpacing: 50
  },
  themeVariables: {
    primaryColor: '#3B82F6',
    primaryTextColor: '#fff',
    primaryBorderColor: '#2563EB',
    lineColor: '#4B5563',
    secondaryColor: '#1F2937',
    tertiaryColor: '#374151'
  }
});

function DagDiagram({ tasks, dependencies }) {
  const diagramRef = useRef(null);

  useEffect(() => {
    const generateDiagram = async () => {
      if (!tasks || !dependencies) return;

      const diagram = `
        graph LR
          %% Nodos
          ${tasks.map(task => 
            `${task.var_name}["${task.id}"]:::task`
          ).join('\n          ')}
          
          %% Conexiones
          ${dependencies.map(([from, to]) => 
            `${from} --> ${to}`
          ).join('\n          ')}
          
          %% Estilos
          classDef task fill:#1F2937,stroke:#3B82F6,stroke-width:2px,rx:8px,ry:8px;
      `;
      
      try {
        const { svg } = await mermaid.render('dag-diagram-' + Math.random(), diagram);
        if (diagramRef.current) {
          diagramRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Error al generar el diagrama:', error);
      }
    };

    generateDiagram();
  }, [tasks, dependencies]);

  return (
    <div className="bg-react-darker p-6 rounded-lg">
      <div ref={diagramRef} className="flex justify-center overflow-x-auto" />
    </div>
  );
}

export default DagDiagram; 