import mongoose from "mongoose";

const speakingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    audioUrl: { type: String, required: true },
    transcript: { type: String },
    aiScore: { type: Number, default: 0 },
    pronunciation: { type: Number, default: 0 },
    fluency: { type: Number, default: 0 },
    feedback: { type: String },
    overallFeedback: { type: String } // 👈 This fixes Error #2
  },
  { timestamps: true }
);

export const Speaking = mongoose.model("SpeakingSubmission", speakingSchema);