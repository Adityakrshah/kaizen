import { Profile } from "../models/profile.model";

// 1. Get Profile (Only if not deleted)
export const getProfileByUserId = async (userId: string) => {
  const profile = await Profile.findOne({ userId });
  
  // Security check: Don't return profiles that are soft-deleted
  if (profile?.accountStatus.isDeleted) {
    throw new Error("This account has been deleted.");
  }
  
  return profile;
};

// 2. Update/Create Profile
export const upsertProfile = async (userId: string, updateData: any) => {
  // We use findOneAndUpdate with upsert: true so it creates one if it doesn't exist yet
  return await Profile.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { new: true, upsert: true }
  );
};

// 3. 🚀 SOFT DELETE Function
export const softDeleteProfile = async (userId: string) => {
  return await Profile.findOneAndUpdate(
    { userId },
    { $set: { "accountStatus.isDeleted": true } },
    { new: true }
  );
};