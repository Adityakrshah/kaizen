import { Request, Response, NextFunction } from "express";
import Groq from "groq-sdk";
import { startnewtest, updateteststatus } from "../services/mocktest.service";
import { auth } from "../config/auth"; 
import { logUserActivity } from "../services/progress.service";
import { Mocktest } from "../models/mocktest.model";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * 1. Start a new Mock Test Session
 */
export const startmocktest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const result = await startnewtest(session.user.id);
    
    return res.status(201).json({ 
      success: true, 
      data: result.testData,
      bundle: result.bundle 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Update mid-test status (warnings, termination, etc.)
 */
export const updatemocktest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { testId, status, warnings, terminationReason } = req.body;

    if (!testId) {
      return res.status(400).json({ success: false, message: "Test ID is required" });
    }

    const updatedTest = await updateteststatus(testId, status, warnings, terminationReason);
    
    return res.status(200).json({ success: true, data: updatedTest });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. AI Evaluation for Writing Tasks
 */
export const evaluateMockWriting = async (req: Request, res: Response) => {
  try {
    const { task1Response, task2Response, prompts } = req.body;

    const prompt = `
      You are an expert, strict IELTS examiner. 
      Task 1 Prompt: ${prompts.task1}
      Candidate Task 1: ${task1Response}
      Task 2 Prompt: ${prompts.task2}
      Candidate Task 2: ${task2Response}

      Evaluate both tasks. You MUST respond with ONLY a valid JSON object:
      {
        "bandScore": 6.5,
        "feedback": "A short summary of strengths and weaknesses."
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    const resultString = completion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(resultString);

    return res.status(200).json({
      success: true,
      bandScore: result.bandScore || 0,
      feedback: result.feedback || "Evaluation completed."
    });

  } catch (error) {
    console.error("Groq Evaluation Error:", error);
    return res.status(500).json({ success: false, message: "AI evaluation failed" });
  }
};

/**
 * 4. FINAL SUBMISSION (Saves Scores + Detailed Report)
 */
export const submitMockTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const userId = session.user.id; 
    // 🚀 We now expect the testId from the frontend
    const { testId, sections, detailedReport } = req.body;

    if (!testId) {
      res.status(400).json({ success: false, message: "Test ID is required for submission" });
      return;
    }

    // A. Calculate Overall Band Score
    const r = sections?.reading?.score || 0;
    const l = sections?.listening?.score || 0;
    const w = sections?.writing?.score || 0;
    const s = sections?.speaking?.score || 0;
    const overallBand = Number(((r + l + w + s) / 4).toFixed(1));

    // B. 🚀 UPDATE the existing test instead of creating a duplicate!
    const updatedTest = await Mocktest.findByIdAndUpdate(
      testId,
      {
         $set: {
           status: "completed",
           overallBand,
           sections,
           detailedReport,
           updatedAt: new Date()
         }
      },
      { new: true } // Returns the updated document
    );

    // C. Update Dashboard Activity
    await logUserActivity(userId, 180);

    res.status(200).json({ 
      success: true, 
      message: "Mock test submitted and report generated.",
      data: updatedTest 
    });
  } catch (error) {
    console.error("Submit Mock Test Error:", error);
    res.status(500).json({ error: "Failed to submit test and save report" });
  }
};

/**
 * 5. Get Single Test Details (For the "View Result" page)
 */
export const getMockTestById = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const test = await Mocktest.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    // Security: Only allow the owner to see their result
    if (test.userId.toString() !== session.user.id) {
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: test });
  } catch (error) {
    console.error("Fetch Test Detail Error:", error);
    res.status(500).json({ success: false, message: "Error fetching test details" });
  }
};