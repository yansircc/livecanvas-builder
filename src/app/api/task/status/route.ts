import type { PollTaskResult, TaskStatus } from "@/types/common";
import { runs } from "@trigger.dev/sdk/v3";
import { NextResponse } from "next/server";

// Enable caching for completed tasks with revalidation every 60 seconds
export const revalidate = 60;

export async function GET(request: Request) {
	// Get the task ID from the URL query parameters
	const url = new URL(request.url);
	const taskId = url.searchParams.get("taskId");

	if (!taskId) {
		return NextResponse.json(
			{ error: "Missing taskId parameter" },
			{ status: 400 },
		);
	}

	try {
		// Use the Trigger.dev SDK to retrieve the run
		const result = await runs.retrieve(taskId);
		console.log(
			`${taskId} 任务状态: ${result.status}, 输出状态: ${!!result.output}`,
		);

		// Directly use the Trigger.dev status as our TaskStatus
		const status = result.status as TaskStatus;

		// Prepare the response
		const response: PollTaskResult = {
			taskId: result.id,
			status,
			code: result.output,
			error:
				status === "CANCELED"
					? "任务已被取消"
					: typeof result.error === "string"
						? result.error
						: undefined,
			advices: [],
		};

		// Use different cache headers based on task status
		// For completed tasks, cache with revalidation
		// For other statuses, no cache
		if (status === "COMPLETED") {
			return NextResponse.json(response, {
				headers: {
					"Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
				},
			});
		}

		// For processing tasks, don't cache
		return NextResponse.json(response, {
			headers: {
				"Cache-Control": "no-store, max-age=0",
			},
		});
	} catch (error) {
		console.error("Error fetching task status:", error);

		// Return the error to the client instead of mock data
		return NextResponse.json(
			{
				taskId,
				status: "FAILED",
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch task status",
			},
			{
				status: 500,
				headers: {
					"Cache-Control": "no-store, max-age=0",
				},
			},
		);
	}
}
