/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          '"Plus Jakarta Sans"',
          "Outfit",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        body: ['"Inter"', "Source Sans 3", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      colors: {
        void: {
          950: "#0f1419",
          900: "#1a2130",
          800: "#222b3a",
        },
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.9)",
        },
        accent: {
          cyan: "#0d9488",
          indigo: "#4f46e5",
        },
      },
      backgroundImage: {
        "grid-fine": `linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)`,
        "mesh-hero":
          "radial-gradient(ellipse 90% 60% at 20% 0%, rgba(56,189,248,0.22), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 0%, rgba(59,130,246,0.12), transparent 50%), radial-gradient(ellipse 50% 40% at 0% 60%, rgba(96,165,250,0.1), transparent 50%)",
        "glow-btm":
          "radial-gradient(ellipse 100% 70% at 50% 100%, rgba(59,130,246,0.12), transparent 50%)",
      },
      backgroundSize: {
        grid: "64px 64px",
      },
      boxShadow: {
        glass:
          "0 1px 3px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)"
,
        card: "0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)"
,
        glow: "0 0 0 1px rgba(14, 165, 233, 0.18), 0 4px 20px rgba(59, 130, 246, 0.12)"
,
        "inner-glow": "inset 0 1px 0 0 rgba(255,255,255,0.8)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
