import { useConfig } from '../context/ConfigContext';
import { motion } from 'framer-motion';

function Documentation() {
  const { docSections, loading } = useConfig();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-react-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="p-6">
        <div className="card">
          <div className="bg-[#2A1810] rounded-lg border border-orange-900/50 p-4 mb-8">
            <h2 className="text-2xl font-semibold text-orange-500/90 flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Documentación
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {docSections.map((section) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-react-darker/50 rounded-lg border border-react-border/30"
                >
                  <div className="p-4 border-b border-react-border/20">
                    <div className="flex items-center space-x-3">
                      <svg className="h-5 w-5 text-react-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                      </svg>
                      <h3 className="text-xl font-semibold text-gray-200">{section.title}</h3>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.cards.map((card, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          className="bg-react-dark rounded-lg border border-react-border/20 p-4 hover:border-react-blue/30 transition-colors"
                        >
                          <h4 className="text-lg font-medium text-gray-200 mb-2">{card.title}</h4>
                          <p className="text-gray-400 text-sm">{card.content}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documentation; 