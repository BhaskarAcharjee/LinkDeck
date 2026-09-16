/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        deck: {
          bg: {
            DEFAULT: '#0B0D13',
            card: '#121620',
            elevated: '#171C28',
            hover: '#1D2333',
            border: '#242C3E',
            borderLight: '#323D54'
          },
          cyan: {
            DEFAULT: '#06B6D4',
            glow: 'rgba(6, 182, 212, 0.25)',
            dim: '#0891B2'
          },
          violet: {
            DEFAULT: '#8B5CF6',
            glow: 'rgba(139, 92, 246, 0.25)',
            dim: '#7C3AED'
          },
          amber: {
            DEFAULT: '#F59E0B',
            dim: '#D97706'
          },
          emerald: {
            DEFAULT: '#10B981',
            dim: '#059669'
          }
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Cascadia Code',
          'Consolas',
          'monospace'
        ]
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'glow-violet': '0 0 20px -3px rgba(139, 92, 246, 0.35)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.6)'
      }
    },
  },
  plugins: [],
}
