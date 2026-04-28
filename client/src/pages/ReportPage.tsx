import { trpc } from "@/lib/trpc";
import { ShieldCheck, Send, X, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = ["학교 시설", "학급 운영", "기타 건의"];

export default function ReportPage() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [targetId, setTargetId] = useState("");
  const [content, setContent]   = useState("");
  const [done, setDone]         = useState(false);

  const reportMutation = trpc.report.submit.useMutation({
    onSuccess: () => { setDone(true); setContent(""); setTargetId(""); },
    onError: (e: any) => toast.error(e.message),
  });

  const submit = () => {
    if (content.trim().length < 5) { toast.error("내용을 5자 이상 입력해 주세요"); return; }
    reportMutation.mutate({ category, targetStudentId: targetId || undefined, content });
  };

  return (
    <div className="mw-home">
      <div className="mw-topbar">
        <div className="mw-topbar-left">
          <div className="mw-school-badge">
            <ShieldCheck size={14} color="#fff" />
          </div>
          <div>
            <div className="mw-topbar-name">익명 제보</div>
            <div className="mw-topbar-sub">담임에게만 전달됩니다</div>
          </div>
        </div>
      </div>

      <div className="mw-scroll">
        {done ? (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "36px 20px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <CheckCircle size={40} color="#059669" style={{ margin: "0 auto 12px" }} />
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", letterSpacing: "-0.05em", marginBottom: 6 }}>제보가 접수되었습니다</div>
            <p style={{ fontSize: "0.82rem", color: "#6b7280", letterSpacing: "-0.02em", lineHeight: 1.6 }}>
              담임 선생님에게만 전달되며<br />익명이 보장됩니다.
            </p>
            <button
              onClick={() => setDone(false)}
              style={{ marginTop: 20, padding: "10px 24px", background: "#1a3557", border: "none", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "-0.02em" }}
            >
              새 제보 작성
            </button>
          </div>
        ) : (
          <>
            {/* 안내 */}
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ fontSize: "0.78rem", color: "#0369a1", lineHeight: 1.6, letterSpacing: "-0.02em" }}>
                이 제보는 완전 익명으로 처리됩니다.<br />
                제보자의 정보는 어떤 경우에도 공개되지 않습니다.
              </p>
            </div>

            {/* 카테고리 */}
            <div>
              <p className="mw-section-title">분류</p>
              <div style={{ height: 10 }} />
              <div style={{ display: "flex", gap: 7 }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    style={{ flex: 1, padding: "9px 4px", borderRadius: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "-0.02em", cursor: "pointer", border: "1px solid", background: category === cat ? "#1a3557" : "#fff", color: category === cat ? "#fff" : "#6b7280", borderColor: category === cat ? "#1a3557" : "#e5e7eb", transition: "all 0.15s" }}
                  >{cat}</button>
                ))}
              </div>
            </div>

            {/* 대상 (선택) */}
            <div>
              <p className="mw-section-title">관련 학번 <span style={{ fontWeight: 400, color: "#d1d5db" }}>(선택)</span></p>
              <div style={{ height: 10 }} />
              <input
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                placeholder="예: 2-2-03 (없으면 비워두세요)"
                style={{ width: "100%", padding: "11px 14px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: "0.85rem", letterSpacing: "-0.02em", outline: "none", fontFamily: "inherit", background: "#fff" }}
              />
            </div>

            {/* 내용 */}
            <div>
              <p className="mw-section-title">제보 내용</p>
              <div style={{ height: 10 }} />
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="제보하실 내용을 자세히 적어주세요…"
                rows={6}
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: "0.85rem", letterSpacing: "-0.02em", lineHeight: 1.65, resize: "none", outline: "none", fontFamily: "inherit", background: "#fff" }}
              />
              <div style={{ textAlign: "right", marginTop: 4, fontSize: "0.65rem", color: content.length < 5 ? "#dc2626" : "#9ca3af" }}>
                {content.length}자
              </div>
            </div>

            <button
              onClick={submit}
              disabled={reportMutation.isPending || content.trim().length < 5}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "14px", background: "#1a3557", border: "none", borderRadius: 12, fontSize: "0.9rem", fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "-0.02em", opacity: (reportMutation.isPending || content.trim().length < 5) ? 0.4 : 1, transition: "opacity 0.15s" }}
            >
              <Send size={15} />
              {reportMutation.isPending ? "제출 중…" : "익명으로 제보하기"}
            </button>

            <div style={{ height: 8 }} />
          </>
        )}
      </div>
    </div>
  );
}
