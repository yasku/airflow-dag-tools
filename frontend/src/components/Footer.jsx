import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-react-border/30 bg-react-darker/80 backdrop-blur-md supports-[backdrop-filter]:bg-react-darker/60">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <span className="text-lg font-semibold">
                <span className="text-react-blue">AirFlow</span> <span className="text-white">DAG Validator</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Herramienta desarollada por el equipo de Big Data & Analytics - Agustin Yaskuloski
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link to="/generator-v2" className="text-gray-300 hover:text-react-blue transition-colors duration-200">
              Crear DAG
            </Link>
            <Link to="/validation-v2" className="text-gray-300 hover:text-react-blue transition-colors duration-200">
              Validaciones
            </Link>
            <Link to="/docs-v2" className="text-gray-300 hover:text-react-blue transition-colors duration-200">
              Documentación
            </Link>
            <Link to="/dag-docs-v2" className="text-gray-300 hover:text-react-blue transition-colors duration-200">
              Docs DAGs
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-react-border/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Agustin Yaskuloski - Claro AMX. Todos los derechos reservados.
          </p>
          <div className="mt-4 md:mt-0 flex gap-4">
            <a href="#" className="text-gray-400 hover:text-react-blue transition-colors duration-200">
              Términos
            </a>
            <a href="#" className="text-gray-400 hover:text-react-blue transition-colors duration-200">
              Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 