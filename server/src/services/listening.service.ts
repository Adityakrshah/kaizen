import { Listening } from "../models/listening.model";
import {
  generateListeningTranscriptAI,
  generateListeningQuestionsAI, // 👈 Fixed import
  generateListeningTitleAI
} from "./ai.service";
import { generateAudioFromText } from "./tts.service"; // Ensure this path is correct
import { ListeningResult } from "../models/listeningResult.model";
// 1. Accept userId and filter the database
export const getAllListening = async (userId: string) => {
  return Listening.find({ userId }).select("-questions.correctAnswer").sort({ createdAt: -1 });
};

export const getListeningById = async (id: string) => {
  return Listening.findById(id).select("-questions.correctAnswer").lean();
};
export const evaluateListeningAnswers = async (
  userId: string,
  listeningId: string,
  answers: string[]
) => {
  const listening = await Listening.findById(listeningId);
  if (!listening) return null;

  let correctCount = 0;
  const detailedAnswers: any[] = [];

  listening.questions.forEach((q: any, index: number) => {
    const userAnswer = answers[index] || ""; // Handle empty answers safely
    const isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();

    if (isCorrect) correctCount++;

    detailedAnswers.push({
      question: q.question,
      userAnswer: userAnswer,
      isCorrect
    });
  });

  const totalQuestions = listening.questions.length;
  
  // Calculate Band Score (0 to 9)
  const bandScore = totalQuestions > 0 
    ? Number(((correctCount / totalQuestions) * 9).toFixed(1)) 
    : 0;

  // 🚀 SAVE THE ATTEMPT!
  const attempt = await ListeningResult.create({
    userId,
    listeningId,
    score: bandScore,
    correctAnswers: correctCount,
    totalQuestions,
    detailedAnswers,
    status: 'completed'
  });

  return {
    id: attempt._id,
    totalQuestions,
    correctAnswers: correctCount,
    bandScore,
    results: detailedAnswers
  };
};
// export const evaluateListeningAnswers = async (
//   listeningId: string,
//   answers: string[]
// ) => {
//   const listening = await Listening.findById(listeningId);
//   if (!listening) return null;

//   let score = 0;
//   const results: any[] = [];

//   listening.questions.forEach((q: any, index: number) => {
//     const userAnswer = answers[index];
//     const isCorrect =
//       userAnswer?.toLowerCase().trim() ===
//       q.correctAnswer.toLowerCase().trim();

//     if (isCorrect) score++;

//     results.push({
//       question: q.question,
//       yourAnswer: userAnswer,
//       correctAnswer: q.correctAnswer,
//       isCorrect
//     });
//   });

//   return {
//     totalQuestions: listening.questions.length,
//     correctAnswers: score,
//     results
//   };
// };

// 2. Accept userId to attach to the new test
export const generateListeningTest = async (userId: string): Promise<any> => {
  const transcript = (await generateListeningTranscriptAI()) || "";

  if (!transcript) {
    throw new Error("Failed to generate listening transcript");
  }

  const audioUrl = await generateAudioFromText(transcript);

  // ONE AI request using the correct Listening function
  const raw = await generateListeningQuestionsAI(transcript);

  let questions: any[] = [];

  if (raw) {
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      questions = Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
      console.error("Question parsing failed");
      console.error("AI Response:", raw);
    }
  }

  // Assign timestamps
  let timeCursor = 0;
  const segmentDuration = 7;

  questions = questions.map((q: any) => {
    const startTime = timeCursor;
    const endTime = timeCursor + segmentDuration;
    timeCursor += segmentDuration;

    return { ...q, startTime, endTime };
  });

  // Generate dynamic title
  const dynamicTitle = await generateListeningTitleAI(transcript);

  // 3. SAVE EXACTLY ONCE WITH USER ID
  const test = await Listening.create({
    userId, // 👈 Links the test to the user who clicked generate
    title: dynamicTitle, 
    transcript,
    audioUrl,
    questions
  });

  return test;
};