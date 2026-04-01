import mongoose from "mongoose"

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["mcq", "true_false_not_given", "fill_blank", "matching"],
    default: "mcq"
  },
  options: {
    type: [String],
    default: []
  },
  correctAnswer: {
    type: String,
    required: true
  },
  startTime: {
    type: Number,
    required: true
  },
  endTime: {
    type: Number,
    required: true
  }
})

const listeningSchema = new mongoose.Schema(
  {
    userId: { 
      type: String, // 👈 Moved here! Belongs to the whole test
      required: true 
    },
    title: {
      type: String,
      required: true
    },
    audioUrl: {
      type: String,
      required: true
    },
    transcript: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },
    questions: [questionSchema]
  },
  { timestamps: true }
)

export const Listening = mongoose.model("Listening", listeningSchema)