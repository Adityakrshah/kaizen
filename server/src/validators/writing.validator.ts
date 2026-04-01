import { z } from "zod"

export const submitWritingSchema = z.object({
  body: z.object({
    prompt: z.string().min(10, "Prompt is required"),
    response: z.string().min(50, "Response must be at least 50 characters"),
    wordCount: z.number().min(1)
  })
})