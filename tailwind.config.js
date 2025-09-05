/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./public/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#f0f9ff',
        'secondary': '#e0f2fe', 
        'accent': '#0891b2',
      },
      fontFamily: {
        'sans': ['Assistant', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
