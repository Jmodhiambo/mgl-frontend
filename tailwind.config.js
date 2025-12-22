/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './apps/**/*.{js,ts,jsx,tsx}',    // All files in apps (user, organizer, admin)
        './shared/**/*.{js,ts,jsx,tsx}'   // All shared components, hooks, etc.
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};