import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultCustomizationOptions } from '../config/style-presets'
import type { CustomizationOptions } from '../types/theme-options'

interface StyleState {
  customOptions: CustomizationOptions
  setColorScheme: (schemeId: string) => void
  setFontScheme: (schemeId: string) => void
  setButtonScheme: (schemeId: string) => void
  resetToDefaults: () => void
}

export const useStyleStore = create<StyleState>()(
  persist(
    (set) => ({
      customOptions: defaultCustomizationOptions,

      setColorScheme: (schemeId: string) =>
        set((state) => ({
          customOptions: {
            ...state.customOptions,
            colorScheme: schemeId,
          },
        })),

      setFontScheme: (schemeId: string) =>
        set((state) => ({
          customOptions: {
            ...state.customOptions,
            fontScheme: schemeId,
          },
        })),

      setButtonScheme: (schemeId: string) =>
        set((state) => ({
          customOptions: {
            ...state.customOptions,
            buttonScheme: schemeId,
          },
        })),

      resetToDefaults: () =>
        set({
          customOptions: defaultCustomizationOptions,
        }),
    }),
    {
      name: 'preview-style-preferences',
    },
  ),
)
