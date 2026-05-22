/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#030D2A',
          900: '#071A4B',
          800: '#0B2870',
          700: '#1A3A8A',
          600: '#2052A8',
          500: '#2E6ACC',
        },
        brand: {
          red:  '#CC2936',
          blue: '#3B9EFF',
        },
      },
      animation: {
        'spin-slow': 'spin 1.8s linear infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
