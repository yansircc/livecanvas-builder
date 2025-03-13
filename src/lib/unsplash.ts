// Enable verbose logging in development mode
const VERBOSE_LOGGING = process.env.NODE_ENV === 'development'

// Supported image categories
export const SUPPORTED_CATEGORIES = ['people', 'technology', 'architecture', 'business'] as const
export type ImageCategory = (typeof SUPPORTED_CATEGORIES)[number]

/**
 * Collection of pre-selected high-quality Unsplash images
 * These images are used as a source for random images in the application
 */
export const UNSPLASH_IMAGES: Record<ImageCategory, string[]> = {
  people: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=800&h=600&fit=crop',
  ],
  technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1496065187959-7f07b8353c55?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1516192518150-0d8fee5425e3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?w=800&h=600&fit=crop',
  ],
  architecture: [
    'https://images.unsplash.com/photo-1470723710355-95304d8aece4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1481026469463-66327c86e544?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1451976426598-a7593bd6d0b2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1478066792002-98655f9b8e27?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1496564203457-11bb12075d90?w=800&h=600&fit=crop',
  ],
  business: [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1664575599736-c5197c684128?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1664575600397-88fb18a55bd4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1664575600796-ffa828c5cb6e?w=800&h=600&fit=crop',
  ],
}

// Track recently used images to avoid repetition
interface RecentlyUsedImage {
  url: string
  timestamp: number
}
const recentlyUsedImages: RecentlyUsedImage[] = []
const RECENT_IMAGE_EXPIRY = 10 * 60 * 1000 // 10 minutes
const MAX_RECENT_IMAGES = 50

/**
 * Log a message if verbose logging is enabled
 */
function log(message: string, ...args: any[]) {
  if (VERBOSE_LOGGING) {
    console.log(message, ...args)
  }
}

/**
 * Check if an image has been recently used
 */
function isRecentlyUsed(url: string): boolean {
  return recentlyUsedImages.some((item) => item.url === url)
}

/**
 * Mark an image as recently used
 */
function markAsRecentlyUsed(url: string): void {
  // Remove if already in the list
  const existingIndex = recentlyUsedImages.findIndex((item) => item.url === url)
  if (existingIndex >= 0) {
    recentlyUsedImages.splice(existingIndex, 1)
  }

  // Add to the end of the list (most recently used)
  recentlyUsedImages.push({
    url,
    timestamp: Date.now(),
  })

  // Remove oldest items if list is too long
  if (recentlyUsedImages.length > MAX_RECENT_IMAGES) {
    recentlyUsedImages.shift()
  }
}

/**
 * Clean up expired recently used images
 */
function cleanupRecentlyUsed(): void {
  const currentTime = Date.now()
  while (
    recentlyUsedImages.length > 0 &&
    currentTime - recentlyUsedImages[0]!.timestamp > RECENT_IMAGE_EXPIRY
  ) {
    recentlyUsedImages.shift()
  }
}

/**
 * Get a random image from a list, preferring ones not recently used
 */
function getRandomImage(category: ImageCategory): string {
  cleanupRecentlyUsed()

  // Try to find an image that hasn't been recently used
  const unusedImages = UNSPLASH_IMAGES[category].filter((url) => !isRecentlyUsed(url))

  if (unusedImages.length > 0) {
    // Use a random unused image
    const randomIndex = Math.floor(Math.random() * unusedImages.length)
    const imageUrl = unusedImages[randomIndex]
    if (imageUrl) {
      markAsRecentlyUsed(imageUrl)
      return imageUrl
    }
  }

  // If all images have been recently used, use a random one anyway
  const randomIndex = Math.floor(Math.random() * UNSPLASH_IMAGES[category].length)
  const imageUrl = UNSPLASH_IMAGES[category][randomIndex]

  // This should always be defined since UNSPLASH_IMAGES has entries for all categories
  // But we'll add a fallback just to be safe
  if (imageUrl) {
    markAsRecentlyUsed(imageUrl)
    return imageUrl
  }

  // Fallback in case something went wrong
  return `https://livecanvas-builder.b-cdn.net/placeholder/800x600.jpg`
}

/**
 * Get a random image for the specified category
 */
export function getUnsplashImage(category?: ImageCategory): string {
  // If no category specified, choose a random one
  const selectedCategory: ImageCategory =
    category ||
    SUPPORTED_CATEGORIES[Math.floor(Math.random() * SUPPORTED_CATEGORIES.length)] ||
    'business'

  return getRandomImage(selectedCategory)
}

/**
 * Initialize the image tracking system
 * This is a no-op function kept for compatibility with existing code
 */
export function initializeImageCache(): void {
  if (VERBOSE_LOGGING) {
    log('Image system initialized')
  }
}
