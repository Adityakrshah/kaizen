import { Request, Response, NextFunction } from "express"
import path from "path"
import { auth } from "../config/auth";
import {
  evaluateSpeaking,
  getSpeakingPrompts,
  getRandomSpeakingPrompt
} from "../services/speaking.service"

/**
 * Analyze user speaking audio
 * POST /speaking/analyze
 */


export const analyzeSpeaking = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "Audio file required" });

    // 👈 Get the prompt text sent from the frontend
    const promptText = req.body.topic || "Default Reading Prompt";

    const result = await evaluateSpeaking(session.user.id, req.file.path, promptText);

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetch speaking prompts
 * GET /speaking/prompts
 */
export const fetchSpeakingPrompts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = Number(req.query.limit) || 20

    const prompts = await getSpeakingPrompts(limit)

    return res.status(200).json({
      success: true,
      message: "Speaking prompts fetched successfully",
      data: prompts
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Fetch one random speaking prompt
 * GET /speaking/prompts/random
 */
export const fetchRandomSpeakingPrompt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const prompt = await getRandomSpeakingPrompt()

    return res.status(200).json({
      success: true,
      message: "Random speaking prompt fetched successfully",
      data: prompt
    })
  } catch (error) {
    next(error)
  }
}

import { getSpeakingHistory } from "../services/speaking.service"

// Replace your existing fetchSpeakingHistory with this:
export const fetchSpeakingHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 🚀 Require authentication to view history
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const history = await getSpeakingHistory(session.user.id, page, limit);

    res.json({
      success: true,
      message: "Speaking history fetched successfully",
      data: history
    });
  } catch (error) {
    next(error);
  }
}