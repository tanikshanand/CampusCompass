/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      colors: {
        // Deep obsidian space-black shades
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#05070f', // Sleeker premium space-black
        },
        // Amethyst violet shades (replaces standard indigo)
        indigo: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#8b5cf6', // Royal violet
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#581c87',
          950: '#090518', // Premium deep violet-black
        },
      },
    },
  },
  plugins: [],
};
