'use client'

import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'

export function AuthClientDemo() {
  const { user, isLoading, isAuthenticated, error } = useAuth()

  if (isLoading) {
    return (
      <div className="bg-muted animate-pulse rounded-md border p-4">
        Loading authentication data...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border bg-red-100 p-4 text-red-800">
        <p className="font-semibold">Error loading authentication data:</p>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="bg-muted rounded-md border p-4">
      <p>Authentication Success: {isAuthenticated ? 'Yes' : 'No'}</p>

      {isAuthenticated && user ? (
        <div className="mt-2">
          <p>User ID: {user.id}</p>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          {user.image && (
            <div className="mt-2">
              <p>Profile Image:</p>
              <Image
                src={user.image}
                alt={`${user.name}'s profile`}
                className="mt-1 h-16 w-16 rounded-full"
                width={64}
                height={64}
              />
            </div>
          )}
        </div>
      ) : (
        <p className="mt-2 text-gray-500">Not authenticated</p>
      )}
    </div>
  )
}
