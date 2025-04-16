import { auth } from "@/server/auth";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { generateACFFieldsTool } from "./tools/acf";
import { generateLNLCodeTool } from "./tools/lnl";

export const maxDuration = 60;

export async function POST(req: Request) {
	const session = await auth();
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const { messages } = await req.json();

	const result = streamText({
		model: openai("gpt-4.1-mini"),
		messages,
		tools: {
			generateACFFields: generateACFFieldsTool,
			generateLNLCode: generateLNLCodeTool,
		},
		maxSteps: 3,
		temperature: 0.2,
		system: `You are an expert in creating WordPress ACF field groups and related LNL(tangible loop & logic) code.
Your task is to help the user design an ACF field group for their specified post type, and then generate the related LNL code.`,
	});

	return result.toDataStreamResponse();
}
