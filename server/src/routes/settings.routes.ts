import { Router } from "express";
import { UserSettings } from "../models/settings.model";
import { auth } from "../config/auth"; // Make sure this path is correct!

const router = Router();

// 🛡️ Middleware to protect the route and grab the user session
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    // We pass the incoming request to Better Auth to check for the session cookie
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    if (!session) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    req.user = session.user; // Attach user to request
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🟢 GET: Fetch User Settings
router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user.id });
    
    // If they are a new user and don't have settings yet, create default ones!
    if (!settings) {
      settings = await UserSettings.create({ userId: req.user.id });
    }
    
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
});

// 🟢 PUT: Update User Settings
router.put("/", requireAuth, async (req: any, res: any) => {
  try {
    // Upsert means: Update it if it exists, Create it if it doesn't
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, data: updatedSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
});

export default router;