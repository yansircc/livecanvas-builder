// src/app/preview/config/style-presets.ts
import {
  type ButtonScheme,
  type ColorScheme,
  type CustomizationOptions,
  type FontScheme,
} from '../types/theme-options'

// Color scheme presets
export const colorSchemes: ColorScheme[] = [
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    description: 'Professional blue palette',
    primaryColor: '#0d6efd',
    secondaryColor: '#6c757d',
    backgroundColor: '#ffffff',
    textColor: '#212529',
  },
  {
    id: 'modern-purple',
    name: 'Modern Purple',
    description: 'Vibrant purple tones',
    primaryColor: '#8b5cf6',
    secondaryColor: '#64748b',
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natural green palette',
    primaryColor: '#059669',
    secondaryColor: '#374151',
    backgroundColor: '#f9fafb',
    textColor: '#111827',
  },
  {
    id: 'coral-sunset',
    name: 'Coral Sunset',
    description: 'Warm coral tones',
    primaryColor: '#f43f5e',
    secondaryColor: '#64748b',
    backgroundColor: '#ffffff',
    textColor: '#334155',
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'Dark interface theme',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    backgroundColor: '#1e293b',
    textColor: '#f1f5f9',
  },
]

// Font scheme presets
export const fontSchemes: FontScheme[] = [
  {
    id: 'modern-sans',
    name: 'Modern Sans',
    description: 'Clean Inter font',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    fontWeightHeading: 600,
    fontWeightBody: 400,
  },
  {
    id: 'classic-serif',
    name: 'Classic Serif',
    description: 'Elegant serif combination',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    fontWeightHeading: 700,
    fontWeightBody: 400,
  },
  {
    id: 'modern-geometric',
    name: 'Modern Geometric',
    description: 'Clean and geometric',
    headingFont: 'Montserrat',
    bodyFont: 'Roboto',
    fontWeightHeading: 700,
    fontWeightBody: 400,
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional typography',
    headingFont: 'Georgia',
    bodyFont: 'Inter',
    fontWeightHeading: 600,
    fontWeightBody: 400,
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Distinctive typography',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    fontWeightHeading: 600,
    fontWeightBody: 400,
  },
]

// Button scheme presets
export const buttonSchemes: ButtonScheme[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, elegant minimal buttons',
    style: 'minimal',
    size: 'medium',
    shadow: false,
    customClass: 'btn-minimal',
    animation: 'hover-scale',
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Modern gradient buttons',
    style: 'gradient',
    size: 'medium',
    shadow: true,
    customClass: 'btn-gradient',
    animation: 'hover-shine',
  },
  {
    id: 'floating',
    name: 'Floating',
    description: 'Buttons with subtle shadow',
    style: 'rounded',
    size: 'medium',
    shadow: true,
    customClass: 'btn-floating',
    animation: 'hover-float',
  },
  {
    id: 'outline',
    name: 'Outline',
    description: 'Clean outlined buttons',
    style: 'square',
    size: 'medium',
    shadow: false,
    customClass: 'btn-outline-custom',
    animation: 'hover-fill',
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Playful retro-styled buttons',
    style: 'square',
    size: 'medium',
    shadow: true,
    customClass: 'btn-retro',
    animation: 'hover-shift',
  },
]

// Default selections
export const defaultCustomizationOptions: CustomizationOptions = {
  colorScheme: 'classic-blue',
  fontScheme: 'modern-sans',
  buttonScheme: 'gradient',
}
