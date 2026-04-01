import dotenv from "dotenv"
dotenv.config()

import fs from "fs"
import path from "path"

import { connectDatabase } from "../config/database"
import Vocabulary from "../models/vocabulary.model"

const seedVocabulary = async () => {
  try {
    await connectDatabase()

    const filePath = path.join(__dirname, "../data/full-word.json")

    const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"))

    const words = rawData.map((item: any) => ({
      word: item.value.word,
      level: item.value.level,
      type: item.value.type,
      phonetics: item.value.phonetics?.us || "",
      example: item.value.examples?.[0] || ""
    }))

    await Vocabulary.deleteMany()

    await Vocabulary.insertMany(words)

    console.log(`Inserted ${words.length} vocabulary words`)

    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

seedVocabulary()