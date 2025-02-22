import { useState } from 'react';
import { motion } from 'framer-motion';

function DagDocForm({ dagName, onSubmit }) {
  const [formData, setFormData] = useState({
    description: '',
    purpose: '',
    schedule: '',
    dependencies: '',
    inputData: '',
    outputData: '',
    notes: '',
    owner: '',
    tasks: [{ name: '', description: '' }]
  });

  const handleAddTask = () => {
    setFormData({
      ...formData,
      tasks: [...formData.tasks, { name: '', description: '' }]
    });
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...formData.tasks];
    newTasks[index][field] = value;
    setFormData({
      ...formData,
      tasks: newTasks
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      dagName,
      ...formData
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primera Card */}
        <div className="bg-react-darker/50 rounded-lg p-6 border border-react-blue/30">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-200 flex items-center mb-3">
                <span className="mr-3 text-lg">📋</span>
                Descripción General
              </label>
              <textarea
                className="input-field w-full h-24 bg-react-dark/50 px-4 py-3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe el propósito general del DAG..."
              />
            </div>
            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-200 flex items-center mb-3">
                <span className="mr-3 text-lg">⏰</span>
                Programación
              </label>
              <input
                type="text"
                className="input-field w-full bg-react-dark/50 px-4 py-3"
                value={formData.schedule}
                onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                placeholder="Ej: @daily, @weekly, 0 0 * * *"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-200 flex items-center mb-3">
                <span className="mr-3 text-lg">👤</span>
                Propietario/Responsable
              </label>
              <input
                type="text"
                className="input-field w-full bg-react-dark/50 px-4 py-3"
                value={formData.owner}
                onChange={(e) => setFormData({...formData, owner: e.target.value})}
                placeholder="Nombre del responsable del DAG"
              />
            </div>
          </div>
        </div>

        {/* Sección de Tareas */}
        <div className="bg-react-darker/50 rounded-lg p-6 border border-react-blue/30">
          <div className="flex items-center justify-between mb-8">
            <label className="block text-lg font-medium text-gray-200 flex items-center">
              <span className="mr-3 text-lg">🔧</span>
              Tareas
            </label>
            <motion.button
              type="button"
              onClick={handleAddTask}
              className="btn-primary flex items-center text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="mr-3 text-lg">📋</span>
              Agregar Tarea
            </motion.button>
          </div>
          <div className="space-y-6">
            {formData.tasks.map((task, index) => (
              <div key={index} className="p-6 bg-react-dark/50 rounded-lg border border-react-blue/20 space-y-6">
                <input
                  type="text"
                  className="input-field w-full bg-react-darker/50 px-4 py-3"
                  value={task.name}
                  onChange={(e) => handleTaskChange(index, 'name', e.target.value)}
                  placeholder="Nombre de la tarea"
                />
                <textarea
                  className="input-field w-full h-20 bg-react-darker/50 px-4 py-3"
                  value={task.description}
                  onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                  placeholder="Descripción de la tarea..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* Última Card */}
        <div className="bg-react-darker/50 rounded-lg p-6 border border-react-blue/30">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-200 flex items-center mb-3">
                <span className="mr-3 text-lg">🔗</span>
                Dependencias
              </label>
              <textarea
                className="input-field w-full h-20 bg-react-dark/50 px-4 py-3"
                value={formData.dependencies}
                onChange={(e) => setFormData({...formData, dependencies: e.target.value})}
                placeholder="Lista de dependencias o requisitos..."
              />
            </div>
            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-200 flex items-center mb-3">
                <span className="mr-3 text-lg">📝</span>
                Notas Adicionales
              </label>
              <textarea
                className="input-field w-full h-20 bg-react-dark/50 px-4 py-3"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Cualquier información adicional relevante..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button
            type="submit"
            className="btn-primary flex items-center text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="mr-3 text-lg">📋</span>
            Generar Documentación
          </motion.button>
        </div>
      </form>
    </div>
  );
}

export default DagDocForm; 