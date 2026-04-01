import mongoose from "mongoose";

const ieltsListeningSchema = new mongoose.Schema({
  audioUrl: { type: String, required: true },
  questions: [{
    question: { type: String, required: true },
    type: { type: String, default: "multiple_choice" },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true }
  }]
}, { timestamps: true });

export const IeltsListening = mongoose.model("IeltsListening", ieltsListeningSchema);