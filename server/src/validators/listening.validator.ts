import { z } from "zod"

export const createListeningSchema = z.object({
  body: z.object({
    audioUrl: z.string().min(1, "Audio URL required"),
    questions: z.array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).min(2),
        answer: z.string()
      })
    ).min(1)
  })
})