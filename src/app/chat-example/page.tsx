import { LongRunningChatExample } from './LongRunningChatExample'

export const metadata = {
  title: 'Chat Generation Example',
  description: 'Generate HTML content using Trigger.dev tasks',
}

export default function ChatExamplePage() {
  return (
    <div className="container py-10">
      <h1 className="mb-8 text-center text-3xl font-bold">Chat Generation with Trigger.dev</h1>
      <p className="text-muted-foreground mb-8 text-center">
        This example demonstrates how to use Trigger.dev to handle chat generation tasks that might
        exceed Vercel&apos;s 60-second timeout limit.
      </p>
      <LongRunningChatExample />
    </div>
  )
}
