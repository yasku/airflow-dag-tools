/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'react-dark': '#23272F',      // Fondo principal
        'react-darker': '#161B22',    // Color de cards
        'react-border': '#343A46',    // Color de bordes
        'react-blue': '#149ECA',      // Azul de react.dev
        'react-hover': '#2B3037',     // Color hover de cards
      },
      boxShadow: {
        'react': '0 0 0 1px rgba(82, 82, 89, 0.32)',
        'react-hover': '0 0 0 1px rgba(82, 82, 89, 0.52)',
      },
      borderRadius: {
        'react': '12px',
      }
    },
  },
  plugins: [],
}