import { Router } from "express"
import {
  analyzeSpeaking,
  fetchSpeakingPrompts,
  fetchRandomSpeakingPrompt
} from "../controllers/speaking.controller"

import { upload } from "../middleware/upload.middleware"
import { validate } from "../middleware/validate.middleware"
import { submitSpeakingSchema } from "../validators"
import { fetchSpeakingHistory } from "../controllers/speaking.controller"

const router = Router()

router.get("/prompts", fetchSpeakingPrompts)
router.get("/history", fetchSpeakingHistory)
router.get("/prompts/random", fetchRandomSpeakingPrompt)

router.post(
  "/analyze",
  upload.single("audio"),
  analyzeSpeaking
)

export default router