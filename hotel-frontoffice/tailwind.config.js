/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'mobile': '320px',
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1440px',
        'wide': '1920px',
      },
      colors: {
        // You can add enterprise theme colors here
        primary: 'var(--color-primary, #0f172a)',
        secondary: 'var(--color-secondary, #334155)',
        accent: 'var(--color-accent, #3b82f6)',
        'text-main': 'var(--color-text-main, #1e293b)',
        'text-muted': 'var(--color-text-muted, #64748b)',
        'bg-main': 'var(--color-bg-main, #f8fafc)',
        'bg-card': 'var(--color-bg-card, #ffffff)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        'section': 'var(--spacing-section, 4rem)',
        'container': 'var(--spacing-container, 2rem)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          mobile: '1rem',
          tablet: '2rem',
          laptop: '4rem',
          desktop: '5rem',
          wide: '6rem',
        },
      }
    },
  },
  plugins: [],
}
