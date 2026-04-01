import mongoose from "mongoose";

const writingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    promptId: { type: mongoose.Schema.Types.ObjectId, ref: "WritingPrompt" },
    taskType: { type: String, enum: ["task1", "task2"], required: true },
    content: { type: String, required: true },
    wordCount: { type: Number },
    aiEvaluation: {
      bandScore: Number,
      taskResponse: String,
      coherence: String,
      vocabulary: String,
      grammar: String,
      overallFeedback: String,
      suggestions: [String]
    }
  },
  { timestamps: true }
);

export const Writing = mongoose.model("WritingSubmission", writingSchema);