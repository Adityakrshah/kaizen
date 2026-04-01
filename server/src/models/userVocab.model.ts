import mongoose, { Schema, Document } from "mongoose";

export interface IUserVocab extends Document {
  userId: string;
  wordId: mongoose.Types.ObjectId;
  status: "mastered";
}

const userVocabSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    wordId: { type: Schema.Types.ObjectId, ref: "Vocabulary", required: true },
    status: { type: String, enum: ["mastered"], default: "mastered" },
  },
  { timestamps: true }
);

// Prevent the same user from mastering the same word twice
userVocabSchema.index({ userId: 1, wordId: 1 }, { unique: true });

export default mongoose.model<IUserVocab>("UserVocab", userVocabSchema);