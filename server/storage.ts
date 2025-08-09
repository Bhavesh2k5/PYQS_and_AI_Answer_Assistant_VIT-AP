import { type User, type InsertUser, type QuestionSession, type InsertQuestionSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createQuestionSession(session: InsertQuestionSession): Promise<QuestionSession>;
  getQuestionSession(id: string): Promise<QuestionSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private questionSessions: Map<string, QuestionSession>;

  constructor() {
    this.users = new Map();
    this.questionSessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createQuestionSession(insertSession: InsertQuestionSession): Promise<QuestionSession> {
    const id = randomUUID();
    const session: QuestionSession = { 
      ...insertSession, 
      id,
      extractedText: insertSession.extractedText ?? null,
      solutions: insertSession.solutions ?? null,
      createdAt: new Date()
    };
    this.questionSessions.set(id, session);
    return session;
  }

  async getQuestionSession(id: string): Promise<QuestionSession | undefined> {
    return this.questionSessions.get(id);
  }
}

export const storage = new MemStorage();
