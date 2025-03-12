import * as crypto from 'crypto'
import { nanoid } from 'nanoid'
import { db } from './index'
import { sampleHtmlContents } from './sample-html-content'
import { account, favorite, like, project, tag, user } from './schema'

/**
 * Generate a password hash in the format used by better-auth
 * Format: salt:hash where hash is sha256(salt + password)
 */
function generatePasswordHash(password: string): string {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex')

  // Create hash using the salt and password
  const hash = crypto
    .createHash('sha256')
    .update(salt + password)
    .digest('hex')

  // Return in the format salt:hash
  return `${salt}:${hash}`
}

/**
 * Seed script for the database
 * Run with: bun src/server/db/seed.ts
 */
async function main() {
  console.log('🌱 Starting database seeding...')

  // Create sample users with IDs in the format used by better-auth
  console.log('Creating sample users...')
  const users = [
    {
      id: nanoid(22), // Generate ID with 22 characters to match better-auth format
      name: 'Demo User',
      email: 'demo@example.com',
      emailVerified: true,
      image: 'https://livecanvas-builder.b-cdn.net/avatars/1.webp',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(22),
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      image: 'https://livecanvas-builder.b-cdn.net/avatars/2.webp',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(22),
      name: 'Admin User',
      email: 'admin@example.com',
      emailVerified: true,
      image: 'https://livecanvas-builder.b-cdn.net/avatars/3.webp',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  // Insert users
  for (const userData of users) {
    await db.insert(user).values(userData).onConflictDoNothing()
  }

  // Create account entries with passwords for each user
  console.log('Creating account entries with passwords...')
  const accounts = [
    {
      id: nanoid(22),
      userId: users[0]!.id,
      providerId: 'credential', // Singular, not plural
      accountId: users[0]!.id, // Use user ID, not email
      password: generatePasswordHash('password123'), // Demo user password
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(22),
      userId: users[1]!.id,
      providerId: 'credential',
      accountId: users[1]!.id,
      password: generatePasswordHash('password123'), // Test user password
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: nanoid(22),
      userId: users[2]!.id,
      providerId: 'credential',
      accountId: users[2]!.id,
      password: generatePasswordHash('admin123'), // Admin user password
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  // Insert account entries
  for (const accountData of accounts) {
    await db.insert(account).values(accountData).onConflictDoNothing()
  }

  // Create sample tags
  console.log('Creating sample tags...')
  const tags = [
    {
      id: nanoid(),
      name: 'Bootstrap',
      count: 0,
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      name: 'Landing Page',
      count: 0,
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      name: 'Form',
      count: 0,
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      name: 'Dashboard',
      count: 0,
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      name: 'Card',
      count: 0,
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      name: 'Responsive',
      count: 0,
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      name: 'Animation',
      count: 0,
      createdAt: new Date(),
    },
  ]

  // Insert tags
  for (const tagData of tags) {
    await db.insert(tag).values(tagData).onConflictDoNothing()
  }

  // Make sure we have at least 3 users to create projects
  if (users.length < 3) {
    console.log('Not enough users to create projects')
    console.log('✅ Database seeding completed (partial).')
    return
  }

  // Non-null assertion for users[0..2] because we checked length >= 3
  const user0 = users[0]!
  const user1 = users[1]!
  const user2 = users[2]!

  // Create sample projects
  console.log('Creating sample projects...')

  const projectData = [
    {
      id: nanoid(),
      title: 'Simple Card Component',
      description: 'A clean and modern card component with image, title, text and button.',
      htmlContent: sampleHtmlContents[0]!, // non-null assertion
      thumbnail: 'https://livecanvas-builder.b-cdn.net/placeholder/1.svg',
      tags: 'Card,Bootstrap,Responsive',
      isPublished: true,
      likesCount: 5,
      userId: user0.id, // user0 is guaranteed
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: nanoid(),
      title: 'Responsive Pricing Table',
      description: 'A beautiful pricing table with three tiers, perfect for SaaS products.',
      htmlContent: sampleHtmlContents[1]!,
      thumbnail: 'https://livecanvas-builder.b-cdn.net/placeholder/2.svg',
      tags: 'Bootstrap,Responsive,Landing Page',
      isPublished: true,
      likesCount: 12,
      userId: user1.id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: nanoid(),
      title: 'Contact Form',
      description: 'A simple yet elegant contact form with validation.',
      htmlContent: sampleHtmlContents[2]!,
      thumbnail: 'https://livecanvas-builder.b-cdn.net/placeholder/3.svg',
      tags: 'Form,Bootstrap',
      isPublished: true,
      likesCount: 8,
      userId: user2.id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: nanoid(),
      title: 'Feature Section',
      description: 'Showcase your product features with this clean and modern section.',
      htmlContent: sampleHtmlContents[3]!,
      thumbnail: 'https://livecanvas-builder.b-cdn.net/placeholder/4.svg',
      tags: 'Landing Page,Responsive',
      isPublished: true,
      likesCount: 15,
      userId: user0.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: nanoid(),
      title: 'Testimonial Slider',
      description: 'Display customer testimonials with this elegant slider component.',
      htmlContent: sampleHtmlContents[4]!,
      thumbnail: 'https://livecanvas-builder.b-cdn.net/placeholder/5.svg',
      tags: 'Bootstrap,Animation',
      isPublished: true,
      likesCount: 10,
      userId: user1.id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]

  // Insert projects
  for (const projectItem of projectData) {
    await db.insert(project).values(projectItem).onConflictDoNothing()
  }

  // Create likes and favorites
  console.log('Creating likes and favorites...')

  // Double-check we have at least 5 projects for the below likes/favorites:
  if (projectData.length >= 5) {
    // Non-null assert each project to avoid TS error
    const p0 = projectData[0]!
    const p1 = projectData[1]!
    const p2 = projectData[2]!
    const p3 = projectData[3]!
    const p4 = projectData[4]!

    // User0 likes projects 1, 2, 4
    await db
      .insert(like)
      .values([
        {
          id: nanoid(),
          projectId: p1.id,
          userId: user0.id,
          createdAt: new Date(),
        },
        {
          id: nanoid(),
          projectId: p2.id,
          userId: user0.id,
          createdAt: new Date(),
        },
        {
          id: nanoid(),
          projectId: p4.id,
          userId: user0.id,
          createdAt: new Date(),
        },
      ])
      .onConflictDoNothing()

    // User1 likes projects 0, 2, 3
    await db
      .insert(like)
      .values([
        {
          id: nanoid(),
          projectId: p0.id,
          userId: user1.id,
          createdAt: new Date(),
        },
        {
          id: nanoid(),
          projectId: p2.id,
          userId: user1.id,
          createdAt: new Date(),
        },
        {
          id: nanoid(),
          projectId: p3.id,
          userId: user1.id,
          createdAt: new Date(),
        },
      ])
      .onConflictDoNothing()

    // User2 likes projects 0, 1, 3, 4
    await db
      .insert(like)
      .values([
        {
          id: nanoid(),
          projectId: p0.id,
          userId: user2.id,
          createdAt: new Date(),
        },
        {
          id: nanoid(),
          projectId: p1.id,
          userId: user2.id,
          createdAt: new Date(),
        },
        {
          id: nanoid(),
          projectId: p3.id,
          userId: user2.id,
          createdAt: new Date(),
        },
        {
          id: nanoid(),
          projectId: p4.id,
          userId: user2.id,
          createdAt: new Date(),
        },
      ])
      .onConflictDoNothing()

    // User0 favorites projects 1, 3
    await db
      .insert(favorite)
      .values([
        {
          id: nanoid(),
          projectId: p1.id,
          userId: user0.id,
          createdAt: new Date(),
        },
        {
          id: nanoid(),
          projectId: p3.id,
          userId: user0.id,
          createdAt: new Date(),
        },
      ])
      .onConflictDoNothing()

    // User1 favorites projects 0, 4
    await db
      .insert(favorite)
      .values([
        {
          id: nanoid(),
          projectId: p0.id,
          userId: user1.id,
          createdAt: new Date(),
        },
        {
          id: nanoid(),
          projectId: p4.id,
          userId: user1.id,
          createdAt: new Date(),
        },
      ])
      .onConflictDoNothing()

    // User2 favorites projects 2, 3
    await db
      .insert(favorite)
      .values([
        {
          id: nanoid(),
          projectId: p2.id,
          userId: user2.id,
          createdAt: new Date(),
        },
        {
          id: nanoid(),
          projectId: p3.id,
          userId: user2.id,
          createdAt: new Date(),
        },
      ])
      .onConflictDoNothing()
  } else {
    console.log('Not enough projects to create likes and favorites')
  }

  console.log('✅ Database seeding completed successfully!')
}

// Run the seed function
main().catch((error) => {
  console.error('❌ Error seeding database:', error)
  process.exit(1)
})
