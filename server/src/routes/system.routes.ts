import { Router } from "express"

const router = Router()

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "kaizen-api",
    timestamp: new Date().toISOString()
  })
})

router.get("/ready", (req, res) => {
  res.status(200).json({
    status: "ready"
  })
})

router.get("/version", (req, res) => {
  res.status(200).json({
    version: "1.0.0"
  })
})

router.get("/metrics", (req, res) => {
  res.status(200).json({
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})

export default router