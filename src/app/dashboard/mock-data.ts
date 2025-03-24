"use server";

import type { ConversationHistory } from "./store/llm-session-store";

const animals = ["dog", "cat", "bird", "fish", "snake"];

export async function getLlmResponse(
  prompt: string,
  history?: ConversationHistory,
  modelId?: string
) {
  // Log history for debugging
  if (history) {
    console.log("Previous conversation:", history);
  }

  if (modelId) {
    console.log("Using model:", modelId);
  }

  const random = Math.random();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // If there's history, include it in the mock response
  const historyPrefix = history
    ? `Based on previous Q: "${history.prompt}" and A: "${JSON.stringify(
        history.response
      ).substring(0, 30)}..."`
    : "";

  // Generate random token usage data
  const promptLength = prompt.length;
  const promptTokens =
    Math.floor(promptLength / 4) + Math.floor(Math.random() * 50);
  const completionTokens = Math.floor(100 + Math.random() * 150);
  const totalTokens = promptTokens + completionTokens;

  return {
    code: `\`\`\`python\n# ${historyPrefix}\nprint(${random})\n\`\`\``,
    advices: [
      `This is a mock response for ${
        animals[Math.floor(Math.random() * animals.length)]
      }${history ? " with conversation history" : ""}`,
      `This is another mock response for ${
        animals[Math.floor(Math.random() * animals.length)]
      }`,
      `This is a third mock response for ${
        animals[Math.floor(Math.random() * animals.length)]
      }`,
    ],
    usage: {
      promptTokens,
      completionTokens,
      totalTokens,
    },
  };
}
