import { auth } from "@/server/auth";
import { chatGenerationTask } from "@/trigger/chat-generation";
import type { ChatTaskResponse } from "@/types/chat";
import { tasks } from "@trigger.dev/sdk/v3";

// Allow streaming responses up to 1 minutes
export const maxDuration = 60;
interface ChatRequestBody {
  prompt: string;
  withBackgroundInfo?: boolean;
  history?: { prompt: string; response?: string }[];
  modelId?: string;
  callbackUrl?: string; // URL to call back with results (for long-running tasks)
  // 精准模式选项，会额外消耗更多token来获取更精准的UI文档
  precisionMode?: boolean;
}

/**
 * 创建错误响应
 * @param message 错误消息
 * @param status HTTP状态码
 * @returns 错误响应
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
    }
  );
}

/**
 * 获取DaisyUI教程
 * @link https://daisyui.com/llms.txt
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

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return createErrorResponse("Unauthorized", 401);
    }

    // 获取用户数据用于任务标记
    const { user } = session;

    const body = (await req.json()) as ChatRequestBody;

    // Extract prompt, withBackgroundInfo, history, and modelId
    const {
      prompt,
      withBackgroundInfo,
      history,
      modelId,
      callbackUrl,
      precisionMode,
    } = body;

    // Default model if none provided
    const selectedModelId = modelId ?? "openai/gpt-4o-mini";

    // 处理用户背景信息
    let context: string | undefined;
    if (withBackgroundInfo && user.backgroundInfo) {
      context = user.backgroundInfo;
    }

    // 如果启用精准模式，从API获取DaisyUI教程
    let uiTutorial: string | undefined;
    if (precisionMode) {
      uiTutorial = await fetchDaisyUIPrompt();
      console.log("精准模式已启用，已加载DaisyUI文档");
    }

    // 所有请求都发送到 Trigger.dev 处理
    try {
      // 触发 Trigger.dev 任务
      const handle = await tasks.trigger(
        chatGenerationTask.id,
        {
          prompt,
          context,
          history,
          model: selectedModelId,
          callbackUrl,
          precisionMode,
          uiTutorial,
        },
        {
          tags: [user.email],
        }
      );

      // 返回任务已开始的响应
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
