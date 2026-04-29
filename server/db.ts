import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users } from "../drizzle/schema";
import {
  players,
  playerStats,
  emotions,
  memories,
  events,
  notifications,
  personalizedContent,
  loopState,
  type InsertPlayerStats,
  type InsertEmotion,
  type InsertMemory,
  type InsertEvent,
  type InsertNotification,
  type InsertPersonalizedContent,
  type InsertLoopState,
} from "../drizzle/schema";
let _db: PostgresJsDatabase | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { max: 1 });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: Partial<InsertUser> & { id?: number }): Promise<void> {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = (user as any)[field];
      if (value === undefined) return;
      updateSet[field] = value ?? null;
    };
    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      updateSet.role = user.role;
    }

    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    if (user.id !== undefined) {
      // Update by primary key
      await db.update(users).set(updateSet).where(eq(users.id, user.id));
    } else if (user.openId) {
      // Legacy: upsert by openId
      const values: InsertUser = { openId: user.openId };
      Object.assign(values, updateSet);
      if (!values.lastSignedIn) values.lastSignedIn = new Date();
      await db
        .insert(users)
        .values(values)
        .onConflictDoUpdate({
          target: users.openId,
          set: updateSet,
        });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(email: string, passwordHash: string, name: string | null = null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
      loginMethod: "email",
      lastSignedIn: new Date(),
    })
    .returning();
  if (!result[0]) throw new Error("Failed to create user");
  return result[0];
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPlayerByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(players).where(eq(players.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPlayerById(playerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(players).where(eq(players.id, playerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPlayer(data: { userId: number; studentId: string; photoUrl?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(players).values({ userId: data.userId, studentId: data.studentId, photoUrl: data.photoUrl });
}

export async function updatePlayerStudentCard(playerId: number, studentCardUrl: string, studentCardKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(players).set({ studentCardUrl, studentCardKey }).where(eq(players.id, playerId));
}

export async function getPlayerStats(playerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(playerStats).where(eq(playerStats.playerId, playerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPlayerStats(playerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(playerStats).values({
    playerId, traumaLevel: 0, memoryPoints: 100,
    trustScore: 50, hatredScore: 0, obsessionScore: 0, compassionScore: 50, mentalState: "normal",
  });
}

export async function updatePlayerStats(playerId: number, updates: Partial<InsertPlayerStats>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(playerStats).set(updates).where(eq(playerStats.playerId, playerId));
}

export async function getLoopState() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(loopState).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateLoopState(updates: Partial<InsertLoopState>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getLoopState();
  if (existing) {
    await db.update(loopState).set(updates).where(eq(loopState.id, existing.id));
  } else {
    await db.insert(loopState).values({ loopCount: 0, isActive: true, distortionLevel: 0, ...updates });
  }
}

export async function getAllPlayers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(players);
}

export async function getAllPlayerStats() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(playerStats);
}

export async function createEmotion(emotion: InsertEmotion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(emotions).values(emotion);
}

export async function createMemory(memory: InsertMemory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(memories).values(memory);
}

export async function getPlayerMemories(playerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(memories).where(eq(memories.playerId, playerId));
}

export async function createEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(events).values(event);
}

export async function getPlayerEvents(playerId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(events).where(eq(events.playerId, playerId)).orderBy(events.createdAt).limit(limit);
}

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(notifications).values(notification);
}

export async function getUnreadNotifications(playerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(and(eq(notifications.playerId, playerId), eq(notifications.isRead, false))).orderBy(notifications.createdAt);
}

export async function createPersonalizedContent(content: InsertPersonalizedContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(personalizedContent).values(content);
}

export async function getPlayerPersonalizedContent(playerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(personalizedContent).where(eq(personalizedContent.playerId, playerId)).orderBy(personalizedContent.createdAt);
}

export async function getMemoryById(memoryId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(memories).where(eq(memories.id, memoryId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function deleteMemory(memoryId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(memories).where(eq(memories.id, memoryId));
}

export async function manipulateMemory(memoryId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(memories).set({ isManipulated: true }).where(eq(memories.id, memoryId));
}
