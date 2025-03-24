# Long-Running Tasks with Trigger.dev

This directory contains the implementation of tasks using [Trigger.dev](https://trigger.dev). These tasks are designed to handle all chat operations, bypassing Vercel's 60-second timeout limit.

## Overview

Vercel serverless functions have a maximum execution time of 60 seconds. For AI-powered features like HTML generation, this limit can be too restrictive. To solve this problem, we use Trigger.dev to offload all chat tasks to their infrastructure, which supports execution times of up to 5 minutes (300 seconds) or more.

## Implementation

### Task Definition

The main task is defined in `chat-generation.ts`. This task:

1. Takes a message, context, and conversation history as input
2. Processes the input using an AI model (e.g., Claude or GPT-4)
3. Returns the generated HTML code and advice

The task is defined using Trigger.dev's `task` function, which allows for longer execution times:

```typescript
export const chatGenerationTask = task({
  id: 'chat-generation-task',
  maxDuration: 300, // 5 minutes
  run: async (payload) => {
    // Task implementation
  },
})
```

### API Integration

The task is integrated with our API in two places:

1. **Chat API (`/api/chat/route.ts`)**: All chat requests are sent to Trigger.dev for processing
2. **Task Status API (`/api/task-status/route.ts`)**: Allows clients to check the status of a task

### Client-Side Utilities

We provide client-side utilities in `src/utils/task-status.ts` to help with:

- Checking task status
- Polling for task completion
- Handling task results

## Usage

To use the chat API:

1. Make a request to the `/api/chat` endpoint with your message
2. You'll receive a response with a `taskId` and status set to 'processing'
3. Use the task ID to poll the `/api/task-status` endpoint until the task is complete
4. Once complete, you'll receive the full result

### Example

```typescript
// Make the initial request
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: 'Generate a landing page with a hero section',
  }),
})

const { taskId, status } = await response.json()

// Poll for the result
if (status === 'processing') {
  const result = await pollTaskStatus(taskId)
  console.log('Final result:', result)
}
```

## Configuration

Trigger.dev requires an API key, which should be set in your environment variables:

```
TRIGGER_API_KEY=your_api_key_here
```

## Deployment

To deploy your Trigger.dev tasks:

```bash
bun trigger:deploy
```

This will deploy your tasks to Trigger.dev's infrastructure, making them available for execution.

## Example Component

See `src/components/examples/LongRunningChatExample.tsx` for a complete example of how to use tasks in a React component.
