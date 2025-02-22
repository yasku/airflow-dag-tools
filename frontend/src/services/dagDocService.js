const API_URL = 'http://127.0.0.1:8000';

export const dagDocService = {
  async generateDagDoc(dagName) {
    const response = await fetch(`${API_URL}/generate_dag_doc/${dagName}`);
    if (!response.ok) throw new Error('Error al generar la documentación del DAG');
    return response.json();
  },

  async getDagDiagram(dagName) {
    const response = await fetch(`${API_URL}/get_dag_diagram/${dagName}`);
    if (!response.ok) throw new Error('Error al generar el diagrama del DAG');
    return response.json();
  }
}; 