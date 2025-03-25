"use client";

import type { Session } from "next-auth";
import { useMemo, useState } from "react";
import { useLlmSessionStore } from "../../hooks/llm-session-store";
import { LlmFormComponent } from "./form";
import type { ResponseData } from "./types";

interface LlmFormProps {
  session: Session | null;
}

export default function LlmForm({ session }: LlmFormProps) {
  const { activeSessionId, sessions } = useLlmSessionStore();
  const [prompt, setPrompt] = useState("");

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId
  );

  // Get the active version if it exists
  const activeVersion = activeSession?.activeVersionId
    ? activeSession.versions.find((v) => v.id === activeSession.activeVersionId)
    : null;

  // Parse response data to get advice and usage
  const { adviceItems, tokenUsage } = useMemo(() => {
    let adviceItems: string[] = [];
    let tokenUsage = undefined;

    if (activeVersion?.response) {
      try {
        // First try to use the advices directly from the response object
        if (activeVersion.response.advices) {
          adviceItems = activeVersion.response.advices;
        }

        // Then try to use the usage directly from the response object
        if (activeVersion.response.usage) {
          tokenUsage = activeVersion.response.usage;
        }

        // If we don't have what we need, try to parse the content
        if (!adviceItems.length || !tokenUsage) {
          const responseData = JSON.parse(
            activeVersion.response.content
          ) as ResponseData;

          // Use parsed advices if available and we don't have them already
          if (responseData.advices && !adviceItems.length) {
            adviceItems = responseData.advices;
          }

          // Use parsed usage if available and we don't have it already
          if (responseData.usage && !tokenUsage) {
            tokenUsage = responseData.usage;
          }
        }
      } catch (e) {
        console.error("Failed to parse response data", e);
      }
    }

    return { adviceItems, tokenUsage };
  }, [activeVersion]);

  // Handle clicking on an advice item to append to textarea
  const handleAdviceClick = (advice: string) => {
    const newValue = prompt ? `${prompt}\n\n${advice}` : advice;
    setPrompt(newValue);
  };

  const selectedModelId = activeVersion?.input.modelId || "";

  return <LlmFormComponent session={session} />;
}
