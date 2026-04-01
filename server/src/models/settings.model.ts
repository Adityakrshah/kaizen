import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  }, // This links directly to the Better Auth User ID
  examType: { 
    type: String, 
    default: "ielts_academic" 
  },
  targetScore: { 
    type: String, 
    default: "8.0" 
  },
  dailyStudyGoal: { 
    type: String, 
    default: "60" 
  },
  notifications: {
    dailyReminders: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: true },
    newTests: { type: Boolean, default: true },
  }
}, { timestamps: true });

export const UserSettings = mongoose.model("UserSettings", settingsSchema);