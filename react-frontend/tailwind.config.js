/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#ff8c32",
          dark: "#f2740f",
        },
      },
    },
  },
  plugins: [],
  // Disable Preflight so Tailwind's base reset doesn't override the
  // existing plain-CSS pages (landing, dashboard, etc.).
  corePlugins: {
    preflight: false,
  },
};
