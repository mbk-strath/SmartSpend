/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        obsidian: {
          950: '#080a0f',
          900: '#0d1117',
          800: '#131920',
          700: '#1a2230',
          600: '#212d3d',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        coral: {
          400: '#fb7185',
          500: '#f43f5e',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}
