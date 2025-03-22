import { JwtAuthExample } from '@/components/examples/jwt-auth-example'

export const metadata = {
  title: 'JWT Authentication Example',
  description: 'Example of JWT-based authentication and API protection',
}

export default function JwtExamplePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-center text-2xl font-bold">JWT Authentication Example</h1>

      <div className="mx-auto max-w-3xl">
        <p className="mb-8 text-center text-gray-600">
          This example demonstrates how to use JWT for client-side authentication and API
          protection.
        </p>

        <JwtAuthExample />
      </div>
    </div>
  )
}
