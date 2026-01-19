import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./steps/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#0066cc",
                "primary-dark": "#0052a3",
                "background-light": "#f5f7f8",
                "background-dark": "#0f1923",
                "surface-light": "#ffffff",
                "surface-dark": "#1e293b",
                "border-light": "#e2e8f0",
                "border-dark": "#334155",
            },
            fontFamily: {
                "display": ["Public Sans", "sans-serif"]
            }
        },
    },
    plugins: [
        forms,
        containerQueries,
    ],
}
