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
 * 3. AI Evaluation for Writing Tasks (🚀 FIXED FOR ACCURACY & DETAIL)
 */
export const evaluateMockWriting = async (req: Request, res: Response): Promise<any> => {
  try {
    const { task1Response, task2Response, prompts } = req.body;

    const prompt = `
      You are an expert, highly critical IELTS examiner. 
      Task 1 Prompt: ${prompts?.task1 || 'Not provided'}
      Candidate Task 1: ${task1Response || 'Not provided'}
      
      Task 2 Prompt: ${prompts?.task2 || 'Not provided'}
      Candidate Task 2: ${task2Response || 'Not provided'}

      Evaluate the candidate's writing strictly against the official IELTS rubric. 
      You MUST respond with ONLY a valid JSON object matching this exact structure:
      {
        "bandScore": 6.5,
        "taskResponseScore": 6.5,
        "coherenceScore": 6.0,
        "vocabularyScore": 7.0,
        "grammarScore": 6.5,
        "overallFeedback": "A detailed 3-4 sentence paragraph explaining the overall performance, strengths, and primary weaknesses.",
        "suggestions": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"]
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
      feedback: result // 🚀 Pass the entire rich object so it saves to the DB
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

    // B. UPDATE the existing test
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
      { new: true } 
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
 * 5. Get Single Test Details
 */
export const getMockTestById = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const test = await Mocktest.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    if (test.userId.toString() !== session.user.id) {
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: test });
  } catch (error) {
    console.error("Fetch Test Detail Error:", error);
    res.status(500).json({ success: false, message: "Error fetching test details" });
  }
};