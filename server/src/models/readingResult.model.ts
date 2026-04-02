import mongoose, { Schema, Document } from "mongoose";

export interface IReadingResult extends Document {
  userId: mongoose.Types.ObjectId;
  passageId: mongoose.Types.ObjectId; 
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  status: 'completed' | 'abandoned';
  detailedAnswers: {
    question: string;
    userAnswer: string;
    isCorrect: boolean;
  }[];
  createdAt: Date;
}

const readingResultSchema = new Schema<IReadingResult>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  passageId: { type: Schema.Types.ObjectId, ref: 'Reading', required: true },
  score: { type: Number, required: true },
  correctAnswers: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  status: { type: String, enum: ['completed', 'abandoned'], default: 'completed' },
  
  // 🚀 THE FIX: Defined explicitly instead of using "Mixed"
  detailedAnswers: [{
    question: { type: String },
    userAnswer: { type: String },
    isCorrect: { type: Boolean }
  }]
}, { timestamps: true });

export const ReadingResult = mongoose.model<IReadingResult>("ReadingResult", readingResultSchema);