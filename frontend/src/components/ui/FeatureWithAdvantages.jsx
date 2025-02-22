import { motion } from 'framer-motion';

function FeatureWithAdvantages() {
  const features = [
    {
      title: "Validación Inteligente",
      description: "Sistema avanzado de validación de DAGs que detecta errores antes de la implementación.",
      icon: "✓"
    },
    {
      title: "Documentación Automática",
      description: "Generación automática de documentación estructurada para tus DAGs.",
      icon: "📝"
    },
    {
      title: "Gestión Simplificada",
      description: "Interfaz intuitiva para administrar y mantener tus flujos de trabajo.",
      icon: "🔧"
    }
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-react-blue mb-2">Plataforma</span>
            <h2 className="text-4xl font-bold text-white mb-4">
              Gestión de DAGs Simplificada
            </h2>
            <p className="text-gray-400 text-lg">
              Optimiza tu flujo de trabajo con Airflow de manera eficiente y segura.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-start space-y-4"
            >
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeatureWithAdvantages; 