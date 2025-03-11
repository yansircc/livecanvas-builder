// write a test page to test the drizzle orm

import { db } from '@/server/db'

export default async function TestPage() {
  const data = await db.query.posts.findMany()
  return <div>{JSON.stringify(data)}</div>
}
