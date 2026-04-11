import { Router } from "express";
import { getMyProfile, updateMyProfile, deleteMyAccount } from "../controllers/profile.controller";

const router = Router();

router.get("/", getMyProfile);
router.patch("/", updateMyProfile);
router.delete("/", deleteMyAccount);

export default router;