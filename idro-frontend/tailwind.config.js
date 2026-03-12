/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#0a0a0a', // Deep charcoal
          900: '#000000', // Pure black
        },
        surface: {
          DEFAULT: '#121212',
          hover: '#1a1a1a',
          border: '#2a2a2a',
        }
      },
    },
  },
  plugins: [],
}