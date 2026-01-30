import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration for Pizza Study
 *
 * The actual theme (colors, fonts, shadows) is defined in src/styles.css
 * using CSS custom properties and Tailwind v4's @theme directive.
 *
 * This config only handles content paths and any plugin configuration.
 */
export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../apps/frontend/src/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // Animation durations for micro-interactions
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
      },
      // Custom animation timing functions
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "smooth-out": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    },
  },
  plugins: [],
} satisfies Config;
