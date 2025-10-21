import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Phase 2+에서 사용
  theme: {
    extend: {
      /* ===== Colors (CSS Variables 사용) ===== */
      colors: {
        // Global
        "app-bg": "var(--app-background)",
        "main-bg": "var(--main-background)",
        "container-bg": "var(--container-background)",

        // LNB
        "lnb-bg": "var(--lnb-background)",
        "lnb-border": "var(--lnb-border)",
        "lnb-text": "var(--lnb-text)",
        "lnb-text-muted": "var(--lnb-text-muted)",
        "lnb-active-bg": "var(--lnb-active-bg)",
        "lnb-active-text": "var(--lnb-active-text)",
        "lnb-hover-bg": "var(--lnb-hover-bg)",

        // Text
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-link": "var(--text-link)",
        "text-error": "var(--text-error)",
        "text-success": "var(--text-success)",

        // Border
        "border-default": "var(--border-default)",
        "border-emphasis": "var(--border-emphasis)",
        "border-input": "var(--border-input)",
        "border-input-focus": "var(--border-input-focus)",

        // Primary
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
        },

        // Semantic
        success: {
          50: "var(--success-50)",
          500: "var(--success-500)",
          600: "var(--success-600)",
        },
        error: {
          50: "var(--error-50)",
          500: "var(--error-500)",
          600: "var(--error-600)",
        },
        warning: {
          50: "var(--warning-50)",
          500: "var(--warning-500)",
          600: "var(--warning-600)",
        },
        info: {
          50: "var(--info-50)",
          500: "var(--info-500)",
          600: "var(--info-600)",
        },

        // Icon backgrounds
        "icon-blue-bg": "var(--icon-blue-bg)",
        "icon-blue-fg": "var(--icon-blue-fg)",
        "icon-green-bg": "var(--icon-green-bg)",
        "icon-green-fg": "var(--icon-green-fg)",
        "icon-purple-bg": "var(--icon-purple-bg)",
        "icon-purple-fg": "var(--icon-purple-fg)",
        "icon-orange-bg": "var(--icon-orange-bg)",
        "icon-orange-fg": "var(--icon-orange-fg)",
      },

      /* ===== Spacing (rem 기반 - 8px 그리드) ===== */
      spacing: {
        lnb: "260px", // 고정
        hitl: "420px", // 고정
      },

      /* ===== Max Width (화면 크기별) ===== */
      maxWidth: {
        chat: "800px", // 기본
        "chat-wide": "1000px", // 1920px+
        portfolio: "1200px",
        "portfolio-wide": "1400px",
        artifacts: "1200px",
        "artifacts-wide": "1400px",
        mypage: "900px",
      },

      /* ===== Font Size (rem 기반) ===== */
      fontSize: {
        display: ["2rem", { lineHeight: "1.25", letterSpacing: "-0.02em" }], // 32px
        h1: ["1.75rem", { lineHeight: "1.29", letterSpacing: "-0.02em" }], // 28px
        h2: ["1.5rem", { lineHeight: "1.33", letterSpacing: "-0.02em" }], // 24px
        h3: ["1.25rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }], // 20px
        h4: ["1.125rem", { lineHeight: "1.33", letterSpacing: "-0.01em" }], // 18px
        "body-lg": ["1rem", { lineHeight: "1.5" }], // 16px
        body: ["0.9375rem", { lineHeight: "1.47" }], // 15px
        "body-sm": ["0.875rem", { lineHeight: "1.43" }], // 14px
        caption: ["0.8125rem", { lineHeight: "1.38" }], // 13px
        "caption-xs": ["0.75rem", { lineHeight: "1.33" }], // 12px
      },

      /* ===== Font Weight ===== */
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },

      /* ===== Border Radius (rem 기반) ===== */
      borderRadius: {
        sm: "0.375rem", // 6px
        DEFAULT: "0.5rem", // 8px
        md: "0.5rem", // 8px
        lg: "0.75rem", // 12px
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
        full: "9999px",
      },

      /* ===== Box Shadow ===== */
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
      },

      /* ===== Z-Index ===== */
      zIndex: {
        base: "0",
        lnb: "10",
        "chat-input": "20",
        dropdown: "30",
        "hitl-panel": "50",
        modal: "100",
        toast: "9999",
      },

      /* ===== Transitions ===== */
      transitionDuration: {
        "150": "150ms",
        "200": "200ms",
        "300": "300ms",
        "500": "500ms",
      },
      transitionTimingFunction: {
        "ease-out": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
        "ease-in-out-cubic": "cubic-bezier(0.645, 0.045, 0.355, 1.000)",
        "ease-out-expo": "cubic-bezier(0.190, 1.000, 0.220, 1.000)",
      },

      /* ===== Animation ===== */
      keyframes: {
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "toast-in": {
          "0%": { transform: "translateY(-16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 300ms ease-in-out-cubic",
        "slide-out-right": "slide-out-right 200ms ease-in-out-cubic",
        "fade-in": "fade-in 200ms ease-out",
        "toast-in": "toast-in 200ms ease-out",
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
