import { z } from "zod"

export const submitSpeakingSchema = z.object({
  body: z.object({
    audioUrl: z.string().min(1, "Audio URL required"),
    transcript: z.string().optional(),
    duration: z.number().min(1)
  })
})