const API_URL = '';

export const configService = {
  // Documentación
  async getDocSections() {
    const response = await fetch(`${API_URL}/config/documentation/`);
    if (!response.ok) throw new Error('Error al cargar la documentación');
    return response.json();
  },

  async updateDocSections(sections) {
    const response = await fetch(`${API_URL}/config/documentation/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sections.hasOwnProperty('sections') ? sections : { sections }),
    });
    if (!response.ok) throw new Error('Error al actualizar la documentación');
    return response.json();
  },

  // Template DAG
  async getDagTemplate() {
    const response = await fetch(`${API_URL}/config/template/`);
    if (!response.ok) throw new Error('Error al cargar el template');
    return response.json();
  },

  async updateDagTemplate(template) {
    const response = await fetch(`${API_URL}/config/template/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ template }),
    });
    if (!response.ok) throw new Error('Error al actualizar el template');
    return response.json();
  },
}; 