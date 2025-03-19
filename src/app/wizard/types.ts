export interface TailwindConfig {
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

// Available font options
export const FONT_OPTIONS = {
  heading: [
    'Inter',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Poppins',
    'Raleway',
    'Playfair Display',
    'Merriweather',
    'Oswald',
  ],
  body: [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Source Sans Pro',
    'Nunito',
    'Roboto Slab',
    'Rubik',
  ],
  mono: [
    'Fira Code',
    'JetBrains Mono',
    'Source Code Pro',
    'IBM Plex Mono',
    'Roboto Mono',
    'Ubuntu Mono',
    'Inconsolata',
  ],
}

// Button style options
export type ButtonStyle = 'default' | 'gradient' | '3d'
export const BUTTON_STYLES: ButtonStyle[] = ['default', 'gradient', '3d']

// Border radius options using the same type as in generator.ts
export type ButtonRadius = 'default' | 'full' | 'none' | 'sm'
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
export const BORDER_RADII: { label: string; value: BorderRadius; css: string }[] = [
  { label: 'None', value: 'none', css: '0' },
  { label: 'Small', value: 'sm', css: '0.125rem' },
  { label: 'Medium', value: 'md', css: '0.375rem' },
  { label: 'Large', value: 'lg', css: '0.5rem' },
  { label: 'Extra Large', value: 'xl', css: '0.75rem' },
  { label: 'Full', value: 'full', css: '1.6rem' },
]
