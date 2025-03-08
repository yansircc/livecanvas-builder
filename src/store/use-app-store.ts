import type { ModelId } from "@/lib/models";
import { type StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

interface ValidationResult {
	valid: boolean;
	errors: string[];
}

interface AppState {
	apiKey: string | null;
	model: ModelId;
	isLoading: boolean;
	code: string | null;
	advices: string[];
	processedHtml: string;
	validationResult: ValidationResult;
	setApiKey: (apiKey: string | null) => void;
	setModel: (model: ModelId) => void;
	setIsLoading: (isLoading: boolean) => void;
	setCode: (code: string | null) => void;
	setAdvices: (advices: string[]) => void;
	setProcessedHtml: (html: string) => void;
	setValidationResult: (result: ValidationResult) => void;
	resetResults: () => void;
}

type AppPersist = Pick<AppState, "apiKey" | "model">;

const stateCreator: StateCreator<AppState, [], [], AppState> = (set) => ({
	apiKey: null,
	model: "anthropic/claude-3-7-sonnet",
	isLoading: false,
	code: null,
	advices: [],
	processedHtml: "",
	validationResult: {
		valid: true,
		errors: [],
	},
	setApiKey: (apiKey: string | null) => set({ apiKey }),
	setModel: (model: ModelId) => set({ model }),
	setIsLoading: (isLoading: boolean) => set({ isLoading }),
	setCode: (code: string | null) => set({ code }),
	setAdvices: (advices: string[]) => set({ advices }),
	setProcessedHtml: (html: string) => set({ processedHtml: html }),
	setValidationResult: (result: ValidationResult) =>
		set({ validationResult: result }),
	resetResults: () =>
		set({
			code: null,
			advices: [],
			processedHtml: "",
			validationResult: {
				valid: true,
				errors: [],
			},
		}),
});

const persistConfig = {
	name: "canvas-builder-storage",
	partialize: (state: AppState) =>
		Object.fromEntries(
			Object.entries(state).filter(([key]) =>
				["apiKey", "model"].includes(key),
			),
		) as AppPersist,
};

export const useAppStore = create<AppState>()(
	persist(stateCreator, persistConfig),
);
