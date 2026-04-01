import mongoose from "mongoose"
import dotenv from "dotenv"
import fs from "fs"
import csv from "csv-parser"

import { Reading } from "../models/reading.model"

dotenv.config()

const MONGO_URI = process.env.MONGO_URI as string

const results: any[] = []

async function seedReading() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log("MongoDB connected")

    fs.createReadStream("src/data/reading/cefr_leveled_texts.csv")
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          title: "Reading Practice",
          passage: data.text,
          difficulty: data.label,
          questions: []
        })
      })
      .on("end", async () => {
        await Reading.deleteMany({})
        await Reading.insertMany(results)

        console.log(`Seeded ${results.length} reading passages`)

        process.exit()
      })

  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

seedReading()
