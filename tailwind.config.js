/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#904C77", // Deep Purple
        secondary: "#E49AB0", // Light Pink
        accent: "#ECBBA5", // Light Coral
        background: "#ECCFC3", // Light Peach
        muted: "#957D95", // Muted Purple
      },
    },
  },
  plugins: [],
};
