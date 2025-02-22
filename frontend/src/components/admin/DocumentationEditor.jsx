import { useState } from 'react';
import { motion } from 'framer-motion';
import IconSelector from './IconSelector';
import { toast } from 'react-hot-toast';
import { useConfig } from '../../context/ConfigContext';

function DocumentationEditor() {
  const { docSections, updateDocSections, loading } = useConfig();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-react-blue"></div>
      </div>
    );
  }

  const handleAddSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'Nueva Sección',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      cards: []
    };
    updateDocSections([...docSections, newSection]);
    toast.success('Sección agregada');
  };

  const handleAddCard = (sectionId) => {
    updateDocSections(docSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          cards: [...section.cards, { title: 'Nueva Card', content: 'Contenido...' }]
        };
      }
      return section;
    }));
    toast.success('Card agregada');
  };

  const handleSectionChange = (index, field, value) => {
    updateDocSections(docSections.map((section, i) =>
      i === index ? { ...section, [field]: value } : section
    ));
  };

  const handleSave = () => {
    // Implementa la lógica para guardar los cambios
    toast.success('Cambios guardados');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-200">Editor de Documentación</h3>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-react-blue/10 text-react-blue rounded-lg hover:bg-react-blue/20 transition-colors"
        >
          Guardar Cambios
        </button>
      </div>

      <div className="space-y-6">
        {docSections.map((section, index) => (
          <div 
            key={section.id} 
            className="bg-react-dark rounded-lg border border-react-border/20 overflow-hidden"
          >
            <div className="p-4 bg-react-darker/50 border-b border-react-border/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="h-5 w-5 text-react-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                  </svg>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                    className="bg-transparent border-none text-lg font-medium text-gray-200 focus:ring-0"
                  />
                </div>
                <IconSelector
                  currentIcon={section.icon}
                  onSelect={(icon) => handleSectionChange(index, 'icon', icon)}
                />
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                {section.cards.map((card, cardIndex) => (
                  <div 
                    key={cardIndex}
                    className="bg-react-darker/50 rounded-lg border border-react-border/20 p-4"
                  >
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => handleSectionChange(index, 'cards', section.cards.map((c, i) =>
                        i === cardIndex ? { ...c, title: e.target.value } : c
                      ))}
                      className="input-field mb-2"
                    />
                    <textarea
                      value={card.content}
                      onChange={(e) => handleSectionChange(index, 'cards', section.cards.map((c, i) =>
                        i === cardIndex ? { ...c, content: e.target.value } : c
                      ))}
                      className="input-field w-full h-32"
                    />
                  </div>
                ))}
                <motion.button
                  onClick={() => handleAddCard(section.id)}
                  className="btn-primary w-full mt-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Agregar Card
                </motion.button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <motion.button
        onClick={handleAddSection}
        className="btn-primary w-full mt-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Agregar Sección
      </motion.button>
    </div>
  );
}

export default DocumentationEditor; 