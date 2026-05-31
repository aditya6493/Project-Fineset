import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "!./app/api/**",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "var(--brand-gold)",
          "gold-light": "var(--brand-gold-light)",
          "gold-dark": "var(--brand-gold-dark)",
          charcoal: "var(--brand-charcoal)",
          ivory: "var(--brand-ivory)",
          cream: "var(--brand-cream)",
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
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          error: "var(--status-error)",
          info: "var(--status-info)",
        },
        border: "var(--border)",
        chart: {
          primary: "var(--chart-primary)",
          secondary: "var(--chart-secondary)",
          axis: "var(--chart-axis)",
          grid: "var(--chart-grid)",
        },
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
  plugins: [tailwindcssAnimate],
};

export default config;
