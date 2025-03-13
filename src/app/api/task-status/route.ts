import { runs } from '@trigger.dev/sdk/v3'
import { NextResponse } from 'next/server'

// Define the response type for our API
interface TaskStatusResponse {
  taskId: string
  status: 'processing' | 'completed' | 'error'
  output?: any
  error?: any
  startedAt?: string
  completedAt?: string
  originalStatus?: string
}

export async function GET(request: Request) {
  // Get the task ID from the URL query parameters
  const url = new URL(request.url)
  const taskId = url.searchParams.get('taskId')

  if (!taskId) {
    return NextResponse.json({ error: 'Missing taskId parameter' }, { status: 400 })
  }

  try {
    console.log(`Fetching task status for: ${taskId}`)

    // Use the Trigger.dev SDK to retrieve the run
    const result = await runs.retrieve(taskId)

    console.log('Run status response:', {
      id: result.id,
      status: result.status,
      hasOutput: !!result.output,
    })

    // Map Trigger.dev status to our application status
    let status: 'processing' | 'completed' | 'error' = 'processing'

    // Check status based on the status string
    if (result.status === 'COMPLETED') {
      status = 'completed'
    } else if (
      result.status === 'FAILED' ||
      result.status === 'CRASHED' ||
      result.status === 'SYSTEM_FAILURE' ||
      result.status === 'CANCELED' ||
      result.status === 'INTERRUPTED'
    ) {
      status = 'error'
    } else {
      // Running, delayed, etc.
      status = 'processing'
    }

    // Prepare the response
    const response: TaskStatusResponse = {
      taskId: result.id,
      status,
      output: result.output,
      error: result.status === 'CANCELED' ? '任务已被取消' : result.error,
      startedAt: result.startedAt ? new Date(result.startedAt).toISOString() : undefined,
      completedAt: result.finishedAt ? new Date(result.finishedAt).toISOString() : undefined,
      originalStatus: result.status,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching task status:', error)

    // Return the error to the client instead of mock data
    return NextResponse.json(
      {
        taskId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to fetch task status',
      },
      { status: 500 },
    )
  }
}
