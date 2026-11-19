/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fdfbf7',
          100: '#fbf7ee',
          200: '#f5ecd8',
          300: '#ebd9b8',
          400: '#dfc293',
          500: '#d0aa6e',
          800: '#5c4524',
          900: '#342614',
        },
        mythic: {
          gold: '#eab308',
          dark: '#0f172a',
          surface: '#1e293b',
          card: '#182234',
          border: '#334155',
        },
      },
    },
  },
  plugins: [],
};
