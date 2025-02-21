/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        background: '#f7f7f7',
        gray: {
          50: '#7A7A7A',   // 50% black
          100: '#666666',  // 100
          200: '#525252',  // 200
          300: '#3D3D3D',  // 300
          400: '#292929',  // 400
          500: '#141414',  // 500
          600: '#000000',  // 600
          700: '#000000',  // 700
          800: '#000000',  // 800
          900: '#000000',  // 900
        }
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            'h2': {
              color: theme('colors.gray.300'),
            },
            'p': {
              color: theme('colors.gray.200'),
            },
            'li': {
              color: theme('colors.gray.200'),
            },
            'sub': {
              color: theme('colors.gray.100'),
            },
            'sup': {
              color: theme('colors.gray.100'),
            },
          },
        },
        purple: {
          css: {
            '--tw-prose-body': theme('colors.gray.200'),
            '--tw-prose-headings': theme('colors.gray.300'),
            '--tw-prose-lead': theme('colors.gray.200'),
            '--tw-prose-links': theme('colors.gray.300'),
            '--tw-prose-bold': theme('colors.gray.300'),
            '--tw-prose-counters': theme('colors.gray.200'),
            '--tw-prose-bullets': theme('colors.gray.100'),
            '--tw-prose-hr': theme('colors.gray.100'),
            '--tw-prose-quotes': theme('colors.gray.300'),
            '--tw-prose-quote-borders': theme('colors.gray.100'),
            '--tw-prose-captions': theme('colors.gray.200'),
            '--tw-prose-code': theme('colors.gray.300'),
            '--tw-prose-pre-code': theme('colors.gray.50'),
            '--tw-prose-pre-bg': theme('colors.gray.300'),
            '--tw-prose-th-borders': theme('colors.gray.100'),
            '--tw-prose-td-borders': theme('colors.gray.50'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 