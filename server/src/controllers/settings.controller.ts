import { Request, Response } from "express";
import { SettingsService } from "../services/settings.service";
import { updateSettingsSchema } from "../validators/settings.validator";

export const SettingsController = {
  getUserSettings: async (req: any, res: Response) => {
    try {
      // req.user comes from your Auth Middleware
      const settings = await SettingsService.getSettings(req.user.id);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching settings" });
    }
  },

  updateUserSettings: async (req: any, res: Response) => {
    try {
      // 1. Validate the incoming data
      const validatedData = updateSettingsSchema.parse(req.body);

      // 2. Call the service to save to MongoDB
      const updated = await SettingsService.updateSettings(req.user.id, validatedData);
      
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};