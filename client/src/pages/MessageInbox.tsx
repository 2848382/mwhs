import { trpc } from "@/lib/trpc";
import { Loader2, MessageSquare, Sparkles, X, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function MessageInbox() {
  const [selected, setSelected] = useState<any | null>(null);

  const contentQuery   = trpc.personalized.getContent.useQuery();
  const notifQuery     = trpc.notification.getUnread.useQuery();
  const generateMutation = trpc.personalized.generateMessage.useMutation({
    onSuccess: () => { toast.success("새 메시지가 생성되었습니다"); contentQuery.refetch(); },
    onError: (e: any) => toast.error(e.message),
  });

  const aiMessages = contentQuery.data ?? [];
  const notifs     = notifQuery.data ?? [];

  const allMessages = [
    ...notifs.map((n: any) => ({ id: `n-${n.id}`, type: "notice", title: n.title, body: n.content, date: new Date(n.createdAt), badge: "공지" })),
    ...aiMessages.map((m: any) => ({ id: `m-${m.id}`, type: "ai", title: "담임 선생님 메시지", body: m.content, date: new Date(m.createdAt), badge: "개인" })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="mw-home">
      <div className="mw-topbar">
        <div className="mw-topbar-left">
          <div className="mw-school-badge">
            <MessageSquare size={14} color="#fff" />
          </div>
          <div>
            <div className="mw-topbar-name">메시지함</div>
            <div className="mw-topbar-sub">알림 · 담임 메시지</div>
          </div>
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: "0.7rem", fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "-0.02em" }}
        >
          {generateMutation.isPending ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={12} />}
          새 메시지 받기
        </button>
      </div>

      <div className="mw-scroll">
        {contentQuery.isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <Loader2 size={24} color="#2563a8" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : allMessages.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "40px 20px", textAlign: "center" }}>
            <MessageSquare size={36} color="#d1d5db" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: "0.85rem", color: "#9ca3af", letterSpacing: "-0.02em", marginBottom: 16 }}>메시지가 없습니다</p>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "#1a3557", border: "none", borderRadius: 10, fontSize: "0.82rem", fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "-0.02em" }}
            >
              <Sparkles size={13} />
              담임 메시지 받기
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {allMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelected(msg)}
                style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: msg.type === "ai" ? "#ede9fe" : "#e8f1fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {msg.type === "ai" ? <Sparkles size={16} color="#7c3aed" /> : <MessageSquare size={16} color="#2563a8" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.04em" }}>{msg.title}</span>
                    <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: msg.type === "ai" ? "#ede9fe" : "#e8f1fb", color: msg.type === "ai" ? "#7c3aed" : "#2563a8", flexShrink: 0 }}>{msg.badge}</span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", letterSpacing: "-0.02em", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.body}</p>
                  <div style={{ fontSize: "0.62rem", color: "#d1d5db", marginTop: 4 }}>
                    {msg.date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })} {msg.date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 8 }} />
      </div>

      {/* 상세 바텀시트 */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={() => setSelected(null)}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 20px 40px", maxHeight: "75vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: selected.type === "ai" ? "#ede9fe" : "#e8f1fb", color: selected.type === "ai" ? "#7c3aed" : "#2563a8" }}>{selected.badge}</span>
                  <span style={{ fontSize: "0.62rem", color: "#9ca3af" }}>{selected.date.toLocaleDateString("ko-KR")}</span>
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.05em" }}>{selected.title}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={18} color="#9ca3af" /></button>
            </div>
            <div style={{ height: 1, background: "#f3f4f6", margin: "14px 0" }} />
            <p style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.8, letterSpacing: "-0.02em" }}>{selected.body}</p>
          </div>
        </div>
      )}
    </div>
  );
}
