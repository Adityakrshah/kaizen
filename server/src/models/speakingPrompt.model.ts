import mongoose from "mongoose"

const speakingPromptSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "read_aloud"
    },
    topic: {
      type: String
    },
    prompt: {
      type: String,
      required: true
    },
    difficulty: {
      type: Number
    },
    examDate: {
      type: Date
    }
  },
  { timestamps: true }
)

export const SpeakingPrompt = mongoose.model(
  "SpeakingPrompt",
  speakingPromptSchema
)