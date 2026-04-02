import { Progress } from "../models/progress.model";
import { Mocktest } from "../models/mocktest.model";
import { UserSettings } from "../models/settings.model";
import UserVocab from "../models/userVocab.model";

// 🚀 FIXED IMPORTS: Use ReadingResult instead of Reading
import { ReadingResult } from "../models/readingResult.model"; 
import { ListeningResult } from "../models/listeningResult.model";
import { Writing } from "../models/writing.model";
import { SpeakingResult } from "../models/speakingResult.model";
// ==========================================
// 1. STANDARD CRUD
// ==========================================
export const getUserProgress = async (userId: string) => {
    return await Progress.findOne({ userId });
};

export const updateProgress = async (userId: string, data: any) => {
    return await Progress.findOneAndUpdate({ userId }, data, { new: true, upsert: true });
};
// ... (getUserProgress and updateProgress stay the same) ...

export const getDashboardData = async (userId: string) => {
  try {
    const [
      settings, 
      vocabLearned, 
      progressRecord, 
      recentTests,
      readingPractices, // 👈 Now this will hold your true results!
      listeningPractices,
      writingPractices,
      speakingPractices
    ] = await Promise.all([
      UserSettings.findOne({ userId }),
      UserVocab.countDocuments({ userId, status: "mastered" }),
      Progress.findOne({ userId }),
      Mocktest.find({ userId, status: "completed" }).sort({ createdAt: -1 }).limit(5).lean<any[]>(),
      
      // 🚀 THE FIX: Query ReadingResult, not the master Reading library
      ReadingResult.find({ userId }).lean<any[]>(), 
      
     ListeningResult.find({ userId }).lean<any[]>(),
      Writing.find({ userId }).lean<any[]>(),
      SpeakingResult.find({ userId }).lean<any[]>()
    ]);

    // ... (Settings and Daily Progress logic stays the same) ...
    const targetScore = settings?.targetScore ? parseFloat(settings.targetScore) : 7.0;
    const dailyGoalMins = settings?.dailyStudyGoal ? parseInt(settings.dailyStudyGoal) : 60;

    let streakDays = progressRecord?.streakDays || 0;
    let studiedTodayMins = 0;
    if (progressRecord) {
        const today = new Date().toDateString();
        const lastActive = new Date(progressRecord.lastActiveDate).toDateString();
        if (today === lastActive) studiedTodayMins = progressRecord.studiedTodayMins;
    }

    let currentScore = 0;
    let formattedRecentTests: any[] = [];
    
    // 🚀 NEW MAPPING: readingPractices now has direct access to the `score` field from ReadingResult
    const allReadingScores: number[] = readingPractices
        .map(p => p.score || 0)
        .filter(s => s > 0);
        
    const allListeningScores: number[] = listeningPractices
        .map(p => p.score || p.bandScore || 0)
        .filter(s => s > 0);
        
    const allWritingScores: number[] = writingPractices
        .map(p => p.aiEvaluation?.bandScore || p.score || 0) 
        .filter(s => s > 0);
        
    const allSpeakingScores: number[] = speakingPractices
        .map(p => p.aiEvaluation?.bandScore || p.score || 0) 
        .filter(s => s > 0);

    // ... (The rest of your Mocktest processing, averages, and AI insights stay EXACTLY the same) ...
    
    let insights = {
        weakest: { module: "Pending", tip: "Take a test or practice to unlock insights." },
        strongest: { module: "Pending", message: "Take a test or practice to unlock insights." }
    };

    if (recentTests.length > 0) {
        let totalOverallBand = 0;
        formattedRecentTests = recentTests.map((test, index) => {
            const r = test.sections?.reading?.score || test.readingScore || 0;
            const l = test.sections?.listening?.score || test.listeningScore || 0;
            const w = test.sections?.writing?.score || test.writingScore || 0;
            const s = test.sections?.speaking?.score || test.speakingScore || 0;
            
            if (r > 0) allReadingScores.push(r);
            if (l > 0) allListeningScores.push(l);
            if (w > 0) allWritingScores.push(w);
            if (s > 0) allSpeakingScores.push(s);

            const testOverall = (r + l + w + s) / 4;
            totalOverallBand += testOverall;

            return {
                id: test._id.toString(),
                name: test.name || `Mock Test ${recentTests.length - index}`,
                score: Number(testOverall.toFixed(1)),
                date: test.createdAt ? new Date(test.createdAt).toLocaleDateString() : "Just now"
            };
        });
        currentScore = Number((totalOverallBand / recentTests.length).toFixed(1));
    }

    const calcAverage = (scores: number[]) => scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const moduleAverages = {
        reading: Number(calcAverage(allReadingScores).toFixed(1)),
        listening: Number(calcAverage(allListeningScores).toFixed(1)),
        writing: Number(calcAverage(allWritingScores).toFixed(1)),
        speaking: Number(calcAverage(allSpeakingScores).toFixed(1)),
    };

    if (allReadingScores.length > 0 || allListeningScores.length > 0 || allWritingScores.length > 0 || allSpeakingScores.length > 0) {
        const modules = [
            { name: "Reading", score: moduleAverages.reading, tip: "Focus on skimming and matching headings.", msg: "Your comprehension speed is excellent." },
            { name: "Listening", score: moduleAverages.listening, tip: "Practice spelling and map labeling.", msg: "Your auditory processing is top tier." },
            { name: "Writing", score: moduleAverages.writing, tip: "Work on using complex sentence structures.", msg: "Your lexical resource is very strong." },
            { name: "Speaking", score: moduleAverages.speaking, tip: "Try to speak at length without hesitation.", msg: "Your fluency and pronunciation are great." }
        ];

        modules.sort((a, b) => a.score - b.score);
        insights = {
            weakest: { module: modules[0].name, tip: modules[0].tip },
            strongest: { module: modules[3].name, message: modules[3].msg }
        };
    }

    return {
      success: true,
      data: {
        stats: { targetScore, currentScore, dailyGoalMins, studiedTodayMins, streakDays, vocabLearned },
        moduleAverages,
        recentTests: formattedRecentTests,
        insights
      }
    };
  } catch (error) {
    console.error("Service Error fetching dashboard data:", error);
    throw new Error("Failed to compile dashboard data");
  }
};
// ==========================================
// 3. ACTIVITY LOGGER
// ==========================================
export const logUserActivity = async (userId: string, minutesSpent: number) => {
  const today = new Date().toDateString();
  let progress = await Progress.findOne({ userId });

  if (!progress) {
    return await Progress.create({
      userId,
      streakDays: 1,
      studiedTodayMins: minutesSpent,
      lastActiveDate: new Date()
    });
  }

  const lastActive = new Date(progress.lastActiveDate).toDateString();

  if (today === lastActive) {
    progress.studiedTodayMins += minutesSpent;
  } else {
    progress.studiedTodayMins = minutesSpent;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastActive === yesterday.toDateString()) {
      progress.streakDays += 1; 
    } else {
      progress.streakDays = 1; 
    }
    progress.lastActiveDate = new Date();
  }

  await progress.save();
  return progress;
};