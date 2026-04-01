import mongoose from "mongoose";

const ieltsSpeakingSchema = new mongoose.Schema({
  part1: [{ type: String, required: true }],
  part2: { type: String, required: true },
  part3: [{ type: String, required: true }]
}, { timestamps: true });

export const IeltsSpeaking = mongoose.model("IeltsSpeaking", ieltsSpeakingSchema);