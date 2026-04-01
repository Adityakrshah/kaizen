import { Request, Response, NextFunction } from "express"

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.headers["x-user-id"]

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized"
    })
  }

  next()
}