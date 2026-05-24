/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        heading: ['Quicksand', 'sans-serif'],
      },
      colors: {
        brand: {
          turquoise: '#4ECDC4',
          blue: '#6B9DC2',
          warm: '#FFB347',
        },
      },
    },
  },
  plugins: [],
}
