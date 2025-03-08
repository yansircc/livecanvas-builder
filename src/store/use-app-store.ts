import type { ModelId } from "@/lib/models";
import { type StateCreator, create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
	// Complete form data
	formData: {
		message: string;
		model: ModelId;
		apiKey: string | null;
		context: string;
	};
}

// 定义可以通过 setState 设置的状态类型
type SettableState = {
	apiKey: string | null;
	model: ModelId;
	context: string;
	isLoading: boolean;
	code: string | null;
	advices: string[];
	processedHtml: string;
	validationResult: ValidationResult;
};

interface AppState extends SettableState {
	// 版本控制相关状态
	versions: Version[];
	currentVersionIndex: number;

	// 通用状态设置方法
	setState: <K extends keyof SettableState>(
		key: K,
		value: SettableState[K],
	) => void;

	// 版本控制方法
	addVersion: (
		prompt: string,
		formData?: {
			message: string;
			model: ModelId;
			apiKey: string | null;
			context: string;
		},
	) => void;
	switchToVersion: (index: number) => void;

	// 重置方法
	resetState: (options?: {
		keepVersions?: boolean;
		keepUserSettings?: boolean;
	}) => void;
}

// 更新持久化配置
type AppPersist = Pick<AppState, "apiKey" | "model" | "context">;

const stateCreator: StateCreator<AppState, [], [], AppState> = (set, get) => ({
	// 初始状态
	apiKey: null,
	model: "anthropic/claude-3-7-sonnet",
	context: "",
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

	// 通用状态设置方法
	setState: (key, value) => set({ [key]: value }),

	// 版本控制方法
	addVersion: (prompt, formData) => {
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
			formData: formData || {
				message: prompt,
				model: get().model,
				apiKey: get().apiKey,
				context: get().context,
			},
		};

		const newVersions = [...get().versions, newVersion];
		set({
			versions: newVersions,
			currentVersionIndex: newVersions.length - 1,
		});
	},

	switchToVersion: (index) => {
		const { versions } = get();
		if (index >= 0 && index < versions.length) {
			const version = versions[index];
			if (version) {
				// Restore all version data
				set({
					currentVersionIndex: index,
					code: version.code,
					processedHtml: version.processedHtml,
					advices: version.advices,
					// Restore form data if available
					...(version.formData && {
						model: version.formData.model,
						apiKey: version.formData.apiKey,
						context: version.formData.context,
					}),
				});
			}
		}
	},

	// 重置方法
	resetState: (options = {}) => {
		const { keepVersions = false, keepUserSettings = true } = options;

		// 创建新状态对象
		const newState: Partial<AppState> = {
			isLoading: false,
			code: null,
			advices: [],
			processedHtml: "",
			validationResult: {
				valid: true,
				errors: [],
			},
		};

		// 如果不保留版本，则重置版本相关状态
		if (!keepVersions) {
			newState.versions = [];
			newState.currentVersionIndex = -1;
		}

		// 如果不保留用户设置，则重置用户设置
		if (!keepUserSettings) {
			newState.apiKey = null;
			newState.model = "anthropic/claude-3-7-sonnet";
			newState.context = "";
		}

		set(newState);
	},
});

const persistConfig = {
	name: "canvas-builder-storage",
	storage: createJSONStorage(() => localStorage),
	partialize: (state: AppState) =>
		Object.fromEntries(
			Object.entries(state).filter(([key]) =>
				["apiKey", "model", "context"].includes(key),
			),
		) as AppPersist,
};

export const useAppStore = create<AppState>()(
	persist(stateCreator, persistConfig),
);
