/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        reposcan: {
          bg: '#0a0a0a',
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#6b7280',
        },
      },
    },
  },
  plugins: [],
};
