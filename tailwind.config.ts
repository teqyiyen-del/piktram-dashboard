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
        brand: '0 12px 25px -10px rgba(255, 94, 74, 0.35)', // header & accent areas
        card: '0 24px 45px -30px rgba(15, 23, 42, 0.35)',   // cards & modals
      },
      borderRadius: {
        lg: '0.75rem',   // 12px → butonlar, inputlar
        xl: '1rem',      // 16px → cardlar
        '2xl': '1.5rem', // 24px → büyük header / section
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        section: '2rem',     // 32px → section gap
        card: '1.5rem',      // 24px → card padding
        headerX: '2rem',     // 32px → header yatay padding
        headerY: '1.5rem',   // 24px → header dikey padding
      },
    },
  },
  plugins: [],
}

export default config
