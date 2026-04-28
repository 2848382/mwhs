import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, Heart, Users, BookOpen, ChevronRight, AlertCircle } from "lucide-react";
import { Link } from "wouter";

const STAT_CONFIG = [
  { key: "trustScore",      label: "신뢰",   color: "#2563a8", bg: "#e8f1fb" },
  { key: "compassionScore", label: "연민",   color: "#059669", bg: "#d1fae5" },
  { key: "obsessionScore",  label: "집착",   color: "#7c3aed", bg: "#ede9fe" },
  { key: "hatredScore",     label: "혐오",   color: "#dc2626", bg: "#fee2e2" },
] as const;

const MENTAL_LABEL: Record<string, { text: string; color: string; bg: string }> = {
  normal:   { text: "안정",   color: "#059669", bg: "#d1fae5" },
  anxious:  { text: "불안",   color: "#d97706", bg: "#fef3c7" },
  critical: { text: "위태로움", color: "#dc2626", bg: "#fee2e2" },
  collapse: { text: "붕괴",   color: "#7f1d1d", bg: "#fecaca" },
};

export default function Dashboard() {
  const profileQuery = trpc.player.getProfile.useQuery();
  const statsQuery   = trpc.player.getStats.useQuery();
  const allPlayersQuery = trpc.player.getAllPlayers.useQuery();
  const notifQuery   = trpc.notification.getUnread.useQuery();
  const eventsQuery  = trpc.events.getMyEvents.useQuery();

  if (!profileQuery.data || !statsQuery.data) {
    return (
      <div className="mw-loading">
        <div className="mw-loading-dot" />
        <span className="mw-loading-text">불러오는 중…</span>
      </div>
    );
  }

  const stats   = statsQuery.data;
  const mental  = MENTAL_LABEL[stats.mentalState] ?? MENTAL_LABEL.normal;
  const players = allPlayersQuery.data ?? [];
  const notifs  = notifQuery.data ?? [];
  const events  = (eventsQuery.data ?? []).slice(0, 5);

  return (
    <div className="mw-home">
      {/* 상단 바 */}
      <div className="mw-topbar">
        <div className="mw-topbar-left">
          <div className="mw-school-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <div>
            <div className="mw-topbar-name">학습 현황</div>
            <div className="mw-topbar-sub">명원고 2-2</div>
          </div>
        </div>
        {notifs.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ background: "#dc2626", color: "#fff", borderRadius: 20, fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px" }}>
              알림 {notifs.length}
            </span>
          </div>
        )}
      </div>

      <div className="mw-scroll">
        {/* 미읽 알림 */}
        {notifs.length > 0 && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <AlertCircle size={14} color="#d97706" />
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#92400e", letterSpacing: "-0.03em" }}>읽지 않은 알림</span>
            </div>
            {notifs.map((n: any) => (
              <div key={n.id} style={{ fontSize: "0.75rem", color: "#78350f", letterSpacing: "-0.02em", lineHeight: 1.5, paddingTop: 4 }}>
                · {n.title}: {n.content}
              </div>
            ))}
          </div>
        )}

        {/* 상태 카드 */}
        <div className="mw-card">
          <div className="mw-card-top" style={{ paddingBottom: 12 }}>
            <div>
              <div className="mw-card-school">나의 현재 상태</div>
              <div className="mw-card-class" style={{ fontSize: "0.95rem" }}>
                {profileQuery.data?.studentId ?? "—"}
              </div>
            </div>
            <span className="mw-status-pill" style={{ background: mental.bg, color: mental.color, fontSize: "0.72rem" }}>
              {mental.text}
            </span>
          </div>

          {/* 건강 지수 바 */}
          <div style={{ padding: "0 18px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", letterSpacing: "-0.02em" }}>건강 지수</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: stats.traumaLevel > 70 ? "#dc2626" : "#1a3557", letterSpacing: "-0.03em" }}>
                {stats.traumaLevel}/100
              </span>
            </div>
            <div style={{ height: 6, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${stats.traumaLevel}%`, background: stats.traumaLevel > 70 ? "#dc2626" : stats.traumaLevel > 40 ? "#f59e0b" : "#2563a8", borderRadius: 4, transition: "width 0.4s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: "0.6rem", color: "#d1d5db" }}>0</span>
              <span style={{ fontSize: "0.6rem", color: "#d1d5db" }}>100</span>
            </div>
          </div>

          {/* 기억 포인트 */}
          <div style={{ padding: "10px 18px", background: "#f9fafb", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.72rem", color: "#6b7280", letterSpacing: "-0.02em" }}>기억 포인트</span>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "#1a3557", letterSpacing: "-0.04em" }}>{stats.memoryPoints} P</span>
          </div>
        </div>

        {/* 감정 수치 그리드 */}
        <div>
          <p className="mw-section-title">감정 수치</p>
          <div style={{ height: 10 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {STAT_CONFIG.map(cfg => {
              const val = (stats as any)[cfg.key] ?? 0;
              return (
                <div key={cfg.key} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 14px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.72rem", color: "#6b7280", letterSpacing: "-0.02em" }}>{cfg.label}</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: cfg.color, letterSpacing: "-0.03em" }}>{val}</span>
                  </div>
                  <div style={{ height: 4, background: "#f3f4f6", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${val}%`, background: cfg.color, borderRadius: 2, opacity: 0.7, transition: "width 0.4s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 수치 변동 히스토리 */}
        {events.length > 0 && (
          <div>
            <p className="mw-section-title">최근 변동 내역</p>
            <div style={{ height: 10 }} />
            <div className="mw-notice">
              {events.map((ev: any, i: number) => (
                <div key={ev.id} className="mw-notice-item">
                  <div className="mw-notice-dot" />
                  <span className="mw-notice-text">{ev.description}</span>
                  <span className="mw-notice-date">
                    {new Date(ev.createdAt).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 반 친구 목록 */}
        <div>
          <p className="mw-section-title">우리 반 ({players.length}명)</p>
          <div style={{ height: 10 }} />
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {players.slice(0, 8).map((p: any, i: number) => {
              const pStats = p.stats;
              const mental = pStats ? MENTAL_LABEL[pStats.mentalState] ?? MENTAL_LABEL.normal : null;
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", padding: "11px 16px", borderBottom: i < Math.min(players.length, 8) - 1 ? "1px solid #f3f4f6" : "none", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "#e8f1fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#1a3557", letterSpacing: "-0.02em" }}>
                      {p.studentId?.slice(-2) ?? "??"}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.04em" }}>
                      {p.studentId ?? "—"}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#9ca3af", letterSpacing: "-0.01em" }}>학생</div>
                  </div>
                  {mental && (
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: mental.bg, color: mental.color, letterSpacing: "-0.01em", flexShrink: 0 }}>
                      {mental.text}
                    </span>
                  )}
                </div>
              );
            })}
            {players.length > 8 && (
              <div style={{ padding: "10px 16px", textAlign: "center", fontSize: "0.72rem", color: "#2563a8", letterSpacing: "-0.02em" }}>
                외 {players.length - 8}명
              </div>
            )}
          </div>
        </div>

        {/* 바로가기 */}
        <div>
          <p className="mw-section-title">바로가기</p>
          <div style={{ height: 10 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { href: "/records", label: "학급 일지 보기", icon: <BookOpen size={16} /> },
              { href: "/map",     label: "학교 안내도 보기", icon: <TrendingUp size={16} /> },
            ].map(item => (
              <Link key={item.href} href={item.href}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, textDecoration: "none", color: "#111827", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "-0.03em", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <span style={{ color: "#2563a8" }}>{item.icon}</span>
                {item.label}
                <ChevronRight size={14} color="#d1d5db" style={{ marginLeft: "auto" }} />
              </Link>
            ))}
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
