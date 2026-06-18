/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope', 'Amiri', 'Noto Naskh Arabic', 'Work Sans', 'system-ui', 'sans-serif'],
                display: ['Manrope', 'Amiri', 'Noto Naskh Arabic', 'sans-serif'],
                arabic: ['Amiri', 'Noto Naskh Arabic', 'serif'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 4px)',
                sm: 'calc(var(--radius) - 8px)'
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                brand: {
                    50:  '#E6F7F7',
                    100: '#CCEFEF',
                    200: '#99DFDF',
                    300: '#5FCDD0',
                    400: '#2DBFC3',
                    500: '#0FB5BA',
                    600: '#0D9FA3',
                    700: '#0B7F82',
                    800: '#085B5E',
                    900: '#053D3F'
                },
                pomegranate: {
                    50:  '#FBEEF0',
                    100: '#F3D2D7',
                    200: '#E2A5AE',
                    300: '#CC6E7C',
                    400: '#A93D4F',
                    500: '#8B1E2E',
                    600: '#741624',
                    700: '#5C111C',
                    800: '#420B14',
                    900: '#2E060D'
                },
                cyan: {
                    50:  '#E0F7FA',
                    100: '#B2EBF2',
                    200: '#80DEEA',
                    300: '#4DD0E1',
                    400: '#26C6DA',
                    500: '#00BCD4',
                    600: '#00ACC1',
                    700: '#0097A7',
                    800: '#00838F',
                    900: '#006064'
                },
                cacao: {
                    50:  '#FAF3EC',
                    100: '#F0E0CE',
                    200: '#E0BFA0',
                    300: '#C99B71',
                    400: '#A87344',
                    500: '#7B5232',
                    600: '#5C3B23',
                    700: '#432B19',
                    800: '#2E1D10',
                    900: '#1A0F08'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
