import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import IconSelector from './IconSelector';
import { toast } from 'react-hot-toast';
import { useConfig } from '../../context/ConfigContext';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import ModuleDocumentation from '../ModuleDocumentation';

function DocumentationEditor() {
  const { docSections, setDocSections } = useConfig();
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [editing, setEditing] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [cardContent, setCardContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (docSections) {
      setSections(JSON.parse(JSON.stringify(docSections))); // Clonar para evitar modificación directa
    }
  }, [docSections]);

  const handleSectionSelect = (sectionId) => {
    // Confirmar si hay cambios sin guardar
    if (hasChanges) {
      if (!confirm('Tienes cambios sin guardar. ¿Deseas continuar?')) {
        return;
      }
    }
    
    setSelectedSection(sectionId);
    setSelectedCard(null);
    setEditing(false);
    setShowPreview(false);
    setHasChanges(false);
  };

  const handleCardSelect = (cardIndex) => {
    // Confirmar si hay cambios sin guardar
    if (hasChanges) {
      if (!confirm('Tienes cambios sin guardar. ¿Deseas continuar?')) {
        return;
      }
    }
    
    if (selectedSection !== null) {
      const section = sections.find(s => s.id === selectedSection);
      if (section && section.cards[cardIndex]) {
        setSelectedCard(cardIndex);
        setCardTitle(section.cards[cardIndex].title);
        setCardContent(section.cards[cardIndex].content);
        setMarkdownContent(section.cards[cardIndex].markdownContent || section.cards[cardIndex].content);
        setEditing(true);
        setHasChanges(false);
      }
    }
  };

  const handleContentChange = (e) => {
    setCardContent(e.target.value);
    setHasChanges(true);
  };

  const handleMarkdownChange = (e) => {
    setMarkdownContent(e.target.value);
    setHasChanges(true);
  };

  const handleTitleChange = (e) => {
    setCardTitle(e.target.value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (selectedSection !== null && selectedCard !== null) {
      setSaving(true);
      
      try {
        // Crear copia profunda de las secciones para modificar
        const updatedSections = JSON.parse(JSON.stringify(sections));
        const sectionIndex = updatedSections.findIndex(s => s.id === selectedSection);
        
        if (sectionIndex !== -1) {
          updatedSections[sectionIndex].cards[selectedCard].title = cardTitle;
          updatedSections[sectionIndex].cards[selectedCard].content = cardContent;
          updatedSections[sectionIndex].cards[selectedCard].markdownContent = markdownContent;
          
          // Enviar los datos actualizados al backend
          await axios.put('/config/documentation/', { sections: updatedSections });
          
          // Actualizar el estado local
          setSections(updatedSections);
          setDocSections(updatedSections);
          setHasChanges(false);
          
          // Mostrar mensaje de éxito
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } catch (error) {
        console.error("Error al guardar documento:", error);
        alert("Ocurrió un error al guardar los cambios. Por favor, inténtalo de nuevo.");
      } finally {
        setSaving(false);
      }
    }
  };

  const addNewCard = () => {
    if (selectedSection !== null) {
      // Crear copia profunda de las secciones para modificar
      const updatedSections = JSON.parse(JSON.stringify(sections));
      const sectionIndex = updatedSections.findIndex(s => s.id === selectedSection);
      
      if (sectionIndex !== -1) {
        // Crear una nueva tarjeta
        const newCard = {
          title: "Nuevo documento",
          content: "Escribe un breve resumen aquí...",
          markdownContent: "# Nuevo documento\n\nEscribe tu contenido con formato Markdown aquí..."
        };
        
        // Añadir la tarjeta a la sección
        updatedSections[sectionIndex].cards.push(newCard);
        
        // Actualizar el estado local
        setSections(updatedSections);
        
        // Seleccionar la nueva tarjeta
        const newCardIndex = updatedSections[sectionIndex].cards.length - 1;
        setSelectedCard(newCardIndex);
        setCardTitle(newCard.title);
        setCardContent(newCard.content);
        setMarkdownContent(newCard.markdownContent);
        setEditing(true);
        setHasChanges(true);
      }
    }
  };

  const deleteCard = async () => {
    if (selectedSection !== null && selectedCard !== null) {
      // Confirmar eliminación
      if (!confirm('¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.')) {
        return;
      }
      
      setSaving(true);
      
      try {
        // Crear copia profunda de las secciones para modificar
        const updatedSections = JSON.parse(JSON.stringify(sections));
        const sectionIndex = updatedSections.findIndex(s => s.id === selectedSection);
        
        if (sectionIndex !== -1) {
          // Eliminar la tarjeta de la sección
          updatedSections[sectionIndex].cards.splice(selectedCard, 1);
          
          // Enviar los datos actualizados al backend
          await axios.put('/config/documentation/', { sections: updatedSections });
          
          // Actualizar el estado local
          setSections(updatedSections);
          setDocSections(updatedSections);
          
          // Limpiar la selección
          setSelectedCard(null);
          setEditing(false);
          setHasChanges(false);
        }
      } catch (error) {
        console.error("Error al eliminar documento:", error);
        alert("Ocurrió un error al eliminar el documento. Por favor, inténtalo de nuevo.");
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-200 mb-6">Editor de Documentación</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Navegación lateral */}
        <div className="lg:col-span-1 bg-react-dark rounded-lg border border-react-border/20 p-4">
          <h4 className="text-lg font-medium text-gray-200 mb-4">Secciones</h4>
          
          {sections.map((section) => (
            <div key={section.id} className="mb-4">
        <button
                onClick={() => handleSectionSelect(section.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors mb-2 ${
                  selectedSection === section.id 
                    ? 'bg-react-blue/20 text-react-blue' 
                    : 'text-gray-300 hover:bg-react-darker'
                }`}
              >
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                  </svg>
                  {section.title}
                </div>
              </button>
              
              {selectedSection === section.id && (
                <div className="ml-4 space-y-1">
                  {section.cards.map((card, index) => (
                    <button
                      key={index}
                      onClick={() => handleCardSelect(index)}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-md ${
                        selectedCard === index
                          ? 'bg-react-blue/10 text-react-blue'
                          : 'text-gray-400 hover:text-gray-300 hover:bg-react-darker'
                      }`}
                    >
                      {card.title}
                    </button>
                  ))}
                  
                  <button
                    onClick={addNewCard}
                    className="w-full text-left text-sm px-3 py-1.5 rounded-md text-green-400 hover:bg-green-900/20 hover:text-green-300 transition-colors mt-2"
                  >
                    <div className="flex items-center">
                      <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Añadir documento
                    </div>
                  </button>
              </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Editor y Vista previa */}
        <div className="lg:col-span-4">
          {editing ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowPreview(false)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      !showPreview ? 'bg-react-blue text-white' : 'bg-react-dark text-gray-300 hover:bg-react-darker'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      showPreview ? 'bg-react-blue text-white' : 'bg-react-dark text-gray-300 hover:bg-react-darker'
                    }`}
                  >
                    Vista previa
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={deleteCard}
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-red-900/30 text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors"
                  >
                    Eliminar
                  </button>
                  
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                      hasChanges && !saving
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-green-600/50 text-white/70 cursor-not-allowed'
                    }`}
                  >
                    {saving ? (
                      <span className="inline-block mr-2 h-4 w-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></span>
                    ) : null}
                    {saveSuccess ? 'Guardado ✓' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
              
              {showPreview ? (
                <div className="bg-react-dark rounded-lg border border-react-border/20 p-6">
                  <h1 className="text-2xl font-bold text-white mb-6">{cardTitle}</h1>
                  
                  <div className="bg-react-dark/80 rounded-lg p-6">
                    <ModuleDocumentation 
                      moduleName={null} 
                      customContent={markdownContent}
                      isSection={true}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <label htmlFor="cardTitle" className="block text-sm font-medium text-gray-300 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      id="cardTitle"
                      value={cardTitle}
                      onChange={handleTitleChange}
                      className="w-full bg-react-dark border border-react-border/30 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-1 focus:ring-react-blue"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="cardContent" className="block text-sm font-medium text-gray-300 mb-1">
                      Resumen (para tarjeta)
                    </label>
                    <textarea
                      id="cardContent"
                      value={cardContent}
                      onChange={handleContentChange}
                      rows={2}
                      className="w-full bg-react-dark border border-react-border/30 rounded-md py-2 px-3 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-react-blue"
                      placeholder="Breve resumen que se mostrará en la tarjeta (sin formato Markdown)"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="markdownContent" className="block text-sm font-medium text-gray-300 mb-1">
                      Contenido completo (Markdown)
                    </label>
                    <textarea
                      id="markdownContent"
                      value={markdownContent}
                      onChange={handleMarkdownChange}
                      rows={16}
                      className="w-full bg-react-dark border border-react-border/30 rounded-md py-2 px-3 text-gray-200 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-react-blue"
                      placeholder="Escribe aquí el contenido completo con formato Markdown"
                    />
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-400">
                    <p>Formato Markdown soportado. Usa # para títulos, * para listas, ** para negrita, etc.</p>
                    <p className="mt-1">Ejemplo: <code className="bg-react-darker p-1 rounded">**Texto en negrita**</code> se mostrará como <strong>Texto en negrita</strong></p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-react-dark rounded-lg border border-react-border/20 p-6 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <svg className="h-12 w-12 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-400">
                  Selecciona una sección y un documento para comenzar a editar
                </p>
              </div>
            </div>
          )}
          </div>
      </div>
    </div>
  );
}

export default DocumentationEditor; 