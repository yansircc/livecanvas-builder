import { tryCatch } from "@/lib/try-catch";
import { runs } from "@trigger.dev/sdk/v3";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const { taskId } = await request.json();

	const { data, error } = await tryCatch(
		(async () => await runs.cancel(taskId))(),
	);

	if (error) {
		return NextResponse.json({
			success: false,
			message: "Failed to cancel task",
		});
	}

	return NextResponse.json({
		success: true,
		message: "Task cancelled successfully",
	});
}
