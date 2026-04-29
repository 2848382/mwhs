import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id:           serial("id").primaryKey(),
  openId:       varchar("openId", { length: 64 }),
  name:         text("name"),
  email:        varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod:  varchar("loginMethod", { length: 64 }),
  role:         roleEnum("role").default("user").notNull(),
  createdAt:    timestamp("createdAt").defaultNow().notNull(),
  updatedAt:    timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User       = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const players = pgTable("players", {
  id:             serial("id").primaryKey(),
  userId:         integer("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  studentId:      varchar("studentId", { length: 10 }).notNull().unique(),
  photoUrl:       text("photoUrl"),
  studentCardUrl: text("studentCardUrl"),
  studentCardKey: varchar("studentCardKey", { length: 255 }),
  createdAt:      timestamp("createdAt").defaultNow().notNull(),
  updatedAt:      timestamp("updatedAt").defaultNow().notNull(),
});

export type Player       = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

export const playerStats = pgTable("playerStats", {
  id:             serial("id").primaryKey(),
  playerId:       integer("playerId").notNull().unique().references(() => players.id, { onDelete: "cascade" }),
  traumaLevel:    integer("traumaLevel").default(0).notNull(),
  memoryPoints:   integer("memoryPoints").default(100).notNull(),
  trustScore:     integer("trustScore").default(50).notNull(),
  hatredScore:    integer("hatredScore").default(0).notNull(),
  obsessionScore: integer("obsessionScore").default(0).notNull(),
  compassionScore:integer("compassionScore").default(50).notNull(),
  mentalState:    varchar("mentalState", { length: 20 }).default("normal").notNull(),
  updatedAt:      timestamp("updatedAt").defaultNow().notNull(),
});

export type PlayerStats       = typeof playerStats.$inferSelect;
export type InsertPlayerStats = typeof playerStats.$inferInsert;

export const emotions = pgTable("emotions", {
  id:           serial("id").primaryKey(),
  fromPlayerId: integer("fromPlayerId").notNull().references(() => players.id, { onDelete: "cascade" }),
  toPlayerId:   integer("toPlayerId").notNull().references(() => players.id, { onDelete: "cascade" }),
  emotionType:  varchar("emotionType", { length: 20 }).notNull(),
  intensity:    integer("intensity").default(0).notNull(),
  reason:       text("reason"),
  createdAt:    timestamp("createdAt").defaultNow().notNull(),
});

export type Emotion       = typeof emotions.$inferSelect;
export type InsertEmotion = typeof emotions.$inferInsert;

export const memories = pgTable("memories", {
  id:            serial("id").primaryKey(),
  playerId:      integer("playerId").notNull().references(() => players.id, { onDelete: "cascade" }),
  title:         varchar("title", { length: 255 }).default("기억").notNull(),
  content:       text("content").notNull(),
  isTrue:        boolean("isTrue").default(true).notNull(),
  isManipulated: boolean("isManipulated").default(false).notNull(),
  credibility:   integer("credibility").default(100).notNull(),
  loopCount:     integer("loopCount").default(0).notNull(),
  discoveredAt:  timestamp("discoveredAt").defaultNow().notNull(),
});

export type Memory       = typeof memories.$inferSelect;
export type InsertMemory = typeof memories.$inferInsert;

export interface MemoryWithStats extends Memory {
  isManipulated: boolean;
  credibility: number;
}

export const events = pgTable("events", {
  id:          serial("id").primaryKey(),
  playerId:    integer("playerId").notNull().references(() => players.id, { onDelete: "cascade" }),
  eventType:   varchar("eventType", { length: 50 }).notNull(),
  description: text("description").notNull(),
  metadata:    text("metadata"),
  createdAt:   timestamp("createdAt").defaultNow().notNull(),
});

export type Event       = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export const notifications = pgTable("notifications", {
  id:               serial("id").primaryKey(),
  playerId:         integer("playerId").notNull().references(() => players.id, { onDelete: "cascade" }),
  title:            varchar("title", { length: 255 }).notNull(),
  content:          text("content").notNull(),
  notificationType: varchar("notificationType", { length: 50 }).notNull(),
  isRead:           boolean("isRead").default(false).notNull(),
  createdAt:        timestamp("createdAt").defaultNow().notNull(),
});

export type Notification       = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const personalizedContent = pgTable("personalizedContent", {
  id:                       serial("id").primaryKey(),
  playerId:                 integer("playerId").notNull().references(() => players.id, { onDelete: "cascade" }),
  contentType:              varchar("contentType", { length: 50 }).notNull(),
  content:                  text("content").notNull(),
  traumaLevelAtGeneration:  integer("traumaLevelAtGeneration").notNull(),
  loopCountAtGeneration:    integer("loopCountAtGeneration").notNull(),
  isViewed:                 boolean("isViewed").default(false).notNull(),
  createdAt:                timestamp("createdAt").defaultNow().notNull(),
});

export type PersonalizedContent       = typeof personalizedContent.$inferSelect;
export type InsertPersonalizedContent = typeof personalizedContent.$inferInsert;

export const loopState = pgTable("loopState", {
  id:             serial("id").primaryKey(),
  loopCount:      integer("loopCount").default(0).notNull(),
  isActive:       boolean("isActive").default(true).notNull(),
  distortionLevel:integer("distortionLevel").default(0).notNull(),
  updatedAt:      timestamp("updatedAt").defaultNow().notNull(),
});

export type LoopState       = typeof loopState.$inferSelect;
export type InsertLoopState = typeof loopState.$inferInsert;
