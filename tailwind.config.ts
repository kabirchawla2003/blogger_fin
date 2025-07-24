import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'earth-green': {
          50: '#f6f8f6',
          100: '#e3e8e3',
          200: '#c7d2c7',
          300: '#9fb3a0',
          400: '#728c74',
          500: '#556b57',
          600: '#415344',
          700: '#354338',
          800: '#2c362f',
          900: '#252d27',
        },
        'organic-brown': {
          50: '#faf8f5',
          100: '#f2ede6',
          200: '#e6d8c8',
          300: '#d4bfa4',
          400: '#c0a082',
          500: '#a68566',
          600: '#8f6f56',
          700: '#785a49',
          800: '#624a3e',
          900: '#513d33',
        },
        'warm-cream': '#fefcf7',
        'sage': '#9caf88',
        'terracotta': '#c1705a',
      },
      fontFamily: {
        'serif': ['Crimson Text', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
