import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section con estilo react.dev */}
      <div className="relative isolate min-h-[80vh] flex items-center">
        {/* Gradiente de fondo actualizado */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-react-blue to-react-blue/20 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="relative z-10 w-full">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-white">
                <span className="text-react-blue">AirFlow</span> <span className="text-white">DAG Validator</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Valida y genera DAGs de Apache Airflow de forma sencilla y segura.
                Asegura que tus workflows cumplan con las mejores prácticas y estándares.
              </p>
            </motion.div>

            {/* Cards de características con estilo react.dev */}
            <div className="mt-16 flex justify-center overflow-x-auto pb-4 max-w-full mx-auto">
              <div className="flex flex-nowrap gap-4 px-4">
                <Link to="/generator-v2" className="group flex-shrink-0 w-60">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="card p-6 h-full"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-react-blue/10 rounded-lg">
                        <svg className="h-6 w-6 text-react-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold ml-3 text-gray-100">
                        Crear DAG
                      </h2>
                    </div>
                    <p className="text-gray-400">
                      Crea nuevos DAGs con una interfaz intuitiva y validación en tiempo real.
                    </p>
                  </motion.div>
                </Link>

                <Link to="/validation-v2" className="group flex-shrink-0 w-60">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="card p-6 h-full"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-react-blue/10 rounded-lg">
                        <svg className="h-6 w-6 text-react-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold ml-3 text-gray-100">
                        Validaciones
                      </h2>
                    </div>
                    <p className="text-gray-400">
                      Valida tus DAGs existentes para asegurar su compatibilidad y estructura correcta.
                    </p>
                  </motion.div>
                </Link>

                <Link to="/docs-v2" className="group flex-shrink-0 w-60">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="card p-6 h-full"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-react-blue/10 rounded-lg">
                        <svg className="h-6 w-6 text-react-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold ml-3 text-gray-100">
                        Documentación
                      </h2>
                    </div>
                    <p className="text-gray-400">
                      Consulta la documentación completa sobre DAGs y mejores prácticas de Airflow.
                    </p>
                  </motion.div>
                </Link>

                <Link to="/dag-docs-v2" className="group flex-shrink-0 w-60">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="card p-6 h-full"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-react-blue/10 rounded-lg">
                        <svg className="h-6 w-6 text-react-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold ml-3 text-gray-100">
                        Docs DAGs
                      </h2>
                    </div>
                    <p className="text-gray-400">
                      Genera y consulta documentación específica para tus DAGs existentes.
                    </p>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;