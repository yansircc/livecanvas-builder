import { type TailwindConfig } from '../types/theme-types'
import { type generateUIColors } from './color-generators'

/**
 * Generate CSS for font configuration
 */
export function generateFontCSS(config: TailwindConfig): string {
  return `
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
}`
}

/**
 * Generate CSS for light mode root variables
 */
export function generateRootVariables(
  config: TailwindConfig,
  uiColors: ReturnType<typeof generateUIColors>,
  primaryShades: Record<string, string>,
  secondaryShades: Record<string, string>,
  accentShades: Record<string, string>,
  primaryBase: string,
  secondaryBase: string,
  accentBase: string,
  borderRadius: string,
): string {
  // // Calculate card and popover radius - limit max radius for aesthetic reasons
  let r = borderRadius
  switch (r) {
    case 'none':
      r = '0'
    case 'sm':
      r = '0.125rem'
    case 'md':
      r = '0.375rem'
    case 'lg':
      r = '0.5rem'
    case 'xl':
      r = '0.75rem'
    case 'full':
      r = '9999px'
    default:
      r = '0.5rem'
  }

  const cardRadius = r
  // Get proper radius values for calculations
  const baseRadius = r
  const radiusSm = `calc(${baseRadius} - 0.25rem)`
  const radiusMd = `calc(${baseRadius} - 0.125rem)`
  const radiusLg = `calc(${baseRadius} + 0.125rem)`
  const radiusXl = `calc(${baseRadius} + 0.25rem)`
  const radius2xl = `calc(${baseRadius} + 0.5rem)`

  return `  :root {
    /* Base colors - kept as hex for exact matching */
    --color-primary: ${primaryBase};
    --color-primary-foreground: white;
    --color-secondary: ${secondaryBase};
    --color-secondary-foreground: white;
    --color-accent: ${accentBase};
    --color-accent-foreground: white;
    
    /* Background and foreground colors */
    --background: ${uiColors.backgroundColor};
    --foreground: ${uiColors.foregroundColor};
    
    /* Card, popover and other UI elements */
    --card: ${uiColors.cardColor};
    --card-foreground: ${uiColors.cardForegroundColor};
    --popover: ${uiColors.popoverColor};
    --popover-foreground: ${uiColors.popoverForegroundColor};
    
    /* UI accent colors */
    --muted: ${uiColors.mutedColor};
    --muted-foreground: ${uiColors.mutedForeground};
    --accent: ${uiColors.accentUIColor};
    --accent-foreground: ${uiColors.accentUIForeground};
    
    /* State colors */
    --destructive: ${uiColors.destructiveColor};
    --destructive-foreground: ${uiColors.darkForegroundColor};
    --success: ${uiColors.successColor};
    --success-foreground: ${uiColors.darkForegroundColor};
    --warning: ${uiColors.warningColor};
    --warning-foreground: ${uiColors.foregroundColor};
    --info: ${uiColors.infoColor};
    --info-foreground: ${uiColors.foregroundColor};
    
    /* Border and outline colors */
    --border: ${uiColors.borderColor};
    --input: ${uiColors.inputColor};
    --ring: ${uiColors.ringColor};
    --ring-offset: ${uiColors.ringColorOffset};
    
    /* Divider colors */
    --divider: ${uiColors.dividerColor};
    
    /* State change colors */
    --hover-bg: ${uiColors.hoverBgColor};
    --active-bg: ${uiColors.activeBgColor};
    
    /* Dynamic shadows - coordinated with primary color */
    --shadow: 0 1px 2px ${uiColors.shadowColor};
    --shadow-md: 0 4px 6px ${uiColors.shadowColorMd}, 0 1px 3px ${uiColors.shadowColor};
    --shadow-lg: 0 10px 15px ${uiColors.shadowColorLg}, 0 3px 6px ${uiColors.shadowColorMd};
    --shadow-xl: 0 20px 25px ${uiColors.shadowColorXl}, 0 8px 10px ${uiColors.shadowColorLg};
    --shadow-inner: inset 0 2px 4px 0 ${uiColors.shadowColor};
    --shadow-none: 0 0 #0000;
    
    /* Color palette */
    /* Primary color palette */
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
    
    /* Secondary color palette */
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
    
    /* Accent color palette */
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
    --radius: ${baseRadius};
    --radius-sm: ${radiusSm};
    --radius-md: ${radiusMd};
    --radius-lg: ${radiusLg};
    --radius-xl: ${radiusXl};
    --radius-2xl: ${radius2xl};
    
    /* Component-specific radius settings */
    --card-radius: ${cardRadius};
    --popover-radius: ${cardRadius};
    --input-radius: ${baseRadius};
    --button-radius: ${baseRadius};
    
    ${config.spacing ? `--spacing-base: ${config.spacing};` : '--spacing-base: 1rem;'}
  }`
}

/**
 * Generate CSS for dark mode variables
 */
export function generateDarkModeVariables(uiColors: ReturnType<typeof generateUIColors>): string {
  return `  :root.dark, .dark {
    /* Dark mode base colors */
    --background: ${uiColors.darkBackgroundColor};
    --foreground: ${uiColors.darkForegroundColor};
    
    /* Card, popover and other UI elements */
    --card: ${uiColors.darkCardColor};
    --card-foreground: ${uiColors.darkCardForegroundColor};
    --popover: ${uiColors.darkPopoverColor};
    --popover-foreground: ${uiColors.darkPopoverForegroundColor};
    
    /* UI accent colors */
    --muted: ${uiColors.darkMutedColor};
    --muted-foreground: ${uiColors.darkMutedForeground};
    --accent: ${uiColors.darkAccentUIColor};
    --accent-foreground: ${uiColors.darkAccentUIForeground};
    
    /* Border and outline colors */
    --border: ${uiColors.darkBorderColor};
    --input: ${uiColors.darkInputColor};
    --ring: ${uiColors.ringColor};
    --ring-offset: ${uiColors.darkRingColorOffset};
    
    /* Divider colors - dark mode */
    --divider: ${uiColors.darkDividerColor};
    
    /* State change colors - dark mode */
    --hover-bg: ${uiColors.darkHoverBgColor};
    --active-bg: ${uiColors.darkActiveBgColor};
    
    /* Dynamic shadows - dark mode */
    --shadow: 0 1px 2px ${uiColors.darkShadowColor};
    --shadow-md: 0 4px 6px ${uiColors.darkShadowColorMd}, 0 1px 3px ${uiColors.darkShadowColor};
    --shadow-lg: 0 10px 15px ${uiColors.darkShadowColorLg}, 0 3px 6px ${uiColors.darkShadowColorMd};
    --shadow-xl: 0 20px 25px ${uiColors.darkShadowColorXl}, 0 8px 10px ${uiColors.darkShadowColorLg};
    --shadow-inner: inset 0 2px 4px 0 ${uiColors.darkShadowColor};
    --shadow-none: 0 0 #0000;
  }`
}

/**
 * Generate CSS for theme configuration
 */
export function generateThemeVariables(): string {
  return `  /* Container settings */
  --container-center: true;
  --container-padding: 2rem;
  --container-screens-2xl: 1400px;
  
  /* Font settings */
  --font-heading: "var(--font-heading)", ui-sans-serif, system-ui, sans-serif;
  --font-body: "var(--font-body)", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "var(--font-mono)", ui-monospace, SFMono-Regular, monospace;
  
  /* Animation settings */
  --animation-default: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --animation-button: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --animation-card: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --animation-drawer: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --animation-input: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --animation-modal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --animation-tooltip: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Colors that should be accessed via color-{name} utilities */
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
  --color-ring-offset: var(--ring-offset);
  --color-divider: var(--divider);
  --color-hover-bg: var(--hover-bg);
  --color-active-bg: var(--active-bg);
  
  /* Map color palette to theme variables */
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
  
  /* Border radius values - accessed via rounded-* utilities */
  --radius: var(--radius);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --radius-2xl: var(--radius-2xl);
  
  /* Component-specific radius */
  --radius-card: var(--card-radius);
  --radius-popover: var(--popover-radius);
  --radius-input: var(--input-radius);
  --radius-button: var(--button-radius);
  
  /* Shadow mapping */
  --shadow-default: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-inner: var(--shadow-inner);
  --shadow-none: var(--shadow-none);`
}

/**
 * Generate utility classes for the Tailwind CSS
 */
export function generateUtilityClasses(): string {
  return `@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}`
}

/**
 * Generate CSS for component-specific styles
 */
export function generateComponentStyles(): string {
  return `/* Component-specific styles */
@layer components {
  /* Card component styles */
  .card {
    border-radius: var(--radius-card);
  }
  
  /* Popover component styles */
  .popover-content {
    border-radius: var(--radius-popover);
  }
  
  /* Input component styles */
  .input {
    border-radius: var(--radius-input);
  }
  
  /* Button component styles */
  .button, .btn {
    border-radius: var(--radius-button);
  }
}`
}
