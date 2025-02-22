import { motion } from 'framer-motion';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Configuración de animaciones comunes
export const animations = {
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  cardHover: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  },
};

// Configuración de layouts comunes
export const layouts = {
  pageContainer: "min-h-[calc(100vh-4rem)]",
  sidebarLayout: "flex h-[calc(100vh-4rem)]",
  sidebar: "w-72 p-4 border-r border-react-border/30",
  mainContent: "flex-1 overflow-auto",
  contentSection: "p-6",
};

// Configuración de componentes comunes
export const components = {
  card: "bg-react-darker/50 rounded-lg border border-react-border/30",
  title: {
    container: "bg-[#2A1810] rounded-lg border border-orange-900/50 p-4 mb-8",
    text: "text-2xl font-semibold text-orange-500/90 flex items-center",
  },
  button: {
    primary: "btn-primary flex items-center",
    secondary: "btn-secondary flex items-center",
  },
  input: {
    field: "input-field w-full bg-react-dark/50",
    container: "space-y-2",
  },
};

// Configuración de colores y gradientes
export const colors = {
  background: {
    primary: "bg-react-dark",
    secondary: "bg-react-darker",
    accent: "bg-react-blue",
  },
  text: {
    primary: "text-gray-200",
    secondary: "text-gray-400",
    accent: "text-react-blue",
  },
  border: {
    primary: "border-react-border/30",
    accent: "border-react-blue/30",
  },
};

// Configuración de editor de código
export const codeEditor = {
  style: {
    ...atomOneDark,
    fontSize: "14px",
    fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Menlo,monospace",
  },
  options: {
    padding: 16,
    minHeight: "400px",
    backgroundColor: "#1A1D23",
  },
};

// Configuración de gradientes
export const gradients = {
  primary: "bg-gradient-to-tr from-react-blue to-react-blue/20 opacity-20",
  text: "bg-gradient-to-r from-react-blue to-purple-400 text-transparent bg-clip-text",
};

// Configuración de efectos
export const effects = {
  glass: "backdrop-blur-md bg-black/40",
  glow: "hover:shadow-lg hover:shadow-react-blue/20",
  hover: "hover:bg-react-blue/5 hover:text-react-blue",
};

// Configuración de layouts específicos
export const pageLayouts = {
  withSidebar: {
    container: layouts.sidebarLayout,
    sidebar: layouts.sidebar,
    content: layouts.mainContent,
  },
  centered: {
    container: "max-w-7xl mx-auto px-6 py-12",
    content: "grid gap-8",
  },
};

// Configuración de elementos de interfaz comunes
export const ui = {
  iconButton: "p-2 rounded-lg hover:bg-react-blue/5 transition-colors duration-200",
  badge: "px-2 py-1 rounded-full text-xs font-medium",
  divider: "border-t border-react-border/30",
  loader: "animate-spin rounded-full h-8 w-8 border-b-2 border-react-blue",
}; 