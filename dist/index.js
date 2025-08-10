// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  questionSessions;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.questionSessions = /* @__PURE__ */ new Map();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async createQuestionSession(insertSession) {
    const id = randomUUID();
    const session = {
      ...insertSession,
      id,
      extractedText: insertSession.extractedText ?? null,
      solutions: insertSession.solutions ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.questionSessions.set(id, session);
    return session;
  }
  async getQuestionSession(id) {
    return this.questionSessions.get(id);
  }
};
var storage = new MemStorage();

// server/routes.ts
import multer from "multer";
import { createWorker } from "tesseract.js";
import sharp from "sharp";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var questionSessions = pgTable("question_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalText: text("original_text").notNull(),
  extractedText: text("extracted_text"),
  solutions: text("solutions"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertQuestionSessionSchema = createInsertSchema(questionSessions).pick({
  originalText: true,
  extractedText: true,
  solutions: true
});
var ocrRequestSchema = z.object({
  imageData: z.string()
});
var solutionRequestSchema = z.object({
  questions: z.string().min(1, "Questions text is required")
});

// server/routes.ts
import { z as z2 } from "zod";
import { GoogleGenAI } from "@google/genai";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB limit
});
async function registerRoutes(app2) {
  app2.post("/api/ocr", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      const processedImage = await sharp(req.file.buffer).greyscale().normalize().sharpen().png().toBuffer();
      const worker = await createWorker("eng");
      const { data: { text: text2 } } = await worker.recognize(processedImage);
      await worker.terminate();
      if (!text2.trim()) {
        return res.status(400).json({ error: "No text could be extracted from the image" });
      }
      res.json({ extractedText: text2.trim() });
    } catch (error) {
      console.error("OCR processing error:", error);
      res.status(500).json({ error: "Failed to process image" });
    }
  });
  app2.post("/api/solutions", async (req, res) => {
    try {
      const { questions } = solutionRequestSchema.parse(req.body);
      const geminiApiKey2 = process.env.GEMINI_API_KEY;
      if (!geminiApiKey2) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }
      const genAI = new GoogleGenAI({ apiKey: geminiApiKey2 });
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
        contents: prompt
      });
      const solutions = response.text;
      if (!solutions) {
        return res.status(500).json({ error: "Gemini AI returned empty response" });
      }
      console.log("Gemini response received:", solutions.length, "characters");
      const session = await storage.createQuestionSession({
        originalText: questions,
        extractedText: questions,
        solutions
      });
      res.json({
        solutions,
        sessionId: session.id,
        modelUsed: "gemini-1.5-flash"
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Solution generation error:", error);
      res.status(500).json({ error: `Failed to generate solutions: ${error instanceof Error ? error.message : "Unknown error"}` });
    }
  });
  app2.get("/api/sessions/:id", async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
var geminiApiKey = process.env.GEMINI_API_KEY;
console.log("GEMINI_API_KEY:", geminiApiKey);
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}`);
  });
})();
