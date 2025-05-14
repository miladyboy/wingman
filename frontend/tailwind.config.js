/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
	  './src/**/*.{js,ts,jsx,tsx,mdx}',
	  './src/components/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
	  container: {
		center: true,
		padding: '2rem',
		screens: { '2xl': '1440px' },
	  },
	  extend: {
		/* ——— Typography ——— */
		fontFamily: {
		  sans: ['Inter', 'ui-sans-serif', 'system-ui'],
		  display: ['Playfair Display', 'serif'],   // elegant headings
		  mono: ['JetBrains Mono', 'monospace'],
		},
  
		/* ——— Shared radius ——— */
		borderRadius: {
		  lg: 'var(--radius)',
		  md: 'calc(var(--radius) - 2px)',
		  sm: 'calc(var(--radius) - 4px)',
		},
  
		/* ——— Color tokens (all via CSS vars) ——— */
		colors: {
		  royal: '#4B2996',   // Example purple
		  ivory: '#F8F7F4',   // Example off-white
		  luxe: '#CBA135',    // Example gold
		  border:      'hsl(var(--border))',
		  input:       'hsl(var(--input))',
		  ring:        'hsl(var(--ring))',
		  background:  'hsl(var(--background))',
		  foreground:  'hsl(var(--foreground))',
  
		  primary: {
			DEFAULT:   'hsl(var(--primary))',            // champagne accent
			foreground:'hsl(var(--primary-foreground))',
		  },
		  secondary: {
			DEFAULT:   'hsl(var(--secondary))',          // ivory cards
			foreground:'hsl(var(--secondary-foreground))',
		  },
		  muted: {
			DEFAULT:   'hsl(var(--muted))',
			foreground:'hsl(var(--muted-foreground))',
		  },
		  accent: {
			DEFAULT:   'hsl(var(--accent))',             // soft charcoal highlight
			foreground:'hsl(var(--accent-foreground))',
		  },
		  destructive: {
			DEFAULT:   'hsl(var(--destructive))',
			foreground:'hsl(var(--destructive-foreground))',
		  },
		  card: {
			DEFAULT:   'hsl(var(--card))',
			foreground:'hsl(var(--card-foreground))',
		  },
		  popover: {
			DEFAULT:   'hsl(var(--popover))',
			foreground:'hsl(var(--popover-foreground))',
		  },
		},
  
		/* ——— Radix accordion anims (shadcn) ——— */
		keyframes: {
		  'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
		  'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
		  'dot-pulse': {
			'0%, 80%, 100%': { opacity: '0.3' },
			'40%': { opacity: '1' },
		  },
		  'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
		},
		animation: {
		  'accordion-down': 'accordion-down 0.25s ease-out',
		  'accordion-up':   'accordion-up 0.25s ease-out',
		  'dot-pulse': 'dot-pulse 1.2s infinite ease-in-out',
		  'fade-in': 'fade-in 1s ease forwards',
		},
	  },
	},
	plugins: [
	  require('@tailwindcss/typography'),
	  require('@tailwindcss/forms'),
	],
  };
  