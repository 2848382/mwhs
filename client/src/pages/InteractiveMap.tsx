import { trpc } from "@/lib/trpc";
import { Loader2, MapPin, ChevronRight, X } from "lucide-react";
import { useState } from "react";

interface MapLocation {
  id: string; name: string; floor: string; x: number; y: number;
  description: string; category: "교실" | "편의" | "체육" | "기타";
  hours?: string;
}

const LOCATIONS: MapLocation[] = [
  { id: "classroom-2-2", name: "2학년 2반 교실",  floor: "2층", x: 58, y: 40, description: "2학년 2반 홈베이스입니다. 조례·종례가 이곳에서 진행됩니다.", category: "교실", hours: "07:30 – 21:00" },
  { id: "hallway-2f",    name: "2층 복도",         floor: "2층", x: 35, y: 52, description: "이동 수업 및 환경미화 담당 구역입니다.", category: "기타" },
  { id: "infirmary",     name: "양호실",            floor: "1층", x: 72, y: 44, description: "건강 상담 및 응급처치를 받을 수 있습니다.", category: "편의", hours: "08:00 – 17:00" },
  { id: "library",       name: "도서관",            floor: "3층", x: 58, y: 62, description: "학습 자료와 도서 대출이 가능합니다.", category: "편의", hours: "09:00 – 18:00" },
  { id: "cafeteria",     name: "급식실",            floor: "B1", x: 32, y: 76, description: "점심시간 11:50에 급식 배식이 진행됩니다.", category: "편의", hours: "11:50 – 13:10" },
  { id: "gym",           name: "체육관",            floor: "별관", x: 78, y: 70, description: "체육 수업 및 학교 행사 장소입니다.", category: "체육", hours: "08:00 – 20:00" },
  { id: "rooftop",       name: "옥상",              floor: "옥상", x: 52, y: 16, description: "학생 자유 시간 개방 구역입니다.", category: "기타", hours: "12:30 – 13:10" },
  { id: "basement",      name: "지하 창고",          floor: "B1", x: 20, y: 84, description: "시설 관리실 및 창고 구역입니다. 학생 출입 제한.", category: "기타" },
];

const CATEGORY_COLOR: Record<string, { bg: string; color: string; dot: string }> = {
  교실: { bg: "#e8f1fb", color: "#1a3557", dot: "#2563a8" },
  편의: { bg: "#d1fae5", color: "#064e3b", dot: "#059669" },
  체육: { bg: "#fde68a", color: "#78350f", dot: "#d97706" },
  기타: { bg: "#f3f4f6", color: "#374151", dot: "#6b7280" },
};

export default function InteractiveMap() {
  const [selected, setSelected] = useState<MapLocation | null>(null);
  const [filter, setFilter] = useState<string>("전체");

  const categories = ["전체", "교실", "편의", "체육", "기타"];
  const filtered = filter === "전체" ? LOCATIONS : LOCATIONS.filter(l => l.category === filter);

  return (
    <div className="mw-home">
      <div className="mw-topbar">
        <div className="mw-topbar-left">
          <div className="mw-school-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
            </svg>
          </div>
          <div>
            <div className="mw-topbar-name">학교 안내도</div>
            <div className="mw-topbar-sub">명원고등학교</div>
          </div>
        </div>
      </div>

      <div className="mw-scroll">
        {/* 인터랙티브 맵 SVG */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.04em" }}>전체 지도</span>
            <span style={{ fontSize: "0.65rem", color: "#9ca3af", letterSpacing: "-0.01em" }}>핀을 탭하면 상세 정보</span>
          </div>
          <div style={{ position: "relative", background: "#f8fafc", aspectRatio: "16/10" }}>
            {/* 건물 외곽 */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0 }}>
              {/* 건물 실루엣 */}
              <rect x="10" y="10" width="75" height="75" rx="2" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" />
              <rect x="15" y="15" width="65" height="28" rx="1" fill="#dbeafe" stroke="#bfdbfe" strokeWidth="0.3" />
              <rect x="15" y="47" width="65" height="28" rx="1" fill="#dbeafe" stroke="#bfdbfe" strokeWidth="0.3" />
              {/* 층 구분선 */}
              <line x1="10" y1="43" x2="85" y2="43" stroke="#cbd5e1" strokeWidth="0.4" strokeDasharray="2 2" />
              <line x1="10" y1="57" x2="85" y2="57" stroke="#cbd5e1" strokeWidth="0.4" strokeDasharray="2 2" />
              {/* 층 라벨 */}
              <text x="87" y="27" fontSize="3" fill="#94a3b8" fontFamily="sans-serif">3F</text>
              <text x="87" y="50" fontSize="3" fill="#94a3b8" fontFamily="sans-serif">2F</text>
              <text x="87" y="69" fontSize="3" fill="#94a3b8" fontFamily="sans-serif">1F</text>
              {/* 핀 */}
              {LOCATIONS.map(loc => {
                const c = CATEGORY_COLOR[loc.category];
                const isSelected = selected?.id === loc.id;
                return (
                  <g key={loc.id} style={{ cursor: "pointer" }} onClick={() => setSelected(loc)}>
                    <circle cx={loc.x} cy={loc.y} r={isSelected ? 4.5 : 3.5}
                      fill={isSelected ? c.dot : "#fff"} stroke={c.dot} strokeWidth={isSelected ? 0 : 1.5}
                      style={{ transition: "all 0.15s" }} />
                    {isSelected && <circle cx={loc.x} cy={loc.y} r={7} fill={c.dot} opacity={0.15} />}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 필터 칩 */}
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "-0.02em", cursor: "pointer", border: "1px solid",
                background: filter === cat ? "#1a3557" : "#fff",
                color: filter === cat ? "#fff" : "#6b7280",
                borderColor: filter === cat ? "#1a3557" : "#e5e7eb",
                transition: "all 0.15s",
              }}
            >{cat}</button>
          ))}
        </div>

        {/* 공간 목록 */}
        <div>
          <p className="mw-section-title">공간 목록</p>
          <div style={{ height: 10 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(loc => {
              const c = CATEGORY_COLOR[loc.category];
              return (
                <div
                  key={loc.id}
                  onClick={() => setSelected(loc)}
                  style={{ background: "#fff", border: `1px solid ${selected?.id === loc.id ? c.dot : "#e5e7eb"}`, borderRadius: 12, padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "border-color 0.15s" }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin size={16} color={c.dot} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.04em", marginBottom: 2 }}>{loc.name}</div>
                    <div style={{ fontSize: "0.65rem", color: "#9ca3af", letterSpacing: "-0.01em" }}>{loc.floor} · {loc.category}</div>
                  </div>
                  {loc.hours && (
                    <span style={{ fontSize: "0.6rem", color: "#6b7280", letterSpacing: "-0.01em", flexShrink: 0 }}>{loc.hours}</span>
                  )}
                  <ChevronRight size={14} color="#d1d5db" />
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ height: 8 }} />
      </div>

      {/* 상세 바텀시트 */}
      {selected && (() => {
        const c = CATEGORY_COLOR[selected.category];
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={() => setSelected(null)}>
            <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 20px 36px" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: c.bg, color: c.color, letterSpacing: "-0.01em" }}>{selected.category} · {selected.floor}</span>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.05em", marginTop: 6 }}>{selected.name}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={18} color="#9ca3af" /></button>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.7, letterSpacing: "-0.02em", marginBottom: 14 }}>{selected.description}</p>
              {selected.hours && (
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", background: "#f9fafb", borderRadius: 9, border: "1px solid #e5e7eb" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span style={{ fontSize: "0.78rem", color: "#374151", fontWeight: 700, letterSpacing: "-0.03em" }}>운영 시간</span>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280", letterSpacing: "-0.02em", marginLeft: "auto" }}>{selected.hours}</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
