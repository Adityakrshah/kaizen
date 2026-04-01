import { z } from "zod"

export const createMockTestSchema = z.object({
  body: z.object({
    testType: z.enum(["IELTS", "PTE"]),
    sections: z.array(
      z.enum(["reading", "writing", "listening", "speaking"])
    ).min(1),
    duration: z.number().min(1)
  })
})