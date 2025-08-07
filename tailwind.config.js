/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        blue: {
          500: '#0EA5E9',
          600: '#0284C7',
        },
        cyan: {
          500: '#06B6D4',
          600: '#0891B2',
        },
        emerald: {
          500: '#10B981',
        },
        green: {
          500: '#22C55E',
          400: '#4ADE80',
        },
        yellow: {
          400: '#FACC15',
        },
      },
      backdropBlur: {
        'xl': '24px',
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};