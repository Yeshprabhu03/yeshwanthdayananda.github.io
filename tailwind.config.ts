import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0f172a',
        accent: '#22c55e',
        muted: '#94a3b8',
      },
      boxShadow: {
        floating: '0 20px 60px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
