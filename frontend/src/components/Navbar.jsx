import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

function Navbar() {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <nav className="sticky top-0 z-50 border-b border-react-border/30 bg-react-darker/80 backdrop-blur-md supports-[backdrop-filter]:bg-react-darker/60">
      <div className="px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center justify-between w-full">
            <Link 
              to="/" 
              className="flex items-center group transition-all duration-300 hover:scale-105 mr-8"
            >
              <div className="flex items-center">
                <div className="mr-3">
                  <svg 
                    className="h-6 w-6 text-white" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 12h14M12 5v14" 
                    />
                  </svg>
                </div>

                <div className="flex flex-col">
                  <span className="text-xl font-bold">
                    <span className="text-react-blue">AirFlow</span> <span className="text-white">DAG Validator</span>
                  </span>
                  <span className="text-xs text-gray-200 transition-colors duration-300">
                    Validación y Generación de DAGs
                  </span>
                </div>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                to="/generator-v2"
                className={`px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                  location.pathname === '/generator-v2'
                    ? 'text-react-blue bg-react-blue/10'
                    : 'text-gray-200 hover:text-react-blue hover:bg-react-blue/5'
                }`}
              >
                Crear DAG
              </Link>
              
              <Link
                to="/validation-v2"
                className={`px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                  location.pathname === '/validation-v2'
                    ? 'text-react-blue bg-react-blue/10'
                    : 'text-gray-200 hover:text-react-blue hover:bg-react-blue/5'
                }`}
              >
                Validaciones
              </Link>

              <Link
                to="/docs-v2"
                className={`px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                  location.pathname === '/docs-v2'
                    ? 'text-react-blue bg-react-blue/10'
                    : 'text-gray-200 hover:text-react-blue hover:bg-react-blue/5'
                }`}
              >
                Documentación
              </Link>

              <Link
                to="/dag-docs-v2"
                className={`px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                  location.pathname === '/dag-docs-v2'
                    ? 'text-react-blue bg-react-blue/10'
                    : 'text-gray-200 hover:text-react-blue hover:bg-react-blue/5'
                }`}
              >
                Docs DAGs
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                      location.pathname === '/admin'
                        ? 'text-react-blue bg-react-blue/10'
                        : 'text-gray-200 hover:text-react-blue hover:bg-react-blue/5'
                    }`}
                  >
                    Administración
                  </Link>
                  <motion.button
                    onClick={logout}
                    className="px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:text-red-400 hover:bg-red-400/5 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cerrar Sesión
                  </motion.button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:text-react-blue hover:bg-react-blue/5 transition-colors duration-200"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;