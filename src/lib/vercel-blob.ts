import { del, put } from "@vercel/blob";

// const { url } = await put('articles/blob.txt', 'Hello World!', { access: 'public' });

/**
 * Uploads a file to Vercel Blob
 * @param buffer The file buffer to upload
 * @param fileName The name of the file
 * @param folder The folder to upload to (without leading or trailing slashes)
 * @returns The URL of the uploaded file
 */
export async function uploadToVercelBlob(
	buffer: Buffer,
	fileName: string,
	folder = "thumbnails",
): Promise<string> {
	// Ensure folder has no leading or trailing slashes
	const normalizedFolder = folder.replace(/^\/|\/$/g, "");

	// Create the path
	const path = `/${normalizedFolder}/${fileName}`;

	// Upload to Vercel Blob
	const { url } = await put(path, buffer, { access: "public" });

	if (!url) {
		console.error("Vercel Blob upload failed");
		throw new Error("Failed to upload to Vercel Blob");
	}

	// Return the CDN URL
	return url;
}

/**
 * Deletes a file from Vercel Blob
 * @param path The path of the file to delete
 */
export async function deleteFromVercelBlob(path: string) {
	await del(path);
}
