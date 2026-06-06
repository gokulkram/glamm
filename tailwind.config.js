/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F5',
        charcoal: '#2C2C2C',
        'charcoal-dark': '#1a1a1a',
        rose: '#B76E79',
        gold: '#C9B5A0',
        // Primary colors used throughout the site
        accent: '#f68961',
        'accent-dark': '#e07750',
        text: '#2C2C2C',
        'text-muted': '#6B6B6B',
        background: '#FAF8F5',
        surface: '#F5F0EB',
        border: '#EAE3D9',
      },
    },
  },
  plugins: [],
}

