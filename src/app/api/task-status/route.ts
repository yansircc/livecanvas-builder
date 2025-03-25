import type { TaskStatus, TaskStatusResponse } from "@/types/task";
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
      { status: 400 }
    );
  }

  try {
    console.log(`Fetching task status for: ${taskId}`);

    // Use the Trigger.dev SDK to retrieve the run
    const result = await runs.retrieve(taskId);

    console.log("Run status response:", {
      id: result.id,
      status: result.status,
      hasOutput: !!result.output,
    });

    // Map Trigger.dev status to our application status
    let status: TaskStatus = "processing";

    // Check status based on the status string
    if (result.status === "COMPLETED") {
      status = "completed";
    } else if (
      result.status === "FAILED" ||
      result.status === "CRASHED" ||
      result.status === "SYSTEM_FAILURE" ||
      result.status === "CANCELED" ||
      result.status === "INTERRUPTED"
    ) {
      status = "error";
    } else {
      // Running, delayed, etc.
      status = "processing";
    }

    // Prepare the response
    const response: TaskStatusResponse = {
      taskId: result.id,
      status,
      output: result.output,
      error: result.status === "CANCELED" ? "任务已被取消" : result.error,
      startedAt: result.startedAt
        ? new Date(result.startedAt).toISOString()
        : undefined,
      completedAt: result.finishedAt
        ? new Date(result.finishedAt).toISOString()
        : undefined,
      originalStatus: result.status,
    };

    // Use different cache headers based on task status
    // For completed/error tasks, cache with revalidation
    // For processing tasks, no cache
    if (status === "completed" || status === "error") {
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
        status: "error",
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
      }
    );
  }
}
