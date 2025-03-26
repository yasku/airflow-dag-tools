import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import DagList from '../components/DagList';

function ValidationV2() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dagCode, setDagCode] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [selectedDagName, setSelectedDagName] = useState(null);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      const text = await selectedFile.text();
      setDagCode(text);
    }
  };

  const handleDagSelect = async (dagName) => {
    try {
      const response = await fetch(`/get_dag_content/${dagName}`);
      const data = await response.json();
      setDagCode(data.content);
      setSelectedDagName(dagName);
      setFile(null);
    } catch (error) {
      console.error('Error al cargar el DAG:', error);
      toast.error('Error al cargar el DAG');
    }
  };

  const handleUpload = async () => {
    if (!file && !selectedDagName) {
      toast.error("Selecciona un archivo DAG o elige uno de la lista.");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    } else {
      const dagBlob = new Blob([dagCode], { type: 'text/x-python' });
      formData.append("file", dagBlob, selectedDagName);
    }

    try {
      const response = await fetch("/validate_dag/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      // Asegurarnos de que el resultado tenga la estructura correcta
      setValidationResult({
        valid: result.valid,
        error: result.valid ? null : (
          result.error?.details?.[0]?.message || 
          result.error?.message || 
          "Error desconocido en el DAG"
        )
      });
      
      if (result.valid) {
        toast.success("¡DAG válido!");
      } else {
        toast.error("El DAG contiene errores");
      }
    } catch (error) {
      console.error("Error al subir el DAG:", error);
      setValidationResult({
        valid: false,
        error: "Error al comunicarse con el servidor"
      });
      toast.error("Error al comunicarse con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="p-6">
        <div className="card">
          <div className="bg-[#2A1810] rounded-lg border border-orange-900/50 p-4 mb-8">
            <h2 className="text-2xl font-semibold text-orange-500/90 flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Validaciones
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Sidebar con DagList */}
              <div className="col-span-3">
                <DagList onDagSelect={handleDagSelect} />
              </div>

              {/* Contenido principal */}
              <div className="col-span-9">
                <div className="space-y-6">
                  {/* Área de subida de archivo */}
                  <div className="section-container">
                    <h3 className="section-header">
                      <svg className="h-5 w-5 text-react-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Subir DAG para Validación
                    </h3>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".py"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-react-darker border-2 border-react-border border-dashed rounded-react hover:bg-react-hover/20 hover:border-react-blue/50 cursor-pointer"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-3 text-react-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-300">
                            <span className="font-semibold">Click para subir</span> o arrastra y suelta
                          </p>
                          <p className="text-xs text-gray-500">.py (Archivos Python)</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Botón de validación */}
                  <div className="flex justify-center">
                    <motion.button
                      onClick={handleUpload}
                      disabled={loading || (!file && !selectedDagName)}
                      className="btn-primary text-lg px-8 py-3"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Validando...
                        </div>
                      ) : (
                        "Validar DAG"
                      )}
                    </motion.button>
                  </div>

                  {/* Resultado de validación con el nuevo formato */}
                  <AnimatePresence>
                    {validationResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`bg-react-darker/50 rounded-lg p-6 border ${
                          validationResult.valid
                            ? 'border-green-500/30'
                            : 'border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center">
                          {validationResult.valid ? (
                            <>
                              <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-green-400 font-medium">DAG válido</span>
                            </>
                          ) : (
                            <>
                              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span className="text-red-400 font-medium">Error en el DAG:</span>
                            </>
                          )}
                        </div>
                        {!validationResult.valid && (
                          <pre className="mt-4 p-4 bg-[#1A1D23] rounded-lg text-red-400 text-sm overflow-x-auto">
                            {typeof validationResult.error === 'string' 
                              ? validationResult.error 
                              : JSON.stringify(validationResult.error, null, 2)
                            }
                          </pre>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Visualización del código */}
                  <AnimatePresence>
                    {dagCode && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-8"
                      >
                        <div className="card overflow-hidden">
                          <div className="flex items-center justify-between p-4 border-b border-react-border/30">
                            <div className="flex items-center space-x-3">
                              <div className="flex space-x-1">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                              </div>
                              <span className="text-sm font-medium text-gray-400">Python</span>
                            </div>
                          </div>
                          <SyntaxHighlighter
                            language="python"
                            style={atomOneDark}
                            customStyle={{
                              background: '#1A1D23',
                              padding: '1.5rem',
                              margin: 0,
                              borderRadius: 0,
                            }}
                          >
                            {dagCode}
                          </SyntaxHighlighter>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValidationV2; 