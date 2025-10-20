import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontWeight: {
        // Design system: use one level thinner
        // Bold -> Semibold (600), Semibold -> Medium (500)
        medium: '500',
        semibold: '600',
        bold: '600', // Bold should be Semibold
      },
      letterSpacing: {
        tight: '-0.025em', // For titles >20px
      },
    },
  },
  plugins: [],
};

export default config;
