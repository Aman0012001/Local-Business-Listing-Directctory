import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#004a99',
                    50: '#f0f4ff',
                    100: '#e0e9ff',
                    200: '#c2d4ff',
                    300: '#94b4ff',
                    400: '#5c8aff',
                    500: '#004a99', // Brand Blue
                    600: '#003c7d',
                    700: '#002e61',
                    800: '#002145',
                    900: '#001429',
                },
                accent: {
                    DEFAULT: '#ff7a00',
                    50: '#fff4e6',
                    100: '#ffe9cc',
                    500: '#ff7a00', // Accent Orange
                    600: '#e66e00',
                },
                surface: {
                    DEFAULT: '#faf8ff',
                    bright: '#ffffff',
                },
                "on-surface": '#131b2e',
            },
            fontFamily: {
                sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Helvetica", "Arial", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};
export default config;
