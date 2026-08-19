/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF7F2',  // warm off-white background
          100: '#F5EFE6', // warm secondary background
          200: '#E6DDD0', // clean warm border
          300: '#D5C9B8', // defined warm border
          400: '#C2B4A1',
        },
        terracotta: {
          50: '#FAF2EE',
          100: '#F4E5DE',
          200: '#E7C8BB',
          300: '#D9AA98',
          400: '#C27B66',
          500: '#A4533E',
          600: '#8C4331',
          700: '#753424', // deep rich mahogany terracotta
          800: '#5C2619',
          900: '#451B11',
        },
        sage: {
          50: '#F5F6F0',
          100: '#EAECE0',
          200: '#D5D9C1',
          300: '#BFC5A2',
          400: '#9BA378',
          500: '#7D8658',
          600: '#646D42',
          700: '#4C5430',
        },
        charcoal: {
          950: '#181614', // deep espresso charcoal for headings & high-contrast titles
          900: '#231F1C', // primary text
          800: '#38332E', // high contrast buttons
          700: '#4D4640', // rich secondary text
          600: '#635B53',
          500: '#7A7167',
          400: '#998F84',
          300: '#BFB5A8',
          200: '#D5C9B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'ambient': '0 2px 10px rgba(24, 22, 20, 0.05)',
        'ambient-hover': '0 8px 24px rgba(24, 22, 20, 0.09)',
        'ambient-modal': '0 20px 48px rgba(24, 22, 20, 0.14)',
      },
      letterSpacing: {
        'editorial': '0.04em',
        'caps': '0.08em',
      }
    },
  },
  plugins: [],
}
