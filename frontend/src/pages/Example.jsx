import { 
  layouts, 
  components, 
  animations, 
  colors,
  gradients,
  effects 
} from '../styles/theme';
import { cx, responsive, withAnimation } from '../styles/utils';

function Example() {
  return (
    <motion.div 
      className={layouts.pageContainer}
      {...animations.pageTransition}
    >
      <div className={layouts.contentSection}>
        <div className={components.card}>
          <div className={components.title.container}>
            <h2 className={components.title.text}>
              Título de la Página
            </h2>
          </div>

          <div className={cx(
            components.card,
            colors.background.secondary,
            effects.glass
          )}>
            {/* Contenido */}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Example; 