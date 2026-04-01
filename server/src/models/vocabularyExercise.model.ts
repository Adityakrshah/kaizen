import mongoose from "mongoose"

const vocabularyExerciseSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true
    },
    question: {
      type: String
    },
    sentence: {
      type: String
    },
    options: [
      {
        type: String
      }
    ],
    answer: {
      type: String
    },
    audio: {
      type: String
    },
    level: {
      type: String
    }
  },
  { timestamps: true }
)

export default mongoose.model(
  "VocabularyExercise",
  vocabularyExerciseSchema
)