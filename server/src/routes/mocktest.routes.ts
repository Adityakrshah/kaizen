import { Router } from "express";
import { 
  startmocktest, 
  updatemocktest, 
  getMockTestById, 
  evaluateMockWriting,
  submitMockTest // 🚀 1. ADDED THIS IMPORT
} from "../controllers/mocktest.controller";

const router = Router();

// POST /api/mocktest/start
router.post("/start", startmocktest);

// PATCH /api/mocktest/update
router.patch("/update", updatemocktest);

// POST /api/mocktest/submit
router.post("/submit", submitMockTest); // 🚀 2. ADDED THIS ROUTE

// GET /api/mocktest/:id
router.get("/:id", getMockTestById);

// POST /api/mocktest/evaluate-writing
router.post("/evaluate-writing", evaluateMockWriting);

export default router;