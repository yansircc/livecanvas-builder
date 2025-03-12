/**
 * Upload image to BunnyCDN via server API
 * @param base64Image Base64 encoded image data
 * @returns URL of the uploaded image
 */
export async function uploadToBunnyCDN(base64Image: string): Promise<string> {
  try {
    // Call the server API endpoint
    const response = await fetch('/api/upload/avatar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `上传失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success || !data.url) {
      throw new Error(data.error || '上传图片失败')
    }

    return data.url
  } catch (error) {
    console.error('上传到BunnyCDN失败:', error)
    throw error
  }
}
