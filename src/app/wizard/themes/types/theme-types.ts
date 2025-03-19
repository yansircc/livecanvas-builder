import { type BorderRadius, type ButtonRadius, type ButtonStyle } from '../../types'

export interface TailwindConfig {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  headingFont: string
  bodyFont: string
  monoFont: string
  borderRadius?: BorderRadius
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
