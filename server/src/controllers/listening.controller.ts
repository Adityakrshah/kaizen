import { Request, Response } from "express";
import {
  getAllListening,
  getListeningById,
  evaluateListeningAnswers,
  generateListeningTest
} from "../services/listening.service";
import { auth } from "../config/auth"; // Ensure this is imported

export const getListening = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

    // Fetch only this user's tests
    const data = await getAllListening(session.user.id);

    res.json({ success: true, data });
  } catch {
    res.status(500).json({ message: "Failed to fetch listening passages" });
  }
};

export const getListeningByIdController = async (req: Request, res: Response) => {
  try {
    const listening = await getListeningById(req.params.id as string);

    if (!listening) {
      return res.status(404).json({ message: "Listening passage not found" });
    }

    res.json({ success: true, data: listening });
  } catch {
    res.status(500).json({ message: "Failed to fetch listening passage" });
  }
};

// export const submitListeningAnswers = async (req: Request, res: Response) => {
//   try {
//     const result = await evaluateListeningAnswers(
//       req.body.listeningId,
//       req.body.answers
//     );

//     if (!result) {
//       return res.status(404).json({ message: "Listening passage not found" });
//     }

//     res.json({ success: true, ...result });
//   } catch {
//     res.status(500).json({ message: "Failed to evaluate answers" });
//   }
// };


export const submitListeningAnswers = async (req: Request, res: Response) => {
  try {
    // 1. Get the session
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) {
      return res.status(401).json({ message: "Unauthorized: You must be logged in." });
    }

    // 2. Pass userId and answers. (Fallback to passageId just in case your frontend sends that)
    const testId = req.body.listeningId || req.body.passageId; 

    const result = await evaluateListeningAnswers(
      session.user.id,
      testId,
      req.body.answers
    );

    if (!result) {
      return res.status(404).json({ message: "Listening test not found" });
    }

    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Listening Evaluation Error:", error);
    res.status(500).json({ message: "Failed to evaluate listening answers" });
  }
};
export const generateListening = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

    // Generate a test assigned to this user
    const test = await generateListeningTest(session.user.id);

    if (!test) {
      return res.status(500).json({ success: false, message: "Listening test generation failed" });
    }

    return res.status(200).json({ success: true, data: test });
  } catch (error: any) {
    console.error("Listening generation error:");
    console.error(error?.message);
    return res.status(500).json({ success: false, message: error?.message || "Failed to generate listening test" });
  }
};