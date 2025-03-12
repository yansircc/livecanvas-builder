export interface Project {
  id: string
  title: string
  description: string | null
  htmlContent: string
  thumbnail: string | null
  tags: string | null
  isPublished: boolean
  likesCount: number
  userId: string
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    name: string
    image: string | null
  }
}
