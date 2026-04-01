import { Router } from "express";
import { submitWritingTest } from "../controllers/writing.controller";

const router = Router();

// POST /api/writing/submit
router.post("/submit", submitWritingTest);

export default router;