import { type ButtonRadius, type ButtonStyle } from '../types'
import { generateButtonStyleCSS } from './generate-button-styles'
import { generateColorShades } from './generate-color-shades'

interface TailwindConfig {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  headingFont: string
  bodyFont: string
  monoFont: string
  borderRadius?: string
  spacing?: string
  buttonStyle?: ButtonStyle
  buttonRadius?: ButtonRadius
  primaryShades?: Record<string, string>
  secondaryShades?: Record<string, string>
  accentShades?: Record<string, string>
  primaryShade?: string
  secondaryShade?: string
  accentShade?: string
}

export function generateTailwindV4CSS(config: TailwindConfig): string {
  // Use provided shade maps or generate them
  const primaryShades = config.primaryShades || generateColorShades(config.primaryColor)
  const secondaryShades = config.secondaryShades || generateColorShades(config.secondaryColor)
  const accentShades =
    config.accentShades || (config.accentColor ? generateColorShades(config.accentColor) : {})

  // Get the base colors from selected shades or defaults
  const primaryBaseShade = config.primaryShade || '500'
  const secondaryBaseShade = config.secondaryShade || '500'
  const accentBaseShade = config.accentShade || '500'

  // Use the selected shade value as the base color
  const primaryBase = primaryShades[primaryBaseShade] || config.primaryColor
  const secondaryBase = secondaryShades[secondaryBaseShade] || config.secondaryColor
  const accentBase = accentShades[accentBaseShade] || config.accentColor || '#f471b5'

  // Generate button style CSS based on selected style
  const buttonStyleCSS = generateButtonStyleCSS(
    config.buttonStyle || 'default',
    primaryBase, // Use selected shade as base color
    secondaryBase, // Use selected shade as base color
    config.buttonRadius,
  )

  // Define border radius
  const borderRadius = config.borderRadius || '0.5rem'

  return `/* 
 * Tailwind CSS v4 Configuration
 * This file contains all the configuration for Tailwind CSS v4
 *
 * NOTE: The @import 'tailwindcss'; syntax is specific to Tailwind CSS v4 with local installation.
 * When using the preview feature or CDN version, the import will be automatically handled.
 */

@import 'tailwindcss';

@font-face {
  font-family: "${config.headingFont}";
  src: url("https://fonts.googleapis.com/css2?family=${config.headingFont.replace(/ /g, '+')}&display=swap");
}

@font-face {
  font-family: "${config.bodyFont}";
  src: url("https://fonts.googleapis.com/css2?family=${config.bodyFont.replace(/ /g, '+')}&display=swap");
}

@font-face {
  font-family: "${config.monoFont}";
  src: url("https://fonts.googleapis.com/css2?family=${config.monoFont.replace(/ /g, '+')}&display=swap");
}

@layer base {
  :root {
    /* Base colors - preserved as hex at 500 for exact matching */
    --color-primary: ${primaryBase};
    --color-primary-foreground: white;
    --color-secondary: ${secondaryBase};
    --color-secondary-foreground: white;
    --color-accent: ${accentBase};
    --color-accent-foreground: white;
    
    /* Background and foreground colors */
    --background: oklch(0.98 0 0);
    --foreground: oklch(0.15 0.01 240);
    
    /* Card, popover, and other UI elements */
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.15 0.01 240);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.15 0.01 240);
    
    /* UI accent colors */
    --muted: oklch(0.96 0.01 240);
    --muted-foreground: oklch(0.55 0.02 240);
    --accent: oklch(0.96 0.01 240);
    --accent-foreground: oklch(0.22 0.01 240);
    
    /* State colors */
    --destructive: oklch(0.57 0.25 27);
    --destructive-foreground: oklch(0.98 0 0);
    --success: oklch(0.56 0.15 160);
    --success-foreground: oklch(0.98 0 0);
    --warning: oklch(0.75 0.18 80);
    --warning-foreground: oklch(0.15 0.01 240);
    --info: oklch(0.66 0.18 225);
    --info-foreground: oklch(0.98 0 0);
    
    /* Border and outline colors */
    --border: oklch(0.89 0.01 240);
    --input: oklch(0.89 0.01 240);
    --ring: ${primaryBase};
    
    /* Color palette shades */
    /* Primary color shades */
    --primary-50: ${primaryShades['50']};
    --primary-100: ${primaryShades['100']};
    --primary-200: ${primaryShades['200']};
    --primary-300: ${primaryShades['300']};
    --primary-400: ${primaryShades['400']};
    --primary-500: ${primaryShades['500']};
    --primary-600: ${primaryShades['600']};
    --primary-700: ${primaryShades['700']};
    --primary-800: ${primaryShades['800']};
    --primary-900: ${primaryShades['900']};
    --primary-950: ${primaryShades['950']};
    
    /* Secondary color shades */
    --secondary-50: ${secondaryShades['50']};
    --secondary-100: ${secondaryShades['100']};
    --secondary-200: ${secondaryShades['200']};
    --secondary-300: ${secondaryShades['300']};
    --secondary-400: ${secondaryShades['400']};
    --secondary-500: ${secondaryShades['500']};
    --secondary-600: ${secondaryShades['600']};
    --secondary-700: ${secondaryShades['700']};
    --secondary-800: ${secondaryShades['800']};
    --secondary-900: ${secondaryShades['900']};
    --secondary-950: ${secondaryShades['950']};
    
    /* Accent color shades */
    --accent-50: ${accentShades['50'] || '#fdf2f8'};
    --accent-100: ${accentShades['100'] || '#fce7f3'};
    --accent-200: ${accentShades['200'] || '#fbcfe8'};
    --accent-300: ${accentShades['300'] || '#f9a8d4'};
    --accent-400: ${accentShades['400'] || '#f472b6'};
    --accent-500: ${accentShades['500'] || '#ec4899'};
    --accent-600: ${accentShades['600'] || '#db2777'};
    --accent-700: ${accentShades['700'] || '#be185d'};
    --accent-800: ${accentShades['800'] || '#9d174d'};
    --accent-900: ${accentShades['900'] || '#831843'};
    --accent-950: ${accentShades['950'] || '#500724'};
    
    /* System border radius - used throughout the design system */
    --radius: ${borderRadius};
    --radius-sm: calc(${borderRadius} - 0.25rem);
    --radius-md: calc(${borderRadius} - 0.125rem);
    --radius-lg: calc(${borderRadius} + 0.125rem);
    --radius-xl: calc(${borderRadius} + 0.25rem);
    --radius-2xl: calc(${borderRadius} + 0.5rem);
    
    ${config.spacing ? `--spacing-base: ${config.spacing};` : '--spacing-base: 1rem;'}
  }
}

@layer dark {
  :root.dark, .dark {
    /* Base colors in OKLCH format for dark mode */
    --background: oklch(0.15 0.01 240);
    --foreground: oklch(0.98 0 0);
    
    /* Card, popover, and other UI elements */
    --card: oklch(0.18 0.01 240);
    --card-foreground: oklch(0.98 0 0);
    --popover: oklch(0.18 0.01 240);
    --popover-foreground: oklch(0.98 0 0);
    
    /* UI accent colors */
    --muted: oklch(0.25 0.01 240);
    --muted-foreground: oklch(0.65 0.02 240);
    --accent: oklch(0.25 0.01 240);
    --accent-foreground: oklch(0.98 0 0);
    
    /* Border and outline colors */
    --border: oklch(0.30 0.01 240);
    --input: oklch(0.30 0.01 240);
  }
}

@theme {
  /* Container settings */
  --container-center: true;
  --container-padding: 2rem;
  --container-screens-2xl: 1400px;
  
  /* Font family settings */
  --font-heading: "${config.headingFont}", ui-sans-serif, system-ui, sans-serif;
  --font-body: "${config.bodyFont}", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "${config.monoFont}", ui-monospace, SFMono-Regular, monospace;
  
  /* Animation settings */
  --animation-default: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --animation-button: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --animation-card: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --animation-drawer: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --animation-input: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --animation-modal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --animation-tooltip: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Colors that should be accessed through the color-{name} utilities */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--color-primary);
  --color-primary-foreground: var(--color-primary-foreground);
  --color-secondary: var(--color-secondary);
  --color-secondary-foreground: var(--color-secondary-foreground);
  --color-accent: var(--color-accent);
  --color-accent-foreground: var(--color-accent-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  
  /* Map color shades to theme variables */
  --color-primary-50: var(--primary-50);
  --color-primary-100: var(--primary-100);
  --color-primary-200: var(--primary-200);
  --color-primary-300: var(--primary-300);
  --color-primary-400: var(--primary-400);
  --color-primary-500: var(--primary-500);
  --color-primary-600: var(--primary-600);
  --color-primary-700: var(--primary-700);
  --color-primary-800: var(--primary-800);
  --color-primary-900: var(--primary-900);
  --color-primary-950: var(--primary-950);
  
  --color-secondary-50: var(--secondary-50);
  --color-secondary-100: var(--secondary-100);
  --color-secondary-200: var(--secondary-200);
  --color-secondary-300: var(--secondary-300);
  --color-secondary-400: var(--secondary-400);
  --color-secondary-500: var(--secondary-500);
  --color-secondary-600: var(--secondary-600);
  --color-secondary-700: var(--secondary-700);
  --color-secondary-800: var(--secondary-800);
  --color-secondary-900: var(--secondary-900);
  --color-secondary-950: var(--secondary-950);
  
  --color-accent-50: var(--accent-50);
  --color-accent-100: var(--accent-100);
  --color-accent-200: var(--accent-200);
  --color-accent-300: var(--accent-300);
  --color-accent-400: var(--accent-400);
  --color-accent-500: var(--accent-500);
  --color-accent-600: var(--accent-600);
  --color-accent-700: var(--accent-700);
  --color-accent-800: var(--accent-800);
  --color-accent-900: var(--accent-900);
  --color-accent-950: var(--accent-950);
  
  /* Border radius values - accessible via the rounded-* utilities */
  --radius: var(--radius);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --radius-2xl: var(--radius-2xl);
}

/* Custom button styles based on selected type */
${buttonStyleCSS}

/* Utility classes for working with the design system */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

/* You can add additional custom styles here */
`
}
