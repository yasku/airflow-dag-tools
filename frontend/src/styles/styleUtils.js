// Importar dependencias necesarias
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Función para combinar clases condicionales (de utils.js)
export const cx = (...classes) => classes.filter(Boolean).join(' ');

// Alias para mantener compatibilidad con código existente
export const combineStyles = cx;

// Configuraciones compartidas entre páginas (de pageStyles.js)
export const sharedStyles = {
  pageContainer: "min-h-[calc(100vh-4rem)]",
  contentPadding: "p-6",
  card: "bg-react-darker/50 rounded-lg border border-react-border/30",
  titleBox: {
    container: "bg-[#2A1810] rounded-lg border border-orange-900/50 p-4 mb-8",
    text: "text-2xl font-semibold text-orange-500/90 flex items-center"
  }
};

// Configuraciones específicas por página (de pageStyles.js)
export const pageStyles = {
  // Estilos específicos de Admin.jsx
  admin: {
    ...sharedStyles,
    tabButton: (isActive) => `
      flex items-center px-4 py-2 rounded-lg transition-colors duration-200 
      ${isActive 
        ? 'bg-react-blue/10 text-react-blue'
        : 'text-gray-400 hover:text-gray-200 hover:bg-react-blue/5'
      }
    `,
    tabContent: "bg-react-darker/50 rounded-lg border border-react-border/30",
    contentPadding: "p-6"
  },

  // Estilos específicos de Generator.jsx
  generator: {
    ...sharedStyles,
    layout: {
      sidebar: "sidebar p-6",
      mainContent: "main-content"
    },
    codeEditor: {
      container: "bg-react-dark/50 rounded-lg overflow-hidden border border-react-border/30",
      style: {
        fontSize: "14px",
        backgroundColor: "#1A1D23",
        fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Menlo,monospace",
        minHeight: "400px"
      }
    },
    validationResult: (isValid) => `
      bg-react-darker/50 rounded-lg p-6 border 
      ${isValid ? 'border-green-500/30' : 'border-red-500/30'}
    `
  },

  // Estilos específicos de Upload.jsx
  upload: {
    ...sharedStyles,
    layout: {
      container: "flex h-[calc(100vh-4rem)]",
      sidebar: "w-72 p-4 border-r border-react-border/30",
      content: "flex-1 overflow-auto"
    },
    dropzone: `
      flex flex-col items-center justify-center w-full h-32 px-4 
      transition bg-react-darker border-2 border-react-border border-dashed 
      rounded-react hover:bg-react-hover/20 hover:border-react-blue/50 cursor-pointer
    `,
    codeViewer: {
      container: "mt-8 bg-react-darker rounded-lg overflow-hidden",
      header: "flex items-center justify-between p-4 border-b border-react-border/30"
    }
  },

  // Estilos específicos de DagDocumentation.jsx
  dagDocumentation: {
    ...sharedStyles,
    layout: {
      container: "flex h-[calc(100vh-4rem)]",
      sidebar: "w-72 p-4 border-r border-react-border/30",
      content: "flex-1 overflow-auto p-6"
    },
    docForm: {
      section: "bg-react-darker/50 rounded-lg p-6 border border-react-border/30 space-y-4",
      input: "input-field w-full bg-react-dark/50"
    }
  },

  // Estilos específicos de Documentation.jsx
  documentation: {
    ...sharedStyles,
    sectionCard: `
      bg-react-darker/50 rounded-lg border border-react-border/30
      motion-safe:hover:scale-[1.01] transition-transform duration-300
    `,
    contentCard: `
      bg-react-dark rounded-lg border border-react-border/20 p-4 
      hover:border-react-blue/30 transition-colors
    `
  },

  // Estilos específicos de Home.jsx
  home: {
    ...sharedStyles,
    hero: {
      container: "relative isolate min-h-[80vh] flex items-center",
      gradient: `
        absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden 
        blur-3xl sm:-top-80
      `
    },
    featureCard: `
      group card p-6 hover:border-react-blue/20 
      motion-safe:hover:scale-[1.02] transition-all duration-300
    `
  }
};

// Estilos adicionales de styles.js
export const styles = {
  // Layouts principales
  layout: {
    container: "flex h-[calc(100vh-4rem)]",
    sidebar: "w-72 border-r border-react-border/30",
    content: "flex-1 overflow-auto",
  },
  
  // Componentes UI comunes
  ui: {
    button: {
      primary: "btn btn-primary",
      secondary: "btn btn-secondary",
      outline: "btn btn-outline",
      icon: "btn btn-icon",
    },
    input: {
      text: "input-field",
      file: "input-file",
      select: "select-field",
    },
    card: {
      base: "card",
      hover: "card hover-card",
      interactive: "card interactive-card",
    },
    badge: {
      info: "badge badge-info",
      success: "badge badge-success",
      warning: "badge badge-warning",
      error: "badge badge-error",
    },
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

// Configuraciones de animación para framer-motion
export const motionConfig = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

// Exportar configuraciones de estilos para componentes específicos
export const syntaxHighlighterStyle = atomOneDark;

// Exportar cualquier otra utilidad o constante que pueda ser necesaria