/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.html",
    "./app/**/*.html", // nested templates
  ],
  theme: {
    extend: {
      animation: {
        "grow-shrink": "growShrink 3s ease-in-out infinite",
      },
      keyframes: {
        growShrink: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
};
