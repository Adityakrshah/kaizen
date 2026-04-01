import { z } from "zod"

export const createReadingSchema = z.object({
  body: z.object({
    passage: z.string().min(50, "Passage must be at least 50 characters"),
    questions: z.array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string()).min(2),
        answer: z.string().min(1)
      })
    ).min(1)
  })
})