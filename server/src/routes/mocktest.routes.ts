import { Router } from "express";
import { startmocktest, updatemocktest ,getMockTestById, evaluateMockWriting} from "../controllers/mocktest.controller";

const router = Router();

// POST /api/mocktest/start
router.post("/start", startmocktest);

// PATCH /api/mocktest/update
router.patch("/update", updatemocktest);
// server/src/routes/mocktest.routes.ts
router.get("/:id", getMockTestById);
// Add this alongside your /start and /update routes:
router.post("/evaluate-writing", evaluateMockWriting);
export default router;