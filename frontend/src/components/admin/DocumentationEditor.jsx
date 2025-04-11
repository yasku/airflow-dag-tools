import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import IconSelector from './IconSelector';
import { toast } from 'react-hot-toast';
import { useConfig } from '../../context/ConfigContext';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import ModuleDocumentation from '../ModuleDocumentation';

function DocumentationEditor() {
  const { docSections, updateDocSections } = useConfig();
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
  
  // Estados para la creación/edición de secciones
  const [isSectionEditing, setIsSectionEditing] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [sectionIcon, setSectionIcon] = useState('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z');
  const [isEditingExistingSection, setIsEditingExistingSection] = useState(false);
  const [originalSectionId, setOriginalSectionId] = useState(''); // Para guardar el ID original al editar

  useEffect(() => {
    if (docSections) {
      // Asegurarse de que docSections es un array
      const sectionsArray = Array.isArray(docSections) 
        ? docSections 
        : (docSections?.sections || []);
      
      // Clonar para evitar modificación directa
      setSections(JSON.parse(JSON.stringify(sectionsArray)));
    } else {
      // Si no hay datos, inicializar con array vacío
      setSections([]);
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
          
          // Actualizar usando la función del contexto - Enviar el array directamente
          await updateDocSections(updatedSections);
          
          // Actualizar el estado local
          setSections(updatedSections);
          setHasChanges(false);
          
          // Mostrar mensaje de éxito
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } catch (error) {
        console.error("Error al guardar documento:", error);
        toast.error("Ocurrió un error al guardar los cambios. Por favor, inténtalo de nuevo.");
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
          
          // Actualizar usando la función del contexto
          await updateDocSections(updatedSections);
          
          // Actualizar el estado local
          setSections(updatedSections);
          
          // Limpiar la selección
          setSelectedCard(null);
          setEditing(false);
          setHasChanges(false);
        }
      } catch (error) {
        console.error("Error al eliminar documento:", error);
        toast.error("Ocurrió un error al eliminar el documento. Por favor, inténtalo de nuevo.");
      } finally {
        setSaving(false);
      }
    }
  };

  // Función para iniciar la creación de una nueva sección
  const handleCreateSection = () => {
    // Confirmar si hay cambios sin guardar
    if (hasChanges) {
      if (!confirm('Tienes cambios sin guardar. ¿Deseas continuar?')) {
        return;
      }
    }
    
    // Limpiar selecciones y estados
    setSelectedSection(null);
    setSelectedCard(null);
    setEditing(false);
    setShowPreview(false);
    setHasChanges(false);
    
    // Inicializar el formulario de sección
    setSectionTitle('Nueva Sección');
    setSectionId('nueva-seccion-' + Date.now().toString().slice(-4)); // Generar ID único
    setSectionIcon('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z');
    setIsSectionEditing(true);
  };
  
  // Función para manejar cambios en los campos del formulario de sección
  const handleSectionTitleChange = (e) => {
    setSectionTitle(e.target.value);
  };
  
  const handleSectionIdChange = (e) => {
    setSectionId(e.target.value);
  };
  
  const handleSectionIconChange = (iconPath) => {
    setSectionIcon(iconPath);
  };
  
  // Función para validar el formulario de sección
  const validateSectionForm = () => {
    if (!sectionTitle.trim()) {
      toast.error('El título de la sección no puede estar vacío');
      return false;
    }
    
    if (!sectionId.trim()) {
      toast.error('El ID de la sección no puede estar vacío');
      return false;
    }
    
    // Validar formato del ID (solo caracteres alfanuméricos, guiones y guiones bajos)
    if (!/^[a-z0-9-_]+$/.test(sectionId)) {
      toast.error('El ID debe contener solo letras minúsculas, números, guiones o guiones bajos');
      return false;
    }
    
    // Validar que el ID sea único
    const existingSectionWithId = sections.find(s => s.id === sectionId);
    if (existingSectionWithId) {
      toast.error('Ya existe una sección con este ID. Por favor, usa un ID único');
      return false;
    }
    
    return true;
  };
  
  // Función para guardar una nueva sección
  const handleSaveSectionForm = async () => {
    if (!validateSectionForm()) return;
    
    setSaving(true);
    
    try {
      // Crear nueva sección
      const newSection = {
        id: sectionId,
        title: sectionTitle,
        icon: sectionIcon,
        cards: [] // Iniciar sin documentos
      };
      
      // Crear copia profunda de las secciones y añadir la nueva
      const updatedSections = JSON.parse(JSON.stringify(sections));
      updatedSections.push(newSection);
      
      // Actualizar en el backend
      await updateDocSections(updatedSections);
      
      // Actualizar estado local
      setSections(updatedSections);
      setIsSectionEditing(false);
      
      // Seleccionar la nueva sección
      setSelectedSection(sectionId);
      
      toast.success('Sección creada correctamente');
    } catch (error) {
      console.error("Error al crear sección:", error);
      toast.error("Ocurrió un error al crear la sección. Por favor, inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };
  
  // Función para cancelar la creación de sección
  const handleCancelSectionForm = () => {
    setIsSectionEditing(false);
    setIsEditingExistingSection(false);
    setOriginalSectionId('');
  };

  // Función para iniciar la edición de una sección existente
  const handleEditSection = (sectionId) => {
    // Confirmar si hay cambios sin guardar
    if (hasChanges) {
      if (!confirm('Tienes cambios sin guardar. ¿Deseas continuar?')) {
        return;
      }
    }
    
    const sectionToEdit = sections.find(s => s.id === sectionId);
    if (!sectionToEdit) return;
    
    // Limpiar selecciones y estados actuales
    setSelectedCard(null);
    setEditing(false);
    setShowPreview(false);
    setHasChanges(false);
    
    // Establecer valores iniciales para la edición
    setSectionTitle(sectionToEdit.title);
    setSectionId(sectionToEdit.id);
    setSectionIcon(sectionToEdit.icon);
    setOriginalSectionId(sectionToEdit.id);
    
    // Activar modo de edición de sección existente
    setIsEditingExistingSection(true);
    setIsSectionEditing(true);
  };
  
  // Función para validar el formulario de sección en modo edición
  const validateEditSectionForm = () => {
    if (!sectionTitle.trim()) {
      toast.error('El título de la sección no puede estar vacío');
      return false;
    }
    
    if (!sectionId.trim()) {
      toast.error('El ID de la sección no puede estar vacío');
      return false;
    }
    
    // Validar formato del ID (solo caracteres alfanuméricos, guiones y guiones bajos)
    if (!/^[a-z0-9-_]+$/.test(sectionId)) {
      toast.error('El ID debe contener solo letras minúsculas, números, guiones o guiones bajos');
      return false;
    }
    
    // Si el ID cambió, validar que sea único
    if (sectionId !== originalSectionId) {
      const existingSectionWithId = sections.find(s => s.id === sectionId);
      if (existingSectionWithId) {
        toast.error('Ya existe una sección con este ID. Por favor, usa un ID único');
        return false;
      }
    }
    
    return true;
  };
  
  // Función para guardar cambios en una sección existente
  const handleSaveEditedSection = async () => {
    if (!validateEditSectionForm()) return;
    
    setSaving(true);
    
    try {
      // Crear copia profunda de las secciones para modificar
      const updatedSections = JSON.parse(JSON.stringify(sections));
      const sectionIndex = updatedSections.findIndex(s => s.id === originalSectionId);
      
      if (sectionIndex !== -1) {
        // Si el ID cambió, necesitamos actualizar las referencias
        const oldId = originalSectionId;
        const newId = sectionId;
        
        // Actualizar la sección con los nuevos valores
        updatedSections[sectionIndex].title = sectionTitle;
        updatedSections[sectionIndex].icon = sectionIcon;
        // Cambiar el ID solo si es diferente
        if (oldId !== newId) {
          updatedSections[sectionIndex].id = newId;
        }
        
        // Actualizar en el backend
        await updateDocSections(updatedSections);
        
        // Actualizar estado local
        setSections(updatedSections);
        setIsSectionEditing(false);
        setIsEditingExistingSection(false);
        
        // Seleccionar la sección editada (por su nuevo ID si cambió)
        setSelectedSection(newId);
        
        toast.success('Sección actualizada correctamente');
      }
    } catch (error) {
      console.error("Error al actualizar sección:", error);
      toast.error("Ocurrió un error al actualizar la sección. Por favor, inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };
  
  // Función para eliminar una sección existente
  const handleDeleteSection = async (sectionId) => {
    // Confirmar eliminación
    if (!confirm('¿Estás seguro de que deseas eliminar esta sección y todos sus documentos? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setSaving(true);
    
    try {
      // Crear copia profunda de las secciones excluyendo la que queremos eliminar
      const updatedSections = sections.filter(s => s.id !== sectionId);
      
      // Actualizar en el backend
      await updateDocSections(updatedSections);
      
      // Actualizar estado local
      setSections(updatedSections);
      
      // Limpiar selecciones
      setSelectedSection(null);
      setSelectedCard(null);
      setEditing(false);
      
      toast.success('Sección eliminada correctamente');
    } catch (error) {
      console.error("Error al eliminar sección:", error);
      toast.error("Ocurrió un error al eliminar la sección. Por favor, inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-200 mb-6">Editor de Documentación</h3>
      
      {isSectionEditing ? (
        // Formulario para crear/editar sección
        <div className="bg-react-dark rounded-lg border border-react-border/20 p-6">
          <h4 className="text-lg font-medium text-gray-200 mb-4">
            {isEditingExistingSection ? 'Editar Sección' : 'Crear Nueva Sección'}
          </h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="sectionTitle" className="block text-sm font-medium text-gray-300 mb-1">
                Título
              </label>
              <input
                type="text"
                id="sectionTitle"
                value={sectionTitle}
                onChange={handleSectionTitleChange}
                className="w-full bg-react-dark border border-react-border/30 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-1 focus:ring-react-blue"
                placeholder="Título de la sección"
              />
            </div>
            
            <div>
              <label htmlFor="sectionId" className="block text-sm font-medium text-gray-300 mb-1">
                ID {isEditingExistingSection ? '(cuidado al cambiar)' : '(único, solo letras minúsculas, números, guiones)'}
              </label>
              <input
                type="text"
                id="sectionId"
                value={sectionId}
                onChange={handleSectionIdChange}
                className="w-full bg-react-dark border border-react-border/30 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-1 focus:ring-react-blue"
                placeholder="id-de-seccion"
              />
              <p className="text-xs text-gray-400 mt-1">
                {isEditingExistingSection 
                  ? 'Cambiar el ID puede afectar enlaces existentes. Solo usa caracteres alfanuméricos, guiones o guiones bajos.'
                  : 'El ID debe ser único y no puede contener espacios ni caracteres especiales.'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Icono
              </label>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-react-darker rounded-md">
                  <svg className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sectionIcon} />
                  </svg>
                </div>
                <IconSelector 
                  currentIcon={sectionIcon} 
                  onSelect={handleSectionIconChange} 
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end space-x-3">
              <button
                onClick={handleCancelSectionForm}
                className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-md transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={isEditingExistingSection ? handleSaveEditedSection : handleSaveSectionForm}
                disabled={saving}
                className="px-4 py-2 bg-react-blue/90 hover:bg-react-blue text-white rounded-md flex items-center transition-colors"
              >
                {saving ? (
                  <span className="inline-block mr-2 h-4 w-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></span>
                ) : null}
                {isEditingExistingSection ? 'Actualizar Sección' : 'Guardar Sección'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Navegación lateral */}
          <div className="lg:col-span-1 bg-react-dark rounded-lg border border-react-border/20 p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-200">Secciones</h4>
              
              <button
                onClick={handleCreateSection}
                className="p-1.5 rounded-md text-green-400 hover:bg-green-800/20 hover:text-green-300 transition-colors"
                title="Crear nueva sección"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            {Array.isArray(sections) && sections.map((section) => (
              <div key={section.id} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => handleSectionSelect(section.id)}
                    className={`flex-grow text-left px-3 py-2 rounded-md transition-colors ${
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
                  
                  <div className="flex ml-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSection(section.id);
                      }}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-gray-700/30 hover:text-gray-200 transition-colors"
                      title="Editar sección"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section.id);
                      }}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors"
                      title="Eliminar sección"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
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
      )}
    </div>
  );
}

export default DocumentationEditor; 