// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    // 💡 container'ı merkezleyelim ve padding'i fluid yapalım
    container: {
      center: true,
      padding: 'clamp(16px, 1.8vw, 32px)',
    },
    extend: {
      // 💡 DAHA BÜYÜK BREAKPOINT'LER
      screens: {
        '3xl': '1920px',
        '4xl': '2560px', // 4K
        '5xl': '3200px', // 5K civarı (yatay)
      },
      colors: {
        background: '#FFFFFF',
        'background-dark': '#121212',
        foreground: '#000000',
        'foreground-dark': '#F5F5F7',
        accent: '#FF5E4A',
        'accent-dark': '#e44a39',
        muted: '#F5F5F7',
        'muted-dark': '#0f0f10',
        'muted-foreground': '#6B7280',
        surface: '#FFFFFF',
        'surface-dark': '#1A1A1D',
        border: '#E5E7EB',
      },
      boxShadow: {
        brand: '0 12px 25px -10px rgba(255, 94, 74, 0.35)',
        card: '0 24px 45px -30px rgba(15, 23, 42, 0.35)',
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        section: '2rem',
        card: '1.5rem',
        headerX: '2rem',
        headerY: '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
