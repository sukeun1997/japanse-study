/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        jp: ['"Noto Sans JP"', '"Hiragino Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
