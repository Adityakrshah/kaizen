// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import cookieParser from "cookie-parser";
// import path from "path";
// import { toNodeHandler } from "better-auth/node";

// // Configuration & Auth
// import { auth } from "./config/auth";

// // Routes
// import settingsRoutes from "./routes/settings.routes";
// import systemRoutes from "./routes/system.routes";
// import vocabularyRoutes from "./routes/vocabulary.routes";
// import readingRoutes from "./routes/reading.routes";
// import listeningRoutes from "./routes/listening.routes";
// import writingRoutes from "./routes/writing.routes";
// import speakingRoutes from "./routes/speaking.routes";
// import mocktestRoutes from "./routes/mocktest.routes";
// import progressRoutes from "./routes/progress.routes";

// // Middleware
// import { errorHandler } from "./middleware/error.middleware";
// import { apiLimiter } from "./middleware/rateLimit.middleware";

// const app = express();

// // 🟢 1. SECURITY & CORS (Must be first)
// app.use(cors({ 
//   origin: "http://localhost:5173", 
//   credentials: true 
// }));

// // 🟢 2. COOKIE PARSER (Needed for Session detection)
// app.use(cookieParser());

// // 🟢 3. BETTER AUTH HANDLER (Critical Order)
// /** * We mount this BEFORE express.json(). 
//  * Better Auth handles its own body parsing for /api/auth routes.
//  * Using 'app.use' without a wildcard is the safest prefix-match for Express 5.
//  */
// app.use("/api/auth", toNodeHandler(auth));

// // 🟢 4. BODY PARSERS (For all other /api routes)
// // We increase the limit to 5MB so profile pictures don't get rejected.
// app.use(express.json({ limit: "5mb" }));
// app.use(express.urlencoded({ limit: "5mb", extended: true }));

// // 🟢 5. GLOBAL MIDDLEWARES
// app.use(morgan("dev"));
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" }
// }));

// // 🟢 6. APPLICATION ROUTES
// app.use("/api", apiLimiter); // Rate limiting for API safety

// app.use("/api/settings", settingsRoutes);
// app.use("/api/vocabulary", vocabularyRoutes);
// app.use("/api/reading", readingRoutes);
// app.use("/api/listening", listeningRoutes);
// app.use("/api/writing", writingRoutes);
// app.use("/api/speaking", speakingRoutes);
// app.use("/api/mocktest", mocktestRoutes);
// app.use("/api/progress", progressRoutes);
// app.use("/system", systemRoutes);

// // Static files for uploads (profile pictures, etc.)
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// // 🟢 7. ERROR HANDLING
// app.get("/", (req, res) => {
//   res.json({ message: "Kaizen API is live and healthy 🚀" });
// });

// app.use((req, res) => {
//   res.status(404).json({ success: false, message: "Route not found" });
// });

// app.use(errorHandler);

// export default app;

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

// 🟢 1. CORS (Absolute Priority)
// Must be first to handle Pre-flight (OPTIONS) requests correctly.
app.use(cors({ 
  origin: "http://localhost:5173", 
  credentials: true 
}));

// 🟢 2. LOGGING & COOKIES
app.use(morgan("dev"));
app.use(cookieParser());

// 🟢 3. BETTER AUTH HANDLER
/**
 * We mount this BEFORE the general express.json() body parser.
 * Better Auth is smart enough to handle its own body parsing for Email/Password,
 * and mounting it here prevents "Body already consumed" errors during Social redirects.
 */
app.use("/api/auth", toNodeHandler(auth));

// 🟢 4. BODY PARSERS (For all other routes)
// Increased to 5MB to support Base64 profile picture uploads in Settings.
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// 🟢 5. SECURITY HEADERS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Allows social avatars (Google/GitHub) to load in the frontend
  contentSecurityPolicy: false, 
}));

// 🟢 6. APPLICATION ROUTES
app.use("/api", apiLimiter); // Apply rate limiting to all /api routes

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