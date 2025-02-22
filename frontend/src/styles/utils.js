// Función para combinar clases condicionales
export const cx = (...classes) => classes.filter(Boolean).join(' ');

// Función para aplicar variantes de componentes
export const applyVariant = (base, variant) => `${base} ${variant}`;

// Función para generar clases responsivas
export const responsive = (base, sm, md, lg) => 
  cx(base, sm && `sm:${sm}`, md && `md:${md}`, lg && `lg:${lg}`);

// Función para aplicar animaciones
export const withAnimation = (element, animation) => {
  return {
    ...element,
    ...animation,
  };
};

// Función para aplicar estilos condicionales
export const styleIf = (condition, styles) => condition ? styles : ''; 