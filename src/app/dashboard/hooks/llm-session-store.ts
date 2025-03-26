import type { ModelProvider } from "@/lib/models";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FormData {
	prompt: string;
	history?: ConversationHistory[];
	providerId?: ModelProvider;
	modelId?: string;
	withBackgroundInfo?: boolean;
	precisionMode?: boolean;
}

export interface ConversationHistory {
	prompt: string;
	response: string;
}

export interface TokenUsage {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
}

export interface LlmResponse {
	content: string;
	timestamp: number;
	usage?: TokenUsage;
	advices?: string[];
}

export interface Version {
	id: number;
	input: FormData;
	response: LlmResponse | null;
	isLoading: boolean;
}

export interface Session {
	id: number;
	versions: Version[];
	activeVersionId: number | null;
	selectedProviderId: ModelProvider;
	selectedModelId: string;
}

interface LlmSessionState {
	sessions: Session[];
	activeSessionId: number;
	globalSelectedProviderId: ModelProvider;
	globalSelectedModelId: string;

	// Actions
	addSession: () => void;
	clearAllSessions: () => void;
	setActiveSession: (sessionId: number) => void;
	addVersion: (sessionId: number, input: FormData) => number;
	setVersionResponse: (
		sessionId: number,
		versionId: number,
		response: LlmResponse,
	) => void;
	setVersionLoading: (
		sessionId: number,
		versionId: number,
		isLoading: boolean,
	) => void;
	setActiveVersion: (sessionId: number, versionId: number) => void;
	setSessionModel: (
		sessionId: number,
		providerId: ModelProvider,
		modelId: string,
	) => void;
	setGlobalModel: (providerId: ModelProvider, modelId: string) => void;
	getPreviousConversation: (sessionId: number) => ConversationHistory | null;
	getSelectedProvider: (sessionId: number) => ModelProvider;
	getSelectedModelId: (sessionId: number) => string;
}

// Default provider and model values
const defaultProviderId: ModelProvider = "anthropic";
const defaultModelId = "claude-3.7-sonnet";

// Initial session
const defaultSession: Session = {
	id: 1,
	versions: [],
	activeVersionId: null,
	selectedProviderId: defaultProviderId,
	selectedModelId: defaultModelId,
};

export const useLlmSessionStore = create<LlmSessionState>()(
	persist(
		(set, get) => ({
			sessions: [defaultSession],
			activeSessionId: 1,
			globalSelectedProviderId: defaultProviderId,
			globalSelectedModelId: defaultModelId,

			addSession: () =>
				set((state) => {
					const newSessionId =
						Math.max(...state.sessions.map((s) => s.id), 0) + 1;
					const newSession: Session = {
						id: newSessionId,
						versions: [],
						activeVersionId: null,
						selectedProviderId: state.globalSelectedProviderId,
						selectedModelId: state.globalSelectedModelId,
					};

					return {
						sessions: [...state.sessions, newSession],
						activeSessionId: newSessionId,
					};
				}),

			clearAllSessions: () =>
				set((state) => ({
					sessions: [
						{
							...defaultSession,
							selectedProviderId: state.globalSelectedProviderId,
							selectedModelId: state.globalSelectedModelId,
						},
					],
					activeSessionId: 1,
				})),

			setActiveSession: (sessionId) =>
				set(() => ({
					activeSessionId: sessionId,
				})),

			addVersion: (sessionId, input) => {
				let newVersionId = 1;

				set((state) => {
					const sessionIndex = state.sessions.findIndex(
						(s) => s.id === sessionId,
					);
					if (sessionIndex === -1) return state;

					const targetSession = state.sessions[sessionIndex];
					if (!targetSession) return state;

					newVersionId =
						targetSession.versions.length > 0
							? Math.max(...targetSession.versions.map((v) => v.id)) + 1
							: 1;

					// Ensure the provider and model IDs are included in the input
					const inputWithModel = {
						...input,
						providerId: input.providerId || targetSession.selectedProviderId,
						modelId: input.modelId || targetSession.selectedModelId,
					};

					const newVersion: Version = {
						id: newVersionId,
						input: inputWithModel,
						response: null,
						isLoading: true,
					};

					const updatedSession: Session = {
						...targetSession,
						versions: [...targetSession.versions, newVersion],
						activeVersionId: newVersionId,
					};

					const updatedSessions = [...state.sessions];
					updatedSessions[sessionIndex] = updatedSession;

					return { sessions: updatedSessions };
				});

				return newVersionId;
			},

			setVersionResponse: (sessionId, versionId, response) =>
				set((state) => {
					const sessionIndex = state.sessions.findIndex(
						(s) => s.id === sessionId,
					);
					if (sessionIndex === -1) return state;

					const targetSession = state.sessions[sessionIndex];
					if (!targetSession) return state;

					const versionIndex = targetSession.versions.findIndex(
						(v) => v.id === versionId,
					);
					if (versionIndex === -1) return state;

					const targetVersion = targetSession.versions[versionIndex];
					if (!targetVersion) return state;

					const updatedVersion: Version = {
						...targetVersion,
						response,
						isLoading: false,
					};

					const updatedVersions = [...targetSession.versions];
					updatedVersions[versionIndex] = updatedVersion;

					const updatedSession: Session = {
						...targetSession,
						versions: updatedVersions,
					};

					const updatedSessions = [...state.sessions];
					updatedSessions[sessionIndex] = updatedSession;

					return { sessions: updatedSessions };
				}),

			setVersionLoading: (sessionId, versionId, isLoading) =>
				set((state) => {
					const sessionIndex = state.sessions.findIndex(
						(s) => s.id === sessionId,
					);
					if (sessionIndex === -1) return state;

					const targetSession = state.sessions[sessionIndex];
					if (!targetSession) return state;

					const versionIndex = targetSession.versions.findIndex(
						(v) => v.id === versionId,
					);
					if (versionIndex === -1) return state;

					const targetVersion = targetSession.versions[versionIndex];
					if (!targetVersion) return state;

					const updatedVersion: Version = {
						...targetVersion,
						isLoading,
					};

					const updatedVersions = [...targetSession.versions];
					updatedVersions[versionIndex] = updatedVersion;

					const updatedSession: Session = {
						...targetSession,
						versions: updatedVersions,
					};

					const updatedSessions = [...state.sessions];
					updatedSessions[sessionIndex] = updatedSession;

					return { sessions: updatedSessions };
				}),

			setActiveVersion: (sessionId, versionId) =>
				set((state) => {
					const sessionIndex = state.sessions.findIndex(
						(s) => s.id === sessionId,
					);
					if (sessionIndex === -1) return state;

					const targetSession = state.sessions[sessionIndex];
					if (!targetSession) return state;

					const updatedSession: Session = {
						...targetSession,
						activeVersionId: versionId,
					};

					const updatedSessions = [...state.sessions];
					updatedSessions[sessionIndex] = updatedSession;

					return { sessions: updatedSessions };
				}),

			setSessionModel: (sessionId, providerId, modelId) =>
				set((state) => {
					const sessionIndex = state.sessions.findIndex(
						(s) => s.id === sessionId,
					);
					if (sessionIndex === -1) return state;

					const targetSession = state.sessions[sessionIndex];
					if (!targetSession) return state;

					const updatedSession: Session = {
						...targetSession,
						selectedProviderId: providerId,
						selectedModelId: modelId,
					};

					const updatedSessions = [...state.sessions];
					updatedSessions[sessionIndex] = updatedSession;

					return {
						sessions: updatedSessions,
						globalSelectedProviderId: providerId,
						globalSelectedModelId: modelId,
					};
				}),

			setGlobalModel: (providerId, modelId) =>
				set(() => ({
					globalSelectedProviderId: providerId,
					globalSelectedModelId: modelId,
				})),

			getPreviousConversation: (sessionId) => {
				const state = get();
				const session = state.sessions.find((s) => s.id === sessionId);

				if (!session || session.versions.length === 0) {
					return null;
				}

				// Get the last version that has a response
				const versionsWithResponses = session.versions
					.filter((v) => v.response !== null)
					.sort((a, b) => b.id - a.id); // Sort by id descending

				if (versionsWithResponses.length === 0) {
					return null;
				}

				const lastVersion = versionsWithResponses[0];

				if (!lastVersion || !lastVersion.response) {
					return null;
				}

				// Try to parse the content as JSON to extract the code
				let responseContent: {
					code: string;
					advices?: string[];
					usage?: TokenUsage;
				};
				try {
					responseContent = JSON.parse(lastVersion.response.content);
				} catch (error) {
					// If parsing fails, use the content directly
					responseContent = {
						code: lastVersion.response.content,
					};
				}

				return {
					prompt: lastVersion.input.prompt,
					response: responseContent.code,
				};
			},

			getSelectedProvider: (sessionId) => {
				const state = get();
				const session = state.sessions.find((s) => s.id === sessionId);

				if (!session) {
					return state.globalSelectedProviderId;
				}

				return session.selectedProviderId;
			},

			getSelectedModelId: (sessionId) => {
				const state = get();
				const session = state.sessions.find((s) => s.id === sessionId);

				if (!session) {
					return state.globalSelectedModelId;
				}

				return session.selectedModelId;
			},
		}),
		{
			name: "llm-session-storage", // name of the item in localStorage
			partialize: (state) => ({
				sessions: state.sessions,
				activeSessionId: state.activeSessionId,
				globalSelectedProviderId: state.globalSelectedProviderId,
				globalSelectedModelId: state.globalSelectedModelId,
			}),
		},
	),
);
