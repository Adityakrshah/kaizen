import { Router } from "express";
import { fetchProgress, updateUserProgress, getDashboardStats } from "../controllers/progress.controller";

const router = Router();

// IMPORTANT: Put the /dashboard route BEFORE the /:userId route
// Otherwise, Express will think "dashboard" is a userId!
router.get("/dashboard", getDashboardStats);

// Your existing routes
router.get("/:userId", fetchProgress);
router.put("/:userId", updateUserProgress);

export default router;