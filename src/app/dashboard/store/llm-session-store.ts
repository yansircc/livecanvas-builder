import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FormData {
  prompt: string;
}

export interface LlmResponse {
  content: string;
  timestamp: number;
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
}

interface LlmSessionState {
  sessions: Session[];
  activeSessionId: number;

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
}

// Initial session
const defaultSession: Session = {
  id: 1,
  versions: [],
  activeVersionId: null,
};

export const useLlmSessionStore = create<LlmSessionState>()(
  persist(
    (set) => ({
      sessions: [defaultSession],
      activeSessionId: 1,

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
          sessions: [defaultSession],
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

          const newVersion: Version = {
            id: newVersionId,
            input,
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
    }),
    {
      name: "llm-session-storage", // name of the item in localStorage
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);
