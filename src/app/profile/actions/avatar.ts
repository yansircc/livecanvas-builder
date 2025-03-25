"use server";

import { deleteFromVercelBlob, uploadToVercelBlob } from "@/lib/vercel-blob";

/**
 * Uploads an avatar image to Vercel Blob storage
 * @param base64OrBuffer - Base64 string or Buffer of the image
 * @param fileName - Name of the file
 * @param userId - User ID to organize avatars by user
 * @param oldAvatarUrl - Optional existing avatar URL to delete
 * @returns The URL of the uploaded avatar
 */
export async function uploadAvatar(
	base64OrBuffer: string | Buffer,
	fileName: string,
	userId: string,
	oldAvatarUrl?: string | null,
): Promise<string> {
	try {
		// If we have an old avatar URL, delete it first
		if (oldAvatarUrl?.includes("vercel-storage.com")) {
			await deleteAvatar(oldAvatarUrl);
		}

		// Convert base64 to buffer if needed
		let buffer: Buffer;
		if (typeof base64OrBuffer === "string") {
			// Extract the base64 data if it's a data URL
			if (base64OrBuffer.startsWith("data:")) {
				const base64Data = base64OrBuffer.replace(
					/^data:image\/\w+;base64,/,
					"",
				);
				buffer = Buffer.from(base64Data, "base64");
			} else {
				buffer = Buffer.from(base64OrBuffer);
			}
		} else {
			buffer = base64OrBuffer;
		}

		// Upload to Vercel Blob
		const imageUrl = await uploadToVercelBlob(
			buffer,
			fileName,
			`avatars/${userId}`,
		);
		return imageUrl;
	} catch (error) {
		console.error("Avatar upload failed:", error);
		throw new Error("Failed to upload avatar");
	}
}

/**
 * Deletes an avatar from Vercel Blob storage
 * @param avatarUrl - The URL of the avatar to delete
 * @returns True if deletion was successful
 */
async function deleteAvatar(avatarUrl: string): Promise<boolean> {
	try {
		if (!avatarUrl || !avatarUrl.includes("vercel-storage.com")) {
			return false;
		}

		const urlObj = new URL(avatarUrl);
		const path = urlObj.pathname;

		if (path) {
			await deleteFromVercelBlob(path);
			console.log("Avatar deleted successfully");
			return true;
		}
		return false;
	} catch (error) {
		console.error("Failed to delete avatar:", error);
		return false;
	}
}
