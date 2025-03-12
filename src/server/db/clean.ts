import { sql } from 'drizzle-orm'
import { db } from './index'

async function cleanDatabase() {
  console.log('🧹 Starting database clean...')

  try {
    // Step 1: Drop and recreate the public schema
    console.log('Dropping and recreating the public schema...')

    try {
      // This will drop all tables, views, functions, etc. in the public schema
      await db.execute(sql`DROP SCHEMA public CASCADE`)
      await db.execute(sql`CREATE SCHEMA public`)

      // Grant privileges back to public
      await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres`)
      await db.execute(sql`GRANT ALL ON SCHEMA public TO public`)

      console.log('✅ Public schema dropped and recreated successfully')
    } catch (error) {
      console.error('❌ Error dropping/recreating schema:', error)
      throw error
    }
  } catch (error) {
    console.error('❌ Database clean failed:', error)
    process.exit(1)
  }
}

// Run the clean function
cleanDatabase().catch((error) => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})
