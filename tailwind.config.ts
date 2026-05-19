import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Deep Teal — primary CTA / brand actions (anchored at brand-600 = #0F766E, Tailwind teal-700)
        // Replaced the brighter #00A896 ramp 2026-05-19 per Master O CMO brief 2 for the
        // intelligence-workspace internal app surface. Marketing homepage uses Tailwind
        // `blue-600` literal so it's insulated from this swap.
        brand: {
          50:  "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0F766E",
          700: "#115E59",
          800: "#134E4A",
          900: "#042F2E"
        },
        // Intelligence accents — flat tokens (no full ramp).
        // intel-cyan = data viz + chart accents; intel-dark = admin/data-terminal surfaces.
        "intel-cyan": "#0891B2",
        "intel-dark": "#07111F",
        // Deep Navy — headlines, navigation, dark-mode surface (anchored at navy-800 = #1A2B3C)
        navy: {
          50:  "#E8ECF0",
          100: "#C6CFD8",
          200: "#9BACBE",
          300: "#6F89A4",
          400: "#496C8B",
          500: "#2F4D6E",
          600: "#243C56",
          700: "#1F344A",
          800: "#1A2B3C",
          900: "#0E1822"
        },
        // Muted Gold — premium tier accents (anchored at gold-500 = #D4AF37)
        gold: {
          50:  "#FAF4DD",
          100: "#F4E5AB",
          200: "#ECD478",
          300: "#E3C355",
          400: "#DBB942",
          500: "#D4AF37",
          600: "#B8932A",
          700: "#93761F",
          800: "#6E5814",
          900: "#4A3A0A"
        },
        // Success / Hygiene-status indicators (anchored at success-500 = #2ECC71)
        success: {
          50:  "#E8FAEE",
          100: "#BFF1D2",
          200: "#8FE5AE",
          300: "#5FD98A",
          400: "#46D27D",
          500: "#2ECC71",
          600: "#25A35B",
          700: "#1B7C45",
          800: "#12552F",
          900: "#082E19"
        },
        // Admin "control room" palette — dark by default. Scoped to /admin routes.
        admin: {
          bg:          "#0F172A",
          surface:     "#111827",
          "surface-2": "#1F2937",
          border:      "#334155",
          "border-2":  "#1E293B",
          accent:      "#00A896",
          ok:          "#10B981",
          warn:        "#F59E0B",
          danger:      "#EF4444",
          text:        "#F8FAFC",
          "text-mute": "#94A3B8",
          "text-dim":  "#64748B"
        }
        // Slate Grey #34495E is intentionally not redefined — Tailwind's default `slate-700`
        // (#334155) and `slate-600` (#475569) are within 3% of it; using the default scale
        // keeps semantic class names (text-slate-700, border-slate-200) intuitive.
      }
    }
  },
  plugins: []
};

export default config;
