import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			'button-gradient': 'linear-gradient(90deg, rgba(8, 69, 69, 1) 0%, rgba(24, 154, 147, 1) 100%)'
  		},
  		fontFamily: {
  			nunito: [
  				'Nunito',
  				'sans-serif'
  			],
  			heading: [
  				'var(--font-heading)',
  				'ui-sans-serif',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI Variable Display',
  				'Segoe UI',
  				'Helvetica',
  				'Apple Color Emoji',
  				'Arial',
  				'sans-serif',
  				'Segoe UI Emoji',
  				'Segoe UI Symbol',
  				'Noto Color Emoji'
  			],
  			mono: [
  				'var(--font-mono)',
  				...require("tailwindcss/defaultTheme").fontFamily.mono
  			],
  			sans: [
  				'var(--font-sans)',
  				'ui-sans-serif',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI Variable Display',
  				'Segoe UI',
  				'Helvetica',
  				'Apple Color Emoji',
  				'Arial',
  				'sans-serif',
  				'Segoe UI Emoji',
  				'Segoe UI Symbol',
  				'Noto Color Emoji'
  			]
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				'50': '#e6ecec',
  				'100': '#b2c5c5',
  				'200': '#8da9a9',
  				'300': '#5a8282',
  				'400': '#396a6a',
  				'500': '#084545',
  				'600': '#073f3f',
  				'700': '#063131',
  				'800': '#042626',
  				'900': '#031d1d',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#e8f5f4',
  				'100': '#b7e0de',
  				'200': '#95d1cd',
  				'300': '#64bbb7',
  				'400': '#46aea9',
  				'500': '#189a93',
  				'600': '#168c86',
  				'700': '#116d68',
  				'800': '#0d5551',
  				'900': '#0a413e',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent1: {
  				'50': '#fffefc',
  				'100': '#fffdf6',
  				'200': '#fffbf2',
  				'300': '#fefaec',
  				'400': '#fef9e8',
  				'500': '#fef7e2',
  				'600': '#e7e1ce',
  				'700': '#b4afa0',
  				'800': '#8c887c',
  				'900': '#6b685f',
  				DEFAULT: 'hsl(var(--accent1))',
  				foreground: 'hsl(var(--accent1-foreground))'
  			},
  			accent2: {
  				'50': '#fcfcff',
  				'100': '#f6f7fe',
  				'200': '#f2f3fe',
  				'300': '#eceefe',
  				'400': '#e8eafd',
  				'500': '#e2e5fd',
  				'600': '#ced0e6',
  				'700': '#a0a3b4',
  				'800': '#7c7e8b',
  				'900': '#5f606a',
  				DEFAULT: 'hsl(var(--accent1))',
  				foreground: 'hsl(var(--accent1-foreground))'
  			},
  			info: {
  				'50': '#ebf3fe',
  				'100': '#c2d8fc',
  				'200': '#a5c6fb',
  				'300': '#7caef9',
  				'400': '#6298f8',
  				'500': '#3b82f6',
  				'600': '#3767e0',
  				'700': '#2c52ca',
  				'800': '#2342b7',
  				'900': '#19367f',
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))'
  			},
  			error: {
  				'50': '#fdecec',
  				'100': '#fac5c5',
  				'200': '#f8a9a9',
  				'300': '#f48282',
  				'400': '#f26869',
  				'500': '#ef4444',
  				'600': '#d93e3e',
  				'700': '#a33030',
  				'800': '#832525',
  				'900': '#641d1d',
  				DEFAULT: 'hsl(var(--error))',
  				foreground: 'hsl(var(--error-foreground))'
  			},
  			success: {
  				'50': '#e9f9ef',
  				'100': '#bae6dc',
  				'200': '#99d4b5',
  				'300': '#6bbd93',
  				'400': '#4ed17e',
  				'500': '#22c55e',
  				'600': '#1fb36c',
  				'700': '#18c843',
  				'800': '#13ac34',
  				'900': '#0e5327',
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			neutral1: {
  				'50': '#f4f4f5',
  				'100': '#e4e4e7',
  				'200': '#d4d4d8',
  				'300': '#a1a1aa',
  				'400': '#71717a',
  				'500': '#52525b',
  				'600': '#3f3f46',
  				'700': '#27272a',
  				'800': '#18181b',
  				'900': '#0f0f11',
  				DEFAULT: 'hsl(var(--neutral))',
  				foreground: 'hsl(var(--neutral-foreground))'
  			},
  			neutral2: {
  				'50': '#f4f4f5',
  				'100': '#e4e4e7',
  				'200': '#d4d4d8',
  				'300': '#a1a1aa',
  				'400': '#71717a',
  				'500': '#52525b',
  				'600': '#3f3f46',
  				'700': '#27272a',
  				'800': '#18181b',
  				'900': '#0f0f11',
  				DEFAULT: 'hsl(var(--neutral2))',
  				foreground: 'hsl(var(--neutral2-foreground))'
  			},
  			warning: {
  				'50': '#f7f3e8',
  				'100': '#fdf1b8',
  				'200': '#fce190',
  				'300': '#fcd364',
  				'400': '#fcbd3a',
  				'500': '#faa21c',
  				'600': '#db8707',
  				'700': '#b66b00',
  				'800': '#8c5100',
  				'900': '#623900',
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
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
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))',
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: '#F8F8F9',
  				accent: '#084545',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))',
  				'primary-foreground': '#545454',
  				'accent-foreground': '#FDFEFE'
  			},
  			brand: {
  				DEFAULT: 'hsl(var(--brand))',
  				foreground: 'hsl(var(--brand-foreground))'
  			},
  			highlight: {
  				DEFAULT: 'hsl(var(--highlight))',
  				foreground: 'hsl(var(--highlight-foreground))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			fadeIn: {
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'animate-fade-in': 'fadeIn 0.3s ease'
  		}
  	}
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar-hide")],
} satisfies Config;
