import type { Config } from "tailwindcss";

// ─── INTERCAMBIA MUNDIAL 2026 — Design Tokens ─────────────────────────────
// Single source of truth for all design decisions.
// Use semantic names (brand, accent) instead of raw color names (sky, amber).
// See THEME.md for full usage guide.

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRIMARY — sky blue. Use for interactive elements, links, focus rings.
        brand: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7", // ← default: buttons, links
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },

        // ACCENT — amber. Use for active states, badges, notifications, page accent bars.
        accent: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24", // ← active nav, accent bars, ping ring
          500: "#f59e0b", // ← unread badges, highlights
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },

        // MATCH TYPES — semantic colors for Intercambios section only.
        mutual: {
          bg:     "#dcfce7", // green-100
          text:   "#166534", // green-800
          border: "#86efac", // green-300
        },
        direct: {
          bg:     "#e0f2fe", // sky-100
          text:   "#075985", // sky-800
          border: "#bae6fd", // sky-200
        },
      },

      fontFamily: {
        // Display — Bebas Neue. Headers, section titles, numbers.
        display: ["var(--font-display)", "Impact", "Arial Narrow", "sans-serif"],
        // Body — Plus Jakarta Sans. All other text.
        sans:    ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },

      boxShadow: {
        // Use shadow-card for all white content cards.
        card:       "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "card-md":  "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
      },

      borderRadius: {
        // Use radius-card for cards, radius-button is the default rounded-md.
        card: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
