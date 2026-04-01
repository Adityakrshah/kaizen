import { Router } from "express";
import { 
  getListening, 
  getListeningByIdController, 
  submitListeningAnswers, 
  generateListening 
} from "../controllers/listening.controller";

const router = Router();

router.get("/", getListening);
router.get("/:id", getListeningByIdController);
router.post("/submit", submitListeningAnswers);
router.post("/generate", generateListening);

export default router;