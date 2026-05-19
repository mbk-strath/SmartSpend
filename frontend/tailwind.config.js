/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        burgundy: {
          DEFAULT: '#7c1d2e',
          deep: '#5c1420',
          light: '#9b2335',
        },
      },
    },
  },
  plugins: [],
}
