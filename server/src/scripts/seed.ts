import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserSettings } from "../models/settings.model";
import { Progress } from "../models/progress.model";
import { Mocktest } from "../models/mocktest.model";
import Vocabulary from "../models/vocabulary.model";

// Load env variables to get MONGODB_URI
dotenv.config();

// 🚀 PASTE YOUR ACTUAL USER ID HERE
const USER_ID = "69cc3de2280e10706fcad587"; 

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected!");

    console.log("🧹 Clearing old data for this user...");
    await UserSettings.deleteMany({ userId: USER_ID });
    await Progress.deleteMany({ userId: USER_ID });
    await Mocktest.deleteMany({ userId: USER_ID });
    await Vocabulary.deleteMany({ userId: USER_ID });

    console.log("🌱 Planting new data...");

    // 1. Settings
    await UserSettings.create({
      userId: USER_ID,
      targetScore: "8.0",
      dailyStudyGoal: "60",
    });

    // 2. Progress (Streak and Mins)
    await Progress.create({
      userId: USER_ID,
      streakDays: 7,
      studiedTodayMins: 45,
      lastActiveDate: new Date(),
    });

    // 3. Vocabulary (15 Mastered Words)
    const words = ["Ubiquitous", "Ephemeral", "Paradigm", "Meticulous", "Cognitive", "Lucid", "Pragmatic", "Resilient", "Alleviate", "Nuance", "Inevitable", "Profound", "Ambiguous", "Eloquent", "Tenacious"];
    const vocabDocs = words.map(w => ({ userId: USER_ID, word: w, status: "mastered" }));
    await Vocabulary.insertMany(vocabDocs);

    // 4. Mock Tests (4 Tests to show progression on the graph)
    const today = new Date();
    const mockTests = [
      {
        userId: USER_ID,
        status: "completed",
        sections: { reading: { score: 6.0 }, listening: { score: 6.5 }, writing: { score: 5.5 }, speaking: { score: 6.0 } },
        createdAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        userId: USER_ID,
        status: "completed",
        sections: { reading: { score: 6.5 }, listening: { score: 7.0 }, writing: { score: 6.0 }, speaking: { score: 6.5 } },
        createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        userId: USER_ID,
        status: "completed",
        sections: { reading: { score: 7.0 }, listening: { score: 7.5 }, writing: { score: 6.5 }, speaking: { score: 7.0 } },
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        userId: USER_ID,
        status: "completed",
        sections: { reading: { score: 7.5 }, listening: { score: 8.0 }, writing: { score: 6.5 }, speaking: { score: 7.0 } },
        createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];
    await Mocktest.insertMany(mockTests);

    console.log("🎉 Seed complete! Check your dashboard.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();