import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        vault: {
          50: "#f0f1f5",
          100: "#e0e2ea",
          200: "#c4c7d4",
          300: "#9ea3b8",
          400: "#727998",
          500: "#555c78",
          600: "#434962",
          700: "#353a50",
          800: "#1e2231",
          900: "#14161f",
          950: "#0a0a0f",
        },
        brand: {
          DEFAULT: "#6366f1",
          light: "#818cf8",
          hover: "#5558e6",
          muted: "rgba(99, 102, 241, 0.12)",
          accent: "#06b6d4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: [
          "var(--font-jetbrains-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0, 0, 0, 0.25)",
        elevated: "0 4px 12px rgba(0, 0, 0, 0.35)",
        glow: "0 0 20px rgba(99, 102, 241, 0.08)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 250ms ease-out",
        "slide-down": "slide-down 250ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
