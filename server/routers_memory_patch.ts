// 이 파일은 server/routers.ts의 memory 라우터 섹션에 추가할 코드입니다
// memory 라우터 섹션을 다음과 같이 수정하세요:

/*
  memory: router({
    // 기존 getMemories 프로시저
    getMemories: protectedProcedure.query(async ({ ctx }) => {
      const player = await db.getPlayerByUserId(ctx.user.id);
      if (!player) return [];
      return await db.getPlayerMemories(player.id);
    }),

    // 새로 추가: getPlayerMemories (MemoryRoom.tsx에서 사용)
    getPlayerMemories: protectedProcedure.query(async ({ ctx }) => {
      const player = await db.getPlayerByUserId(ctx.user.id);
      if (!player) return [];
      return await db.getPlayerMemories(player.id);
    }),

    // 기존 addMemory 프로시저
    addMemory: protectedProcedure
      .input(
        z.object({
          playerId: z.number(),
          content: z.string(),
          isTrue: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => {
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

    // 새로 추가: deleteMemory
    deleteMemory: protectedProcedure
      .input(z.object({ memoryId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const player = await db.getPlayerByUserId(ctx.user.id);
        if (!player) throw new Error("Player not found");

        // 기억 소유권 확인
        const memory = await db.getMemoryById(input.memoryId);
        if (!memory || memory.playerId !== player.id) {
          throw new Error("Unauthorized");
        }

        await db.deleteMemory(input.memoryId);
        return { success: true };
      }),

    // 새로 추가: manipulateMemory
    manipulateMemory: protectedProcedure
      .input(z.object({ memoryId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const player = await db.getPlayerByUserId(ctx.user.id);
        if (!player) throw new Error("Player not found");

        // 기억 소유권 확인
        const memory = await db.getMemoryById(input.memoryId);
        if (!memory || memory.playerId !== player.id) {
          throw new Error("Unauthorized");
        }

        await db.manipulateMemory(input.memoryId);
        return { success: true };
      }),
  }),
*/
