import type { ModelId } from "@/lib/models";
import { type StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

interface ValidationResult {
	valid: boolean;
	errors: string[];
}

export interface Version {
	id: string;
	timestamp: number;
	code: string | null;
	processedHtml: string;
	advices: string[];
	prompt: string;
	parentId: string | null;
}

interface AppState {
	apiKey: string | null;
	model: ModelId;
	isLoading: boolean;
	code: string | null;
	advices: string[];
	processedHtml: string;
	validationResult: ValidationResult;
	versions: Version[];
	currentVersionIndex: number;
	lastPrompt: string;
	setApiKey: (apiKey: string | null) => void;
	setModel: (model: ModelId) => void;
	setIsLoading: (isLoading: boolean) => void;
	setCode: (code: string | null) => void;
	setAdvices: (advices: string[]) => void;
	setProcessedHtml: (html: string) => void;
	setValidationResult: (result: ValidationResult) => void;
	setVersions: (versions: Version[]) => void;
	addVersion: (prompt: string) => void;
	switchToVersion: (index: number) => void;
	resetResults: () => void;
	clearVersions: () => void;
}

// Only persist apiKey and model preferences
type AppPersist = Pick<AppState, "apiKey" | "model">;

const stateCreator: StateCreator<AppState, [], [], AppState> = (set, get) => ({
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
	versions: [],
	currentVersionIndex: -1,
	lastPrompt: "",
	setApiKey: (apiKey: string | null) => set({ apiKey }),
	setModel: (model: ModelId) => set({ model }),
	setIsLoading: (isLoading: boolean) => set({ isLoading }),
	setCode: (code: string | null) => set({ code }),
	setAdvices: (advices: string[]) => set({ advices }),
	setProcessedHtml: (html: string) => set({ processedHtml: html }),
	setValidationResult: (result: ValidationResult) =>
		set({ validationResult: result }),
	setVersions: (versions: Version[]) => set({ versions }),
	addVersion: (prompt: string) => {
		const { code, processedHtml, advices, currentVersionIndex, versions } =
			get();
		if (!code) return; // Don't add version if no code was generated

		// Determine the parent version based on the current index
		const parentId =
			currentVersionIndex >= 0 &&
			currentVersionIndex < versions.length &&
			versions[currentVersionIndex]
				? versions[currentVersionIndex].id
				: null;

		const newVersion: Version = {
			id: Date.now().toString(),
			timestamp: Date.now(),
			code,
			processedHtml,
			advices,
			prompt,
			parentId, // Add parent reference
		};

		const newVersions = [...get().versions, newVersion];
		set({
			versions: newVersions,
			currentVersionIndex: newVersions.length - 1,
			lastPrompt: prompt,
		});
	},
	switchToVersion: (index: number) => {
		const { versions } = get();
		if (index >= 0 && index < versions.length) {
			const version = versions[index];
			if (version) {
				set({
					currentVersionIndex: index,
					code: version.code,
					processedHtml: version.processedHtml,
					advices: version.advices,
				});
			}
		}
	},
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
	clearVersions: () =>
		set({
			versions: [],
			currentVersionIndex: -1,
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
