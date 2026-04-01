import { Mocktest } from "../models/mocktest.model";
import { IeltsListening } from "../models/ieltslistening.model";
import { Reading } from "../models/reading.model";
import { WritingPrompt } from "../models/writingprompt.model";
import { IeltsSpeaking } from "../models/ieltsspeaking.model";

export const startnewtest = async (userId: string) => {
  let examBundle: any = {};

  try {
    // 🚀 PULLING REAL RANDOM DATA FROM YOUR AI FACTORY DB
    const listeningData = await IeltsListening.aggregate([{ $sample: { size: 1 } }]);
    const readingData = await Reading.aggregate([{ $sample: { size: 3 } }]); 
    const writingData = await WritingPrompt.aggregate([{ $sample: { size: 1 } }]); // Grab 1 prompt that contains both tasks
    const speakingData = await IeltsSpeaking.aggregate([{ $sample: { size: 1 } }]);

    if (listeningData.length > 0 && readingData.length > 0 && writingData.length > 0 && speakingData.length > 0) {
      examBundle = {
        listening: listeningData[0],
        reading: readingData,
        writing: { 
          task1: writingData[0].task1, 
          task2: writingData[0].task2 
        },
        speaking: speakingData[0]
      };
      console.log("✅ Successfully loaded AI generated test from Database!");
    } else {
      throw new Error("Database is empty! Triggering fallback.");
    }
  } catch (error) {
    console.warn("⚠️ Using hardcoded fallback bundle because of an error:", error);
    
    // 🛡️ THE FALLBACK BUNDLE (Only runs if the DB is completely empty or crashes)
    examBundle = {
      listening: { audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", questions: [{ id: 1, question: "What is the main topic?", type: "multiple_choice", options: ["History", "Science", "Art", "Math"], correctAnswer: "Science" }] },
      reading: [ { title: "History of AI", passage: "AI began in...", questions: [{ question: "When did it begin?", options: ["2000s", "1950s"], correctAnswer: "1950s" }] } ],
      writing: { task1: "Summarize the chart.", task2: "Do you agree or disagree?" },
      speaking: { part1: ["What is your name?"], part2: "Describe a book.", part3: ["Why do people read?"] }
    };
  }

  // Create a fresh test session in the database
  const newTest = await Mocktest.create({
    userId,
    status: "running"
  });

  return { testData: newTest, bundle: examBundle };
};

export const updateteststatus = async (testId: string, status: string, warnings: number, terminationReason: string) => {
  const updateData: any = { status, warnings, terminationReason };
  if (status === "completed" || status === "terminated") updateData.completedAt = new Date();
  return await Mocktest.findByIdAndUpdate(testId, updateData, { new: true });
};

export const submittestscores = async (testId: string, scores: { listening: number; reading: number; writing: number; speaking: number; overallBand: number }) => {
  const updateData = {
    overallBand: scores.overallBand,
    sections: {
      listening: { score: scores.listening },
      reading: { score: scores.reading },
      writing: { score: scores.writing },
      speaking: { score: scores.speaking }
    },
    status: "completed",
    completedAt: new Date()
  };
  return await Mocktest.findByIdAndUpdate(testId, updateData, { new: true });
};