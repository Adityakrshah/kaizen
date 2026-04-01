import { Router } from "express";
import { getVocabulary, addVocabulary, getPracticeDeck, markAsMastered } from "../controllers/vocabulary.controller";

const router = Router();

router.get("/", getVocabulary);
router.post("/", addVocabulary);

// Practice specific routes
router.get("/practice", getPracticeDeck);
router.post("/master", markAsMastered);
// Add this route
// router.post("/enrich", bulkEnrichMeanings);
// router.post("/clean", cleanVocabulary);
export default router;