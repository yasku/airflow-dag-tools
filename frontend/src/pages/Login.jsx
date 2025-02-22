import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast.jsx';

function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(credentials.username, credentials.password);
      showToast.success('Inicio de sesión exitoso');
      navigate('/admin');
    } catch (error) {
      showToast.error('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2A1810] rounded-lg border border-orange-900/50 p-4 mb-6"
        >
          <h2 className="text-2xl font-semibold text-orange-500/90 flex items-center justify-center">
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Iniciar Sesión
          </h2>
        </motion.div>

        {/* Login Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-react-darker/50 rounded-lg border border-react-blue/30 p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-200 flex items-center mb-3">
                <span className="mr-3 text-lg">👤</span>
                Usuario
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="input-field w-full bg-react-dark/50 px-4 py-3"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="block text-lg font-medium text-gray-200 flex items-center mb-3">
                <span className="mr-3 text-lg">🔒</span>
                Contraseña
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="input-field w-full bg-react-dark/50 px-4 py-3"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Iniciando sesión...
                </div>
              ) : (
                <>
                  <span className="mr-3 text-lg">🔑</span>
                  Iniciar Sesión
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Login; 