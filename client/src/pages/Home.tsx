import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2, BarChart3, Map, BookOpen, LogOut, User, Camera, Megaphone, ShieldCheck, MessageSquare } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { useRef, useState } from "react";

const NOTICES_PREVIEW = [
  { text: "5월 가정통신문 배부 안내 — 이번 주 금요일까지 제출 바랍니다.", date: "04.28" },
  { text: "도서관 정기 휴관 안내 (5/1 오전 중 이용 불가)", date: "04.27" },
  { text: "학생 건강 상담 프로그램 신청 안내 — 보건실로 문의하세요.", date: "04.25" },
];

function StudentCard({ isAuthenticated, user }: { isAuthenticated: boolean; user: any }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUrl(URL.createObjectURL(file));
  };

  return (
    <div className="mw-card">
      <div className="mw-card-top">
        <div>
          <div className="mw-card-school">명원고등학교 · 明院高等學校</div>
          <div className="mw-card-class">2학년 2반</div>
        </div>
        <span className="mw-card-badge">학생증</span>
      </div>
      <div className="mw-card-body">
        <div className="mw-photo-area">
          <input ref={fileInputRef} type="file" accept="image/*" className="mw-hidden-input" onChange={handleFileChange} />
          <div className="mw-photo-wrap" onClick={isAuthenticated ? () => fileInputRef.current?.click() : undefined} style={{ cursor: isAuthenticated ? "pointer" : "default" }}>
            {photoUrl ? <img src={photoUrl} alt="프로필" className="mw-photo-img" /> : (
              <div className="mw-photo-placeholder"><User strokeWidth={1.5} /></div>
            )}
            {isAuthenticated && (
              <div className="mw-photo-overlay"><Camera /><span>사진 등록</span></div>
            )}
          </div>
          {isAuthenticated && <p className="mw-photo-hint">탭하여 등록</p>}
        </div>
        <div className="mw-card-info">
          <div className="mw-info-name">
            {isAuthenticated && user?.name ? user.name : <span className="mw-info-name-empty">이름 미등록</span>}
          </div>
          <div className="mw-info-row">
            <div className="mw-info-item">
              <span className="mw-info-label">학번</span>
              <span className="mw-info-val mw-info-val-empty">—</span>
            </div>
            <div className="mw-info-item">
              <span className="mw-info-label">담임</span>
              <span className="mw-info-val mw-info-val-empty">—</span>
            </div>
            <div className="mw-info-item">
              <span className="mw-info-label">소속</span>
              <span className="mw-info-val">2학년 2반</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mw-card-divider" />
      <div className="mw-card-bottom">
        <div className="mw-loop-info">
          <div className="mw-loop-dot" />
          <span className="mw-loop-text">2025학년도</span>
          <span className="mw-loop-num">1학기</span>
        </div>
        <span className="mw-status-pill">재학 중</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const notifQuery = trpc.notification.getUnread.useQuery(undefined, { enabled: isAuthenticated });
  const unreadCount = notifQuery.data?.length ?? 0;

  if (loading) {
    return (
      <div className="mw-loading">
        <div className="mw-loading-dot" />
        <span className="mw-loading-text">불러오는 중…</span>
      </div>
    );
  }

  const MENUS = [
    { href: "/dashboard", icon: <BarChart3 strokeWidth={2} />, iconClass: "mw-icon-blue",   name: "학습 현황",  desc: "성적 · 감정 · 기록" },
    { href: "/map",       icon: <Map strokeWidth={2} />,       iconClass: "mw-icon-indigo", name: "학교 안내도", desc: "층별 공간 탐색" },
    { href: "/records",   icon: <BookOpen strokeWidth={2} />,  iconClass: "mw-icon-rose",   name: "학급 일지",  desc: "일정 · 기록 열람" },
    { href: "/notices",   icon: <Megaphone strokeWidth={2} />, iconClass: "mw-icon-amber",  name: "공지사항",   desc: "학급 공지 확인" },
    {
      href: "/messages",
      icon: (
        <div style={{ position: "relative" }}>
          <MessageSquare strokeWidth={2} />
          {unreadCount > 0 && (
            <span style={{ position: "absolute", top: -5, right: -5, background: "#dc2626", color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: "0.5rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {unreadCount}
            </span>
          )}
        </div>
      ),
      iconClass: "mw-icon-purple",
      name: "메시지함",
      desc: `알림${unreadCount > 0 ? ` · 미읽 ${unreadCount}` : ""} · 담임 메시지`,
    },
    { href: "/report",    icon: <ShieldCheck strokeWidth={2} />, iconClass: "mw-icon-slate",  name: "익명 제보",  desc: "담임에게 전달" },
  ];

  return (
    <div className="mw-home">
      <div className="mw-topbar">
        <div className="mw-topbar-left">
          <div className="mw-school-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div className="mw-topbar-name">명원고등학교</div>
            <div className="mw-topbar-sub">2학년 2반 학생 포털</div>
          </div>
        </div>
        <div className="mw-topbar-right">
          {isAuthenticated
            ? <button className="mw-logout-btn" onClick={logout}><LogOut size={12} style={{ marginRight: 4 }} />로그아웃</button>
            : <button className="mw-login-btn" onClick={() => (window.location.href = getLoginUrl())}>로그인</button>
          }
        </div>
      </div>

      <div className="mw-scroll">
        <StudentCard isAuthenticated={isAuthenticated} user={user} />

        <div>
          <p className="mw-section-title">메뉴</p>
          <div style={{ height: 10 }} />
          <div className="mw-menu-grid">
            {MENUS.map(m => (
              <Link key={m.href} href={m.href} className="mw-menu-btn">
                <div className={`mw-menu-icon ${m.iconClass}`}>{m.icon}</div>
                <div className="mw-menu-label">
                  <span className="mw-menu-name">{m.name}</span>
                  <span className="mw-menu-desc">{m.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p className="mw-section-title">공지사항</p>
            <Link href="/notices" style={{ fontSize: "0.7rem", color: "#2563a8", textDecoration: "none", letterSpacing: "-0.02em" }}>더 보기</Link>
          </div>
          <div style={{ height: 10 }} />
          <div className="mw-notice">
            {NOTICES_PREVIEW.map((n, i) => (
              <div className="mw-notice-item" key={i}>
                <div className="mw-notice-dot" />
                <span className="mw-notice-text">{n.text}</span>
                <span className="mw-notice-date">{n.date}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
