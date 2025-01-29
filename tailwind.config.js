const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './docs/**/*.{md,mdx,tsx}', './tutorial/**/*.{md,mdx,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [],
};
