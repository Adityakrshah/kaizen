import mongoose from "mongoose";

const writingPromptSchema = new mongoose.Schema({
  task1: { type: String, required: true },
  task2: { type: String, required: true }
}, { timestamps: true });

export const WritingPrompt = mongoose.model("WritingPrompt", writingPromptSchema);