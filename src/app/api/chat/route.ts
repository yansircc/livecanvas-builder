import {
	type AvailableModelId,
	type AvailableProviderId,
	isValidModel,
} from "@/lib/models";
import { auth } from "@/server/auth";
import { chatGenerationTask } from "@/trigger/chat-generation";
import type { ChatTaskResponse } from "@/types/chat";
import { tasks } from "@trigger.dev/sdk/v3";
import { PROMPT } from "./prompt";

// Allow streaming responses up to 1 minutes
export const maxDuration = 60;

interface ChatRequestBody {
	providerId: AvailableProviderId;
	modelId: AvailableModelId;
	prompt: string;
	withBackgroundInfo?: boolean;
	precisionMode?: boolean;
	history?: { prompt: string; response?: string }[];
}

/**
 * 创建错误响应
 */
function createErrorResponse(message: string, status = 500): Response {
	return new Response(
		JSON.stringify({
			error: message,
			code: "<!-- Error: Failed to generate valid HTML -->",
			advices: ["Try a different prompt or model"],
		}),
		{
			status,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
}

/**
 * 获取DaisyUI教程
 */
async function fetchDaisyUIPrompt() {
	try {
		const response = await fetch("https://daisyui.com/llms.txt");
		return await response.text();
	} catch (error) {
		console.error("Failed to fetch DaisyUI tutorial:", error);
		return undefined;
	}
}

/**
 * 构建上下文提示词
 */
function buildContextualPrompt(
	prompt: string,
	context?: string,
	history?: { prompt: string; response?: string }[],
	uiTutorial?: string,
): string {
	let contextualPrompt = PROMPT;

	// Add user context if available
	if (context?.trim()) {
		contextualPrompt += `\n\n### User Context:\n${context}`;
	}

	// Add conversation history if available
	if (history && history.length > 0) {
		contextualPrompt += "\n\n### Previous Conversation Context:";
		history.forEach(
			(item: { prompt: string; response?: string }, index: number) => {
				contextualPrompt += `\n\nUser Request ${index + 1}: ${item.prompt}`;
				if (item.response) {
					contextualPrompt += `\n\nYour Response ${
						index + 1
					}: You generated the following HTML code:\n\`\`\`html\n${
						item.response
					}\n\`\`\``;
				}
			},
		);
		contextualPrompt += "\n\n### Current Request:";
	}

	// Add daisyUI tutorial if available
	if (uiTutorial) {
		contextualPrompt += `\n\n### DaisyUI Tutorial:\n${uiTutorial}`;
	}

	// Add the current message
	contextualPrompt += `\n\n Here is the command you need to execute:${prompt}`;

	return contextualPrompt;
}

export async function POST(req: Request) {
	try {
		const session = await auth();
		if (!session) {
			return createErrorResponse("Unauthorized", 401);
		}

		const { user } = session;
		const body = (await req.json()) as ChatRequestBody;

		const {
			providerId,
			modelId,
			prompt,
			withBackgroundInfo,
			precisionMode,
			history,
		} = body;

		const isValid = await isValidModel(providerId, modelId);
		if (!isValid) {
			return createErrorResponse("Invalid model", 400);
		}

		// Process user background info
		let context: string | undefined;
		if (withBackgroundInfo && user.backgroundInfo) {
			context = user.backgroundInfo;
		}

		// Fetch DaisyUI tutorial if precision mode is enabled
		let uiTutorial: string | undefined;
		if (precisionMode) {
			uiTutorial = await fetchDaisyUIPrompt();
			console.log("精准模式已启用，已加载DaisyUI文档");
		}

		// Build the complete prompt with all context
		const processedPrompt = buildContextualPrompt(
			prompt,
			context,
			history,
			uiTutorial,
		);

		try {
			// Trigger the task with processed prompt and provider ID
			const handle = await tasks.trigger(
				chatGenerationTask.id,
				{
					processedPrompt,
					providerId,
					modelId,
				},
				{
					tags: [user.email],
				},
			);

			const response: ChatTaskResponse = {
				taskId: handle.id,
				status: "processing",
				code: "<!-- Processing your request, please check back later -->",
				advices: [
					"Your request is being processed",
					"任务已经开始处理",
					"请稍后查看结果",
				],
			};

			return new Response(JSON.stringify(response), {
				headers: {
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			console.error("Failed to trigger task:", error);
			return createErrorResponse("Failed to start processing task", 500);
		}
	} catch (error) {
		console.error("Error parsing request:", error);
		return createErrorResponse("Invalid request format", 400);
	}
}
