import { z } from "zod"

export const vocabularySchema = z.object({
  word: z.string().min(1, "Word is required"),
  meaning: z.string().min(1, "Meaning is required"),
  example: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional()
})