/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: "true",
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        conversation: "hsl(var(--conversation))",
        recording: "hsl(var(--recording))",
        blue: "hsl(var(--blue))",
        audios: "hsl(var(--audios))",
        success: "hsl(var(--success))",
        modal: "hsl(var(--modal))",
        "alert-40": "hsl(var(--alert-40))",
        "alert-60": "hsl(var(--alert-60))",
        "alert-90": "hsl(var(--alert-90))",
        "alert-95": "hsl(var(--alert-95))",
        "gray-35": "hsl(var(--gray-35))",
        "gray-52": "hsl(var(--gray-52))",
        "gray-92": "hsl(var(--gray-92))",
        "gray-97": "hsl(var(--gray-97))",
        "gray-98": "hsl(var(--gray-98))",
        thumb: "hsl(var(--thumb))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        wave: {
          "0%, 60%, 100%": {
            transform: "rotate(17deg)",
          },
          "7.5%, 22.5%, 37.5%, 52.5%": {
            transform: "rotate(54deg)",
          },
          "15%, 30%, 45%": {
            transform: "rotate(24deg)",
          },
          "3.75%, 18.75%, 33.75%, 48.75%": {
            transform: "rotate(27deg)",
          },
          "11.25%, 26.25%, 41.25%, 56.25%": {
            transform: "rotate(51deg)",
          },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
        "pause-pulse": {
          "0%": {
            transform: 'scale(1)',
          },
          "50%": {
            transform: 'scale(1.05)',
          },
          "100%": {
            transform: 'scale(1)',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        wave: "wave 2.5s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
        "pause-pulse": "pause-pulse 0.6s infinite",
      },
      boxShadow: {
        default: "0 0 12px 4px",
        blue: "0px 0px 32px 0px hsla(209, 96%, 51%, 0.5)",
        success: "0 0 12px 4px hsl(var(--success))",
        button: "0px 4px 16px 0px hsla(115, 56%, 38%, 0.15)",
        switch: "0 0 8px rgba(255, 255, 255, 0.5)"
      },
      fontFamily: {
        sans: ["Hiragino Sans W3", ...defaultTheme.fontFamily.sans],
      },
      transitionProperty: {
        height: "height",
        width: "width",
      },
      transitionDuration: {
        "10s": "10000ms",
      },
      backgroundImage: {
        "gradient-lime-100":
          "linear-gradient(227.98deg, #FCFF7C 0%, #86FF7B 100%)",
        "gradient-lime-25":
          "linear-gradient(227.98deg, rgba(252, 255, 124, 0.25) 0%, rgba(134, 255, 123, 0.25) 100%)",
      },
      listStyleType: {
        square: "square",
        circle: "circle",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
