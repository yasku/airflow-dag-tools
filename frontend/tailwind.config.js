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
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.react-blue'),
              '&:hover': {
                color: theme('colors.blue.400'),
              },
            },
            h1: {
              color: theme('colors.white'),
            },
            h2: {
              color: theme('colors.white'),
            },
            h3: {
              color: theme('colors.white'),
            },
            h4: {
              color: theme('colors.white'),
            },
            strong: {
              color: theme('colors.white'),
            },
            code: {
              color: theme('colors.amber.400'),
              backgroundColor: theme('colors.gray.800'),
              padding: '0.25rem',
              borderRadius: '0.25rem',
            },
            blockquote: {
              color: theme('colors.gray.400'),
              borderLeftColor: theme('colors.gray.700'),
            },
            hr: {
              borderColor: theme('colors.gray.700'),
            },
            ol: {
              li: {
                '&:before': {
                  color: theme('colors.gray.500'),
                },
              },
            },
            ul: {
              li: {
                '&:before': {
                  backgroundColor: theme('colors.gray.500'),
                },
              },
            },
            pre: {
              backgroundColor: theme('colors.gray.800'),
            },
            thead: {
              color: theme('colors.white'),
              borderBottomColor: theme('colors.gray.700'),
            },
            tbody: {
              tr: {
                borderBottomColor: theme('colors.gray.700'),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}