import { Request, Response } from "express";
import { auth } from "../config/auth";
import {
  getAllReadingPassages,
  getReadingPassageById as getPassageByIdService,
  evaluateReadingAnswers,
  generateReadingTest // 👈 Fixed import name
} from "../services/reading.service";
import { generateQuestionsForExistingPassage } from "../services/reading.service";
export const getReadingPassages = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

    // 👈 Fixed: Now securely passing the user's ID
    const passages = await getAllReadingPassages(session.user.id);

    res.json({ success: true, data: passages });
  } catch (error) {
    console.error("Failed to fetch reading passages", error);
    res.status(500).json({ message: "Failed to fetch reading passages" });
  }
};

export const getReadingPassageById = async (req: Request, res: Response) => {
  try {
    const passage = await getPassageByIdService(req.params.id as string);

    if (!passage) {
      return res.status(404).json({ message: "Passage not found" });
    }

    res.json({ success: true, data: passage });
  } catch {
    res.status(500).json({ message: "Failed to fetch reading passage" });
  }
};

export const submitReadingAnswers = async (req: Request, res: Response) => {
  try {
    const result = await evaluateReadingAnswers(
      req.body.passageId,
      req.body.answers
    );

    if (!result) {
      return res.status(404).json({ message: "Passage not found" });
    }

    res.json({ success: true, ...result });
  } catch {
    res.status(500).json({ message: "Failed to evaluate answers" });
  }
};

export const generateReading = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

    // 👈 Fixed: Using the updated generator that builds the whole test
    const test = await generateReadingTest(session.user.id);

    res.json({ success: true, data: test });
  } catch (error: any) {
    console.error("Reading generation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate reading test"
    });
  }
};


export const generateQuestions = async (req: Request, res: Response) => {
  try {
    const updatedPassage = await generateQuestionsForExistingPassage(req.params.id as string);
    res.json({ success: true, data: updatedPassage });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};