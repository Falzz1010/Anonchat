/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brutal-dark': '#1a1a1a',
        'brutal-gray': '#2a2a2a',
        'brutal-pink': '#ff69b4',
        'brutal-red': '#ff4444',
        'brutal-blue': '#4444ff',
      },
    },
  },
  plugins: [],
}
