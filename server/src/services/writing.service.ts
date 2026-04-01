import { Writing } from "../models/writing.model";
import { evaluateWritingAI } from "./ai.service";

/**
 * Evaluates an essay using AI and saves it to the database.
 */
export const evaluateEssay = async (userId: string, content: string, prompt: string, taskType: string) => {
  console.log(`✍️ Evaluating ${taskType} for user ${userId}...`);
  
  const aiResponse = await evaluateWritingAI(content, prompt, taskType);
  
  let evaluation;
  try {
    const cleaned = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    evaluation = JSON.parse(cleaned);
  } catch (e) {
    console.error("AI Evaluation Parse Error:", aiResponse);
    evaluation = { 
      bandScore: 0, 
      overallFeedback: "The AI response was malformed. Please try again." 
    };
  }

  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;

  // Save the submission to the database
  return await Writing.create({
    userId,
    taskType,
    content,
    wordCount,
    aiEvaluation: evaluation
  });
};