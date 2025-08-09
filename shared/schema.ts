import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const questionSessions = pgTable("question_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalText: text("original_text").notNull(),
  extractedText: text("extracted_text"),
  solutions: text("solutions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuestionSessionSchema = createInsertSchema(questionSessions).pick({
  originalText: true,
  extractedText: true,
  solutions: true,
});

export const ocrRequestSchema = z.object({
  imageData: z.string(),
});

export const solutionRequestSchema = z.object({
  questions: z.string().min(1, "Questions text is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type QuestionSession = typeof questionSessions.$inferSelect;
export type InsertQuestionSession = z.infer<typeof insertQuestionSessionSchema>;
export type OCRRequest = z.infer<typeof ocrRequestSchema>;
export type SolutionRequest = z.infer<typeof solutionRequestSchema>;
