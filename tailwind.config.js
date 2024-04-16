/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            backgroundImage: {
                'letterBackground': "url('/assets/letter_bg.png')",
                'letterBackground-White': "linear-gradient(rgba(255, 255, 255, 0.6),rgba(255, 255, 255, 0.6)), url('/assets/letter_bg.png')",
                'letterBackground-Green': "linear-gradient(rgba(164, 229, 147, 0.6),rgba(164, 229, 147, 0.6)), url('/assets/letter_bg.png')",
                'letterBackground-Yellow': "linear-gradient(rgba(254, 251, 146, 0.6),rgba(254, 251, 146, 0.6)), url('/assets/letter_bg.png')",
            }
        },
    },
    plugins: [
        require('tailwind-scrollbar-hide'),
        require('tailwind-extended-shadows')
    ],
}

