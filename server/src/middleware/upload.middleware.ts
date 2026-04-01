import multer from "multer"
import path from "path"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
})

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // 🔍 Log the incoming type to help debugging
    console.log("📥 Incoming file type:", file.mimetype);

    const allowedTypes = [
      "audio/webm", 
      "audio/mpeg", 
      "audio/wav", 
      "audio/mp4", 
      "audio/ogg",
      "video/webm" // Some browsers wrap audio in a video/webm container
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // 👇 This is what was triggering your error
      cb(new Error("Only audio files are allowed (audio/webm, mp3, wav, etc.)") as any, false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});