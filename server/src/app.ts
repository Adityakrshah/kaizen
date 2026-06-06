import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { toNodeHandler } from "better-auth/node";

// Configuration & Auth
import { auth } from "./config/auth";

// Routes
import settingsRoutes from "./routes/settings.routes";
import systemRoutes from "./routes/system.routes";
import vocabularyRoutes from "./routes/vocabulary.routes";
import readingRoutes from "./routes/reading.routes";
import listeningRoutes from "./routes/listening.routes";
import writingRoutes from "./routes/writing.routes";
import speakingRoutes from "./routes/speaking.routes";
import mocktestRoutes from "./routes/mocktest.routes";
import progressRoutes from "./routes/progress.routes";
import profileRoutes from "./routes/profile.routes";

// Middleware
import { errorHandler } from "./middleware/error.middleware";
import { apiLimiter } from "./middleware/rateLimit.middleware";

const app = express();

// 🟢 0. TRUST PROXY (CRITICAL FOR RENDER)
// Tells Express to trust the 'X-Forwarded-Proto' header from Render's load balancer.
// Without this, Better Auth thinks the connection is HTTP and rejects it.
app.set("trust proxy", 1);

// 🟢 1. STANDARD CORS (For actual data requests)
app.use(cors({
  origin: ["http://localhost:5173", "https://kaizen.adityakshah.com.np"],
  credentials: true,
}));

// 🟢 1.5 THE NUCLEAR PREFLIGHT HANDLER (The Fix)
// This manually catches every OPTIONS ping, forces the correct headers, 
// and terminates the request with a perfect 204 Success code so it never hits the 404 route.
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const allowedOrigins = ["http://localhost:5173", "https://kaizen.adityakshah.com.np"];
    const origin = req.headers.origin || "";
    
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    
    return res.status(204).end();
  }
  next();
});

// 🟢 2. LOGGING & COOKIES
app.use(morgan("dev"));
app.use(cookieParser());

// 🟢 3. BETTER AUTH HANDLER
// Intercepts auth requests before the body parser consumes them
// To this correct Express 5 line:
app.all("/api/auth/*splat", toNodeHandler(auth));

// 🟢 4. BODY PARSERS (For all other routes)
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// 🟢 5. SECURITY HEADERS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Allows Google/GitHub avatars
}));

// 🟢 6. APPLICATION ROUTES
app.use("/api", apiLimiter);

// Module-specific endpoints
app.use("/api/settings", settingsRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api/reading", readingRoutes);
app.use("/api/listening", listeningRoutes);
app.use("/api/writing", writingRoutes);
app.use("/api/speaking", speakingRoutes);
app.use("/api/mocktest", mocktestRoutes);
app.use("/api/progress", progressRoutes);
app.use("/system", systemRoutes);
app.use("/api/profile", profileRoutes);

// Static files (Serving uploaded profile pictures)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 🟢 7. STATUS & ERROR HANDLING
app.get("/", (req, res) => {
  res.json({ 
    status: "online", 
    message: "Kaizen API is live and healthy 🚀",
    timestamp: new Date().toISOString()
  });
});

// Fallback for non-existent routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Centralized Error Handler
app.use(errorHandler);

export default app;