import { Request, Response } from "express"
import Vocabulary from "../models/vocabulary.model"
import { vocabularySchema } from "../validators/vocabulary.validator"
import { ZodError } from "zod"
import UserVocab from "../models/userVocab.model"; // Create this model if not done
import { auth } from "../config/auth";
import { generateBulkVocabAI} from "../services/ai.service";
export const getPracticeDeck = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

    const mastered = await UserVocab.find({ userId: session.user.id }).select("wordId");
    const masteredIds = mastered.map(m => m.wordId);

    // 1. Get 10 random words
    const words = await Vocabulary.aggregate([
      { $match: { _id: { $nin: masteredIds } } },
      { $sample: { size: 10 } }
    ]);

    // 2. CHECK: If any word is missing a meaning, enrich ONLY those 10
    const needsEnrichment = words.filter(w => !w.meaning || w.meaning === "");
    
    if (needsEnrichment.length > 0) {
      const wordStrings = needsEnrichment.map(w => w.word);
      const aiContent = await generateBulkVocabAI(wordStrings); // Your 50-word function works for 10 too!
      
      if (aiContent) {
        const results = JSON.parse(aiContent.replace(/```json|```/g, ""));
        
        // Update the DB and the local 'words' array so the user sees it immediately
        for (const item of results) {
          const doc = await Vocabulary.findOneAndUpdate(
            { word: item.word },
            { meaning: item.meaning, example: item.example },
            { new: true }
          );
          
          // Sync the data in the current response array
          const index = words.findIndex(w => w.word === item.word);
          if (index !== -1) words[index] = doc;
        }
      }
    }

    res.json({ success: true, data: words });
  } catch (error) {
    res.status(500).json({ message: "Practice session failed" });
  }
};
//only used once for cleaning the duplicate vocabulary from dataset
// export const cleanVocabulary = async (req: Request, res: Response) => {
//   try {
//     const duplicates = await Vocabulary.aggregate([
//       {
//         $group: {
//           _id: "$word",
//           ids: { $push: "$_id" },
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $match: {
//           count: { $gt: 1 }
//         }
//       }
//     ]);

//     // Loop through each "bucket" of duplicates
//     for (const item of duplicates) {
//       item.ids.shift(); // Remove the first ID from the delete list (Keep it!)
//       await Vocabulary.deleteMany({ _id: { $in: item.ids } }); // Delete the rest
//     }

//     res.json({ 
//       success: true, 
//       message: `Cleaned ${duplicates.length} duplicate word groups. Your database is now lean!` 
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Cleanup failed" });
//   }
// };
// export const bulkEnrichMeanings = async (req: Request, res: Response) => {
//   try {
//     // 1. Fetch 50 words missing a meaning
//     const docs = await Vocabulary.find({
//       $or: [{ meaning: { $exists: false } }, { meaning: "" }]
//     }).limit(50);

//     if (docs.length === 0) return res.json({ count: 0, message: "Kaizen is fully enriched! 🎉" });

//     const wordStrings = docs.map(d => d.word);
    
//     // 2. Call the AI with the batch of 50
//     const aiContent = await generateBulkVocabAI(wordStrings);
    
//     if (aiContent) {
//       // Clean and parse the response
//       const cleanJson = aiContent.replace(/```json|```/g, "").trim();
//       const results = JSON.parse(cleanJson);

//       // We'll use a Bulk Write for maximum database speed
//       const bulkOps = results.map((item: any) => ({
//         updateOne: {
//           filter: { word: item.word },
//           update: { meaning: item.meaning, example: item.example }
//         }
//       }));

//       await Vocabulary.bulkWrite(bulkOps);
//     }

//     res.json({ 
//         success: true, 
//         count: docs.length, 
//         message: `Processed a batch of ${docs.length} words.` 
//     });
//   } catch (error) {
//     console.error("Turbo Enrichment Error:", error);
//     res.status(500).json({ message: "Batch failed" });
//   }
// };
export const markAsMastered = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

    const { wordId } = req.body;
    
    await UserVocab.findOneAndUpdate(
      { userId: session.user.id, wordId },
      { status: "mastered" },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to save progress" });
  }
};

// Keep your existing getVocabulary and addVocabulary below...
export const getVocabulary = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const search = req.query.search as string

    const query: any = {}

    if (search) {
      query.word = { $regex: search, $options: "i" }
    }

    const skip = (page - 1) * limit

    const words = await Vocabulary.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ word: 1 })

    const total = await Vocabulary.countDocuments(query)

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalWords: total,
      data: words
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vocabulary" })
  }
}

export const addVocabulary = async (req: Request, res: Response) => {
  try {
    // 1. Validate the input using the schema
    const validatedData = vocabularySchema.parse(req.body)

    // 2. Create the record using the validated data
    const newWord = await Vocabulary.create(validatedData)

    res.status(201).json(newWord)
  } catch (error) {
    // 3. Handle Validation Errors specifically
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues // Provides specific feedback on what went wrong
      })
    }

    res.status(500).json({ message: "An unexpected error occurred" })
  }
}