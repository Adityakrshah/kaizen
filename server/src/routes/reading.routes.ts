import express from "express";
import {
  getReadingPassages,
  getReadingPassageById,
  submitReadingAnswers,
  generateReading,
  generateQuestions // 👈 Updated import name
} from "../controllers/reading.controller";

const router = express.Router();

// Fetch all passages (Standard + AI)
router.get("/", getReadingPassages);

// Generate a new AI passage
router.post("/generate", generateReading); // 👈 Updated function call

// Get a specific passage
router.get("/:id", getReadingPassageById);

// Submit answers for grading
router.post("/submit", submitReadingAnswers);
// Generate questions for an existing test
router.post("/:id/questions", generateQuestions);
export default router;