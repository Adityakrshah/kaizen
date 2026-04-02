import mongoose, { Schema, Document } from "mongoose";

export interface ISpeakingResult extends Document {
  userId: mongoose.Types.ObjectId;
  promptText?: string;
  score: number; // Overall Band Score
  pronunciation: number;
  fluency: number;
  transcription: string;
  aiFeedback: string;
  overallFeedback: string;
  audioUrl?: string;
  status: 'completed' | 'abandoned';
  createdAt: Date;
}

const speakingResultSchema = new Schema<ISpeakingResult>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  promptText: { type: String },
  score: { type: Number, required: true },
  pronunciation: { type: Number, default: 0 },
  fluency: { type: Number, default: 0 },
  transcription: { type: String, required: true },
  aiFeedback: { type: String, default: "" },
  overallFeedback: { type: String, default: "" },
  audioUrl: { type: String },
  status: { type: String, enum: ['completed', 'abandoned'], default: 'completed' }
}, { timestamps: true });

export const SpeakingResult = mongoose.model<ISpeakingResult>("SpeakingResult", speakingResultSchema);