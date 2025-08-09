import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { createWorker } from "tesseract.js";
import sharp from "sharp";
import { ocrRequestSchema, solutionRequestSchema } from "@shared/schema";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

interface MulterRequest extends Request {
  file?: any;
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // OCR endpoint for image processing
  app.post("/api/ocr", upload.single("image"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Image preprocessing with Sharp
      const processedImage = await sharp(req.file.buffer)
        .greyscale()
        .normalize()
        .sharpen()
        .png()
        .toBuffer();

      // OCR processing with Tesseract
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(processedImage);
      await worker.terminate();

      if (!text.trim()) {
        return res.status(400).json({ error: "No text could be extracted from the image" });
      }

      res.json({ extractedText: text.trim() });
    } catch (error) {
      console.error("OCR processing error:", error);
      res.status(500).json({ error: "Failed to process image" });
    }
  });

  // Solution generation endpoint using Google Gemini
  app.post("/api/solutions", async (req, res) => {
    try {
      const { questions } = solutionRequestSchema.parse(req.body);
      const geminiApiKey = process.env.GEMINI_API_KEY;

      if (!geminiApiKey) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      // Initialize Gemini AI
      const genAI = new GoogleGenAI({ apiKey: geminiApiKey });

      console.log("Using Gemini 1.5 Flash model for solution generation");

      const prompt = `You are an expert academic tutor specializing in providing comprehensive, step-by-step solutions to academic questions. 

Analyze and solve the following questions with detailed explanations:

${questions}

For each question, provide:

## Question Analysis
- Identify the key concepts and requirements
- Note any given data or constraints

## Step-by-Step Solution
- Break down the solution into clear, logical steps
- Show all calculations and reasoning
- Explain why each step is necessary

## Final Answer
- Clearly highlight the final result
- Include units where applicable
- Verify the answer makes sense

Format your response using proper markdown with clear headings and structure. Make the solutions educational and easy to follow.`;

      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });
      
      const solutions = response.text;
      
      if (!solutions) {
        return res.status(500).json({ error: "Gemini AI returned empty response" });
      }

      console.log("Gemini response received:", solutions.length, "characters");

      // Store the session
      const session = await storage.createQuestionSession({
        originalText: questions,
        extractedText: questions,
        solutions: solutions
      });

      res.json({ 
        solutions,
        sessionId: session.id,
        modelUsed: "gemini-1.5-flash"
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Solution generation error:", error);
      res.status(500).json({ error: `Failed to generate solutions: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  });

  // Get session by ID
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getQuestionSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Session retrieval error:", error);
      res.status(500).json({ error: "Failed to retrieve session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
