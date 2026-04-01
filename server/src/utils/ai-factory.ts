import mongoose from "mongoose";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { Reading } from "../models/reading.model";
import { WritingPrompt } from "../models/writingprompt.model";
import { IeltsSpeaking } from "../models/ieltsspeaking.model";
import { IeltsListening } from "../models/ieltslistening.model";

// 🚀 IMPORT YOUR EXISTING TTS SERVICE
import { generateAudioFromText } from "../services/tts.service";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const AI_MODEL = "llama-3.1-8b-instant"; 
const MONGO_URI = process.env.DATABASE_URL || process.env.MONGO_URI || "mongodb://localhost:27017/kaizen";

// ⏱️ HELPER: Pause execution to prevent API rate limits
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 🧠 AI GENERATOR FUNCTIONS
async function generateWritingPrompt() {
  const prompt = `You are an expert IELTS examiner. Generate a unique, realistic IELTS Writing test. Return ONLY valid JSON:
  {
    "task1": "150-word prompt describing a chart as a single text string.",
    "task2": "250-word prompt discussing a social issue as a single text string."
  }`;
  const completion = await groq.chat.completions.create({ messages: [{ role: "user", content: prompt }], model: AI_MODEL, response_format: { type: "json_object" } });
  return JSON.parse(completion.choices[0]?.message?.content || "{}");
}

async function generateReadingPassage() {
  const prompt = `You are an expert IELTS examiner. Generate a unique IELTS Reading passage (300 words) with 4 multiple choice questions. Return ONLY valid JSON:
  {
    "title": "Academic title", 
    "passage": "300-word passage...",
    "questions": [ 
      { 
        "question": "...", 
        "type": "multiple_choice", 
        "options": ["First full descriptive answer text", "Second full descriptive answer text", "Third full descriptive answer text", "Fourth full descriptive answer text"], 
        "correctAnswer": "Exact string of correct option" 
      } 
    ]
  }
  STRICT RULE: You MUST write out the FULL text for each answer choice. NEVER use single letters like "A", "B", "C", or "D" as options.`;
  const completion = await groq.chat.completions.create({ messages: [{ role: "user", content: prompt }], model: AI_MODEL, response_format: { type: "json_object" } });
  return JSON.parse(completion.choices[0]?.message?.content || "{}");
}

async function generateSpeakingPrompt() {
  const prompt = `You are an expert IELTS examiner. Generate a unique IELTS Speaking test. Return ONLY valid JSON:
  {
    "part1": ["Q1?", "Q2?", "Q3?"],
    "part2": "Describe a time when...",
    "part3": ["Abstract Q1?", "Abstract Q2?"]
  }`;
  const completion = await groq.chat.completions.create({ messages: [{ role: "user", content: prompt }], model: AI_MODEL, response_format: { type: "json_object" } });
  return JSON.parse(completion.choices[0]?.message?.content || "{}");
}

async function generateListeningSection() {
  const prompt = `You are an expert IELTS examiner. Write a 150-word monologue about a random academic or everyday topic. Then generate 4 multiple-choice questions based on that text. Return ONLY valid JSON:
  {
    "transcript": "The exact spoken words of the monologue. Do not include speaker names.",
    "questions": [ 
      { 
        "question": "...", 
        "type": "multiple_choice", 
        "options": ["First full descriptive answer text", "Second full descriptive answer text", "Third full descriptive answer text", "Fourth full descriptive answer text"], 
        "correctAnswer": "Exact string of correct option" 
      } 
    ]
  }
  STRICT RULE: You MUST write out the FULL text for each answer choice. NEVER use single letters like "A", "B", "C", or "D" as options.`;
  const completion = await groq.chat.completions.create({ messages: [{ role: "user", content: prompt }], model: AI_MODEL, response_format: { type: "json_object" } });
  return JSON.parse(completion.choices[0]?.message?.content || "{}");
}

// 🏭 THE FACTORY LOOP
const runFactory = async (batchesToGenerate: number) => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB.");
    
    console.log("🗑️  Wiping old database records...");
    await WritingPrompt.deleteMany({});
    await Reading.deleteMany({});
    await IeltsSpeaking.deleteMany({});
    await IeltsListening.deleteMany({});
    console.log("✨ Database wiped clean! Firing up the AI Factory...\n");

    for (let i = 0; i < batchesToGenerate; i++) {
      console.log(`⏳ Generating Test Batch ${i + 1} of ${batchesToGenerate}...`);

      const [writingData, readingData, speakingData, listeningData] = await Promise.all([
        generateWritingPrompt(),
        generateReadingPassage(),
        generateSpeakingPrompt(),
        generateListeningSection() 
      ]);

      // 1. Save Writing
      if (writingData) {
        const safeTask1 = typeof writingData.task1 === 'object' ? (writingData.task1.prompt || JSON.stringify(writingData.task1)) : writingData.task1;
        const safeTask2 = typeof writingData.task2 === 'object' ? (writingData.task2.prompt || JSON.stringify(writingData.task2)) : writingData.task2;
        await WritingPrompt.create({ task1: safeTask1 || "Describe the chart.", task2: safeTask2 || "Do you agree?" });
      }

      // 2. Save Reading
      if (readingData.title) await Reading.create(readingData);

      // 3. Save Speaking
      if (speakingData.part2) await IeltsSpeaking.create(speakingData);

      // 4. GENERATE MP3 WITH RETRY LOGIC
      if (listeningData.transcript && listeningData.questions) {
        console.log("  🎙️  Sending transcript to Deepgram TTS Service...");
        
        let audioUrl = "";
        let retries = 3;
        
        while (retries > 0) {
          try {
            audioUrl = await generateAudioFromText(listeningData.transcript);
            break; // Success! Break out of the retry loop.
          } catch (error) {
            retries--;
            console.warn(`  ⚠️ Deepgram connection failed. Retries left: ${retries}. Waiting 5 seconds...`);
            if (retries === 0) throw new Error("Deepgram API failed after 3 attempts.");
            await sleep(5000); // Wait 5 seconds before trying again
          }
        }

        await IeltsListening.create({
          audioUrl: audioUrl, 
          questions: listeningData.questions
        });
        console.log(`  ✔️  Listening Section saved (Audio: ${audioUrl}).`);
      }

      // 🛑 COOLDOWN: Wait 4 seconds before starting the next batch to respect API limits
      if (i < batchesToGenerate - 1) {
        console.log("  ☕ Resting for 4 seconds to prevent API rate limits...\n");
        await sleep(4000);
      }
    }

    console.log(`\n🎉 AI Factory Complete! Successfully injected ${batchesToGenerate} completely dynamic tests.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error in AI Factory:", error);
    process.exit(1);
  }
};

// 🚀 GENERATE 4 FRESH TESTS
const BATCHES = 4; 
runFactory(BATCHES);