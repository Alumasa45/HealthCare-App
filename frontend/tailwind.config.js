/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Purple Theme
        'light-purple': {
          50: '#faf7ff',
          100: '#f3ebff',
          200: '#e9d9ff',
          300: '#d6bbff',
          400: '#be93ff',
          500: '#a663ff',
          600: '#9333ea',
          700: '#7c2cd6',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Custom Healthcare Purple Palette
        'healthcare': {
          50: '#f8f6ff',
          100: '#f0ebff',
          200: '#e3d9ff',
          300: '#d1b8ff',
          400: '#b993ff',
          500: '#9f5eff',
          600: '#8b39f5',
          700: '#7c2ed9',
          800: '#6827b8',
          900: '#542296',
        },
        // Soft accent colors
        'soft-purple': '#e6e0f8',
        'feather-purple': '#d1c7e8',
        'gentle-lavender': '#f5f3ff',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'drift-left': 'driftLeft 15s linear infinite',
        'drift-right': 'driftRight 12s linear infinite',
        'feather-float': 'featherFloat 10s ease-in-out infinite',
        'gentle-sway': 'gentleSway 7s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0.7' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)', opacity: '1' },
        },
        driftLeft: {
          '0%': { transform: 'translateX(100vw) translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(-100px) translateY(-100px) rotate(360deg)', opacity: '0' },
        },
        driftRight: {
          '0%': { transform: 'translateX(-100px) translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(100vw) translateY(-100px) rotate(-360deg)', opacity: '0' },
        },
        featherFloat: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-15px) translateX(10px) rotate(90deg)' },
          '50%': { transform: 'translateY(-30px) translateX(-5px) rotate(180deg)' },
          '75%': { transform: 'translateY(-10px) translateX(-15px) rotate(270deg)' },
        },
        gentleSway: {
          '0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
          '25%': { transform: 'translateX(10px) rotate(5deg)' },
          '50%': { transform: 'translateX(-5px) rotate(-3deg)' },
          '75%': { transform: 'translateX(-10px) rotate(-5deg)' },
        },
      },
      backgroundImage: {
        'light-purple-gradient': 'linear-gradient(135deg, #faf7ff 0%, #f3ebff 50%, #e9d9ff 100%)',
        'healthcare-gradient': 'linear-gradient(135deg, #f8f6ff 0%, #f0ebff 50%, #e3d9ff 100%)',
      },
    },
  },
  plugins: [],
}
