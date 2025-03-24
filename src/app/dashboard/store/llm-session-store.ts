import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FormData {
  prompt: string;
  history?: ConversationHistory[];
  modelId?: string;
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
  selectedModelId: string;
}

interface LlmSessionState {
  sessions: Session[];
  activeSessionId: number;
  globalSelectedModelId: string;

  // Actions
  addSession: () => void;
  clearAllSessions: () => void;
  setActiveSession: (sessionId: number) => void;
  addVersion: (sessionId: number, input: FormData) => number;
  setVersionResponse: (
    sessionId: number,
    versionId: number,
    response: LlmResponse
  ) => void;
  setVersionLoading: (
    sessionId: number,
    versionId: number,
    isLoading: boolean
  ) => void;
  setActiveVersion: (sessionId: number, versionId: number) => void;
  setSessionModelId: (sessionId: number, modelId: string) => void;
  setGlobalModelId: (modelId: string) => void;
  getPreviousConversation: (sessionId: number) => ConversationHistory | null;
  getSelectedModelId: (sessionId: number) => string;
}

// Default model ID from the first available model
const defaultModelId = "anthropic/claude-3.7-sonnet";

// Initial session
const defaultSession: Session = {
  id: 1,
  versions: [],
  activeVersionId: null,
  selectedModelId: defaultModelId,
};

export const useLlmSessionStore = create<LlmSessionState>()(
  persist(
    (set, get) => ({
      sessions: [defaultSession],
      activeSessionId: 1,
      globalSelectedModelId: defaultModelId,

      addSession: () =>
        set((state) => {
          const newSessionId =
            Math.max(...state.sessions.map((s) => s.id), 0) + 1;
          const newSession: Session = {
            id: newSessionId,
            versions: [],
            activeVersionId: null,
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
            (s) => s.id === sessionId
          );
          if (sessionIndex === -1) return state;

          const targetSession = state.sessions[sessionIndex];
          if (!targetSession) return state;

          newVersionId =
            targetSession.versions.length > 0
              ? Math.max(...targetSession.versions.map((v) => v.id)) + 1
              : 1;

          // Ensure the model ID is included in the input
          const inputWithModel = {
            ...input,
            modelId: targetSession.selectedModelId,
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
            (s) => s.id === sessionId
          );
          if (sessionIndex === -1) return state;

          const targetSession = state.sessions[sessionIndex];
          if (!targetSession) return state;

          const versionIndex = targetSession.versions.findIndex(
            (v) => v.id === versionId
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
            (s) => s.id === sessionId
          );
          if (sessionIndex === -1) return state;

          const targetSession = state.sessions[sessionIndex];
          if (!targetSession) return state;

          const versionIndex = targetSession.versions.findIndex(
            (v) => v.id === versionId
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
            (s) => s.id === sessionId
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

      setSessionModelId: (sessionId, modelId) =>
        set((state) => {
          const sessionIndex = state.sessions.findIndex(
            (s) => s.id === sessionId
          );
          if (sessionIndex === -1) return state;

          const targetSession = state.sessions[sessionIndex];
          if (!targetSession) return state;

          const updatedSession: Session = {
            ...targetSession,
            selectedModelId: modelId,
          };

          const updatedSessions = [...state.sessions];
          updatedSessions[sessionIndex] = updatedSession;

          return {
            sessions: updatedSessions,
            globalSelectedModelId: modelId,
          };
        }),

      setGlobalModelId: (modelId) =>
        set(() => ({
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

        return {
          prompt: lastVersion.input.prompt,
          response: JSON.parse(lastVersion.response.content),
        };
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
        globalSelectedModelId: state.globalSelectedModelId,
      }),
    }
  )
);
