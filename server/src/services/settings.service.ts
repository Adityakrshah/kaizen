import { UserSettings } from "../models/settings.model";

export const SettingsService = {
  // Get settings for a user, or create defaults if they don't exist
  async getSettings(userId: string) {
    let settings = await UserSettings.findOne({ userId });
    if (!settings) {
      settings = await UserSettings.create({ userId });
    }
    return settings;
  },

  // Update or Create settings
  async updateSettings(userId: string, updateData: any) {
    return await UserSettings.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );
  }
};