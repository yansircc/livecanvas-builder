import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CssState {
  customCss: string
  setCustomCss: (css: string) => void
  clearCustomCss: () => void
}

// Create a Zustand store with localStorage persistence
export const useCssStore = create<CssState>()(
  persist(
    (set) => ({
      customCss: '',
      setCustomCss: (css: string) => set({ customCss: css }),
      clearCustomCss: () => set({ customCss: '' }),
    }),
    {
      name: 'custom-css-storage', // localStorage key
    },
  ),
)
