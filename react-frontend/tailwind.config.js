/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#ff8c32",
          dark: "#f2740f",
          light: "#ffb877",
        },
        ink: {
          950: "#0e1016",
          900: "#171923",
          800: "#1f2430",
          700: "#2a3040",
          600: "#3c4256",
        },
        paper: {
          DEFAULT: "#f5f6f8",
          warm: "#fbf3e7",
        },
        teal: {
          DEFAULT: "#1f6f6b",
          dark: "#164f4c",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(14, 16, 22, 0.04), 0 8px 24px rgba(14, 16, 22, 0.06)",
        panel: "0 20px 60px rgba(14, 16, 22, 0.35)",
      },
    },
  },
  plugins: [],
};
