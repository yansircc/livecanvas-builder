import { z } from 'zod'

export const metadataSchema = z.object({
  title: z
    .string()
    .describe('A concise, descriptive title for the HTML content, between 5-100 characters'),
  description: z
    .string()
    .describe('A detailed description of the HTML content, between 20-300 characters'),
  tags: z
    .array(z.string().min(3).max(20))
    .describe('3-7 relevant tags for the HTML content, each between 3-20 characters'),
})

export type MetadataResponse = z.infer<typeof metadataSchema>
