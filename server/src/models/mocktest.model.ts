import mongoose, { Schema, Document } from "mongoose";

// 🚀 1. THE INTERFACE: This tells TypeScript EXACTLY what fields are allowed.
export interface IMocktest extends Document {
  userId: mongoose.Types.ObjectId;
  status: 'running' | 'in-progress' | 'completed' | 'terminated';
  warnings: number;
  terminationReason: string;
  examBundle: any; // This allows the questions to be saved
  overallBand: number;
  sections: {
    reading: { score: number; timeSpent?: number };
    listening: { score: number; timeSpent?: number };
    writing: { score: number; timeSpent?: number };
    speaking: { score: number; timeSpent?: number };
  };
  detailedReport: {
    reading: any[];
    listening: any[];
    writing: { task1?: string; task2?: string; aiFeedback?: string };
    speaking: { transcription?: string; aiFeedback?: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

// 🚀 2. THE SCHEMA
const mocktestSchema = new Schema<IMocktest>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['running', 'in-progress', 'completed', 'terminated'], 
    default: 'running' 
  },
  warnings: { type: Number, default: 0 },
  terminationReason: { type: String, default: "" },
  examBundle: { type: Schema.Types.Mixed }, 
  overallBand: { type: Number, default: 0 },
  sections: {
    reading: { score: { type: Number, default: 0 }, timeSpent: Number },
    listening: { score: { type: Number, default: 0 }, timeSpent: Number },
    writing: { score: { type: Number, default: 0 }, timeSpent: Number },
    speaking: { score: { type: Number, default: 0 }, timeSpent: Number }
  },
  detailedReport: {
    reading: { type: [Schema.Types.Mixed], default: [] },
    listening: { type: [Schema.Types.Mixed], default: [] },
    writing: { task1: String, task2: String, aiFeedback: String },
    speaking: { transcription: String, aiFeedback: String }
  }
}, { timestamps: true });

export const Mocktest = mongoose.model<IMocktest>("Mocktest", mocktestSchema);