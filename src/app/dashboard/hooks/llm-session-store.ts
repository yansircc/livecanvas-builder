import type { AvailableModelId, AvailableProviderId } from "@/lib/models";
import type { TaskStatus } from "@/types/task";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FormData {
	prompt: string;
	history?: ConversationHistory[];
	providerId?: AvailableProviderId;
	modelId?: AvailableModelId;
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
	taskStatus?: TaskStatus;
	taskError?: string;
}

export interface Session {
	id: number;
	versions: Version[];
	activeVersionId: number | null;
	hasCompletedVersion?: boolean;
}

interface LlmSessionState {
	sessions: Session[];
	activeSessionId: number;
	globalSelectedProviderId: AvailableProviderId;
	globalSelectedModelId: AvailableModelId;

	// Getters
	getActiveSession: () => Session | undefined;
	getActiveVersion: () => Version | undefined;
	getSessionVersion: (
		sessionId: number,
		versionId: number,
	) => Version | undefined;

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
	setVersionTaskStatus: (
		sessionId: number,
		versionId: number,
		status: TaskStatus,
		error?: string,
	) => void;
	setActiveVersion: (sessionId: number, versionId: number) => void;
	setGlobalModel: (
		providerId: AvailableProviderId,
		modelId: AvailableModelId,
	) => void;
	getPreviousConversation: (sessionId: number) => ConversationHistory | null;
	getSelectedProvider: () => AvailableProviderId;
	getSelectedModelId: () => AvailableModelId;
	cleanupIncompleteVersions: () => void;
	deleteVersion: (sessionId: number, versionId: number) => void;
	deleteSession: (sessionId: number) => void;
	markSessionCompleted: (sessionId: number) => void;
	clearSessionCompleted: (sessionId: number) => void;
}

// Default provider and model values
const defaultProviderId: AvailableProviderId = "anthropic";
const defaultModelId: AvailableModelId = "claude-3-7-sonnet-20250219";

// Initial session
const defaultSession: Session = {
	id: 1,
	versions: [],
	activeVersionId: null,
};

export const useLlmSessionStore = create<LlmSessionState>()(
	persist(
		(set, get) => ({
			sessions: [defaultSession],
			activeSessionId: 1,
			globalSelectedProviderId: defaultProviderId,
			globalSelectedModelId: defaultModelId,

			// Getters
			getActiveSession: () => {
				const state = get();
				return state.sessions.find((s) => s.id === state.activeSessionId);
			},

			getActiveVersion: () => {
				const activeSession = get().getActiveSession();
				if (!activeSession?.activeVersionId) return undefined;
				return activeSession.versions.find(
					(v) => v.id === activeSession.activeVersionId,
				);
			},

			getSessionVersion: (sessionId, versionId) => {
				const session = get().sessions.find((s) => s.id === sessionId);
				return session?.versions.find((v) => v.id === versionId);
			},

			// Actions
			addSession: () =>
				set((state) => {
					const newSessionId =
						Math.max(...state.sessions.map((s) => s.id), 0) + 1;
					const newSession: Session = {
						id: newSessionId,
						versions: [],
						activeVersionId: null,
					};

					return {
						sessions: [...state.sessions, newSession],
						activeSessionId: newSessionId,
					};
				}),

			clearAllSessions: () =>
				set(() => ({
					sessions: [
						{
							...defaultSession,
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
						providerId: input.providerId || state.globalSelectedProviderId,
						modelId: input.modelId || state.globalSelectedModelId,
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

			setVersionTaskStatus: (sessionId, versionId, status, error) =>
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
						taskStatus: status,
						taskError: error,
						isLoading: ![
							"COMPLETED",
							"FAILED",
							"CRASHED",
							"SYSTEM_FAILURE",
							"INTERRUPTED",
							"CANCELED",
						].includes(status),
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

			getSelectedProvider: () => {
				const state = get();
				return state.globalSelectedProviderId;
			},

			getSelectedModelId: () => {
				const state = get();
				return state.globalSelectedModelId;
			},

			cleanupIncompleteVersions: () =>
				set((state) => {
					const updatedSessions = state.sessions.map((session) => {
						// Filter out versions that have input but no response and are still loading
						const filteredVersions = session.versions.filter(
							(version) =>
								!(
									version.input &&
									version.response === null &&
									version.isLoading
								),
						);

						// Update activeVersionId if necessary
						let activeVersionId = session.activeVersionId;
						if (
							activeVersionId !== null &&
							!filteredVersions.some((v) => v.id === activeVersionId) &&
							filteredVersions.length > 0
						) {
							// If the active version was removed, set the latest version as active
							activeVersionId =
								filteredVersions[filteredVersions.length - 1]?.id || null;
						} else if (filteredVersions.length === 0) {
							activeVersionId = null;
						}

						return {
							...session,
							versions: filteredVersions,
							activeVersionId,
						};
					});

					return { sessions: updatedSessions };
				}),

			deleteVersion: (sessionId, versionId) =>
				set((state) => {
					const sessionIndex = state.sessions.findIndex(
						(s) => s.id === sessionId,
					);
					if (sessionIndex === -1) return state;

					const session = state.sessions[sessionIndex];
					if (!session) return state;

					// Filter out the target version
					const updatedVersions = session.versions.filter(
						(v) => v.id !== versionId,
					);

					// If there are no versions left, don't change the session
					if (updatedVersions.length === 0 && session.versions.length === 1) {
						return state;
					}

					// Update activeVersionId if necessary
					let activeVersionId = session.activeVersionId;
					if (activeVersionId === versionId && updatedVersions.length > 0) {
						// Set the latest version as active if the deleted version was active
						const lastVersion = updatedVersions[updatedVersions.length - 1];
						activeVersionId = lastVersion ? lastVersion.id : null;
					} else if (updatedVersions.length === 0) {
						activeVersionId = null;
					}

					const updatedSession = {
						...session,
						versions: updatedVersions,
						activeVersionId,
					};

					const updatedSessions = [...state.sessions];
					updatedSessions[sessionIndex] = updatedSession;

					return { sessions: updatedSessions };
				}),

			deleteSession: (sessionId) =>
				set((state) => {
					// Don't delete if it's the only session
					if (state.sessions.length <= 1) return state;

					const updatedSessions = state.sessions.filter(
						(s) => s.id !== sessionId,
					);

					// If the active session is deleted, set the first available session as active
					let activeSessionId = state.activeSessionId;
					if (activeSessionId === sessionId && updatedSessions.length > 0) {
						const firstSession = updatedSessions[0];
						activeSessionId = firstSession ? firstSession.id : activeSessionId;
					}

					return {
						sessions: updatedSessions,
						activeSessionId,
					};
				}),

			markSessionCompleted: (sessionId) =>
				set((state) => {
					const sessionIndex = state.sessions.findIndex(
						(s) => s.id === sessionId,
					);
					if (sessionIndex === -1) return state;

					const updatedSessions = [...state.sessions];
					const session = { ...updatedSessions[sessionIndex] };
					session.hasCompletedVersion = true;
					updatedSessions[sessionIndex] = session as Session;

					return { sessions: updatedSessions };
				}),

			clearSessionCompleted: (sessionId) =>
				set((state) => {
					const sessionIndex = state.sessions.findIndex(
						(s) => s.id === sessionId,
					);
					if (sessionIndex === -1) return state;

					const updatedSessions = [...state.sessions];
					const session = { ...updatedSessions[sessionIndex] };
					session.hasCompletedVersion = false;
					updatedSessions[sessionIndex] = session as Session;

					return { sessions: updatedSessions };
				}),
		}),
		{
			name: "llm-session-storage",
			partialize: (state) => ({
				sessions: state.sessions,
				activeSessionId: state.activeSessionId,
				globalSelectedProviderId: state.globalSelectedProviderId,
				globalSelectedModelId: state.globalSelectedModelId,
			}),
		},
	),
);
