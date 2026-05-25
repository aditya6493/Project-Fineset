import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#B8972E",
          "gold-light": "#D4AF37",
          "gold-dark": "#8B6914",
          charcoal: "#1C1C1E",
          ivory: "#FAF7F2",
          cream: "#F5EFE6",
        },
        surface: {
          primary: "var(--surface-primary)",
          secondary: "var(--surface-secondary)",
          card: "var(--surface-card)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        status: {
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",
          info: "#3B82F6",
        },
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        numeric: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        input: "8px",
        chip: "999px",
      },
      spacing: {
        "page-x": "16px",
        "page-md": "32px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
