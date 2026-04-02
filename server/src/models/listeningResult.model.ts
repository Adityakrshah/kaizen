import mongoose, { Schema, Document } from "mongoose";

export interface IListeningResult extends Document {
  userId: mongoose.Types.ObjectId;
  listeningId: mongoose.Types.ObjectId; 
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

const listeningResultSchema = new Schema<IListeningResult>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  listeningId: { type: Schema.Types.ObjectId, ref: 'IeltsListening', required: true },
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

export const ListeningResult = mongoose.model<IListeningResult>("ListeningResult", listeningResultSchema);