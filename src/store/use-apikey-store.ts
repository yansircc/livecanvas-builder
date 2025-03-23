import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ApiKeyStore {
	apiKey: string;
	setApiKey: (apiKey: string) => void;
}

export const useApiKeyStore = create<ApiKeyStore>()(
	persist(
		(set) => ({
			apiKey: "",
			setApiKey: (apiKey) => set({ apiKey }),
		}),
		{
			name: "openrouter_api_key",
		},
	),
);
