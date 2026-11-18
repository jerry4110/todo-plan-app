import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        rausch: {
          DEFAULT: "#ff385c",
          active: "#e00b41",
          disabled: "#ffd1da",
        },
        ink: "var(--ink)",
        body: "var(--body)",
        muted: "var(--muted)",
        "muted-soft": "var(--muted-soft)",
        surface: {
          soft: "var(--surface-soft)",
          strong: "var(--surface-strong)",
        },
        hairline: {
          DEFAULT: "var(--hairline)",
          soft: "var(--hairline-soft)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "14px",
        xl: "32px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        none: "var(--shadow-none)",
      },
      spacing: {
        18: "4.5rem",
        section: "4rem",
      },
    },
  },
  plugins: [],
};
export default config;
