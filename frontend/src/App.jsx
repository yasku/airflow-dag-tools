import "./index.css";  // Cargar los estilos de Tailwind CSS
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ConfigProvider } from './context/ConfigContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Generator from './pages/Generator';
import Upload from './pages/Upload';
import Documentation from './pages/Documentation';
import Login from './pages/Login';
import Admin from './pages/Admin';
import DagDocumentation from './pages/DagDocumentation';
import GeneratorV2 from './pages/GeneratorV2';
import ValidationV2 from './pages/ValidationV2';
import DocumentationV2 from './pages/DocumentationV2';
import DagDocumentationV2 from './pages/DagDocumentationV2';

function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <Router>
          <div className="min-h-screen bg-react-dark flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/generator" element={<Generator />} />
                <Route path="/generator-v2" element={<GeneratorV2 />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/docs" element={<Documentation />} />
                <Route path="/docs-v2" element={<DocumentationV2 />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/dag-docs" element={<DagDocumentation />} />
                <Route path="/dag-docs-v2" element={<DagDocumentationV2 />} />
                <Route path="/validation-v2" element={<ValidationV2 />} />
              </Routes>
            </div>
            <Toaster />
          </div>
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
}

export default App;
