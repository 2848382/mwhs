import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { hashPassword, verifyPassword } from "./password";

export function registerOAuthRoutes(app: Express) {
  // POST /api/auth/signup — 이메일/비밀번호 회원가입
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    const { email, password, name } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "invalid input" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "password must be at least 6 characters" });
      return;
    }

    try {
      const existing = await db.getUserByEmail(email);
      if (existing) {
        res.status(409).json({ error: "이미 사용 중인 이메일입니다" });
        return;
      }

      const passwordHash = await hashPassword(password);
      const user = await db.createUser(email, passwordHash, typeof name === "string" ? name : null);

      const sessionToken = await sdk.createSessionToken(String(user.id), {
        name: user.name || email,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.status(201).json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      console.error("[Auth] Signup failed", error);
      res.status(500).json({ error: "회원가입에 실패했습니다" });
    }
  });

  // POST /api/auth/login — 이메일/비밀번호 로그인
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "invalid input" });
      return;
    }

    try {
      const user = await db.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다" });
        return;
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다" });
        return;
      }

      // 마지막 로그인 시간 업데이트
      await db.upsertUser({ id: user.id, lastSignedIn: new Date() });

      const sessionToken = await sdk.createSessionToken(String(user.id), {
        name: user.name || email,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "로그인에 실패했습니다" });
    }
  });

  // POST /api/auth/logout — 로그아웃
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
}
