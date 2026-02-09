import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                luminea: {
                    50: '#f8f7ff',
                    100: '#f0eefe',
                    200: '#e1dcfd',
                    300: '#d2cbfc',
                    400: '#b3a9f7',
                    500: '#9487f3',
                    600: '#764ba2',
                    700: '#667eea',
                    800: '#554da2',
                    900: '#443b7f',
                },
                feedora: {
                    50: '#fff5f5',
                    100: '#ffe3e3',
                    200: '#ffcac9',
                    300: '#ffa7a5',
                    400: '#ff8581',
                    500: '#FF6F61', // Couleur principale
                    600: '#e65549',
                    700: '#cc3f33',
                    800: '#a82f24',
                    900: '#8a241a',
                },
            },
            backgroundImage: {
                'luminea-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'feedora-gradient': 'linear-gradient(135deg, #FF6F61 0%, #e65549 100%)',
            },
        },
    },

    plugins: [forms],
};
