import dotenv from "dotenv"
dotenv.config()
import Groq from "groq-sdk"
import { DeepgramClient } from "@deepgram/sdk"
import fs from "fs"
import path from "path"

const deepgram = new DeepgramClient({
  apiKey: process.env.DEEPGRAM_API_KEY as string
})

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

/**
 * Generate Meaning and Example for Vocabulary
 */
export const generateBulkVocabAI = async (words: string[]) => {
  const wordsList = words.join(", ");
  
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b", 
    messages: [
      {
        role: "system",
        content: `
You are an IELTS/PTE expert. I will provide a list of 50 words.
For EACH word, provide:
1. A concise meaning (max 15 words).
2. One high-level academic example sentence.

Return ONLY a valid JSON array of objects. Do not include any text outside the JSON.
Format:
[
  { "word": "word1", "meaning": "...", "example": "..." }
]
`
      },
      {
        role: "user",
        content: `Enrich these words: ${wordsList}`
      }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" } 
  });

  return completion.choices[0].message?.content;
};

/**
 * Evaluate IELTS writing
 */
export const evaluateWritingAI = async (content: string, prompt: string, taskType: string) => {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: `You are an expert IELTS Writing Examiner. 
        Evaluate the following ${taskType} essay based on the prompt: "${prompt}".
        Provide a professional breakdown in JSON format:
        {
          "bandScore": 0.0,
          "taskResponse": "Feedback on how well they answered the prompt",
          "coherence": "Feedback on flow and paragraphing",
          "vocabulary": "Feedback on word choice and range",
          "grammar": "Feedback on accuracy and complexity",
          "overallFeedback": "One paragraph summary",
          "suggestions": ["specific improvement 1", "specific improvement 2"]
        }`
      },
      { role: "user", content: `Essay Content: ${content}` }
    ],
    temperature: 0.3
  });

  return completion.choices[0].message?.content || "{}";
};

/**
 * Evaluate spoken English
 */
// 👈 Fix Error #1 by adding targetText: string
export const evaluateSpeakingAI = async (transcript: string, targetText: string) => {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: `You are a PTE/IELTS Speaking Examiner. 
        Target Text to read: "${targetText}"
        Evaluate the candidate's transcript. 
        Return ONLY JSON: { "bandScore": 0, "pronunciation": 0, "fluency": 0, "feedback": "specific errors", "overallFeedback": "general tip" }`
      },
      { role: "user", content: `Candidate Transcript: ${transcript}` }
    ],
    temperature: 0.3
  });

  return completion.choices[0].message?.content || "{}";
};

/**
 * Deepgram TTS - With Auto-Chunking for Long Transcripts
 */
export const generateAudioFromText = async (text: string) => {
  fs.mkdirSync("uploads/listening", { recursive: true });

  const filename = `listening-${Date.now()}.mp3`;
  const filepath = path.join("uploads/listening", filename);

  const textBatches: string[] = [];
  const MAX_LENGTH = 1800; // Deepgram max is 2000, 1800 is very safe
  let remainingText = text;

  // Unbreakable logic: Forces splits safely under the limit
  while (remainingText.length > 0) {
    if (remainingText.length <= MAX_LENGTH) {
      textBatches.push(remainingText);
      break;
    }
    
    // Find the last space within our safe limit so we don't cut words in half
    let splitAt = remainingText.lastIndexOf(" ", MAX_LENGTH);
    
    // Fallback if there are literally no spaces (rare, but safe)
    if (splitAt === -1) splitAt = MAX_LENGTH;

    textBatches.push(remainingText.substring(0, splitAt));
    
    // Trim the start of the remaining text for the next loop
    remainingText = remainingText.substring(splitAt).trim();
  }

  const audioBuffers: Buffer[] = [];
  console.log(`🎙️ Unbreakable strict split: Processing ${textBatches.length} chunks...`);

  // Process each chunk through Deepgram
  for (const batch of textBatches) {
    if (!batch) continue;
    
    const response = await deepgram.speak.v1.audio.generate({
      text: batch,
      model: "aura-asteria-en"
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    audioBuffers.push(buffer);
  }

  // Stitch chunks together into one MP3
  fs.writeFileSync(filepath, Buffer.concat(audioBuffers));
  console.log(`✅ Deepgram limit strictly bypassed and saved at: ${filepath}`);

  return `/uploads/listening/${filename}`;
}

/**
 * Generate listening transcript
 */
export const generateListeningTranscriptAI = async () => {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: `
Act as you are the professional IELTS/PTE examiner. Generate an IELTS listening dialogue.
Rules:
- 2-3 speakers
- natural conversation
Return only the dialogue.
`
      }
    ]
  })
  return completion.choices[0].message?.content || ""
}

/**
 * Generate a dynamic title for the listening test
 */
export const generateListeningTitleAI = async (transcript: string) => {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: "You are an IELTS instructor. Generate a short, descriptive title (maximum 5 words) for the following listening transcript. Return ONLY the title text, without quotes or extra punctuation."
      },
      {
        role: "user",
        content: transcript
      }
    ],
    temperature: 0.3
  })
  return completion.choices[0].message?.content?.replace(/["']/g, "").trim() || "Listening Practice Test";
}

/**
 * Generate listening questions
 */
export const generateListeningQuestionsAI = async (text: string) => {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: `You are an IELTS Listening exam question generator. Generate 15 IELTS Listening questions based on the transcript provided. Return ONLY a JSON array of objects with keys: "question", "type" (must be "mcq", "true_false_not_given", "fill_blank", or "matching"), "options" (array of 4 strings), and "correctAnswer".`
      },
      {
        role: "user",
        content: text
      }
    ],
    temperature: 0.2
  });

  return completion.choices[0].message?.content || "[]";
}

/**
 * Generate reading comprehension questions
 */
export const generateReadingQuestionsAI = async (passage: string) => {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: `
You are an IELTS reading test generator. Generate 15 questions from the passage.
Use these types: mcq, true_false_not_given, fill_blank, matching.
Return ONLY JSON in this format:
[
 {
  "question": "...",
  "type": "mcq",
  "options": ["A","B","C","D"],
  "correctAnswer": "..."
 }
]
`
      },
      {
        role: "user",
        content: `Passage:\n${passage}`
      }
    ],
    temperature: 0.7
  });

  return completion.choices[0].message?.content || "[]";
}
/**
 * Generate an IELTS Academic Reading Passage
 */
export const generateReadingPassageAI = async () => {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: `
You are an expert IELTS Academic content creator. 
Write a highly academic, 600-700 word reading passage suitable for an IELTS Reading exam. 
Topics should be scientific, historical, or sociological.
Do not include a title in the text, just the paragraphs.
`
      }
    ],
    temperature: 0.7
  });

  return completion.choices[0].message?.content || "";
}

/**
 * Generate a dynamic title for the reading passage
 */
export const generateReadingTitleAI = async (passage: string) => {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: "Generate a short, formal, academic title (maximum 6 words) for the following passage. Return ONLY the title text, without quotes."
      },
      {
        role: "user",
        content: passage
      }
    ],
    temperature: 0.3
  });

  return completion.choices[0].message?.content?.replace(/["']/g, "").trim() || "Academic Reading Passage";
}
