import dotenv from "dotenv"
dotenv.config()

import fs from "fs"
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export const transcribeAudio = async (audioPath: string) => {
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-large-v3-turbo"
  })

  return transcription.text
}