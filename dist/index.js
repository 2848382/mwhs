var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  emotions: () => emotions,
  events: () => events,
  loopState: () => loopState,
  memories: () => memories,
  notifications: () => notifications,
  personalizedContent: () => personalizedContent,
  playerStats: () => playerStats,
  players: () => players,
  roleEnum: () => roleEnum,
  users: () => users
});
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean
} from "drizzle-orm/pg-core";
var roleEnum, users, players, playerStats, emotions, memories, events, notifications, personalizedContent, loopState;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    roleEnum = pgEnum("role", ["user", "admin"]);
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: roleEnum("role").default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    players = pgTable("players", {
      id: serial("id").primaryKey(),
      userId: integer("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
      studentId: varchar("studentId", { length: 10 }).notNull().unique(),
      photoUrl: text("photoUrl"),
      studentCardUrl: text("studentCardUrl"),
      studentCardKey: varchar("studentCardKey", { length: 255 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    playerStats = pgTable("playerStats", {
      id: serial("id").primaryKey(),
      playerId: integer("playerId").notNull().unique().references(() => players.id, { onDelete: "cascade" }),
      traumaLevel: integer("traumaLevel").default(0).notNull(),
      memoryPoints: integer("memoryPoints").default(100).notNull(),
      trustScore: integer("trustScore").default(50).notNull(),
      hatredScore: integer("hatredScore").default(0).notNull(),
      obsessionScore: integer("obsessionScore").default(0).notNull(),
      compassionScore: integer("compassionScore").default(50).notNull(),
      mentalState: varchar("mentalState", { length: 20 }).default("normal").notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    emotions = pgTable("emotions", {
      id: serial("id").primaryKey(),
      fromPlayerId: integer("fromPlayerId").notNull().references(() => players.id, { onDelete: "cascade" }),
      toPlayerId: integer("toPlayerId").notNull().references(() => players.id, { onDelete: "cascade" }),
      emotionType: varchar("emotionType", { length: 20 }).notNull(),
      intensity: integer("intensity").default(0).notNull(),
      reason: text("reason"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    memories = pgTable("memories", {
      id: serial("id").primaryKey(),
      playerId: integer("playerId").notNull().references(() => players.id, { onDelete: "cascade" }),
      title: varchar("title", { length: 255 }).default("\uAE30\uC5B5").notNull(),
      content: text("content").notNull(),
      isTrue: boolean("isTrue").default(true).notNull(),
      isManipulated: boolean("isManipulated").default(false).notNull(),
      credibility: integer("credibility").default(100).notNull(),
      loopCount: integer("loopCount").default(0).notNull(),
      discoveredAt: timestamp("discoveredAt").defaultNow().notNull()
    });
    events = pgTable("events", {
      id: serial("id").primaryKey(),
      playerId: integer("playerId").notNull().references(() => players.id, { onDelete: "cascade" }),
      eventType: varchar("eventType", { length: 50 }).notNull(),
      description: text("description").notNull(),
      metadata: text("metadata"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      playerId: integer("playerId").notNull().references(() => players.id, { onDelete: "cascade" }),
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content").notNull(),
      notificationType: varchar("notificationType", { length: 50 }).notNull(),
      isRead: boolean("isRead").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    personalizedContent = pgTable("personalizedContent", {
      id: serial("id").primaryKey(),
      playerId: integer("playerId").notNull().references(() => players.id, { onDelete: "cascade" }),
      contentType: varchar("contentType", { length: 50 }).notNull(),
      content: text("content").notNull(),
      traumaLevelAtGeneration: integer("traumaLevelAtGeneration").notNull(),
      loopCountAtGeneration: integer("loopCountAtGeneration").notNull(),
      isViewed: boolean("isViewed").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    loopState = pgTable("loopState", {
      id: serial("id").primaryKey(),
      loopCount: integer("loopCount").default(0).notNull(),
      isActive: boolean("isActive").default(true).notNull(),
      distortionLevel: integer("distortionLevel").default(0).notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  createEmotion: () => createEmotion,
  createEvent: () => createEvent,
  createMemory: () => createMemory,
  createNotification: () => createNotification,
  createPersonalizedContent: () => createPersonalizedContent,
  createPlayer: () => createPlayer,
  createPlayerStats: () => createPlayerStats,
  deleteMemory: () => deleteMemory,
  getAllPlayerStats: () => getAllPlayerStats,
  getAllPlayers: () => getAllPlayers,
  getDb: () => getDb,
  getLoopState: () => getLoopState,
  getMemoryById: () => getMemoryById,
  getPlayerById: () => getPlayerById,
  getPlayerByUserId: () => getPlayerByUserId,
  getPlayerEvents: () => getPlayerEvents,
  getPlayerMemories: () => getPlayerMemories,
  getPlayerPersonalizedContent: () => getPlayerPersonalizedContent,
  getPlayerStats: () => getPlayerStats,
  getUnreadNotifications: () => getUnreadNotifications,
  getUserByOpenId: () => getUserByOpenId,
  manipulateMemory: () => manipulateMemory,
  updateLoopState: () => updateLoopState,
  updatePlayerStats: () => updatePlayerStats,
  updatePlayerStudentCard: () => updatePlayerStudentCard,
  upsertUser: () => upsertUser
});
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = { openId: user.openId };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = /* @__PURE__ */ new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getPlayerByUserId(userId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(players).where(eq(players.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getPlayerById(playerId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(players).where(eq(players.id, playerId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createPlayer(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(players).values({ userId: data.userId, studentId: data.studentId, photoUrl: data.photoUrl });
}
async function updatePlayerStudentCard(playerId, studentCardUrl, studentCardKey) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(players).set({ studentCardUrl, studentCardKey }).where(eq(players.id, playerId));
}
async function getPlayerStats(playerId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(playerStats).where(eq(playerStats.playerId, playerId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createPlayerStats(playerId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(playerStats).values({
    playerId,
    traumaLevel: 0,
    memoryPoints: 100,
    trustScore: 50,
    hatredScore: 0,
    obsessionScore: 0,
    compassionScore: 50,
    mentalState: "normal"
  });
}
async function updatePlayerStats(playerId, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(playerStats).set(updates).where(eq(playerStats.playerId, playerId));
}
async function getLoopState() {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(loopState).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateLoopState(updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getLoopState();
  if (existing) {
    await db.update(loopState).set(updates).where(eq(loopState.id, existing.id));
  } else {
    await db.insert(loopState).values({ loopCount: 0, isActive: true, distortionLevel: 0, ...updates });
  }
}
async function getAllPlayers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(players);
}
async function getAllPlayerStats() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(playerStats);
}
async function createEmotion(emotion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(emotions).values(emotion);
}
async function createMemory(memory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(memories).values(memory);
}
async function getPlayerMemories(playerId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(memories).where(eq(memories.playerId, playerId));
}
async function createEvent(event) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(events).values(event);
}
async function getPlayerEvents(playerId, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(events).where(eq(events.playerId, playerId)).orderBy(events.createdAt).limit(limit);
}
async function createNotification(notification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(notifications).values(notification);
}
async function getUnreadNotifications(playerId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(and(eq(notifications.playerId, playerId), eq(notifications.isRead, false))).orderBy(notifications.createdAt);
}
async function createPersonalizedContent(content) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(personalizedContent).values(content);
}
async function getPlayerPersonalizedContent(playerId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(personalizedContent).where(eq(personalizedContent.playerId, playerId)).orderBy(personalizedContent.createdAt);
}
async function getMemoryById(memoryId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(memories).where(eq(memories.id, memoryId)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function deleteMemory(memoryId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(memories).where(eq(memories.id, memoryId));
}
async function manipulateMemory(memoryId) {
  const db = await getDb();
  if (!db) return;
  await db.update(memories).set({ isManipulated: true }).where(eq(memories.id, memoryId));
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_schema();
    init_env();
    _db = null;
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
init_env();
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
init_db();
import { z as z2 } from "zod";

// server/_core/llm.ts
init_env();
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/routers.ts
function calculateMentalState(traumaLevel) {
  if (traumaLevel < 25) return "normal";
  if (traumaLevel < 50) return "anxious";
  if (traumaLevel < 75) return "critical";
  return "collapse";
}
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // ============================================
  // R.E.S.E.T 시스템 프로시저
  // ============================================
  player: router({
    /**
     * 현재 사용자의 플레이어 프로필 조회
     */
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const player = await getPlayerByUserId(ctx.user.id);
      if (!player) return null;
      const stats = await getPlayerStats(player.id);
      return { ...player, stats };
    }),
    /**
     * 플레이어 프로필 생성 (회원가입 시)
     */
    createProfile: protectedProcedure.input(
      z2.object({
        studentId: z2.string().min(1),
        photoUrl: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const existing = await getPlayerByUserId(ctx.user.id);
      if (existing) {
        throw new Error("Player profile already exists");
      }
      await createPlayer({
        userId: ctx.user.id,
        studentId: input.studentId,
        photoUrl: input.photoUrl
      });
      const player = await getPlayerByUserId(ctx.user.id);
      if (player) {
        await createPlayerStats(player.id);
      }
      return { success: true };
    }),
    /**
     * 플레이어 통계 조회
     */
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const player = await getPlayerByUserId(ctx.user.id);
      if (!player) return null;
      return await getPlayerStats(player.id);
    }),
    /**
     * 모든 플레이어 조회 (관계도용)
     */
    getAllPlayers: publicProcedure.query(async () => {
      const allPlayers = await getAllPlayers();
      const allStats = await getAllPlayerStats();
      return allPlayers.map((player) => {
        const stats = allStats.find((s) => s.playerId === player.id);
        return { ...player, stats };
      });
    })
  }),
  stats: router({
    /**
     * 트라우마 수치 업데이트
     */
    updateTrauma: protectedProcedure.input(z2.object({ delta: z2.number() })).mutation(async ({ ctx, input }) => {
      const player = await getPlayerByUserId(ctx.user.id);
      if (!player) throw new Error("Player not found");
      const stats = await getPlayerStats(player.id);
      if (!stats) throw new Error("Player stats not found");
      const newTraumaLevel = Math.max(0, Math.min(100, stats.traumaLevel + input.delta));
      const newMentalState = calculateMentalState(newTraumaLevel);
      await updatePlayerStats(player.id, {
        traumaLevel: newTraumaLevel,
        mentalState: newMentalState
      });
      await createEvent({
        playerId: player.id,
        eventType: "trauma_change",
        description: `\uD2B8\uB77C\uC6B0\uB9C8 \uC218\uCE58 \uBCC0\uD654: ${stats.traumaLevel} \u2192 ${newTraumaLevel}`,
        metadata: JSON.stringify({ delta: input.delta, newLevel: newTraumaLevel })
      });
      return { newTraumaLevel, newMentalState };
    }),
    /**
     * 감정 수치 업데이트 (신뢰/혐오/집착/연민)
     */
    updateEmotion: protectedProcedure.input(
      z2.object({
        toPlayerId: z2.number(),
        emotionType: z2.enum(["trust", "hatred", "obsession", "compassion"]),
        delta: z2.number()
      })
    ).mutation(async ({ ctx, input }) => {
      const player = await getPlayerByUserId(ctx.user.id);
      if (!player) throw new Error("Player not found");
      const stats = await getPlayerStats(player.id);
      if (!stats) throw new Error("Player stats not found");
      let currentScore = 0;
      let newScore = 0;
      switch (input.emotionType) {
        case "trust":
          currentScore = stats.trustScore;
          newScore = Math.max(0, Math.min(100, currentScore + input.delta));
          await updatePlayerStats(player.id, { trustScore: newScore });
          break;
        case "hatred":
          currentScore = stats.hatredScore;
          newScore = Math.max(0, Math.min(100, currentScore + input.delta));
          await updatePlayerStats(player.id, { hatredScore: newScore });
          break;
        case "obsession":
          currentScore = stats.obsessionScore;
          newScore = Math.max(0, Math.min(100, currentScore + input.delta));
          await updatePlayerStats(player.id, { obsessionScore: newScore });
          break;
        case "compassion":
          currentScore = stats.compassionScore;
          newScore = Math.max(0, Math.min(100, currentScore + input.delta));
          await updatePlayerStats(player.id, { compassionScore: newScore });
          break;
      }
      await createEmotion({
        fromPlayerId: player.id,
        toPlayerId: input.toPlayerId,
        emotionType: input.emotionType,
        intensity: newScore - currentScore,
        reason: `\uAC10\uC815 \uC218\uCE58 \uBCC0\uD654`
      });
      return { emotionType: input.emotionType, newScore };
    })
  }),
  loop: router({
    /**
     * 루프 상태 조회
     */
    getState: publicProcedure.query(async () => {
      return await getLoopState();
    }),
    /**
     * 루프 카운트 증가 (GM 전용)
     */
    incrementLoop: protectedProcedure.input(z2.object({ adminKey: z2.string() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const currentLoop = await getLoopState();
      const newLoopCount = (currentLoop?.loopCount ?? 0) + 1;
      const newDistortionLevel = Math.min(100, newLoopCount * 10);
      await updateLoopState({
        loopCount: newLoopCount,
        distortionLevel: newDistortionLevel
      });
      return { loopCount: newLoopCount, distortionLevel: newDistortionLevel };
    })
  }),
  memory: router({
    /**
     * 플레이어의 기억 조각 조회
     */
    getMemories: protectedProcedure.query(async ({ ctx }) => {
      const player = await getPlayerByUserId(ctx.user.id);
      if (!player) return [];
      return await getPlayerMemories(player.id);
    }),
    /**
     * 기억 조각 추가 (GM 또는 시스템)
     */
    addMemory: protectedProcedure.input(
      z2.object({
        playerId: z2.number(),
        content: z2.string(),
        isTrue: z2.boolean()
      })
    ).mutation(async ({ ctx, input }) => {
      const player = await getPlayerByUserId(ctx.user.id);
      if (player?.id !== input.playerId && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const loopState2 = await getLoopState();
      await createMemory({
        playerId: input.playerId,
        content: input.content,
        isTrue: input.isTrue,
        loopCount: loopState2?.loopCount ?? 0
      });
      return { success: true };
    }),
    deleteMemory: protectedProcedure.input(z2.object({ memoryId: z2.number() })).mutation(async ({ ctx, input }) => {
      const player = await getPlayerByUserId(ctx.user.id);
      if (!player) throw new Error("Player not found");
      await deleteMemory(input.memoryId);
      return { success: true };
    }),
    manipulateMemory: protectedProcedure.input(z2.object({ memoryId: z2.number() })).mutation(async ({ ctx, input }) => {
      const player = await getPlayerByUserId(ctx.user.id);
      if (!player) throw new Error("Player not found");
      await manipulateMemory(input.memoryId);
      return { success: true };
    })
  }),
  notification: router({
    /**
     * 미읽 알림 조회
     */
    getUnread: protectedProcedure.query(async ({ ctx }) => {
      const player = await getPlayerByUserId(ctx.user.id);
      if (!player) return [];
      return await getUnreadNotifications(player.id);
    }),
    /**
     * 알림 발송 (시스템)
     */
    send: protectedProcedure.input(
      z2.object({
        playerId: z2.number(),
        title: z2.string(),
        content: z2.string(),
        notificationType: z2.string()
      })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      await createNotification({
        playerId: input.playerId,
        title: input.title,
        content: input.content,
        notificationType: input.notificationType,
        isRead: false
      });
      return { success: true };
    })
  }),
  personalized: router({
    /**
     * 개인화 콘텐츠 조회 (플레이어 본인만)
     */
    getContent: protectedProcedure.query(async ({ ctx }) => {
      const player = await getPlayerByUserId(ctx.user.id);
      if (!player) return [];
      return await getPlayerPersonalizedContent(player.id);
    }),
    /**
     * LLM 기반 개인화 메시지 생성
     */
    generateMessage: protectedProcedure.mutation(async ({ ctx }) => {
      const player = await getPlayerByUserId(ctx.user.id);
      if (!player) throw new Error("Player not found");
      const stats = await getPlayerStats(player.id);
      if (!stats) throw new Error("Player stats not found");
      const loopState2 = await getLoopState();
      const prompt = `
\uB2F9\uC2E0\uC740 \uBA85\uC6D0\uACE0\uB4F1\uD559\uAD50 2\uD559\uB144 2\uBC18\uC758 \uC2EC\uB9AC \uC0C1\uB2F4\uC0AC\uC785\uB2C8\uB2E4.
\uD50C\uB808\uC774\uC5B4\uC758 \uD604\uC7AC \uC815\uC2E0 \uC0C1\uD0DC\uB97C \uBC14\uD0D5\uC73C\uB85C \uAC1C\uC778\uD654\uB41C \uC2EC\uB9AC \uC870\uC791 \uBA54\uC2DC\uC9C0\uB97C \uC0DD\uC131\uD558\uC138\uC694.

\uD50C\uB808\uC774\uC5B4 \uC815\uBCF4:
- \uD2B8\uB77C\uC6B0\uB9C8 \uB808\uBCA8: ${stats.traumaLevel}/100
- \uC815\uC2E0 \uC0C1\uD0DC: ${stats.mentalState}
- \uC2E0\uB8B0: ${stats.trustScore}/100
- \uD610\uC624: ${stats.hatredScore}/100
- \uC9D1\uCC29: ${stats.obsessionScore}/100
- \uC5F0\uBBFC: ${stats.compassionScore}/100
- \uB8E8\uD504 \uD68C\uCC28: ${loopState2?.loopCount ?? 0}

\uD50C\uB808\uC774\uC5B4\uC758 \uC2EC\uB9AC \uC0C1\uD0DC\uC5D0 \uB9DE\uB294 \uAE30\uAD34\uD558\uACE0 \uBD88\uC548\uAC10\uC744 \uC8FC\uB294 \uBA54\uC2DC\uC9C0\uB97C \uC0DD\uC131\uD558\uC138\uC694.
\uBA54\uC2DC\uC9C0\uB294 \uD55C\uAD6D\uC5B4\uB85C, 2-3\uBB38\uC7A5 \uC815\uB3C4\uB85C \uC791\uC131\uD558\uC138\uC694.
`;
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "\uB2F9\uC2E0\uC740 \uC2EC\uB9AC \uACF5\uD3EC TRPG\uC758 \uC2DC\uB098\uB9AC\uC624 \uC791\uAC00\uC785\uB2C8\uB2E4."
          },
          { role: "user", content: prompt }
        ]
      });
      const messageContent = response.choices[0]?.message.content;
      const generatedContent = typeof messageContent === "string" ? messageContent : "\uC54C \uC218 \uC5C6\uB294 \uC18D\uC0AD\uC784...";
      await createPersonalizedContent({
        playerId: player.id,
        contentType: "psychological_message",
        content: generatedContent,
        traumaLevelAtGeneration: stats.traumaLevel,
        loopCountAtGeneration: loopState2?.loopCount ?? 0,
        isViewed: false
      });
      return { content: String(generatedContent) };
    })
  }),
  // ============================================
  // 공지사항 (notices — 인메모리, DB 미연결 시 대체)
  // ============================================
  notice: router({
    getAll: publicProcedure.query(async () => {
      return [
        { id: 1, title: "5\uC6D4 \uAC00\uC815\uD1B5\uC2E0\uBB38 \uBC30\uBD80 \uC548\uB0B4", content: "\uC774\uBC88 \uC8FC \uAE08\uC694\uC77C\uAE4C\uC9C0 \uAC00\uC815 \uD655\uC778 \uC11C\uBA85 \uC81C\uCD9C \uBC14\uB78D\uB2C8\uB2E4.", date: "2025-04-28", author: "\uB2F4\uC784" },
        { id: 2, title: "\uB3C4\uC11C\uAD00 \uC815\uAE30 \uD734\uAD00 \uC548\uB0B4", content: "5\uC6D4 1\uC77C \uC624\uC804 \uC911 \uB3C4\uC11C\uAD00 \uC774\uC6A9\uC774 \uBD88\uAC00\uD569\uB2C8\uB2E4.", date: "2025-04-27", author: "\uB3C4\uC11C\uBD80" },
        { id: 3, title: "\uD559\uC0DD \uAC74\uAC15 \uC0C1\uB2F4 \uD504\uB85C\uADF8\uB7A8 \uC2E0\uCCAD \uC548\uB0B4", content: "\uAC74\uAC15 \uC0C1\uB2F4\uC744 \uC6D0\uD558\uB294 \uD559\uC0DD\uC740 \uBCF4\uAC74\uC2E4\uB85C \uBB38\uC758\uD558\uC138\uC694.", date: "2025-04-25", author: "\uBCF4\uAC74\uC2E4" },
        { id: 4, title: "\uCCB4\uC721\uB300\uD68C \uBC18\uBCC4 \uC885\uBAA9 \uC120\uC218 \uC2E0\uCCAD", content: "\uACC4\uC8FC\xB7\uC904\uB2E4\uB9AC\uAE30\xB7\uB2E8\uCCB4 \uC904\uB118\uAE30 \uCC38\uAC00 \uD76C\uB9DD\uC790\uB97C \uBAA8\uC9D1\uD569\uB2C8\uB2E4.", date: "2025-04-22", author: "\uB2F4\uC784" }
      ];
    }),
    create: protectedProcedure.input(z2.object({ title: z2.string(), content: z2.string() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Unauthorized");
      return { success: true, message: "\uACF5\uC9C0\uAC00 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4." };
    })
  }),
  // ============================================
  // 익명 제보 시스템
  // ============================================
  report: router({
    submit: protectedProcedure.input(z2.object({
      targetStudentId: z2.string().optional(),
      content: z2.string().min(5),
      category: z2.string()
    })).mutation(async ({ ctx, input }) => {
      const player = await getPlayerByUserId(ctx.user.id);
      if (!player) throw new Error("Player not found");
      await createEvent({
        playerId: player.id,
        eventType: "anonymous_report",
        description: `[\uC775\uBA85\uC81C\uBCF4][${input.category}] ${input.content}${input.targetStudentId ? " / \uB300\uC0C1: " + input.targetStudentId : ""}`,
        metadata: JSON.stringify({ category: input.category, targetId: input.targetStudentId })
      });
      return { success: true };
    })
  }),
  // ============================================
  // 알림 읽음 처리
  // ============================================
  notificationRead: router({
    markRead: protectedProcedure.input(z2.object({ notificationId: z2.number() })).mutation(async ({ ctx, input }) => {
      const db_conn = await (await Promise.resolve().then(() => (init_db(), db_exports))).getDb();
      if (!db_conn) return { success: false };
      const { notifications: notifications2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq2 } = await import("drizzle-orm");
      await db_conn.update(notifications2).set({ isRead: true }).where(eq2(notifications2.id, input.notificationId));
      return { success: true };
    })
  }),
  // ============================================
  // 이벤트 히스토리 (수치 변동 타임라인)
  // ============================================
  events: router({
    getMyEvents: protectedProcedure.query(async ({ ctx }) => {
      const player = await getPlayerByUserId(ctx.user.id);
      if (!player) return [];
      return await getPlayerEvents(player.id, 30);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
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
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
