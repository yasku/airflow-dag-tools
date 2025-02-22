import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import TextareaCodeEditor from "@uiw/react-textarea-code-editor";
import { useConfig } from '../../context/ConfigContext';

function TemplateEditor() {
  const { dagTemplate, updateDagTemplate, loading } = useConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(dagTemplate);

  useEffect(() => {
    setCurrentTemplate(dagTemplate);
  }, [dagTemplate]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-react-blue"></div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateDagTemplate(currentTemplate);
      setIsEditing(false);
    } catch (error) {
      // Error ya manejado en el contexto
      setCurrentTemplate(dagTemplate);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setCurrentTemplate(dagTemplate);
    setIsEditing(false);
    toast.error('Cambios descartados');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Editor de Template DAG</h2>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <motion.button
                onClick={handleSave}
                className="btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Guardar
              </motion.button>
              <motion.button
                onClick={handleCancel}
                className="btn-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
            </>
          ) : (
            <motion.button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Editar Template
            </motion.button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-react-border/30">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-sm font-medium text-gray-400">template_dag.py</span>
        </div>
        
        <TextareaCodeEditor
          value={currentTemplate}
          language="python"
          onChange={(e) => {
            if (isEditing) {
              setCurrentTemplate(e.target.value);
            }
          }}
          disabled={!isEditing}
          style={{
            fontSize: 14,
            backgroundColor: '#1A1D23',
            fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
          }}
          className="min-h-[500px] w-full"
          padding={20}
        />
      </div>

      {isEditing && (
        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-900/50 rounded-lg">
          <p className="text-yellow-500/90 text-sm">
            ⚠️ Recuerda que este template será usado como base para todos los nuevos DAGs creados.
            Asegúrate de mantener la estructura básica y las importaciones necesarias.
          </p>
        </div>
      )}
    </div>
  );
}

export default TemplateEditor; 