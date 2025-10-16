/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CALMA TECH Brand Colors
        primary: {
          DEFAULT: '#5271B4',
          dark: '#3D5389',
          light: '#A8D5E2',
        },
        mint: '#8BC5BC',
        beige: '#E8D5D3',
        gray: {
          light: '#E5E5E5',
          text: '#6B6B6B',
          dark: '#2C2C2C',
        }
      },
      borderRadius: {
        'input': '24px',
        'card': '12px',
        'button': '8px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontSize: {
        'title': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'subtitle': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
      }
    },
  },
  plugins: [],
}
