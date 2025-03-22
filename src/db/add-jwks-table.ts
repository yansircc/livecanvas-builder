import { sql } from 'drizzle-orm'
import { db } from './index'

async function addJwksTable() {
  console.log('🔑 Adding jwks table...')

  try {
    // Create the jwks table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "jwks" (
        "id" text PRIMARY KEY NOT NULL,
        "public_key" text NOT NULL,
        "private_key" text NOT NULL,
        "created_at" timestamp NOT NULL
      );
    `)

    console.log('✅ jwks table created successfully')
  } catch (error) {
    console.error('❌ Failed to create jwks table:', error)
    process.exit(1)
  }
}

// Run the function
addJwksTable().catch((error) => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})
