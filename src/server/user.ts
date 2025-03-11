'use server'

import { auth } from '@/lib/auth'

const signIn = async () => {
  await auth.api.signInEmail({
    body: {
      email: 'test@test.com',
      password: 'test123456',
    },
  })
}

const signUp = async () => {
  await auth.api.signUpEmail({
    body: { email: 'test@test.com', password: 'test123456', name: 'test' },
  })
}

export { signIn, signUp }
