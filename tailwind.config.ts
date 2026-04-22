import { Config } from 'tailwindcss';

const config: Config = {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './docs/**/*.{md,mdx,tsx}', './tutorial/**/*.{md,mdx,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};

export default config;
