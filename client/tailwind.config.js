/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#22d3ee",
      }
    },
  },
  plugins: [
    require("daisyui"), // <--- CETTE LIGNE EST INDISPENSABLE
  ],
  daisyui: {
    themes: ["night"], // Force un thème sombre moderne
  },
}