import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";

// 트라우마 수치에 따른 정신 상태 계산
function calculateMentalState(traumaLevel: number): string {
  if (traumaLevel < 25) return "normal";
  if (traumaLevel < 50) return "anxious";
  if (traumaLevel < 75) return "critical";
  return "collapse";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================
  // R.E.S.E.T 시스템 프로시저
  // ============================================

  player: router({
    /**
     * 현재 사용자의 플레이어 프로필 조회
     */
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const player = await db.getPlayerByUserId(ctx.user.id);
      if (!player) return null;

      const stats = await db.getPlayerStats(player.id);
      return { ...player, stats };
    }),

    /**
     * 플레이어 프로필 생성 (회원가입 시)
     */
    createProfile: protectedProcedure
      .input(
        z.object({
          studentId: z.string().min(1),
          photoUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 기존 프로필 확인
        const existing = await db.getPlayerByUserId(ctx.user.id);
        if (existing) {
          throw new Error("Player profile already exists");
        }

        // 플레이어 프로필 생성
        await db.createPlayer({
          userId: ctx.user.id,
          studentId: input.studentId,
          photoUrl: input.photoUrl,
        });

        // 플레이어 통계 초기화
        const player = await db.getPlayerByUserId(ctx.user.id);
        if (player) {
          await db.createPlayerStats(player.id);
        }

        return { success: true };
      }),

    /**
     * 플레이어 통계 조회
     */
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const player = await db.getPlayerByUserId(ctx.user.id);
      if (!player) return null;

      return await db.getPlayerStats(player.id);
    }),

    /**
     * 모든 플레이어 조회 (관계도용)
     */
    getAllPlayers: publicProcedure.query(async () => {
      const allPlayers = await db.getAllPlayers();
      const allStats = await db.getAllPlayerStats();

      return allPlayers.map(player => {
        const stats = allStats.find(s => s.playerId === player.id);
        return { ...player, stats };
      });
    }),
  }),

  stats: router({
    /**
     * 트라우마 수치 업데이트
     */
    updateTrauma: protectedProcedure
      .input(z.object({ delta: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const player = await db.getPlayerByUserId(ctx.user.id);
        if (!player) throw new Error("Player not found");

        const stats = await db.getPlayerStats(player.id);
        if (!stats) throw new Error("Player stats not found");

        const newTraumaLevel = Math.max(0, Math.min(100, stats.traumaLevel + input.delta));
        const newMentalState = calculateMentalState(newTraumaLevel);

        await db.updatePlayerStats(player.id, {
          traumaLevel: newTraumaLevel,
          mentalState: newMentalState,
        });

        // 이벤트 로그 기록
        await db.createEvent({
          playerId: player.id,
          eventType: "trauma_change",
          description: `트라우마 수치 변화: ${stats.traumaLevel} → ${newTraumaLevel}`,
          metadata: JSON.stringify({ delta: input.delta, newLevel: newTraumaLevel }),
        });

        return { newTraumaLevel, newMentalState };
      }),

    /**
     * 감정 수치 업데이트 (신뢰/혐오/집착/연민)
     */
    updateEmotion: protectedProcedure
      .input(
        z.object({
          toPlayerId: z.number(),
          emotionType: z.enum(["trust", "hatred", "obsession", "compassion"]),
          delta: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const player = await db.getPlayerByUserId(ctx.user.id);
        if (!player) throw new Error("Player not found");

        const stats = await db.getPlayerStats(player.id);
        if (!stats) throw new Error("Player stats not found");

        let currentScore = 0;
        let newScore = 0;

        switch (input.emotionType) {
          case "trust":
            currentScore = stats.trustScore;
            newScore = Math.max(0, Math.min(100, currentScore + input.delta));
            await db.updatePlayerStats(player.id, { trustScore: newScore });
            break;
          case "hatred":
            currentScore = stats.hatredScore;
            newScore = Math.max(0, Math.min(100, currentScore + input.delta));
            await db.updatePlayerStats(player.id, { hatredScore: newScore });
            break;
          case "obsession":
            currentScore = stats.obsessionScore;
            newScore = Math.max(0, Math.min(100, currentScore + input.delta));
            await db.updatePlayerStats(player.id, { obsessionScore: newScore });
            break;
          case "compassion":
            currentScore = stats.compassionScore;
            newScore = Math.max(0, Math.min(100, currentScore + input.delta));
            await db.updatePlayerStats(player.id, { compassionScore: newScore });
            break;
        }

        // 감정 관계 기록
        await db.createEmotion({
          fromPlayerId: player.id,
          toPlayerId: input.toPlayerId,
          emotionType: input.emotionType,
          intensity: newScore - currentScore,
          reason: `감정 수치 변화`,
        });

        return { emotionType: input.emotionType, newScore };
      }),
  }),

  loop: router({
    /**
     * 루프 상태 조회
     */
    getState: publicProcedure.query(async () => {
      return await db.getLoopState();
    }),

    /**
     * 루프 카운트 증가 (GM 전용)
     */
    incrementLoop: protectedProcedure
      .input(z.object({ adminKey: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // 간단한 GM 인증 (실제로는 더 강력한 인증 필요)
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        const currentLoop = await db.getLoopState();
        const newLoopCount = (currentLoop?.loopCount ?? 0) + 1;
        const newDistortionLevel = Math.min(100, newLoopCount * 10);

        await db.updateLoopState({
          loopCount: newLoopCount,
          distortionLevel: newDistortionLevel,
        });

        return { loopCount: newLoopCount, distortionLevel: newDistortionLevel };
      }),
  }),

  memory: router({
    /**
     * 플레이어의 기억 조각 조회
     */
    getMemories: protectedProcedure.query(async ({ ctx }) => {
      const player = await db.getPlayerByUserId(ctx.user.id);
      if (!player) return [];

      return await db.getPlayerMemories(player.id);
    }),

    /**
     * 기억 조각 추가 (GM 또는 시스템)
     */
    addMemory: protectedProcedure
      .input(
        z.object({
          playerId: z.number(),
          content: z.string(),
          isTrue: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 권한 확인: 본인이거나 GM
        const player = await db.getPlayerByUserId(ctx.user.id);
        if (player?.id !== input.playerId && ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        const loopState = await db.getLoopState();
        await db.createMemory({
          playerId: input.playerId,
          content: input.content,
          isTrue: input.isTrue,
          loopCount: loopState?.loopCount ?? 0,
        });

        return { success: true };
      }),

    deleteMemory: protectedProcedure
      .input(z.object({ memoryId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const player = await db.getPlayerByUserId(ctx.user.id);
        if (!player) throw new Error("Player not found");
        await db.deleteMemory(input.memoryId);
        return { success: true };
      }),

    manipulateMemory: protectedProcedure
      .input(z.object({ memoryId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const player = await db.getPlayerByUserId(ctx.user.id);
        if (!player) throw new Error("Player not found");
        await db.manipulateMemory(input.memoryId);
        return { success: true };
      }),
  }),

  notification: router({
    /**
     * 미읽 알림 조회
     */
    getUnread: protectedProcedure.query(async ({ ctx }) => {
      const player = await db.getPlayerByUserId(ctx.user.id);
      if (!player) return [];

      return await db.getUnreadNotifications(player.id);
    }),

    /**
     * 알림 발송 (시스템)
     */
    send: protectedProcedure
      .input(
        z.object({
          playerId: z.number(),
          title: z.string(),
          content: z.string(),
          notificationType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // GM만 알림 발송 가능
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        await db.createNotification({
          playerId: input.playerId,
          title: input.title,
          content: input.content,
          notificationType: input.notificationType,
          isRead: false,
        });

        return { success: true };
      }),
  }),

  personalized: router({
    /**
     * 개인화 콘텐츠 조회 (플레이어 본인만)
     */
    getContent: protectedProcedure.query(async ({ ctx }) => {
      const player = await db.getPlayerByUserId(ctx.user.id);
      if (!player) return [];

      return await db.getPlayerPersonalizedContent(player.id);
    }),

    /**
     * LLM 기반 개인화 메시지 생성
     */
    generateMessage: protectedProcedure.mutation(async ({ ctx }) => {
      const player = await db.getPlayerByUserId(ctx.user.id);
      if (!player) throw new Error("Player not found");

      const stats = await db.getPlayerStats(player.id);
      if (!stats) throw new Error("Player stats not found");

      const loopState = await db.getLoopState();

      // LLM 프롬프트 구성
      const prompt = `
당신은 명원고등학교 2학년 2반의 심리 상담사입니다.
플레이어의 현재 정신 상태를 바탕으로 개인화된 심리 조작 메시지를 생성하세요.

플레이어 정보:
- 트라우마 레벨: ${stats.traumaLevel}/100
- 정신 상태: ${stats.mentalState}
- 신뢰: ${stats.trustScore}/100
- 혐오: ${stats.hatredScore}/100
- 집착: ${stats.obsessionScore}/100
- 연민: ${stats.compassionScore}/100
- 루프 회차: ${loopState?.loopCount ?? 0}

플레이어의 심리 상태에 맞는 기괴하고 불안감을 주는 메시지를 생성하세요.
메시지는 한국어로, 2-3문장 정도로 작성하세요.
`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "당신은 심리 공포 TRPG의 시나리오 작가입니다.",
          },
          { role: "user", content: prompt },
        ],
      });

      const messageContent = response.choices[0]?.message.content;
      const generatedContent = typeof messageContent === "string"
        ? messageContent
        : "알 수 없는 속삭임...";

      // 개인화 콘텐츠 저장
      await db.createPersonalizedContent({
        playerId: player.id,
        contentType: "psychological_message",
        content: generatedContent,
        traumaLevelAtGeneration: stats.traumaLevel,
        loopCountAtGeneration: loopState?.loopCount ?? 0,
        isViewed: false,
      });

      return { content: String(generatedContent) };
    }),
  }),

  // ============================================
  // 공지사항 (notices — 인메모리, DB 미연결 시 대체)
  // ============================================
  notice: router({
    getAll: publicProcedure.query(async () => {
      // DB 없을 때 fallback 데이터 반환
      return [
        { id: 1, title: "5월 가정통신문 배부 안내", content: "이번 주 금요일까지 가정 확인 서명 제출 바랍니다.", date: "2025-04-28", author: "담임" },
        { id: 2, title: "도서관 정기 휴관 안내", content: "5월 1일 오전 중 도서관 이용이 불가합니다.", date: "2025-04-27", author: "도서부" },
        { id: 3, title: "학생 건강 상담 프로그램 신청 안내", content: "건강 상담을 원하는 학생은 보건실로 문의하세요.", date: "2025-04-25", author: "보건실" },
        { id: 4, title: "체육대회 반별 종목 선수 신청", content: "계주·줄다리기·단체 줄넘기 참가 희망자를 모집합니다.", date: "2025-04-22", author: "담임" },
      ];
    }),

    create: protectedProcedure
      .input(z.object({ title: z.string(), content: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new Error("Unauthorized");
        return { success: true, message: "공지가 등록되었습니다." };
      }),
  }),

  // ============================================
  // 익명 제보 시스템
  // ============================================
  report: router({
    submit: protectedProcedure
      .input(z.object({
        targetStudentId: z.string().optional(),
        content: z.string().min(5),
        category: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const player = await db.getPlayerByUserId(ctx.user.id);
        if (!player) throw new Error("Player not found");

        // 제보는 GM에게 알림으로 전달 (playerId 1 = 첫 번째 플레이어/admin 대체)
        // 실제 운영 시 admin player id로 교체
        await db.createEvent({
          playerId: player.id,
          eventType: "anonymous_report",
          description: `[익명제보][${input.category}] ${input.content}${input.targetStudentId ? " / 대상: " + input.targetStudentId : ""}`,
          metadata: JSON.stringify({ category: input.category, targetId: input.targetStudentId }),
        });

        return { success: true };
      }),
  }),

  // ============================================
  // 알림 읽음 처리
  // ============================================
  notificationRead: router({
    markRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db_conn = await (await import("./db")).getDb();
        if (!db_conn) return { success: false };
        const { notifications } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db_conn.update(notifications)
          .set({ isRead: true })
          .where(eq(notifications.id, input.notificationId));
        return { success: true };
      }),
  }),

  // ============================================
  // 이벤트 히스토리 (수치 변동 타임라인)
  // ============================================
  events: router({
    getMyEvents: protectedProcedure.query(async ({ ctx }) => {
      const player = await db.getPlayerByUserId(ctx.user.id);
      if (!player) return [];
      return await db.getPlayerEvents(player.id, 30);
    }),
  }),

});

export type AppRouter = typeof appRouter;

// ============================================
// 헬퍼 함수
// ============================================


