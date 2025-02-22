import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function IconSelector({ currentIcon, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  const icons = [
    {
      path: "M13 10V3L4 14h7v7l9-11h-7z",
      name: "Rayo"
    },
    {
      path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      name: "Escudo"
    },
    {
      path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      name: "Documento"
    },
    {
      path: "M12 6v6m0 0v6m0-6h6m-6 0H6",
      name: "Más"
    },
    {
      path: "M4 6h16M4 12h16M4 18h7",
      name: "Lista"
    },
    {
      path: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
      name: "Código"
    },
    {
      path: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      name: "Terminal"
    },
    {
      path: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      name: "Info"
    }
  ];

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-react-darker/50 border border-react-border/30 hover:bg-react-blue/5 hover:border-react-blue/30 transition-colors duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentIcon} />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay para cerrar el selector */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Panel de iconos */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute right-0 mt-2 p-2 bg-react-darker border border-react-border/30 rounded-lg shadow-lg z-50 grid grid-cols-4 gap-2"
              style={{ width: '256px' }}
            >
              {icons.map((icon, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    onSelect(icon.path);
                    setIsOpen(false);
                  }}
                  className={`p-2 rounded-lg transition-colors duration-200 hover:bg-react-blue/5 group ${
                    currentIcon === icon.path ? 'bg-react-blue/10' : ''
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex flex-col items-center">
                    <svg className="h-6 w-6 text-gray-200 group-hover:text-react-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon.path} />
                    </svg>
                    <span className="text-xs text-gray-400 mt-1 group-hover:text-react-blue">
                      {icon.name}
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default IconSelector; 