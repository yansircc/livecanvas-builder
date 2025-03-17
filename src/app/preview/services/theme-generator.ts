// src/app/preview/services/theme-generator.ts
import type { ThemeOption } from '../components/theme-selector'
import { buttonSchemes, colorSchemes, fontSchemes } from '../config/style-presets'
import type { CustomizationOptions } from '../types/theme-options'

/**
 * Generates a CSS string with Bootstrap variable overrides for a given theme option
 * This function is used by the existing theme selector component
 */
export function generateThemeCSS(theme: ThemeOption): string {
  // Convert hex to RGB for rgba() usage
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `${parseInt(result[1] || '0', 16)}, ${parseInt(result[2] || '0', 16)}, ${parseInt(
          result[3] || '0',
          16,
        )}`
      : '0, 0, 0'
  }

  // Generate different shades of primary color
  const primaryRgb = hexToRgb(theme.primaryColor)
  const secondaryRgb = hexToRgb(theme.secondaryColor)

  // Create CSS with Bootstrap 5 variable overrides
  return `
    /* Bootstrap theme overrides for ${theme.name} theme */
    :root {
      /* Primary colors */
      --bs-primary: ${theme.primaryColor};
      --bs-primary-rgb: ${primaryRgb};
      --bs-primary-text-emphasis: ${theme.primaryColor};
      --bs-primary-bg-subtle: rgba(${primaryRgb}, 0.1);
      --bs-primary-border-subtle: rgba(${primaryRgb}, 0.2);
      
      /* Secondary colors */
      --bs-secondary: ${theme.secondaryColor};
      --bs-secondary-rgb: ${secondaryRgb};
      --bs-secondary-text-emphasis: ${theme.secondaryColor};
      --bs-secondary-bg-subtle: rgba(${secondaryRgb}, 0.1);
      --bs-secondary-border-subtle: rgba(${secondaryRgb}, 0.2);
      
      /* Button overrides */
      --bs-btn-color: #fff;
      --bs-btn-bg: ${theme.primaryColor};
      --bs-btn-border-color: ${theme.primaryColor};
      --bs-btn-hover-color: #fff;
      --bs-btn-hover-bg: ${adjustColor(theme.primaryColor, -10)};
      --bs-btn-hover-border-color: ${adjustColor(theme.primaryColor, -15)};
      --bs-btn-focus-shadow-rgb: ${primaryRgb};
      --bs-btn-active-color: #fff;
      --bs-btn-active-bg: ${adjustColor(theme.primaryColor, -15)};
      --bs-btn-active-border-color: ${adjustColor(theme.primaryColor, -20)};
      --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
      --bs-btn-disabled-color: #fff;
      --bs-btn-disabled-bg: ${theme.primaryColor};
      --bs-btn-disabled-border-color: ${theme.primaryColor};

      /* Link overrides */
      --bs-link-color: ${theme.primaryColor};
      --bs-link-hover-color: ${adjustColor(theme.primaryColor, -20)};
      
      /* Component specific */
      --bs-nav-link-hover-color: ${adjustColor(theme.primaryColor, -10)};
      --bs-navbar-active-color: ${theme.primaryColor};
    }
    
    /* Additional selectors for compatibility */
    .btn-primary {
      background-color: var(--bs-primary);
      border-color: var(--bs-primary);
    }
    
    .btn-primary:hover,
    .btn-primary:focus {
      background-color: var(--bs-btn-hover-bg);
      border-color: var(--bs-btn-hover-border-color);
    }
    
    .btn-primary:active {
      background-color: var(--bs-btn-active-bg);
      border-color: var(--bs-btn-active-border-color);
    }
    
    /* Text coloring */
    .text-primary {
      color: var(--bs-primary) !important;
    }
    
    /* Border coloring */
    .border-primary {
      border-color: var(--bs-primary) !important;
    }
    
    /* Background coloring */
    .bg-primary {
      background-color: var(--bs-primary) !important;
    }

    /* Custom font styles if needed */
    ${generateFontStyles(theme)}
  `
}

/**
 * Generates CSS for extended customization options
 * This function supports the new customization system with separate color, font, and button schemes
 */
export function generateCustomCSS(options: CustomizationOptions): string {
  const colorScheme = colorSchemes.find((c) => c.id === options.colorScheme) || colorSchemes[0]!
  const fontScheme = fontSchemes.find((f) => f.id === options.fontScheme) || fontSchemes[0]!
  const buttonScheme = buttonSchemes.find((b) => b.id === options.buttonScheme) || buttonSchemes[0]!

  // Convert hex to RGB for rgba() usage
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `${parseInt(result[1] || '0', 16)}, ${parseInt(result[2] || '0', 16)}, ${parseInt(
          result[3] || '0',
          16,
        )}`
      : '0, 0, 0'
  }

  const primaryRgb = hexToRgb(colorScheme.primaryColor)
  const secondaryRgb = hexToRgb(colorScheme.secondaryColor)

  // Generate color scheme CSS
  const colorCSS = `
    /* Color scheme: ${colorScheme.name} */
    :root {
      /* Primary colors */
      --bs-primary: ${colorScheme.primaryColor};
      --bs-primary-rgb: ${primaryRgb};
      --bs-primary-text-emphasis: ${colorScheme.primaryColor};
      --bs-primary-bg-subtle: rgba(${primaryRgb}, 0.1);
      --bs-primary-border-subtle: rgba(${primaryRgb}, 0.2);
      
      /* Secondary colors */
      --bs-secondary: ${colorScheme.secondaryColor};
      --bs-secondary-rgb: ${secondaryRgb};
      --bs-secondary-text-emphasis: ${colorScheme.secondaryColor};
      --bs-secondary-bg-subtle: rgba(${secondaryRgb}, 0.1);
      --bs-secondary-border-subtle: rgba(${secondaryRgb}, 0.2);
      
      /* Button overrides */
      --bs-btn-color: #fff;
      --bs-btn-bg: ${colorScheme.primaryColor};
      --bs-btn-border-color: ${colorScheme.primaryColor};
      --bs-btn-hover-color: #fff;
      --bs-btn-hover-bg: ${adjustColor(colorScheme.primaryColor, -10)};
      --bs-btn-hover-border-color: ${adjustColor(colorScheme.primaryColor, -15)};
      --bs-btn-focus-shadow-rgb: ${primaryRgb};
      --bs-btn-active-color: #fff;
      --bs-btn-active-bg: ${adjustColor(colorScheme.primaryColor, -15)};
      --bs-btn-active-border-color: ${adjustColor(colorScheme.primaryColor, -20)};
      --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
      --bs-btn-disabled-color: #fff;
      --bs-btn-disabled-bg: ${colorScheme.primaryColor};
      --bs-btn-disabled-border-color: ${colorScheme.primaryColor};
      
      --bs-body-color: ${colorScheme.textColor || '#212529'};
      --bs-body-bg: ${colorScheme.backgroundColor || '#ffffff'};
      --bs-link-color: ${colorScheme.primaryColor};
      --bs-link-hover-color: ${adjustColor(colorScheme.primaryColor, -20)};
    }
    
    /* Additional color selectors */
    .text-primary {
      color: var(--bs-primary) !important;
    }
    
    .bg-primary {
      background-color: var(--bs-primary) !important;
    }
    
    .border-primary {
      border-color: var(--bs-primary) !important;
    }
    
    /* Button color overrides */
    .btn-primary {
      background-color: var(--bs-primary) !important;
      border-color: var(--bs-primary) !important;
    }
    
    .btn-primary:hover, .btn-primary:focus {
      background-color: var(--bs-btn-hover-bg) !important;
      border-color: var(--bs-btn-hover-border-color) !important;
    }
    
    .btn-primary:active {
      background-color: var(--bs-btn-active-bg) !important;
      border-color: var(--bs-btn-active-border-color) !important;
    }
    
    .btn-outline-primary {
      color: var(--bs-primary) !important;
      border-color: var(--bs-primary) !important;
    }
    
    .btn-outline-primary:hover, .btn-outline-primary:focus {
      background-color: var(--bs-primary) !important;
      color: #fff !important;
    }
  `

  // Generate font scheme CSS
  const fontCSS = `
    /* Font scheme: ${fontScheme.name} */
    :root {
      --bs-body-font-family: '${fontScheme.bodyFont}', -apple-system, BlinkMacSystemFont, sans-serif;
      --bs-headings-font-family: '${fontScheme.headingFont}', -apple-system, BlinkMacSystemFont, sans-serif;
      --bs-body-font-weight: ${fontScheme.fontWeightBody};
      --bs-headings-font-weight: ${fontScheme.fontWeightHeading};
    }
    
    h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6 {
      font-family: var(--bs-headings-font-family);
      font-weight: var(--bs-headings-font-weight);
      ${fontScheme.id === 'creative' ? 'letter-spacing: -0.02em;' : ''}
    }
    
    body {
      font-family: var(--bs-body-font-family);
      font-weight: var(--bs-body-font-weight);
    }
  `

  // Generate button scheme CSS
  let buttonCSS = `
    /* Button scheme: ${buttonScheme.name} */
    .btn {
      ${buttonScheme.style === 'pill' ? 'border-radius: 50rem;' : ''}
      ${buttonScheme.style === 'square' ? 'border-radius: 0;' : ''}
      ${buttonScheme.style === 'rounded' ? 'border-radius: 0.375rem;' : ''}
      ${buttonScheme.style === 'minimal' ? 'border-radius: 0.25rem;' : ''}
      ${buttonScheme.size === 'small' ? 'padding: 0.25rem 0.5rem; font-size: 0.875rem;' : ''}
      ${buttonScheme.size === 'medium' ? 'padding: 0.375rem 0.75rem; font-size: 1rem;' : ''}
      ${buttonScheme.size === 'large' ? 'padding: 0.5rem 1rem; font-size: 1.25rem;' : ''}
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      z-index: 1;
    }
    
    /* Override Bootstrap's default focus styles */
    .btn:focus, .btn:focus-visible, .btn:active:focus {
      box-shadow: none !important;
      outline: none !important;
    }
  `

  // Add special button styles based on customClass
  if (buttonScheme.customClass === 'btn-minimal') {
    buttonCSS += `
      /* Minimal style */
      .btn {
        background-color: transparent;
        transform-origin: center;
      }
      
      .btn:hover {
        transform: translateY(-2px);
      }
      
      .btn:active {
        transform: scale(0.96);
      }
      
      /* Specific button types */
      .btn-primary {
        color: var(--bs-primary) !important;
        border: 1px solid var(--bs-primary) !important;
        background-color: transparent !important;
      }
      
      .btn-primary:hover, .btn-primary:focus, .btn-primary:active {
        background-color: var(--bs-primary) !important;
        color: #fff !important;
        border-color: var(--bs-primary) !important;
      }
      
      .btn-outline-primary {
        color: var(--bs-primary) !important;
        border: 1px solid var(--bs-primary) !important;
        background-color: transparent !important;
      }
      
      .btn-outline-primary:hover, .btn-outline-primary:focus, .btn-outline-primary:active {
        background-color: var(--bs-primary) !important;
        color: #fff !important;
      }
      
      .btn-secondary {
        color: var(--bs-secondary) !important;
        border: 1px solid var(--bs-secondary) !important;
        background-color: transparent !important;
      }
      
      .btn-secondary:hover, .btn-secondary:focus, .btn-secondary:active {
        background-color: var(--bs-secondary) !important;
        color: #fff !important;
      }
    `
  } else if (buttonScheme.customClass === 'btn-gradient') {
    buttonCSS += `
      /* Gradient style */
      .btn {
        position: relative;
        overflow: hidden;
        border: none !important;
      }
      
      .btn::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
        transition: all 0.5s ease;
        z-index: -1;
      }
      
      .btn:hover::after {
        left: 100%;
      }
      
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0,0,0,0.15) !important;
      }
      
      .btn:active {
        transform: translateY(0);
      }
      
      /* Specific button types */
      .btn-primary {
        background-image: linear-gradient(to right, ${colorScheme.primaryColor}, ${adjustColor(colorScheme.primaryColor, 20)}) !important;
        background-color: ${colorScheme.primaryColor} !important;
        color: #fff !important;
      }
      
      .btn-primary:hover, .btn-primary:focus, .btn-primary:active {
        background-image: linear-gradient(to right, ${adjustColor(colorScheme.primaryColor, -5)}, ${adjustColor(colorScheme.primaryColor, 15)}) !important;
        background-color: ${adjustColor(colorScheme.primaryColor, -5)} !important;
        box-shadow: 0 4px 16px rgba(${hexToRgb(colorScheme.primaryColor)}, 0.4) !important;
      }
      
      .btn-secondary {
        background-image: linear-gradient(to right, ${colorScheme.secondaryColor}, ${adjustColor(colorScheme.secondaryColor, 20)}) !important;
        background-color: ${colorScheme.secondaryColor} !important;
        color: #fff !important;
      }
      
      .btn-secondary:hover, .btn-secondary:focus, .btn-secondary:active {
        background-image: linear-gradient(to right, ${adjustColor(colorScheme.secondaryColor, -5)}, ${adjustColor(colorScheme.secondaryColor, 15)}) !important;
        background-color: ${adjustColor(colorScheme.secondaryColor, -5)} !important;
      }
      
      .btn-outline-primary {
        background-image: none !important;
        background-color: transparent !important;
        color: var(--bs-primary) !important;
        border: 1px solid var(--bs-primary) !important;
      }
      
      .btn-outline-primary:hover, .btn-outline-primary:focus, .btn-outline-primary:active {
        background-image: linear-gradient(to right, ${colorScheme.primaryColor}, ${adjustColor(colorScheme.primaryColor, 20)}) !important;
        background-color: ${colorScheme.primaryColor} !important;
        color: #fff !important;
        border-color: transparent !important;
      }
    `
  } else if (buttonScheme.customClass === 'btn-floating') {
    buttonCSS += `
      /* Floating style */
      .btn {
        box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      }
      
      .btn:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.05) !important;
        transform: translateY(-3px);
      }
      
      .btn:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
      }
      
      /* Specific button types */
      .btn-primary {
        background-color: #fff !important;
        color: var(--bs-primary) !important;
        border: 1px solid rgba(${hexToRgb(colorScheme.primaryColor)}, 0.2) !important;
      }
      
      .btn-primary:hover, .btn-primary:focus, .btn-primary:active {
        border-color: rgba(${hexToRgb(colorScheme.primaryColor)}, 0.4) !important;
        background-color: #fff !important;
        color: var(--bs-primary) !important;
      }
      
      /* Override default bootstrap hover state */
      .btn-primary:hover, .btn-primary:focus-visible, .btn-primary:active, .btn-primary.active, .show > .btn-primary.dropdown-toggle {
        color: var(--bs-primary) !important;
        background-color: #fff !important;
      }
      
      .btn-secondary {
        background-color: #fff !important;
        color: var(--bs-secondary) !important;
        border: 1px solid rgba(${hexToRgb(colorScheme.secondaryColor)}, 0.2) !important;
      }
      
      .btn-secondary:hover, .btn-secondary:focus, .btn-secondary:active {
        border-color: rgba(${hexToRgb(colorScheme.secondaryColor)}, 0.4) !important;
        background-color: #fff !important;
        color: var(--bs-secondary) !important;
      }
      
      .btn-outline-primary {
        background-color: transparent !important;
        color: var(--bs-primary) !important;
        border: 1px solid rgba(${hexToRgb(colorScheme.primaryColor)}, 0.5) !important;
      }
      
      .btn-outline-primary:hover, .btn-outline-primary:focus, .btn-outline-primary:active {
        background-color: rgba(${hexToRgb(colorScheme.primaryColor)}, 0.05) !important;
        border-color: rgba(${hexToRgb(colorScheme.primaryColor)}, 0.8) !important;
        color: var(--bs-primary) !important;
      }
    `
  } else if (buttonScheme.customClass === 'btn-outline-custom') {
    buttonCSS += `
      /* Outline custom style */
      .btn {
        position: relative;
        z-index: 1;
        overflow: hidden;
      }
      
      .btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 100%;
        z-index: -1;
        transition: width 0.3s ease;
      }
      
      .btn:hover::before {
        width: 100%;
      }
      
      /* Specific button types */
      .btn-primary {
        background-color: transparent !important;
        color: var(--bs-primary) !important;
        border: 2px solid var(--bs-primary) !important;
      }
      
      .btn-primary::before {
        background-color: var(--bs-primary);
      }
      
      .btn-primary:hover, .btn-primary:focus, .btn-primary:active {
        color: #fff !important;
        background-color: transparent !important;
        border-color: var(--bs-primary) !important;
      }
      
      .btn-secondary {
        background-color: transparent !important;
        color: var(--bs-secondary) !important;
        border: 2px solid var(--bs-secondary) !important;
      }
      
      .btn-secondary::before {
        background-color: var(--bs-secondary);
      }
      
      .btn-secondary:hover, .btn-secondary:focus, .btn-secondary:active {
        color: #fff !important;
        background-color: transparent !important;
        border-color: var(--bs-secondary) !important;
      }
      
      .btn-outline-primary {
        background-color: transparent !important;
        color: var(--bs-primary) !important;
        border: 2px solid var(--bs-primary) !important;
      }
      
      .btn-outline-primary::before {
        background-color: var(--bs-primary);
      }
      
      .btn-outline-primary:hover, .btn-outline-primary:focus, .btn-outline-primary:active {
        color: #fff !important;
        background-color: transparent !important;
      }
    `
  } else if (buttonScheme.customClass === 'btn-retro') {
    buttonCSS += `
      /* Retro style */
      .btn {
        transform: translate(0, 0);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        background-color: #fff !important;
      }
      
      .btn:hover {
        transform: translate(2px, 2px);
      }
      
      .btn:active {
        transform: translate(3px, 3px);
      }
      
      /* Override all Bootstrap hover, focus, and active states */
      .btn:hover, .btn:focus, .btn:active, .btn.active, .btn:focus-visible, 
      .show > .btn.dropdown-toggle {
        background-color: #fff !important;
      }
      
      /* Specific button types */
      .btn-primary {
        color: var(--bs-primary) !important;
        border: 2px solid var(--bs-primary) !important;
        box-shadow: 3px 3px 0 var(--bs-primary) !important;
      }
      
      .btn-primary:hover, .btn-primary:focus, .btn-primary:active, 
      .btn-primary.active, .btn-primary:focus-visible,
      .show > .btn-primary.dropdown-toggle {
        color: var(--bs-primary) !important;
        background-color: #fff !important;
        border-color: var(--bs-primary) !important;
        box-shadow: 1px 1px 0 var(--bs-primary) !important;
      }
      
      .btn-primary:active {
        box-shadow: 0px 0px 0 var(--bs-primary) !important;
      }
      
      .btn-secondary {
        color: var(--bs-secondary) !important;
        border: 2px solid var(--bs-secondary) !important;
        box-shadow: 3px 3px 0 var(--bs-secondary) !important;
      }
      
      .btn-secondary:hover, .btn-secondary:focus, .btn-secondary:active,
      .btn-secondary.active, .btn-secondary:focus-visible,
      .show > .btn-secondary.dropdown-toggle {
        color: var(--bs-secondary) !important;
        background-color: #fff !important;
        border-color: var(--bs-secondary) !important;
        box-shadow: 1px 1px 0 var(--bs-secondary) !important;
      }
      
      .btn-secondary:active {
        box-shadow: 0px 0px 0 var(--bs-secondary) !important;
      }
      
      .btn-outline-primary {
        color: var(--bs-primary) !important;
        border: 2px solid var(--bs-primary) !important;
        box-shadow: 3px 3px 0 var(--bs-primary) !important;
      }
      
      .btn-outline-primary:hover, .btn-outline-primary:focus, .btn-outline-primary:active,
      .btn-outline-primary.active, .btn-outline-primary:focus-visible,
      .show > .btn-outline-primary.dropdown-toggle {
        color: var(--bs-primary) !important;
        background-color: #fff !important;
        border-color: var(--bs-primary) !important;
        box-shadow: 1px 1px 0 var(--bs-primary) !important;
      }
      
      .btn-outline-primary:active {
        box-shadow: 0px 0px 0 var(--bs-primary) !important;
      }
    `
  }

  // Combine all CSS
  return `
    ${colorCSS}
    
    ${fontCSS}
    
    ${buttonCSS}
  `
}

/**
 * Adjusts a hex color by a percentage factor
 * Positive factor lightens, negative factor darkens
 */
function adjustColor(hexColor: string, factor: number): string {
  // Parse the hex color
  const r = parseInt(hexColor.substring(1, 3), 16)
  const g = parseInt(hexColor.substring(3, 5), 16)
  const b = parseInt(hexColor.substring(5, 7), 16)

  // Adjust the color
  const adjustment = factor / 100
  const newR = Math.min(255, Math.max(0, Math.round(r + r * adjustment)))
  const newG = Math.min(255, Math.max(0, Math.round(g + g * adjustment)))
  const newB = Math.min(255, Math.max(0, Math.round(b + b * adjustment)))

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB
    .toString(16)
    .padStart(2, '0')}`
}

/**
 * Generates font style overrides based on the theme
 */
function generateFontStyles(theme: ThemeOption): string {
  // Default fonts based on theme
  let fontStyles = ''

  switch (theme.id) {
    case 'modern':
      fontStyles = `
        :root {
          --bs-body-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --bs-headings-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --bs-headings-font-weight: 600;
        }
      `
      break
    case 'dark':
      fontStyles = `
        :root {
          --bs-body-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --bs-headings-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --bs-headings-font-weight: 700;
          --bs-body-color: #e2e8f0;
          --bs-body-bg: #1e293b;
          --bs-border-color: #334155;
          --bs-light: #334155;
          --bs-dark: #f8fafc;
        }
        
        /* Override card backgrounds for dark mode */
        .card {
          background-color: #0f172a;
          border-color: #334155;
        }
        
        .card-header, .card-footer {
          background-color: rgba(15, 23, 42, 0.5);
          border-color: #334155;
        }
      `
      break
    case 'corporate':
      fontStyles = `
        :root {
          --bs-body-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --bs-headings-font-family: 'Georgia', 'Times New Roman', serif;
          --bs-headings-font-weight: 600;
        }
      `
      break
    case 'creative':
      fontStyles = `
        :root {
          --bs-body-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --bs-headings-font-family: 'Playfair Display', 'Georgia', serif;
          --bs-headings-font-weight: 600;
        }
        
        h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6 {
          letter-spacing: -0.02em;
        }
      `
      break
    default:
      // Default theme has standard Bootstrap fonts
      fontStyles = ''
      break
  }

  return fontStyles
}
