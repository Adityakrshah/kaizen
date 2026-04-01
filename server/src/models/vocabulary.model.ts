import mongoose from "mongoose";

const vocabularySchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true // 👈 Added this to prevent "about " vs "about" duplicates
    },
    meaning: {
      type: String, // 👈 THE CRITICAL ADDITION
      default: ""
    },
    level: {
      type: String
    },
    type: {
      type: String
    },
    phonetics: {
      type: String
    },
    example: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Vocabulary", vocabularySchema);