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
    extend: {
      colors: {
        // Arka plan & foreground
        background: '#FFFFFF',
        'background-dark': '#121212',

        foreground: '#000000',
        'foreground-dark': '#F5F5F7',

        // Accent (marka rengi)
        accent: '#FF5E4A',
        'accent-dark': '#e44a39',

        // Muted tonlar
        muted: '#F5F5F7',
        'muted-dark': '#0f0f10',
        'muted-foreground': '#6B7280',

        // Surface (kartlar, bloklar)
        surface: '#FFFFFF',
        'surface-dark': '#1A1A1D',

        // Border
        border: '#E5E7EB',
      },
      boxShadow: {
        'brand-sm': '0 12px 25px -10px rgba(255, 94, 74, 0.35)',
        'brand-card': '0 24px 45px -30px rgba(15, 23, 42, 0.35)',
      },
      borderRadius: {
        xl: '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // spacing default zaten var, ama ek özel değer gerekiyorsa bırakabilirsin
      spacing: {
        xs: '0.5rem',   // 8px
        sm: '1rem',     // 16px
        md: '1.5rem',   // 24px
        lg: '2rem',     // 32px
        xl: '3rem',     // 48px
        '2xl': '4rem',  // 64px
      },
    },
  },
  plugins: [],
}

export default config
