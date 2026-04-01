import { Request, Response } from "express";
import { evaluateEssay } from "../services/writing.service";
import { auth } from "../config/auth"; // Assuming this is where your auth logic lives

export const submitWritingTest = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { content, prompt, taskType } = req.body;

    if (!content || !prompt || !taskType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const result = await evaluateEssay(session.user.id, content, prompt, taskType);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Writing Controller Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};