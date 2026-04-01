import { Speaking } from "../models/speaking.model"
import { SpeakingPrompt } from "../models/speakingPrompt.model"

import { transcribeAudio } from "./whisper.service"
import { evaluateSpeakingAI } from "./ai.service"


// 👈 Added promptText here
export const evaluateSpeaking = async (userId: string, audioPath: string, promptText: string) => {
  try {
    const transcript = await transcribeAudio(audioPath);
    
    // 👈 Pass promptText to resolve the "2 arguments expected" error
    const aiResponse = await evaluateSpeakingAI(transcript, promptText);
    
    let data;
    try {
      const cleaned = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      data = JSON.parse(cleaned);
    } catch (e) {
      data = { bandScore: 50, pronunciation: 50, fluency: 50, feedback: "Analysis error", overallFeedback: "" };
    }

    // 👈 Now matches the model perfectly
    return await Speaking.create({
      userId,
      audioUrl: audioPath,
      transcript,
      aiScore: data.bandScore,
      pronunciation: data.pronunciation,
      fluency: data.fluency,
      feedback: data.feedback,
      overallFeedback: data.overallFeedback
    });
  } catch (error) {
    console.error("Speaking evaluation error:", error);
    throw error;
  }
};

/**
 * Get speaking prompts
 */
export const getSpeakingPrompts = async (limit: number = 20) => {
  return await SpeakingPrompt.find().limit(limit)
}

/**
 * Get one random speaking prompt
 */
export const getRandomSpeakingPrompt = async () => {
  const result = await SpeakingPrompt.aggregate([
    { $sample: { size: 1 } }
  ])

  return result[0]
}

export const getSpeakingHistory = async (page: number, limit: number) => {
  const skip = (page - 1) * limit

  const attempts = await Speaking.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const total = await Speaking.countDocuments()

  return {
    attempts,
    total,
    page,
    pages: Math.ceil(total / limit)
  }
}