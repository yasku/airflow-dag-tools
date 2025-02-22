import { motion } from 'framer-motion';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Configuraciones compartidas entre páginas
const sharedStyles = {
  pageContainer: "min-h-[calc(100vh-4rem)]",
  contentPadding: "p-6",
  card: "bg-react-darker/50 rounded-lg border border-react-border/30",
  titleBox: {
    container: "bg-[#2A1810] rounded-lg border border-orange-900/50 p-4 mb-8",
    text: "text-2xl font-semibold text-orange-500/90 flex items-center"
  }
};

// Configuraciones específicas por página
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

// Animaciones compartidas
export const animations = {
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

// Utilidades para combinar estilos
export const combineStyles = (...styles) => styles.filter(Boolean).join(' ');

// Configuración del editor de código
export const codeEditorConfig = {
  theme: atomOneDark,
  options: {
    fontSize: 14,
    padding: 20,
    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,monospace',
    backgroundColor: '#1A1D23'
  }
}; 