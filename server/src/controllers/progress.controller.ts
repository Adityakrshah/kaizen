import { Request, Response } from "express";
// We import getDashboardData from the service file here
import { getUserProgress, updateProgress, getDashboardData } from "../services/progress.service";
import { auth } from "../config/auth"; 

export const fetchProgress = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const progress = await getUserProgress(userId as string);
  res.json({ success: true, data: progress });
};

export const updateUserProgress = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const progress = await updateProgress(userId as string, req.body);
  res.json({ success: true, data: progress });
};

// FULLY IMPLEMENTED DASHBOARD CONTROLLER
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await auth.api.getSession({ 
        headers: req.headers as any 
    });

    if (!session || !session.user) {
      res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
      return;
    }

    const userId = session.user.id;

    // This calls the function from the service file
    const dashboardData = await getDashboardData(userId);

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard progress" });
  }
};
