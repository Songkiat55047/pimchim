export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          50: "#f4f6ee",
          100: "#e5ead2",
          200: "#cbd7a8",
          300: "#abbf7c",
          400: "#8ba656",
          500: "#6f8d3d",
          600: "#57712f",
          700: "#445826",
          800: "#333f1e",
          900: "#232a15",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif Thai"', "ui-serif", "serif"],
      },
    },
  },
  plugins: [],
};