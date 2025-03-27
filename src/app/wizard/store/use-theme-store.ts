import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface ThemeSettings {
	borderRadius: number;
	includeFont: boolean;
	uiDensity: string;
	borderWidth: string;
	shadow: number;
	selectedFonts: {
		heading: string;
		body: string;
		mono: string;
	};
	selectedColor: string | null;
	selectedScheme: string | null;
	generatedCSS: string | null;
}

export interface ThemeStore extends ThemeSettings {
	setSelectedColor: (color: string | null) => void;
	setSelectedScheme: (scheme: string | null) => void;
	setGeneratedCSS: (css: string | null) => void;
	updateSettings: (settings: Partial<ThemeSettings>) => void;
	resetStore: () => void;
}

// Default theme settings
const DEFAULT_SETTINGS: ThemeSettings = {
	borderRadius: 0.5,
	includeFont: true,
	uiDensity: "default",
	borderWidth: "thin",
	shadow: 0.5,
	selectedFonts: {
		heading: "Inter",
		body: "Inter",
		mono: "JetBrains Mono",
	},
	selectedColor: null,
	selectedScheme: null,
	generatedCSS: null,
};

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			...DEFAULT_SETTINGS,

			setSelectedColor: (color) =>
				set({ selectedColor: color, generatedCSS: null }),

			setSelectedScheme: (scheme) =>
				set({ selectedScheme: scheme, generatedCSS: null }),

			setGeneratedCSS: (css) => set({ generatedCSS: css }),

			updateSettings: (settings) =>
				set((state) => ({
					...state,
					...settings,
					generatedCSS:
						settings.generatedCSS !== undefined ? settings.generatedCSS : null,
				})),

			resetStore: () => set(DEFAULT_SETTINGS),
		}),
		{
			name: "theme-store",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
