import type { Config } from "tailwindcss";

export default {
    content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontSize: {
                xxs: "0.6rem",
                xs: "0.7rem",
                sm: "0.8rem",
                md: "0.9rem",
                base: "1rem",
                xl: "1.25rem",
                "2xl": "1.563rem",
                "3xl": "1.953rem",
                "4xl": "2.441rem",
                "5xl": "3.052rem",
            },
            colors: {
                primary: "#0f62fe",
                tree: "#fff",
                popover: "#f8f8f8",
                "popover-foreground": "#000",
                tooltip: "#000000",
                "tooltip-foreground": "#ffffff",
                secondary: "#e3e3e3",
                "primary-foreground": "#fff",
                error: "#e53e3e",
                "error-foreground": "#fff",
                success: "#38a169",
                "success-600": "#2f855a",
                warning: "#ed8936",
                "warning-600": "#b7791f",
                info: "#3182ce",
                "info-600": "#2c5282",
                background: "#fff",
                // ...
            },
            borderRadius: {
                none: "0",
                sm: "0.125rem",
                DEFAULT: "0.25rem",
                md: "0.275rem",
                lg: "0.375rem",
                full: "9999px",
                large: "12px",
            },
            fontFamily: {
                sans: ["ui-sans-serif", "system-ui", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
            },
        },
    },
    plugins: [],
} satisfies Config;
