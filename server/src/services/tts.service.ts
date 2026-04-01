import dotenv from "dotenv";
dotenv.config();
import { DeepgramClient } from "@deepgram/sdk";
import fs from "fs";
import path from "path";

const deepgram = new DeepgramClient({
  apiKey: process.env.DEEPGRAM_API_KEY as string
});

export const generateAudioFromText = async (text: string) => {
  fs.mkdirSync("uploads/listening", { recursive: true });

  const filename = `listening-${Date.now()}.mp3`;
  const filepath = path.join("uploads/listening", filename);

  const textBatches: string[] = [];
  const MAX_LENGTH = 1800; 
  let remainingText = text;

  // Unbreakable logic: Forces splits safely under the limit
  while (remainingText.length > 0) {
    if (remainingText.length <= MAX_LENGTH) {
      textBatches.push(remainingText);
      break;
    }
    
    let splitAt = remainingText.lastIndexOf(" ", MAX_LENGTH);
    if (splitAt === -1) splitAt = MAX_LENGTH;

    textBatches.push(remainingText.substring(0, splitAt));
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