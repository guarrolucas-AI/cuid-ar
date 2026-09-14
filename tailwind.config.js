/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        heading: ['Gabarito', 'system-ui', 'sans-serif'],
      },
      colors: {
        cuidar: {
          verde:        '#1F4D3A',
          'verde-900':  '#14201B',
          'verde-700':  '#1A4030',
          'verde-300':  '#9FB6A8',
          agua:         '#3FB7A6',
          coral:        '#D9544D',
          'coral-soft': '#FBF2F1',
          papel:        '#FFFFFF',
          nieve:        '#F6F8F6',
          borde:        '#E6EBE7',
          'gris-suave': '#8E9995',
          'gris-medio': '#5B6661',
          texto:        '#4F5A55',
          tinta:        '#2A332F',
        },
      },
    },
  },
  plugins: [],
}
