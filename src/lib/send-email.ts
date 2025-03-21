/**
 * Send an email using the Plunk API
 * @param to - The email address of the recipient
 * @param subject - The subject of the email
 * @param body - The body of the email
 * @returns The response from the Plunk API
 * @see https://docs.useplunk.com/api-reference/transactional/send
 */

import { env } from '@/env'

interface SendEmailOptions {
  to: string
  subject: string
  body: string
  subscribed?: boolean
  name?: string
  from?: string
  reply?: string
  headers?: Record<string, string>
}

export async function sendEmail({
  to,
  subject,
  body,
  subscribed = true,
  name,
  from,
  reply,
  headers,
}: SendEmailOptions) {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.PLUNK_API_KEY}`,
      },
      body: JSON.stringify({ to, subject, body, subscribed, name, from, reply, headers }),
    }
    const response = await fetch(env.PLUNK_API_URL + '/send', options)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('发送邮件失败:', error)
    throw error
  }
}
