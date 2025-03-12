import { env } from '@/env'

/**
 * Uploads a file to BunnyCDN
 * @param buffer The file buffer to upload
 * @param fileName The name of the file
 * @param folder The folder to upload to (without leading or trailing slashes)
 * @returns The URL of the uploaded file
 */
export async function uploadToBunnyCDN(
  buffer: Buffer,
  fileName: string,
  folder = 'thumbnails',
): Promise<string> {
  // Ensure folder has no leading or trailing slashes
  const normalizedFolder = folder.replace(/^\/|\/$/g, '')

  // Create the path
  const path = `/${normalizedFolder}/${fileName}`

  // Upload to BunnyCDN
  const url = `https://storage.bunnycdn.com/livecanvas-builder${path}`
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      AccessKey: env.BUNNY_STORAGE_API_KEY,
      'Content-Type': 'application/octet-stream',
    },
    body: buffer,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('BunnyCDN upload failed:', errorText)
    throw new Error(`Failed to upload to BunnyCDN: ${errorText}`)
  }

  // Return the CDN URL
  return `https://livecanvas-builder.b-cdn.net${path}`
}
