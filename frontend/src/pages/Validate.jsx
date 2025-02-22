import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-hot-toast';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function Validate() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dagCode, setDagCode] = useState("");
  const [validationResult, setValidationResult] = useState(null);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      const text = await selectedFile.text();
      setDagCode(text);
    }
  };

  const handleValidate = async () => {
    if (!file) {
      toast.error("Por favor, selecciona un archivo DAG primero");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:8000/validate_dag/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setValidationResult(result);
      
      if (result.valid) {
        toast.success("¡DAG válido!");
      } else {
        toast.error("El DAG contiene errores");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error en la validación");
      setValidationResult({
        valid: false,
        error: "Error al comunicarse con el servidor"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Card principal */}
        <div className="card p-8">
          <h2 className="text-2xl font-semibold text-gray-100 mb-8">
            Validar DAG
          </h2>

          {/* Selector de archivo */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Selecciona tu archivo DAG
            </label>
            <input
              type="file"
              accept=".py"
              onChange={handleFileChange}
              className="input-field w-full"
            />
          </div>

          {/* Botón de validación */}
          <div className="flex justify-center mt-8">
            <motion.button
              onClick={handleValidate}
              disabled={loading || !file}
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Validando...
                </div>
              ) : (
                "Validar DAG"
              )}
            </motion.button>
          </div>

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

          {/* Resultado de la validación */}
          <AnimatePresence>
            {validationResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mt-6 p-6 rounded-react border ${
                  validationResult.valid
                    ? 'bg-react-darker border-green-500/20'
                    : 'bg-react-darker border-red-500/20'
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
                      <span className="text-red-400 font-medium">Error en el DAG</span>
                    </>
                  )}
                </div>
                {!validationResult.valid && (
                  <pre className="mt-4 p-4 bg-[#1A1D23] rounded-lg text-red-400 text-sm overflow-x-auto">
                    {JSON.stringify(validationResult.error, null, 2)}
                  </pre>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Validate;
  