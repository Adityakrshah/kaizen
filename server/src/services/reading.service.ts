import { Reading } from "../models/reading.model";
import { 
  generateReadingPassageAI, 
  generateReadingTitleAI, 
  generateReadingQuestionsAI 
} from "./ai.service";

/**
 * HELPER: Forces AI questions to match Mongoose schema perfectly.
 * Handles the "Array to String" casting error specifically.
 */
const cleanAiQuestions = (rawParsedQuestions: any[]) => {
  return rawParsedQuestions.map(q => {
    let finalAnswer = q.correctAnswer || q.answer || q.correct_answer || "N/A";

    // If AI sends an array (the cause of your 500 error), join it into one string
    if (Array.isArray(finalAnswer)) {
      finalAnswer = finalAnswer.join(", ");
    } 
    // If it's an object, stringify it
    else if (typeof finalAnswer === 'object' && finalAnswer !== null) {
      finalAnswer = JSON.stringify(finalAnswer);
    }

    return {
      question: q.question || "Question text missing",
      type: ["mcq", "true_false_not_given", "fill_blank", "matching"].includes(q.type) ? q.type : "mcq",
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: String(finalAnswer).trim()
    };
  });
};

export const getAllReadingPassages = async (userId: string) => {
  return Reading.find({
    $or: [
      { userId: userId },
      { userId: { $exists: false } },
      { userId: null }
    ]
  }).select("-questions.correctAnswer").sort({ createdAt: -1 });
};

export const getReadingPassageById = async (id: string) => {
  return Reading.findById(id).select("-questions.correctAnswer").lean();
};

export const evaluateReadingAnswers = async (passageId: string, answers: string[]) => {
  const passage = await Reading.findById(passageId);
  if (!passage) return null;

  let score = 0;
  const results: any[] = [];

  passage.questions.forEach((q: any, index: number) => {
    const userAnswer = answers[index];
    const isCorrect = userAnswer?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
    if (isCorrect) score++;

    results.push({
      question: q.question,
      yourAnswer: userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect
    });
  });

  return { totalQuestions: passage.questions.length, correctAnswers: score, results };
};

// Generation from Scratch (The "Magic Button")
export const generateReadingTest = async (userId: string) => {
  console.log("📝 Writing new AI academic passage...");
  
  const passage = await generateReadingPassageAI();
  if (!passage) throw new Error("Failed to generate reading passage");

  const title = await generateReadingTitleAI(passage);
  console.log("❓ Generating questions for:", title);

  const rawQuestions = await generateReadingQuestionsAI(passage);
  let questions: any[] = [];
  
  try {
    const cleaned = rawQuestions.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const parsedArray = Array.isArray(parsed) ? parsed : [parsed];
    
    // 👇 APPLY CLEANER HERE
    questions = cleanAiQuestions(parsedArray);
  } catch (err) {
    console.error("AI output failed to parse:", rawQuestions);
    throw new Error("AI returned invalid JSON.");
  }

  const test = await Reading.create({
    userId,
    isAiGenerated: true,
    title,
    passage,
    questions // Mongoose will be happy now!
  });

  return test;
};

// Generation for Existing Standard Passages
export const generateQuestionsForExistingPassage = async (id: string) => {
  const passage = await Reading.findById(id);
  if (!passage) throw new Error("Passage not found");
  
  if (passage.questions && passage.questions.length > 0) return passage;

  console.log("❓ Generating missing questions for standard passage...");
  const rawQuestions = await generateReadingQuestionsAI(passage.passage);
  
  try {
    const cleaned = rawQuestions.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const parsedArray = Array.isArray(parsed) ? parsed : [parsed];

    // 👇 APPLY CLEANER HERE
    passage.questions = cleanAiQuestions(parsedArray) as any;
    await passage.save();
  } catch (err) {
    console.error("AI output failed to parse:", rawQuestions);
    throw new Error("AI returned invalid JSON.");
  }

  return passage;
};