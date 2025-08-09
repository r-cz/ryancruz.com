import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,html}'],
  theme: {
    extend: {
      colors: {
        // Airport signage color palette
        'airport-yellow': '#FFB612',
        'airport-blue': '#003F87',
        'airport-green': '#009639',
        'airport-red': '#D50032',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config