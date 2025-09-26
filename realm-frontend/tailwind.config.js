/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        realm: {
          primary: '#5865f2',
          secondary: '#57f287',
          accent: '#fee75c',
          danger: '#ed4245',
          dark: '#2c2f33',
          darker: '#23272a',
          light: '#99aab5'
        }
      }
    },
  },
  plugins: [],
}