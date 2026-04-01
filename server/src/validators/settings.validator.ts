import { z } from "zod";

export const updateSettingsSchema = z.object({
  examType: z.enum(["ielts_academic", "ielts_general", "pte_academic"]).optional(),
  targetScore: z.string().optional(),
  dailyStudyGoal: z.string().optional(),
  notifications: z.object({
    dailyReminders: z.boolean().optional(),
  }).optional(),
});