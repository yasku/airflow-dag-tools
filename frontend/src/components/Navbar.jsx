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
                <div className="mr-3 relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-react-blue/50 to-purple-500/50 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-react-darker/80 rounded-lg p-2">
                    <svg 
                      className="h-6 w-6 text-react-blue group-hover:text-white transition-colors duration-300" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-react-blue to-purple-400 text-transparent bg-clip-text group-hover:from-white group-hover:to-react-blue transition-all duration-300">
                    Airflow DAG Validator
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