import { Request, Response } from "express";
import { auth } from "../config/auth";
import { getProfileByUserId, upsertProfile, softDeleteProfile } from "../services/profile.service";

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    // If they don't have a profile yet, upsert an empty one automatically
    let profile = await getProfileByUserId(session.user.id).catch(() => null);
    if (!profile) {
      profile = await upsertProfile(session.user.id, { username: session.user.name || "Student" });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ success: false, message: "Unauthorized" });

   // Ensure users can't hack their own status flags via the update route
    const safeData = {
      username: req.body.username,
      profilePicture: req.body.profilePicture,
      coverPicture: req.body.coverPicture, 
      bio: req.body.bio,
      country: req.body.country,
    };

    const updatedProfile = await upsertProfile(session.user.id, safeData);
    res.status(200).json({ success: true, data: updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

export const deleteMyAccount = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Trigger the soft delete
    await softDeleteProfile(session.user.id);

    // Optional: You might want to also invalidate their auth session here

    res.status(200).json({ success: true, message: "Account successfully deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete account" });
  }
};