/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(0 0% 7%)",
        foreground: "hsl(0 0% 98%)",
        primary: {
          DEFAULT: "hsl(180 100% 50%)",
          foreground: "hsl(0 0% 7%)",
        },
        border: "hsl(0 0% 20%)",
        input: "hsl(0 0% 20%)",
        ring: "hsl(180 100% 50%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

