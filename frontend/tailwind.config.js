/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-bg': '#F5F5F5',
                'primary-btn': '#2D3748',
                'secondary': '#4A5568',
                'accent': '#718096',
            }
        },
    },
    plugins: [],
}
