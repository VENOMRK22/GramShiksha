/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          // Legacy support (optional, can map to shades if needed, but defaulting to main)
          50: "oklch(0.97 0.05 140)",
          100: "oklch(0.92 0.1 140)",
          200: "oklch(0.85 0.15 140)",
          300: "oklch(0.75 0.18 140)",
          400: "oklch(0.7 0.2 140)", // Base
          500: "var(--primary)",
          600: "oklch(0.6 0.2 140)",
          700: "oklch(0.5 0.18 140)",
          800: "oklch(0.4 0.15 140)",
          900: "oklch(0.3 0.1 140)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
