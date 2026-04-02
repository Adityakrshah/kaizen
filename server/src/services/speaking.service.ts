// 🚀 FIXED: Import the Result model!
import { SpeakingResult } from "../models/speakingResult.model"
import { SpeakingPrompt } from "../models/speakingPrompt.model"

import { transcribeAudio } from "./whisper.service"
import { evaluateSpeakingAI } from "./ai.service"

export const evaluateSpeaking = async (userId: string, audioPath: string, promptText: string) => {
  try {
    const transcript = await transcribeAudio(audioPath);
    const aiResponse = await evaluateSpeakingAI(transcript, promptText);
    
    let data;
    try {
      const cleaned = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      data = JSON.parse(cleaned);
    } catch (e) {
      data = { bandScore: 0, pronunciation: 0, fluency: 0, feedback: "Analysis error", overallFeedback: "" };
    }

    // 🚀 WIRE UP: Save to SpeakingResult
    return await SpeakingResult.create({
      userId,
      promptText,
      audioUrl: audioPath,
      transcription: transcript,
      score: data.bandScore, // Maps to the dashboard's expected "score"
      pronunciation: data.pronunciation,
      fluency: data.fluency,
      aiFeedback: data.feedback,
      overallFeedback: data.overallFeedback,
      status: 'completed'
    });
  } catch (error) {
    console.error("Speaking evaluation error:", error);
    throw error;
  }
};

export const getSpeakingPrompts = async (limit: number = 20) => {
  return await SpeakingPrompt.find().limit(limit);
};

export const getRandomSpeakingPrompt = async () => {
  const result = await SpeakingPrompt.aggregate([{ $sample: { size: 1 } }]);
  return result[0];
};

// 🚀 FIXED: Added userId so people don't see each other's history!
export const getSpeakingHistory = async (userId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const attempts = await SpeakingResult.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await SpeakingResult.countDocuments({ userId });

  return {
    attempts,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};