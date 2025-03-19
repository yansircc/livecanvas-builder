import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { type BorderRadius, type ButtonStyle } from '../types'

interface TailwindStore {
  // Color settings
  hue: number
  selectedHarmony: string
  shadeLevel: {
    primary: string
    secondary: string
    accent: string
  }

  // Font settings
  fonts: {
    heading: string
    body: string
    mono: string
  }

  // Component settings
  buttonStyle: ButtonStyle
  borderRadius: BorderRadius

  // Actions
  setHue: (hue: number) => void
  setSelectedHarmony: (harmony: string) => void
  setShadeLevel: (role: 'primary' | 'secondary' | 'accent', value: string) => void
  setFont: (type: 'heading' | 'body' | 'mono', font: string) => void
  setButtonStyle: (style: ButtonStyle) => void
  setBorderRadius: (radius: BorderRadius) => void
  resetStore: () => void
}

// Create a function to get the initial state that's safe for SSR
const getDefaultState = () => ({
  // Default values
  hue: 0,
  selectedHarmony: '互补色',
  shadeLevel: {
    primary: '500',
    secondary: '400',
    accent: '600',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  buttonStyle: 'default' as ButtonStyle,
  borderRadius: 'md' as BorderRadius,
})

export const useTailwindStore = create<TailwindStore>()(
  persist(
    (set) => ({
      ...getDefaultState(),

      // Actions
      setHue: (hue) => set({ hue }),
      setSelectedHarmony: (selectedHarmony) => set({ selectedHarmony }),
      setShadeLevel: (role, value) =>
        set((state) => ({
          shadeLevel: {
            ...state.shadeLevel,
            [role]: value,
          },
        })),
      setFont: (type, font) =>
        set((state) => ({
          fonts: {
            ...state.fonts,
            [type]: font,
          },
        })),
      setButtonStyle: (buttonStyle) => set({ buttonStyle }),
      setBorderRadius: (borderRadius) => set({ borderRadius }),
      resetStore: () => set(getDefaultState()),
    }),
    {
      name: 'tailwind-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {
                void 0
              },
              removeItem: () => {
                void 0
              },
            },
      ),
    },
  ),
)
