/** @type {import('tailwindcss').Config} */
module.exports = {
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
        primary: {
          50: '#999999',   // RGB 153 153 153
          100: '#858585',  // RGB 133 133 133
          200: '#717171',  // RGB 113 113 113
          300: '#5c5c5c',  // RGB 92 92 92
          400: '#484848',  // RGB 72 72 72
          500: '#333333',  // RGB 51 51 51
          600: '#1f1f1f',  // Base color - RGB 31 31 31
          700: '#141414',  // RGB 20 20 20
          800: '#030303',  // RGB 3 3 3
          900: '#000000',  // RGB 0 0 0
          DEFAULT: '#1f1f1f',
          hover: '#333333',
          pressed: '#141414',
        },
        text: {
          primary: '#1f1f1f',
          secondary: '#484848',
          tertiary: '#717171',
          placeholder: '#999999',
        },
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