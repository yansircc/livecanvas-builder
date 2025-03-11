import { headers } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'
import { signIn, signUp } from '@/server/user'
import SignOut from './sign-out'

export default async function Test() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md rounded-lg bg-white p-4 shadow-md">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignOut className="w-full" />
          <Button onClick={signIn} className="w-full">
            Sign In
          </Button>
          <Button onClick={signUp} className="w-full">
            Sign Up
          </Button>
          <pre className="rounded bg-gray-200 p-2">
            {session ? session.user.name : 'no session'}
          </pre>
        </CardContent>
      </Card>
    </main>
  )
}
