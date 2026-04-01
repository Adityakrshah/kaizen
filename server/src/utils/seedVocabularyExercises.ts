import mongoose from "mongoose"
import dotenv from "dotenv"

import VocabularyExercise from "../models/vocabularyExercise.model"

import dragDrop from "../data/vocab_fill_in_blanks_dragNdrop.json"
import dropdown from "../data/vocab_fill_in_blanks_dropdown.json"
import listening from "../data/vocab_listening_fill_in_blanks.json"
import dictation from "../data/vocab_write_from_dictation.json"

dotenv.config()

const MONGO_URI = process.env.MONGO_URI as string

async function seedVocabularyExercises() {
  try {
    await mongoose.connect(MONGO_URI)

    console.log("MongoDB connected")

    const drag = (dragDrop as any).data.wordsData
    const drop = (dropdown as any).data.wordsData
    const listen = (listening as any).data.wordsData
    const dict = (dictation as any).data.wordsData

    const exercises = [...drag, ...drop, ...listen, ...dict]

    console.log("Total exercises:", exercises.length)

    await VocabularyExercise.deleteMany({}) // prevents duplicates
    await VocabularyExercise.insertMany(exercises, { ordered: false })

    console.log(`Seeded ${exercises.length} vocabulary exercises`)

    process.exit()

  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

seedVocabularyExercises()