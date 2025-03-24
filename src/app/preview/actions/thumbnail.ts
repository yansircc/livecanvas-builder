"use server";

import { uploadToVercelBlob } from "@/lib/vercel-blob";
import { auth } from "@/server/auth";

/**
 * Generate thumbnail URL
 * @param htmlContent HTML content or base64 image data
 * @param projectId Optional project ID for tracking (can be undefined for new projects)
 * @returns Thumbnail URL with project identifier embedded in the path
 */
export async function generateThumbnail(
	htmlContent: string,
	projectId?: string,
): Promise<string> {
	try {
		const session = await auth();
		if (!session) {
			throw new Error("Unauthorized");
		}

		const userId = session.user.id;

		// Check if it's base64 image data
		if (htmlContent.startsWith("data:image/")) {
			// Extract the base64 data
			const base64Data = htmlContent.replace(/^data:image\/\w+;base64,/, "");

			// Convert to buffer
			const buffer = Buffer.from(base64Data, "base64");

			// Generate a unique filename using timestamp and random string
			const uniqueId = Math.random().toString(36).substring(2, 10);
			const fileName = `${Date.now()}-${uniqueId}.jpg`;

			// Include projectId in the folder path if it exists
			const folder = projectId
				? `thumbnails/${userId}/project_${projectId}`
				: `thumbnails/${userId}`;

			// Upload to Vercel Blob using the server-side utility
			return await uploadToVercelBlob(buffer, fileName, folder);
		}

		// If not base64 image, return default image
		return "https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=2070&auto=format&fit=crop";
	} catch (error) {
		console.error("Failed to generate thumbnail:", error);
		// Return default image
		return "https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=2070&auto=format&fit=crop";
	}
}
