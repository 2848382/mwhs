import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2, ShieldAlert, Bell, Users, Send, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const SECTION_STYLE = {
  background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
  overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

const SECTION_HEAD = {
  padding: "12px 16px", borderBottom: "1px solid #f3f4f6",
  display: "flex", alignItems: "center", gap: 8,
};

export default function GMDashboard() {
  const { user } = useAuth();
  const [notifTitle, setNotifTitle]    = useState("");
  const [notifContent, setNotifContent] = useState("");
  const [targetId, setTargetId]        = useState("");
  const [weekDelta, setWeekDelta]      = useState(1);
  const [aiTargetId, setAiTargetId]   = useState("");

  const loopQuery      = trpc.loop.getState.useQuery();
  const allPlayersQuery = trpc.player.getAllPlayers.useQuery();

  const advanceMutation = trpc.loop.incrementLoop.useMutation({
    onSuccess: () => { toast.success("주차가 업데이트되었습니다"); loopQuery.refetch(); },
    onError: (e: any) => toast.error(e.message),
  });

  const notifMutation = trpc.notification.send.useMutation({
    onSuccess: () => { toast.success("알림이 발송되었습니다"); setNotifTitle(""); setNotifContent(""); },
    onError: (e: any) => toast.error(e.message),
  });

  const aiMutation = trpc.personalized.generateMessage.useMutation({
    onSuccess: (data: any) => toast.success(`AI 메시지 생성: ${data.content?.slice(0, 30)}…`),
    onError: (e: any) => toast.error(e.message),
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="mw-loading">
        <ShieldAlert size={36} color="#dc2626" />
        <span className="mw-loading-text">GM 권한이 필요합니다</span>
      </div>
    );
  }

  if (!loopQuery.data) {
    return <div className="mw-loading"><div className="mw-loading-dot" /></div>;
  }

  const loop    = loopQuery.data;
  const players = allPlayersQuery.data ?? [];

  const sendNotif = () => {
    if (!notifTitle || !notifContent) { toast.error("제목과 내용을 입력하세요"); return; }
    const target = players.find((p: any) => p.studentId === targetId);
    if (!target && targetId) { toast.error("해당 학번의 학생을 찾을 수 없습니다"); return; }
    if (!target) { toast.error("학번을 입력해 주세요"); return; }
    notifMutation.mutate({ playerId: target.id, title: notifTitle, content: notifContent, notificationType: "gm_notice" });
  };

  return (
    <div className="mw-home">
      <div className="mw-topbar">
        <div className="mw-topbar-left">
          <div className="mw-school-badge">
            <ShieldAlert size={14} color="#fff" />
          </div>
          <div>
            <div className="mw-topbar-name">GM 관리 패널</div>
            <div className="mw-topbar-sub">운영진 전용 · admin</div>
          </div>
        </div>
      </div>

      <div className="mw-scroll">
        {/* 현재 학기 현황 */}
        <div style={SECTION_STYLE}>
          <div style={SECTION_HEAD}>
            <RefreshCw size={14} color="#2563a8" />
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.04em" }}>학기 현황</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {[
              { label: "현재 주차", value: loop.loopCount, accent: "#2563a8" },
              { label: "학기 진행률", value: `${loop.distortionLevel}%`, accent: "#d97706" },
              { label: "운영 상태", value: loop.isActive ? "활성" : "비활성", accent: loop.isActive ? "#059669" : "#6b7280" },
              { label: "마지막 업데이트", value: new Date(loop.updatedAt).toLocaleDateString("ko-KR"), accent: "#9ca3af" },
            ].map((item, i) => (
              <div key={item.label} style={{ padding: "14px 16px", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none", borderRight: i % 2 === 0 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ fontSize: "0.62rem", color: "#9ca3af", letterSpacing: "-0.01em", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: item.accent, letterSpacing: "-0.04em" }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "14px 16px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="number" min={1} max={10} value={weekDelta}
              onChange={e => setWeekDelta(Number(e.target.value))}
              style={{ width: 70, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: "0.85rem", letterSpacing: "-0.02em", outline: "none", fontFamily: "inherit" }}
            />
            <span style={{ fontSize: "0.78rem", color: "#6b7280", letterSpacing: "-0.02em" }}>주 증가</span>
            <button
              onClick={() => advanceMutation.mutate({ adminKey: "admin" })}
              disabled={advanceMutation.isPending}
              style={{ marginLeft: "auto", padding: "9px 18px", background: "#1a3557", border: "none", borderRadius: 8, fontSize: "0.82rem", fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "-0.02em", opacity: advanceMutation.isPending ? 0.6 : 1 }}
            >
              {advanceMutation.isPending ? "저장 중…" : "주차 저장"}
            </button>
          </div>
        </div>

        {/* 학생 목록 */}
        <div>
          <p className="mw-section-title">학생 목록 ({players.length}명)</p>
          <div style={{ height: 10 }} />
          <div style={{ ...SECTION_STYLE }}>
            {players.map((p: any, i: number) => {
              const s = p.stats;
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", padding: "11px 16px", borderBottom: i < players.length - 1 ? "1px solid #f3f4f6" : "none", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#374151" }}>{p.studentId?.slice(-2) ?? "??"}</span>
                  </div>
                  <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.04em" }}>{p.studentId}</span>
                  {s && (
                    <div style={{ display: "flex", gap: 6, fontSize: "0.65rem", color: "#9ca3af" }}>
                      <span style={{ color: s.traumaLevel > 70 ? "#dc2626" : "#059669", fontWeight: 700 }}>건강 {s.traumaLevel}</span>
                      <span>신뢰 {s.trustScore}</span>
                    </div>
                  )}
                </div>
              );
            })}
            {players.length === 0 && (
              <div style={{ padding: "24px", textAlign: "center", fontSize: "0.8rem", color: "#9ca3af" }}>등록된 학생이 없습니다</div>
            )}
          </div>
        </div>

        {/* 알림 발송 */}
        <div style={SECTION_STYLE}>
          <div style={SECTION_HEAD}>
            <Bell size={14} color="#2563a8" />
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.04em" }}>알림 발송</span>
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              value={targetId} onChange={e => setTargetId(e.target.value)}
              placeholder="학번 (예: 2-2-03)"
              style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: "0.82rem", letterSpacing: "-0.02em", outline: "none", fontFamily: "inherit" }}
            />
            <input
              value={notifTitle} onChange={e => setNotifTitle(e.target.value)}
              placeholder="알림 제목"
              style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: "0.82rem", letterSpacing: "-0.02em", outline: "none", fontFamily: "inherit" }}
            />
            <textarea
              value={notifContent} onChange={e => setNotifContent(e.target.value)}
              placeholder="알림 내용…" rows={3}
              style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: "0.82rem", letterSpacing: "-0.02em", resize: "none", outline: "none", fontFamily: "inherit" }}
            />
            <button
              onClick={sendNotif} disabled={notifMutation.isPending}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", background: "#1a3557", border: "none", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "-0.02em" }}
            >
              <Send size={14} />
              {notifMutation.isPending ? "발송 중…" : "알림 발송"}
            </button>
          </div>
        </div>

        {/* AI 개인화 메시지 생성 */}
        <div style={SECTION_STYLE}>
          <div style={SECTION_HEAD}>
            <Users size={14} color="#7c3aed" />
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.04em" }}>AI 개인화 메시지</span>
            <span style={{ fontSize: "0.62rem", color: "#9ca3af", marginLeft: "auto" }}>담임 메시지처럼 표시됨</span>
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.6, letterSpacing: "-0.02em" }}>
              해당 학생의 현재 수치를 기반으로 LLM이 개인화된 담임 메시지를 자동 생성합니다.
              학생은 "오늘의 메시지" 형태로 수신합니다.
            </p>
            <input
              value={aiTargetId} onChange={e => setAiTargetId(e.target.value)}
              placeholder="학번 (예: 2-2-03)"
              style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: "0.82rem", letterSpacing: "-0.02em", outline: "none", fontFamily: "inherit" }}
            />
            <button
              onClick={() => aiMutation.mutate()}
              disabled={aiMutation.isPending}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", background: "#6d28d9", border: "none", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "-0.02em", opacity: aiMutation.isPending ? 0.6 : 1 }}
            >
              {aiMutation.isPending ? "생성 중…" : "AI 메시지 생성"}
            </button>
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
