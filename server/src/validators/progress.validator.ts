import { z } from "zod"

export const updateProgressSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    module: z.enum([
      "vocabulary",
      "reading",
      "listening",
      "writing",
      "speaking"
    ]),
    score: z.number().min(0).max(100),
    attemptDate: z.string()
  })
})