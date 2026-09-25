import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F0DF",
        "canvas-2": "#F0E6CE",
        ink: "#1A1613",
        "ink-soft": "#5A5248",
        red: "#D7263D",
        indigo: "#14213D",
        gold: "#F2B134",
        teal: "#2A9D8F",
        border: "#E4D8B8",
      },
      fontFamily: {
        display: ["'Bricolage Grotesque'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
        pill: "999px",
      },
    },
  },
  plugins: [],
} satisfies Config;
