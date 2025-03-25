import * as crypto from "node:crypto";
import { nanoid } from "nanoid";
import type { AdapterAccount } from "next-auth/adapters";
import { db } from "./index";
import { sampleHtmlContents } from "./sample-html-content";
import { account, favorite, project, purchase, user } from "./schema";

/**
 * Seed script for the database
 * Run with: bun src/server/db/seed.ts
 */
async function main() {
	console.log("🌱 Starting database seeding...");

	// Create sample user with IDs in the format used by better-auth
	console.log("Creating sample user...");
	const users = [
		{
			id: nanoid(22), // Generate ID with 22 characters to match better-auth format
			name: "Demo User",
			email: "demo@example.com",
			emailVerified: new Date(),
			image: "https://livecanvas-builder.b-cdn.net/avatars/1.webp",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: nanoid(22),
			name: "Test User",
			email: "test@example.com",
			emailVerified: new Date(),
			image: "https://livecanvas-builder.b-cdn.net/avatars/2.webp",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: nanoid(22),
			name: "Admin User",
			email: "admin@example.com",
			emailVerified: new Date(),
			image: "https://livecanvas-builder.b-cdn.net/avatars/3.webp",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	// Insert user
	for (const userData of users) {
		await db.insert(user).values(userData).onConflictDoNothing();
	}

	// Create account entries for OAuth providers
	console.log("Creating OAuth account entries...");

	// Ensure we have user before proceeding
	if (users.length < 3) {
		console.log("Not enough user to continue seeding");
		return;
	}

	// Get specific user with proper typing
	const user0Id = users[0]?.id ?? "";
	const user1Id = users[1]?.id ?? "";
	const user2Id = users[2]?.id ?? "";

	type AccountInsert = typeof account.$inferInsert;

	const accounts: AccountInsert[] = [
		{
			id: nanoid(22),
			userId: user0Id,
			type: "oauth" as AdapterAccount["type"],
			provider: "github",
			providerAccountId: "12345678",
			refresh_token: null,
			access_token: "gho_123456789",
			expires_at: Math.floor(Date.now() / 1000) + 3600,
			token_type: "bearer",
			scope: "user:email",
			id_token: null,
			session_state: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: nanoid(22),
			userId: user1Id,
			type: "oauth" as AdapterAccount["type"],
			provider: "google",
			providerAccountId: "87654321",
			refresh_token: null,
			access_token: "ya29.123456789",
			expires_at: Math.floor(Date.now() / 1000) + 3600,
			token_type: "bearer",
			scope: "email profile",
			id_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
			session_state: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: nanoid(22),
			userId: user2Id,
			type: "oauth" as AdapterAccount["type"],
			provider: "github",
			providerAccountId: "87654321",
			refresh_token: null,
			access_token: "gho_987654321",
			expires_at: Math.floor(Date.now() / 1000) + 3600,
			token_type: "bearer",
			scope: "user:email",
			id_token: null,
			session_state: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	// Insert account entries
	for (const accountData of accounts) {
		await db.insert(account).values(accountData).onConflictDoNothing();
	}

	// Create sample project first (tag now link directly to project)
	console.log("Creating sample project...");

	// Use the user IDs directly to avoid undefined errors
	const projects = [
		{
			id: nanoid(),
			title: "Simple Card Component",
			description:
				"A clean and modern card component with image, title, text and button.",
			htmlContent: sampleHtmlContents[0] || "<div>Sample card content</div>",
			thumbnail: "https://livecanvas-builder.b-cdn.net/placeholder/1.svg",
			purchaseCount: 5,
			isPublished: true,
			userId: user0Id,
			tags: "Card, Bootstrap, Responsive",
			createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
			updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
		},
		{
			id: nanoid(),
			title: "Responsive Pricing Table",
			description:
				"A beautiful pricing table with three tiers, perfect for SaaS products.",
			htmlContent:
				sampleHtmlContents[1] || "<div>Sample pricing table content</div>",
			thumbnail: "https://livecanvas-builder.b-cdn.net/placeholder/2.svg",
			purchaseCount: 12,
			isPublished: true,
			userId: user1Id,
			tags: "Bootstrap, Responsive, Landing Page",
			createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
			updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
		},
		{
			id: nanoid(),
			title: "Contact Form",
			description: "A simple yet elegant contact form with validation.",
			htmlContent:
				sampleHtmlContents[2] || "<div>Sample contact form content</div>",
			thumbnail: "https://livecanvas-builder.b-cdn.net/placeholder/3.svg",
			purchaseCount: 8,
			isPublished: true,
			userId: user2Id,
			tags: "Form, Bootstrap",
			createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
			updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
		},
		{
			id: nanoid(),
			title: "Feature Section",
			description:
				"Showcase your product features with this clean and modern section.",
			htmlContent:
				sampleHtmlContents[3] || "<div>Sample feature section content</div>",
			thumbnail: "https://livecanvas-builder.b-cdn.net/placeholder/4.svg",
			purchaseCount: 15,
			isPublished: true,
			userId: user0Id,
			tags: "Landing Page, Responsive",
			createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
			updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
		},
		{
			id: nanoid(),
			title: "Testimonial Slider",
			description:
				"Display customer testimonials with this elegant slider component.",
			htmlContent:
				sampleHtmlContents[4] || "<div>Sample testimonial slider content</div>",
			thumbnail: "https://livecanvas-builder.b-cdn.net/placeholder/5.svg",
			purchaseCount: 10,
			isPublished: true,
			userId: user1Id,
			tags: "Bootstrap, Animation",
			createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
			updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
		},
	];

	// Insert project
	for (const projectItem of projects) {
		await db.insert(project).values(projectItem).onConflictDoNothing();
	}

	// Create purchase and favorite
	console.log("Creating purchase and favorite...");

	// Double-check we have at least 5 project
	if (projects.length >= 5) {
		const p0 = projects[0] ?? { id: "" };
		const p1 = projects[1] ?? { id: "" };
		const p2 = projects[2] ?? { id: "" };
		const p3 = projects[3] ?? { id: "" };
		const p4 = projects[4] ?? { id: "" };

		// User0 purchase project 1, 2, 4
		await db
			.insert(purchase)
			.values([
				{
					id: nanoid(),
					projectId: p1.id,
					userId: user0Id,
					amount: 1500, // $15.00
					createdAt: new Date(),
				},
				{
					id: nanoid(),
					projectId: p2.id,
					userId: user0Id,
					amount: 1200, // $12.00
					createdAt: new Date(),
				},
				{
					id: nanoid(),
					projectId: p4.id,
					userId: user0Id,
					amount: 2000, // $20.00
					createdAt: new Date(),
				},
			])
			.onConflictDoNothing();

		// User1 purchase project 0, 2, 3
		await db
			.insert(purchase)
			.values([
				{
					id: nanoid(),
					projectId: p0.id,
					userId: user1Id,
					amount: 1000, // $10.00
					createdAt: new Date(),
				},
				{
					id: nanoid(),
					projectId: p2.id,
					userId: user1Id,
					amount: 1200, // $12.00
					createdAt: new Date(),
				},
				{
					id: nanoid(),
					projectId: p3.id,
					userId: user1Id,
					amount: 1800, // $18.00
					createdAt: new Date(),
				},
			])
			.onConflictDoNothing();

		// User2 purchase project 0, 1, 3, 4
		await db
			.insert(purchase)
			.values([
				{
					id: nanoid(),
					projectId: p0.id,
					userId: user2Id,
					amount: 1000, // $10.00
					createdAt: new Date(),
				},
				{
					id: nanoid(),
					projectId: p1.id,
					userId: user2Id,
					amount: 1500, // $15.00
					createdAt: new Date(),
				},
				{
					id: nanoid(),
					projectId: p3.id,
					userId: user2Id,
					amount: 1800, // $18.00
					createdAt: new Date(),
				},
				{
					id: nanoid(),
					projectId: p4.id,
					userId: user2Id,
					amount: 2000, // $20.00
					createdAt: new Date(),
				},
			])
			.onConflictDoNothing();

		// User0 favorite project 1, 3
		await db
			.insert(favorite)
			.values([
				{
					id: nanoid(),
					projectId: p1.id,
					userId: user0Id,
					createdAt: new Date(),
				},
				{
					id: nanoid(),
					projectId: p3.id,
					userId: user0Id,
					createdAt: new Date(),
				},
			])
			.onConflictDoNothing();

		// User1 favorite project 0, 4
		await db
			.insert(favorite)
			.values([
				{
					id: nanoid(),
					projectId: p0.id,
					userId: user1Id,
					createdAt: new Date(),
				},
				{
					id: nanoid(),
					projectId: p4.id,
					userId: user1Id,
					createdAt: new Date(),
				},
			])
			.onConflictDoNothing();

		// User2 favorite project 2, 3
		await db
			.insert(favorite)
			.values([
				{
					id: nanoid(),
					projectId: p2.id,
					userId: user2Id,
					createdAt: new Date(),
				},
				{
					id: nanoid(),
					projectId: p3.id,
					userId: user2Id,
					createdAt: new Date(),
				},
			])
			.onConflictDoNothing();
	} else {
		console.log("Not enough project to create purchase and favorite");
	}

	console.log("✅ Database seeding completed successfully!");
}

// Run the seed function
main().catch((error) => {
	console.error("❌ Error seeding database:", error);
	process.exit(1);
});
