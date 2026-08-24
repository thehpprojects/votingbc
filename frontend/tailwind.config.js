/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand — indigo/violet Web3 accent
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        // Deep space navy for dark surfaces
        midnight: {
          800: "#141a2e",
          850: "#101424",
          900: "#0c0f1d",
          950: "#080b16",
        },
        // India saffron accent
        saffron: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        // India green accent
        greenIndia: {
          50: "#f1fbf0",
          100: "#dcf5d9",
          200: "#bdeaaf",
          300: "#92da85",
          400: "#66c350",
          500: "#4d9e3c",
          600: "#138808",
          700: "#1c6d0f",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
        hindi: ["'Noto Sans Devanagari'", "Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgb(15 23 42 / 0.06), 0 4px 24px -8px rgb(15 23 42 / 0.08)",
        lift: "0 8px 30px -6px rgb(15 23 42 / 0.12), 0 4px 16px -8px rgb(15 23 42 / 0.08)",
        glow: "0 0 24px -4px rgb(99 102 241 / 0.45)",
        "glow-lg": "0 0 48px -8px rgb(99 102 241 / 0.5)",
        "glow-emerald": "0 0 24px -4px rgb(16 185 129 / 0.45)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgb(99 102 241 / 0.4)" },
          "70%": { boxShadow: "0 0 0 12px rgb(99 102 241 / 0)" },
          "100%": { boxShadow: "0 0 0 0 rgb(99 102 241 / 0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "slide-in": "slide-in 0.3s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        marquee: "marquee 30s linear infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-slate": "linear-gradient(to right, rgb(148 163 184 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
