// Estilos globales para toda la aplicación
export const styles = {
  // Layouts principales
  layout: {
    page: "min-h-[calc(100vh-4rem)]",
    pageWithSidebar: "flex h-[calc(100vh-4rem)]",
    sidebar: "w-72 border-r border-react-border/30 p-6",
    mainContent: "flex-1 overflow-auto",
    contentSection: "p-6",
  },

  // Contenedores
  containers: {
    card: "bg-react-darker/50 rounded-lg border border-react-border/30",
    glassCard: `
      bg-black/40 backdrop-blur-md 
      border border-green-500/10
      rounded-xl shadow-xl transition-all duration-300
      hover:border-green-500/20 
      hover:shadow-2xl hover:shadow-green-500/10 
      relative overflow-hidden
    `,
    section: "bg-react-darker/50 rounded-lg border border-react-border/30 p-6",
  },

  // Encabezados y títulos
  headers: {
    titleContainer: "bg-[#2A1810] rounded-lg border border-orange-900/50 p-4 mb-8",
    sectionTitle: "text-2xl font-semibold text-orange-500/90 flex items-center",
    sectionHeader: "text-lg font-medium text-gray-200 mb-4 flex items-center",
    gradientText: "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500",
  },

  // Formularios e inputs
  forms: {
    input: `
      bg-react-dark/50 border border-react-border/30 rounded-lg px-4 py-2 text-gray-200 
      focus:outline-none focus:ring-2 focus:ring-react-blue/50 focus:border-transparent
      placeholder:text-gray-500
    `,
    fileInput: `
      block w-full text-sm text-gray-300
      file:mr-4 file:py-3 file:px-6 file:rounded-lg
      file:border-0 file:text-sm file:font-semibold
      file:bg-indigo-600 file:text-white
      hover:file:bg-indigo-500 cursor-pointer
      file:transition-all file:duration-300
      file:shadow-lg file:shadow-indigo-500/10
    `,
    inputContainer: "space-y-2",
  },

  // Botones y acciones
  buttons: {
    primary: `
      bg-react-blue/10 text-react-blue rounded-lg px-6 py-3
      hover:bg-react-blue/20 transition-all duration-300
      disabled:opacity-50 disabled:cursor-not-allowed
      flex items-center
    `,
    secondary: `
      bg-react-border/10 text-gray-300 rounded-lg px-6 py-3
      hover:bg-react-border/20 transition-all duration-300
      disabled:opacity-50 disabled:cursor-not-allowed
      flex items-center
    `,
  },

  // Navegación y tabs
  navigation: {
    tab: "flex items-center px-4 py-2 rounded-lg transition-colors duration-200",
    tabActive: "bg-react-blue/10 text-react-blue",
    tabInactive: "text-gray-400 hover:text-gray-200 hover:bg-react-blue/5",
  },

  // Lista de DAGs
  dagList: {
    item: `
      w-full flex items-center px-3 py-2 rounded-lg 
      transition-colors duration-200 group
      hover:bg-react-blue/5 hover:text-react-blue
    `,
    itemActive: "bg-react-blue/10 text-react-blue",
    icon: "h-4 w-4 text-react-blue/70 mr-2 group-hover:text-react-blue",
    text: "text-base text-gray-200 group-hover:text-react-blue truncate",
  },

  // Editor y código
  code: {
    editor: "bg-react-dark/50 rounded-lg overflow-hidden border border-react-border/30",
    container: "bg-[#1A1D23] rounded-lg font-mono text-sm",
    box: `
      bg-[#0A0A0A]/90 rounded-lg p-4 font-mono text-sm
      border border-green-500/10
      overflow-x-auto shadow-inner backdrop-blur-sm text-gray-300
      hover:border-green-500/20 transition-all duration-300
    `,
  },

  // Estados y validación
  validation: {
    success: "border-green-500/30 text-green-400",
    error: "border-red-500/30 text-red-400",
  },

  // Efectos y animaciones
  effects: {
    hoverScale: "transition-transform duration-200 hover:scale-102",
    hoverGlow: "transition-all duration-300 hover:shadow-lg hover:shadow-react-blue/20",
    gradient: "bg-gradient-to-r from-indigo-500 to-purple-500",
    animateGradient: {
      backgroundSize: "200% 200%",
      animation: "gradient 8s linear infinite",
    },
  },

  // Scrollbar personalizado
  scrollbar: {
    width: "8px",
    track: "bg-react-darker",
    thumb: "bg-react-border/50 rounded-full hover:bg-react-border/70 transition-colors",
  },

  // Específicos de cada página
  pages: {
    // Admin
    admin: {
      tabContainer: "flex space-x-4 mb-6",
      contentWrapper: "bg-react-darker/50 rounded-lg border border-react-border/30",
    },

    // Documentation
    docs: {
      cardGrid: "grid grid-cols-1 md:grid-cols-2 gap-4",
      cardAnimation: "hover:scale-105 transition-transform duration-300",
    },

    // Generator
    generator: {
      editorContainer: "min-h-[400px] w-full",
      validationBox: "mt-4 p-4 rounded-lg",
    },

    // Upload
    upload: {
      dropzone: "border-2 border-dashed border-react-border/30 rounded-lg p-8",
      fileList: "mt-4 space-y-2",
    },

    // DagDocumentation
    dagDocs: {
      markdownContainer: "prose prose-invert max-w-none",
      diagramContainer: "overflow-x-auto",
    },
  },
};

// Exportar también variables CSS
export const cssVariables = {
  colors: {
    reactDark: "#0F172A",
    reactDarker: "#1E293B",
    reactBorder: "#334155",
    reactBlue: "#3B82F6",
  },
}; 