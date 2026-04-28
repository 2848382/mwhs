import { trpc } from "@/lib/trpc";
import { Loader2, ChevronRight, Megaphone, X } from "lucide-react";
import { useState } from "react";

export default function NoticePage() {
  const noticesQuery = trpc.notice.getAll.useQuery();
  const [selected, setSelected] = useState<any | null>(null);

  const notices = noticesQuery.data ?? [];

  return (
    <div className="mw-home">
      <div className="mw-topbar">
        <div className="mw-topbar-left">
          <div className="mw-school-badge">
            <Megaphone size={14} color="#fff" />
          </div>
          <div>
            <div className="mw-topbar-name">공지사항</div>
            <div className="mw-topbar-sub">명원고 2-2</div>
          </div>
        </div>
      </div>

      <div className="mw-scroll">
        {noticesQuery.isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <Loader2 size={24} color="#2563a8" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notices.map((n: any, i: number) => (
              <div
                key={n.id}
                onClick={() => setSelected(n)}
                style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "border-color 0.15s" }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: i === 0 ? "#e8f1fb" : "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Megaphone size={15} color={i === 0 ? "#2563a8" : "#9ca3af"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.04em", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "#9ca3af", letterSpacing: "-0.01em" }}>
                    {n.author} · {n.date}
                  </div>
                </div>
                {i === 0 && (
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#2563a8", color: "#fff", flexShrink: 0 }}>NEW</span>
                )}
                <ChevronRight size={14} color="#d1d5db" />
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 8 }} />
      </div>

      {/* 상세 바텀시트 */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={() => setSelected(null)}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 20px 36px", maxHeight: "75vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ flex: 1, paddingRight: 12 }}>
                <div style={{ fontSize: "0.65rem", color: "#9ca3af", letterSpacing: "-0.01em", marginBottom: 6 }}>{selected.author} · {selected.date}</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.05em", lineHeight: 1.4 }}>{selected.title}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}><X size={18} color="#9ca3af" /></button>
            </div>
            <div style={{ height: 1, background: "#f3f4f6", margin: "14px 0" }} />
            <p style={{ fontSize: "0.88rem", color: "#374151", lineHeight: 1.75, letterSpacing: "-0.02em" }}>{selected.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
