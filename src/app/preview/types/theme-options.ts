// src/app/preview/types/theme-options.ts
/**
 * Type definitions for customization options in the preview
 */

export interface ColorScheme {
  id: string
  name: string
  description: string
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  backgroundColor?: string
  textColor?: string
}

export interface FontScheme {
  id: string
  name: string
  description: string
  headingFont: string
  bodyFont: string
  fontWeightHeading: number
  fontWeightBody: number
}

export interface ButtonScheme {
  id: string
  name: string
  description: string
  style: 'rounded' | 'pill' | 'square' | 'minimal' | 'gradient'
  size: 'small' | 'medium' | 'large'
  shadow?: boolean
  customClass?: string
  animation?: 'hover-scale' | 'hover-shine' | 'hover-float' | 'hover-fill' | 'hover-shift'
}

export interface ImageScheme {
  id: string
  name: string
  description: string
  style: 'rounded' | 'circle' | 'square' | 'polaroid' | 'bordered'
  shadow?: boolean
  overlay?: boolean
}

export interface CustomizationOptions {
  colorScheme: string
  fontScheme: string
  buttonScheme: string
}
