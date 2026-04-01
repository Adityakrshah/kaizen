import dotenv from "dotenv"
dotenv.config()

import fs from "fs"
import path from "path"

import { connectDatabase } from "../config/database"
import { SpeakingPrompt } from "../models/speakingPrompt.model"

const seedSpeaking = async () => {
  try {
    await connectDatabase()

    const filePath = path.join(__dirname, "../data/speaking_read-a-loud.json")

    const raw = fs.readFileSync(filePath, "utf8")

    const json = JSON.parse(raw)

    const prompts = json.data.map((item: any) => ({
      type: "read_aloud",
      topic: item.hash_tags,
      prompt: item.qtext,
      difficulty: item.difficulty,
      examDate: item.exam_date
    }))

    await SpeakingPrompt.deleteMany()

    await SpeakingPrompt.insertMany(prompts)

    console.log(`Inserted ${prompts.length} speaking prompts`)

    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

seedSpeaking()