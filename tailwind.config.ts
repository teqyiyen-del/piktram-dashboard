import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        sidebar: '#121212',
        accent: '#FF6B35',
        muted: '#F7F7F7',
        'background-dark': '#121212',
        surface: '#FFFFFF',
        'surface-dark': '#1F1F1F'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}

export default config
