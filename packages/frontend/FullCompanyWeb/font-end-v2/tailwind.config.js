/** @type {import('tailwindcss').Config} */
const plugin=require("tailwindcss/plugin");
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#3b82f6",
                    600: "#2563eb",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                },
            },
        },
        fontFamily: {
            body: [
                "Source Sans Pro",
                "ui-sans-serif",
                "system-ui",
                "-apple-system",
                "system-ui",
                "Segoe UI",
                "Roboto",
                "Helvetica Neue",
                "Arial",
                "Noto Sans",
                "sans-serif",
                "Apple Color Emoji",
                "Segoe UI Emoji",
                "Segoe UI Symbol",
                "Noto Color Emoji",
            ],
            sans: [
                "Source Sans Pro",
                "ui-sans-serif",
                "system-ui",
                "-apple-system",
                "system-ui",
                "Segoe UI",
                "Roboto",
                "Helvetica Neue",
                "Arial",
                "Noto Sans",
                "sans-serif",
                "Apple Color Emoji",
                "Segoe UI Emoji",
                "Segoe UI Symbol",
                "Noto Color Emoji",
            ],
            yahei:[ "Microsoft YaHei", "微软雅黑", "SimHei",'Helvetica', 'Arial', 'sans-serif',"Monaco"],
        },
    },
    corePlugins: {
        preflight: true,
    },
    plugins: [
        // require('@tailwindcss/forms'),
        plugin(function ({ addComponents, theme }) {
            addComponents({
              '.will-change-trans': { // `will-change-transform` is now included in Tailwind CSS 3.0 so using alternative class name for this example
                willChange: 'transform'
              },
              '.ease': {
                transition: 'ease'
              },
            })
          })
    ],
};
