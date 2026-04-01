import mongoose, { Schema, Document } from "mongoose";

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId | string;
  streakDays: number;
  studiedTodayMins: number;
  lastActiveDate: Date; // Used to reset the daily minutes at midnight
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    userId: {
      type: Schema.Types.Mixed, // Supports both String and ObjectId depending on Better Auth
      required: true,
      unique: true, // One progress tracker per user
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    studiedTodayMins: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Progress = mongoose.model<IProgress>("Progress", progressSchema);