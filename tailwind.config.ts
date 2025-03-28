import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'chat-bg': '#1a1b1e',
        'chat-sidebar': '#202123',
        'chat-input': '#2a2b32',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'rgb(52, 53, 65)',
            a: {
              color: '#16B981',
              '&:hover': {
                color: '#0F9868',
              },
            },
            pre: {
              backgroundColor: '#f3f4f6',
              color: '#1f2937',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
            },
            code: {
              color: '#1f2937',
              backgroundColor: '#f3f4f6',
              padding: '0.25rem',
              borderRadius: '0.25rem',
              border: '1px solid #e5e7eb',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
}

export default config 