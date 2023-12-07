/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryBlack: '#0B0C10',
        primaryGray: '#1F2833',
        secondaryGray: '#C5C6C7',
        primaryBlue: '#66FCF1',
        secondaryBlue: '#45A29E',
        hoverColor: 'rgba(0,0,0,0.5)'
      }
    },
  },
  plugins: [],
}

