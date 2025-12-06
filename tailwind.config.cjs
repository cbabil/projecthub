module.exports = {
  content: ['./src/renderer/**/*.{tsx,ts,jsx,js,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: { dark: 'var(--color-bg-dark)', light: 'var(--color-bg-light)' },
          surface: { dark: 'var(--color-surface-dark)', light: 'var(--color-surface-light)' },
          text: { dark: 'var(--color-text-dark)', light: 'var(--color-text-light)' },
          accent: {
            primary: 'var(--color-accent-primary)',
            boost: 'var(--color-accent-boost)',
            blue: 'var(--color-accent-blue)',
            green: 'var(--color-accent-green)',
            red: 'var(--color-accent-red)'
          },
          divider: 'var(--color-divider)'
        }
      }
    }
  },
  plugins: []
};
