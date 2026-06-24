/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#030712',
          card: '#111827',
          accent: '#2563EB',
          hover: '#3B82F6',
          border: '#1E293B',
        },
      },
      backgroundColor: {
        dark: {
          primary: '#030712',
          secondary: '#111827',
          tertiary: '#1F2937',
        },
      },
      textColor: {
        dark: {
          primary: '#F1F5F9',
          secondary: '#CBD5E1',
          tertiary: '#94A3B8',
        },
      },
      borderColor: {
        dark: '#1E293B',
      },
    },
  },
  plugins: [],
};
