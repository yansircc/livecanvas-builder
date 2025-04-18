import { auth } from "@/server/auth";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { LNL_GUIDE } from "./lnl-guide";
import { generateACFFieldsTool } from "./tools/acf";

export const maxDuration = 60;

export async function POST(req: Request) {
	const session = await auth();
	if (!session) {
		return Response.json({ error: "请先登录" }, { status: 401 });
	}

	// Parse the request body once
	const body = await req.json();
	const { messages, apiKey } = body;

	if (!apiKey) {
		return Response.json({ error: "请先填写API密钥" }, { status: 401 });
	}

	const openai = createOpenAI({
		apiKey: apiKey,
		baseURL: "https://aihubmix.com/v1",
	});

	try {
		const result = streamText({
			model: openai("gpt-4.1"),
			messages,
			tools: {
				generateACFFields: generateACFFieldsTool,
			},
			maxSteps: 10,
			system: `
			你是一位WordPress开发专家，专门从事高级自定义字段(ACF)和Tangible Loop & Logic (LNL)开发。
			请使用'generateACFFields'工具帮助用户设计自定义ACF字段组，并生成相应的LNL代码。
			你的任务是输出 3 份代码：
			1. ACF 字段组；
			2. 极简的详情页模板(尽可能展示所有字段)
			3. 极简的归档页模板(设计前要询问用户希望在归档页展示哪些字段)
			下面是 LNL 的指南：
			${LNL_GUIDE}
			`,
		});

		return result.toDataStreamResponse();
	} catch (error) {
		console.error("Chat API error:", error);
		return Response.json(
			{ error: error instanceof Error ? error.message : "AI服务调用失败" },
			{ status: 500 },
		);
	}
}
