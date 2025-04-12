import {
	generateBaseColors,
	generateContentColor,
	generateDarkBaseColors,
	hexToOklch,
} from "./color-utils";

interface ThemeGenerationProps {
	colors: {
		primary: string;
		secondary: string;
		accent: string;
	};
	fonts: {
		heading: string;
		body: string;
		mono: string;
	};
}

/**
 * Generates a complete theme CSS file for DaisyUI using the provided colors and fonts
 */
export function generateThemeCSS(props: ThemeGenerationProps): string {
	const { colors, fonts } = props;

	// Convert hex colors to OKLCH
	const primaryOklch = hexToOklch(colors.primary);
	const secondaryOklch = hexToOklch(colors.secondary);
	const accentOklch = hexToOklch(colors.accent);

	// Generate content colors with good contrast
	const primaryContent = generateContentColor(primaryOklch);
	const secondaryContent = generateContentColor(secondaryOklch);
	const accentContent = generateContentColor(accentOklch);

	// Generate status colors
	const info = "oklch(74% 0.16 232.661)"; // Blue
	const infoContent = generateContentColor(info);
	const success = "oklch(76% 0.177 163.223)"; // Green
	const successContent = generateContentColor(success);
	const warning = "oklch(82% 0.189 84.429)"; // Yellow
	const warningContent = generateContentColor(warning);
	const error = "oklch(71% 0.194 13.428)"; // Red
	const errorContent = generateContentColor(error);

	// Generate neutral colors for light theme
	const neutral = "oklch(20.5% 0 0)"; // Neutral/gray color for light theme
	const neutralContent = generateContentColor(neutral);

	// Generate neutral colors for dark theme
	const darkNeutral = "oklch(97% 0 0)"; // Lighter neutral/gray color for dark theme
	const darkNeutralContent = generateContentColor(darkNeutral);

	// Generate base colors based on primary
	const { base100, base200, base300, baseContent } =
		generateBaseColors(primaryOklch);

	// Generate dark theme base colors
	const darkTheme = generateDarkBaseColors(primaryOklch);

	// Create the CSS string using template literals
	return `/* 
 * Generated DaisyUI Theme for Tailwind CSS v4
 * Created with DaisyUI Theme Generator
 */
@import url('https://fonts.googleapis.com/css2?family=${fonts.heading.replace(/ /g, "+")}:wght@400;700&family=${fonts.body.replace(/ /g, "+")}:wght@400;700&family=${fonts.mono.replace(/ /g, "+")}:wght@400;700&display=swap');
@import 'tailwindcss';

@theme {
  /* Font settings */
  --font-heading: '${fonts.heading}', sans-serif;
  --font-body: '${fonts.body}', sans-serif;
  --font-mono: '${fonts.mono}', monospace;

  /* Breakpoint settings */
  --breakpoint-*: initial;
  --breakpoint-xs: 30rem; /* 480px - for mobile */
  --breakpoint-sm: 40rem; /* 640px - for larger mobile */
  --breakpoint-md: 48rem; /* 768px - for tablet */
  --breakpoint-lg: 64rem; /* 1024px - for small desktop */
  --breakpoint-xl: 80rem; /* 1280px - for large desktop */
  --breakpoint-2xl: 90rem; /* 1440px - for large desktop */

  /* Animation settings */
  --animation-accordion-down: accordion-down 0.2s ease-out;
  --animation-accordion-up: accordion-up 0.2s ease-out;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }
}

@layer components {
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }

  p, span, a, li {
    @apply font-body;
  }
}

@layer utilities {
  .container, .container-fluid {
    @apply w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-12 lg:py-24;
  }
}

@plugin "daisyui" {
  themes:
    light --default,
    dark --prefersdark,
    light-variant;
}

@plugin "daisyui/theme" {
  name: 'light';
  default: true;
  prefersdark: false;
  color-scheme: 'light';
  --color-base-100: ${base100};
  --color-base-200: ${base200};
  --color-base-300: ${base300};
  --color-base-content: ${baseContent};
  --color-primary: ${primaryOklch};
  --color-primary-content: ${primaryContent};
  --color-secondary: ${secondaryOklch};
  --color-secondary-content: ${secondaryContent};
  --color-accent: ${accentOklch};
  --color-accent-content: ${accentContent};
  --color-neutral: ${neutral};
  --color-neutral-content: ${neutralContent};
  --color-info: ${info};
  --color-info-content: ${infoContent};
  --color-success: ${success};
  --color-success-content: ${successContent};
  --color-warning: ${warning};
  --color-warning-content: ${warningContent};
  --color-error: ${error};
  --color-error-content: ${errorContent};
  --radius-selector: 0.5rem;
  --radius-field: 0.25rem;
  --radius-box: 0.5rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 1px;
  --depth: 1;
  --noise: 0;
}

@plugin "daisyui/theme" {
  name: 'dark';
  default: false;
  prefersdark: true;
  color-scheme: 'dark';
  --color-base-100: ${darkTheme.base100};
  --color-base-200: ${darkTheme.base200};
  --color-base-300: ${darkTheme.base300};
  --color-base-content: ${darkTheme.baseContent};
  --color-primary: ${primaryOklch};
  --color-primary-content: ${primaryContent};
  --color-secondary: ${secondaryOklch};
  --color-secondary-content: ${secondaryContent};
  --color-accent: ${accentOklch};
  --color-accent-content: ${accentContent};
  --color-neutral: ${darkNeutral};
  --color-neutral-content: ${darkNeutralContent};
  --color-info: ${info};
  --color-info-content: ${infoContent};
  --color-success: ${success};
  --color-success-content: ${successContent};
  --color-warning: ${warning};
  --color-warning-content: ${warningContent};
  --color-error: ${error};
  --color-error-content: ${errorContent};
  --radius-selector: 0.5rem;
  --radius-field: 0.25rem;
  --radius-box: 0.5rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 1px;
  --depth: 1;
  --noise: 0;
}

@plugin "daisyui/theme" {
  /* Light variant, make a switch between base100 and base200 */
  name: 'light-variant';
  default: false;
  prefersdark: false;
  color-scheme: 'light';
  --color-base-100: ${base200};
  --color-base-200: ${base100};
  --color-base-300: ${base300};
  --color-base-content: ${baseContent};
  --color-primary: ${primaryOklch};
  --color-primary-content: ${primaryContent};
  --color-secondary: ${secondaryOklch};
  --color-secondary-content: ${secondaryContent};
  --color-accent: ${accentOklch};
  --color-accent-content: ${accentContent};
  --color-neutral: ${neutral};
  --color-neutral-content: ${neutralContent};
  --color-info: ${info};
  --color-info-content: ${infoContent};
  --color-success: ${success};
  --color-success-content: ${successContent};
  --color-warning: ${warning};
  --color-warning-content: ${warningContent};
  --color-error: ${error};
  --color-error-content: ${errorContent};
  --radius-selector: 0.5rem;
  --radius-field: 0.25rem;
  --radius-box: 0.5rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 1px;
  --depth: 1;
  --noise: 0;
}
`;
}
