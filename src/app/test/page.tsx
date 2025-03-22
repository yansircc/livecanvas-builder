import { getCurrentUser } from '@/actions/user'
import { AuthClientDemo } from './auth-client-demo'

export default async function TestPage() {
  const authResult = await getCurrentUser()

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Authentication Test Page</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Server Component Auth Status:</h2>
        <div className="bg-muted rounded-md border p-4">
          <p>Authentication Success: {authResult.success ? 'Yes' : 'No'}</p>
          {authResult.success ? (
            <div className="mt-2">
              <p>User ID: {authResult.user.id}</p>
              <p>Name: {authResult.user.name}</p>
              <p>Email: {authResult.user.email}</p>
            </div>
          ) : (
            <p className="text-red-500">Error: {authResult.error}</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Client Component Auth Demo:</h2>
        <AuthClientDemo />
      </div>
    </div>
  )
}
