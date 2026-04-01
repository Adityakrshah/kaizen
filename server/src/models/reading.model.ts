import mongoose from "mongoose";

const readingQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, default: "mcq" },
  options: { type: [String], default: [] },
  correctAnswer: { type: String, required: true } // 👈 Must stay a string
});

const readingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false },
    isAiGenerated: { type: Boolean, default: false },
    title: { type: String, required: true },
    passage: { type: String, required: true },
    difficulty: { 
      type: String, 
      default: "B2" // 👈 REMOVED THE ENUM so A1, B1, C2 etc. are all allowed!
    },
    questions: [readingQuestionSchema]
  },
  { timestamps: true }
);

export const Reading = mongoose.model("Reading", readingSchema);