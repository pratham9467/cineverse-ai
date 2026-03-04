/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2E99BD",
        secondary: "#1A1A1A",
        accent: "#FF0000",
      },
    },
  },
  plugins: [],
};