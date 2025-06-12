/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4A90E2",
        secondary: "#357ABD",
        danger: "#E74C3C",
        background: "#F5F6FA",
        surface: "#FFFFFF",
        text: {
          primary: "#2C3E50",
          secondary: "#95A5A6",
        },
        border: "#E0E0E0",
      },
    },
  },
  plugins: [],
};
