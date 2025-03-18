export interface FontOptions {
  heading: string[]
  body: string[]
  mono: string[]
}

export const fontOptions: FontOptions = {
  heading: ['Inter', 'Roboto', 'Georgia', 'Playfair Display', 'Merriweather', 'Helvetica', 'Arial'],
  body: ['Inter', 'Roboto', 'Open Sans', 'Georgia', 'System UI', 'Helvetica', 'Arial'],
  mono: ['Menlo', 'Monaco', 'Consolas', 'Courier New', 'Roboto Mono'],
}

// Default font selections
export const defaultFonts = {
  heading: 'Inter',
  body: 'Open Sans',
  mono: 'Menlo',
}
