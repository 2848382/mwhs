import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, Lock, FileText, ChevronRight, X } from "lucide-react";
import { useState } from "react";

const CREDIBILITY_COLOR = (n: number) =>
  n > 70 ? "#059669" : n > 40 ? "#d97706" : "#dc2626";

export default function MemoryRoom() {
  const [selected, setSelected] = useState<any | null>(null);
  const [newTitle, setNewTitle]   = useState("");
  const [newContent, setNewContent] = useState("");
  const [adding, setAdding]       = useState(false);

  const memoriesQuery = trpc.memory.getMemories.useQuery();
  const statsQuery    = trpc.player.getStats.useQuery();
  const profileQuery  = trpc.player.getProfile.useQuery();

  const addMutation = trpc.memory.addMemory.useMutation({
    onSuccess: () => { memoriesQuery.refetch(); setNewTitle(""); setNewContent(""); setAdding(false); },
  });
  const deleteMutation = trpc.memory.deleteMemory.useMutation({
    onSuccess: () => { memoriesQuery.refetch(); setSelected(null); },
  });

  if (!memoriesQuery.data || !statsQuery.data) {
    return (
      <div className="mw-loading">
        <div className="mw-loading-dot" />
        <span className="mw-loading-text">불러오는 중…</span>
      </div>
    );
  }

  const memories = memoriesQuery.data;
  const stats    = statsQuery.data;
  const playerId = profileQuery.data?.id ?? 0;

  const isDistorted = (m: any) => m.isManipulated || stats.traumaLevel > 60;

  return (
    <div className="mw-home">
      <div className="mw-topbar">
        <div className="mw-topbar-left">
          <div className="mw-school-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <div>
            <div className="mw-topbar-name">학급 일지</div>
            <div className="mw-topbar-sub">기록 열람 · 작성</div>
          </div>
        </div>
        <button
          onClick={() => setAdding(true)}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: "0.78rem", fontWeight: 700, color: "#1a3557", cursor: "pointer", letterSpacing: "-0.02em" }}
        >
          <Plus size={14} />
          새 기록
        </button>
      </div>

      <div className="mw-scroll">
        {/* 통계 요약 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "총 기록", value: memories.length, color: "#2563a8", bg: "#e8f1fb" },
            { label: "기억 포인트", value: `${stats.memoryPoints}P`, color: "#059669", bg: "#d1fae5" },
            { label: "특이 기록", value: memories.filter(isDistorted).length, color: "#dc2626", bg: "#fee2e2" },
          ].map(item => (
            <div key={item.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "0.6rem", color: "#9ca3af", letterSpacing: "-0.01em", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: item.color, letterSpacing: "-0.04em" }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* 기록 목록 */}
        <div>
          <p className="mw-section-title">기록 목록</p>
          <div style={{ height: 10 }} />
          {memories.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "32px 16px", textAlign: "center" }}>
              <FileText size={32} color="#d1d5db" style={{ margin: "0 auto 8px" }} />
              <p style={{ fontSize: "0.82rem", color: "#9ca3af", letterSpacing: "-0.02em" }}>아직 기록이 없습니다</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {memories.map((m: any) => (
                <div
                  key={m.id}
                  onClick={() => setSelected(m)}
                  style={{
                    background: "#fff", border: `1px solid ${isDistorted(m) ? "#fca5a5" : "#e5e7eb"}`,
                    borderRadius: 12, padding: "13px 16px", cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 12,
                    transition: "border-color 0.15s",
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: isDistorted(m) ? "#fee2e2" : "#e8f1fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isDistorted(m)
                      ? <Lock size={16} color="#dc2626" />
                      : <FileText size={16} color="#2563a8" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.04em", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.title || "제목 없음"}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#9ca3af", letterSpacing: "-0.01em" }}>
                      주차 {m.loopCount} · 신뢰도 {m.credibility}%
                    </div>
                  </div>
                  <ChevronRight size={14} color="#d1d5db" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 8 }} />
      </div>

      {/* 상세 패널 (슬라이드) */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={() => setSelected(null)}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 20px 32px", maxHeight: "70vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.04em" }}>{selected.title || "제목 없음"}</span>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={18} color="#9ca3af" /></button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "#e8f1fb", color: "#1a3557" }}>주차 {selected.loopCount}</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "#f3f4f6", color: CREDIBILITY_COLOR(selected.credibility) }}>신뢰도 {selected.credibility}%</span>
              {selected.isManipulated && <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "#fee2e2", color: "#dc2626" }}>특이 기록</span>}
            </div>
            <p style={{ fontSize: "0.85rem", color: isDistorted(selected) ? "#dc2626" : "#374151", lineHeight: 1.7, letterSpacing: "-0.02em", marginBottom: 20 }}>
              {selected.content}
            </p>
            <button
              onClick={() => deleteMutation.mutate({ memoryId: selected.id })}
              disabled={deleteMutation.isPending}
              style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center", padding: "12px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, fontSize: "0.82rem", fontWeight: 700, color: "#dc2626", cursor: "pointer", letterSpacing: "-0.02em" }}
            >
              <Trash2 size={14} />
              {deleteMutation.isPending ? "삭제 중…" : "이 기록 삭제"}
            </button>
          </div>
        </div>
      )}

      {/* 새 기록 입력 패널 */}
      {adding && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={() => setAdding(false)}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 20px 32px" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.04em" }}>새 기록 작성</span>
              <button onClick={() => setAdding(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={18} color="#9ca3af" /></button>
            </div>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="제목"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: "0.85rem", letterSpacing: "-0.03em", marginBottom: 10, outline: "none", fontFamily: "inherit" }}
            />
            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="기억할 내용을 입력하세요…"
              rows={4}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: "0.85rem", letterSpacing: "-0.03em", resize: "none", outline: "none", fontFamily: "inherit", marginBottom: 14 }}
            />
            <button
              onClick={() => {
                if (!newContent.trim()) return;
                addMutation.mutate({ playerId, content: newContent, isTrue: true });
              }}
              disabled={addMutation.isPending || !newContent.trim()}
              style={{ width: "100%", padding: "13px", background: "#1a3557", border: "none", borderRadius: 10, fontSize: "0.88rem", fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "-0.03em", opacity: !newContent.trim() ? 0.4 : 1 }}
            >
              {addMutation.isPending ? "저장 중…" : "기록 저장"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
