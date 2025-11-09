"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  FileText,
  PieChart,
  User,
  Sparkles,
  Plus,
  PanelLeft,
  ChevronRight,
} from "lucide-react";
import { useLNBWidth } from "@/hooks/useLNBWidth";
import { useChatStore } from "@/store/chatStore";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/common/LanguageSelector";
import DevDemoToggle from "@/components/common/DevDemoToggle";
import ThemeToggle from "@/components/common/ThemeToggle";
import { formatRelativeOrDate, formatAbsoluteDate } from "@/lib/utils";
import { useAppModeStore } from "@/store/appModeStore";
import { getChatSessions, getChatHistory, deleteChatHistory } from "@/lib/api/chat";

/**
 * LNB (Left Navigation Bar) Component
 *
 * 좌측 고정 사이드바 (260px)
 * - 라이트/다크 테마 지원 (CSS 변수 사용)
 * - 상단: 로고 + 접기 버튼
 * - + 새 채팅 버튼
 * - 주요 내비게이션: 채팅, 아티팩트, 포트폴리오, 마이페이지, 디스커버
 * - 최근 채팅 (스크롤 영역)
 * - 하단: 언어 선택, 다크모드 토글, 사용자 정보
 *
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */
export default function LNB() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, setCollapsed } = useLNBWidth();
  const { clearMessages, addMessage, setCurrentThreadId, setHistoryLoading } = useChatStore();
  const currentThreadId = useChatStore((s) => s.currentThreadId);
  const { t, i18n } = useTranslation();
  const { mode } = useAppModeStore();
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = React.useState<boolean>(false);
  const [sessionsLimit, setSessionsLimit] = React.useState<number>(20);
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const [menuPos, setMenuPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState<string>("");

  React.useEffect(() => {
    let mounted = true;
    if (mode === "live") {
      setLoadingSessions(true);
      getChatSessions(sessionsLimit)
        .then((data: any) => {
          if (!mounted) return;
          let list = Array.isArray(data?.sessions) ? data.sessions : Array.isArray(data) ? data : [];
          const curId = useChatStore.getState().currentThreadId;
          if (curId && !list.some((s: any) => s?.conversation_id === curId || s?.id === curId || s?.thread_id === curId || s?.uuid === curId)) {
            const firstUser = useChatStore.getState().messages.find(m => m.role === 'user');
            const title = firstUser?.content?.slice(0, 40) || 'Untitled';
            list = [
              { conversation_id: curId, title, last_message_at: new Date().toISOString() },
              ...list,
            ];
          }
          setSessions(list);
        })
        .catch((e) => {
          if (!mounted) return;
          console.error("Failed to load chat sessions", e);
          setSessions([]);
        })
        .finally(() => mounted && setLoadingSessions(false));
    } else {
      setSessions([]);
    }
    return () => {
      mounted = false;
    };
  }, [mode, sessionsLimit]);

  // 전역 클릭/ESC로 메뉴 닫기 및 rename 종료
  React.useEffect(() => {
    const onDocClick = () => {
      if (menuOpenId) setMenuOpenId(null);
      if (editingId) { setEditingId(null); setEditingValue(""); }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingId) { setEditingId(null); setEditingValue(""); }
        setMenuOpenId(null);
      }
    };
    window.addEventListener("click", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpenId, editingId]);

  // 새로운 세션(conversation_id) 생성 직후 LNB 최근 목록을 즉시 갱신
  React.useEffect(() => {
    if (mode !== "live") return;
    if (!currentThreadId) return;
    let cancelled = false;
    (async () => {
      try {
        const data: any = await getChatSessions(sessionsLimit);
        if (!cancelled) setSessions(Array.isArray(data?.sessions) ? data.sessions : Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) console.error("Failed to refresh sessions after thread change", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentThreadId, mode, sessionsLimit]);

  const openSession = async (conversationId: string) => {
    if (mode !== "live") return;
    if (!conversationId) return; // 안전 가드: 잘못된 id 방지
    // 이미 현재 스레드라면 불필요한 히스토리 호출/정리 방지
    if (conversationId === currentThreadId) {
      if (pathname !== "/") router.push("/");
      return;
    }
    try {
      setHistoryLoading(true);
      setCurrentThreadId(conversationId);
      clearMessages();
      const data: any = await getChatHistory(conversationId, 500);
      const list: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.messages)
        ? data.messages
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : [];

      let injectedContext = false;
      list.forEach((m: any, idx: number) => {
        const rawRole = m.role ?? m.sender ?? m.author ?? "assistant";
        const role = String(rawRole).toLowerCase().includes("user") ? "user" : "assistant";
        let content = m.message ?? m.content ?? m.text ?? "";
        if (!injectedContext && role === "user" && typeof content === "string") {
          const match = content.match(/```context\n([\s\S]*?)```/);
          if (match && match[1]?.trim()) {
            const ctx = match[1].trim();
            const ts = m.timestamp ?? m.created_at ?? m.time ?? new Date().toISOString();
            addMessage({ id: `ctx-${idx}-${Date.now()}`, role: "assistant", content: ctx, timestamp: ts, status: "sent" });
            injectedContext = true;
          }
        }
        if (role === "user" && typeof content === "string") {
          // 1) 컨텍스트 코드블럭 제거
          content = content.replace(/```context[\s\S]*?```/g, "").trimStart();
          // 2) 구분선(---) 이전 제거
          const sepIndex = content.indexOf("---");
          if (sepIndex !== -1) {
            content = content.slice(sepIndex + 3).trimStart();
          }
          // 3) 안내 라벨 한 줄 제거 (ko/en)
          const labelKo = "여기부터 위의 글에 대한 유저의 프롬프트 시작이다.";
          const labelEn = "From here begins the user's prompt referring to the above content.";
          if (content.startsWith(labelKo)) {
            content = content.slice(labelKo.length).trimStart();
          } else if (content.startsWith(labelEn)) {
            content = content.slice(labelEn.length).trimStart();
          }
          // 4) 앞뒤 따옴표 제거
          content = content.replace(/^['"`]+/, "").replace(/['"`]+$/, "");
          // 5) 과도한 연속 개행 축약
          content = content.replace(/\n{3,}/g, "\n\n").trim();
        }
        const ts = m.timestamp ?? m.created_at ?? m.time ?? new Date().toISOString();
        addMessage({ id: `restored-${idx}-${Date.now()}`, role, content, timestamp: ts, status: "sent" });
      });
      if (pathname !== "/") {
        router.push("/");
      }
    } catch (e) {
      console.error("Failed to open session", e);
      if (pathname !== "/") router.push("/");
      // 실패 시에도 목록 정합 유지를 위해 즉시 재조회 (낙관 항목 재삽입 보장)
      try { await refreshSessions(); } catch {}
    } finally {
      setHistoryLoading(false);
    }
  };

  const refreshSessions = async () => {
    if (mode !== "live") return;
    try {
      const data: any = await getChatSessions(sessionsLimit);
      let list = Array.isArray(data?.sessions) ? data.sessions : Array.isArray(data) ? data : [];
      // 보장: 현재 스레드가 목록에 없으면 낙관적으로 추가
      const curId = useChatStore.getState().currentThreadId;
      if (curId && !list.some((s: any) => s?.conversation_id === curId || s?.id === curId || s?.thread_id === curId || s?.uuid === curId)) {
        const firstUser = useChatStore.getState().messages.find(m => m.role === 'user');
        const title = firstUser?.content?.slice(0, 40) || 'Untitled';
        list = [
          { conversation_id: curId, title, last_message_at: new Date().toISOString() },
          ...list,
        ];
      }
      setSessions(list);
    } catch (e) {
      console.error("Failed to refresh sessions", e);
    }
  };

  // 외부에서 세션 업데이트 알림 수신 시 목록 새로고침
  React.useEffect(() => {
    const handler = () => {
      refreshSessions();
    };
    window.addEventListener('chat-session-updated', handler);
    return () => window.removeEventListener('chat-session-updated', handler);
  }, [mode, sessionsLimit]);

  const handleDeleteSession = async (conversationId: string) => {
    try {
      await deleteChatHistory(conversationId);
      if (currentThreadId === conversationId) {
        clearMessages();
        setCurrentThreadId("");
        if (pathname !== "/") router.push("/");
      }
      await refreshSessions();
    } catch (e) {
      console.error("Delete session failed", e);
    } finally {
      setMenuOpenId(null);
    }
  };

  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingValue(currentTitle || "");
    setMenuOpenId(null);
  };

  const commitRename = () => {
    if (!editingId) return;
    const newTitle = editingValue.trim();
    setSessions((prev) => prev.map((s: any) => (s.conversation_id === editingId ? { ...s, title: newTitle || s.title } : s)));
    setEditingId(null);
    setEditingValue("");
    // TODO: Live 모드 영속화 엔드포인트 제공 시 PATCH 호출 추가
  };

  const formatRelative = (ts: number) => {
    const locale = i18n?.language || "en";
    return formatRelativeOrDate(ts, locale, 30);
  };

  const mainNavItems = [
    { href: "/", icon: MessageSquare, label: t("nav.chat") },
    { href: "/artifacts", icon: FileText, label: t("nav.artifacts") },
    { href: "/portfolio", icon: PieChart, label: t("nav.portfolio") },
    { href: "/settings", icon: User, label: t("nav.mypage") },
    { href: "/discover", icon: Sparkles, label: t("nav.discover") },
  ];

  // 새 채팅 시작
  const handleNewChat = () => {
    clearMessages();
    setCurrentThreadId("");
    if (pathname !== "/") {
      router.push("/");
    }
  };

  // Recent Chats: Demo는 하드코딩, Live는 API 연동
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const recentChats =
    mode === "live"
      ? sessions.map((s: any) => ({
          id: s.conversation_id || s.id || s.thread_id || s.uuid,
          title: s.title || "Untitled",
          createdAt: s.last_message_at
            ? Date.parse(s.last_message_at)
            : (s.created_at ? Date.parse(s.created_at) : now),
        }))
      : [
          { id: "1", title: "삼성전자 투자 분석 요청", createdAt: now - 2 * DAY },
          { id: "2", title: "포트폴리오 리밸런싱", createdAt: now - 5 * DAY },
          { id: "3", title: "미국 주식 시장 전망", createdAt: now - 7 * DAY },
        ];

  if (isCollapsed) {
    return (
      <aside
        className="fixed left-0 top-0 h-screen w-[60px] flex flex-col z-10 transition-all duration-300"
        style={{
          backgroundColor: "var(--lnb-background)",
          borderRight: "1px solid var(--lnb-border)"
        }}
      >
        {/* Collapsed Header: 펼치기 버튼만 */}
        <div
          className="flex items-center justify-center"
          style={{
            height: "56px",
            minHeight: "56px",
            maxHeight: "56px",
            borderBottom: "1px solid var(--lnb-border)"
          }}
        >
          <button
            onClick={() => setCollapsed(false)}
            className="w-8 h-8 flex items-center justify-center rounded transition-colors duration-150"
            style={{ color: "var(--lnb-text-muted)" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--lnb-hover-bg)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            aria-label={t("nav.expandMenu")}
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>

        {/* 새 채팅 버튼 (collapsed) */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full h-12 flex items-center justify-center rounded-lg transition-colors duration-150"
            style={{ backgroundColor: "var(--lnb-active-bg)" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-600)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--lnb-active-bg)"}
            aria-label={t("nav.newChat")}
          >
            <Plus className="w-4 h-4" style={{ color: "var(--lnb-active-text)" }} />
          </button>
        </div>

        {/* Collapsed Nav Icons */}
        <nav className="flex flex-col gap-0.5 px-3 items-start">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center w-full h-12 rounded-lg transition-colors duration-150"
                style={{
                  backgroundColor: isActive ? "var(--lnb-hover-bg)" : "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)"
                }}
                onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = "var(--lnb-recent-hover)")}
                onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = "transparent")}
                title={item.label}
              >
                <Icon className="w-4 h-4" />
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-10 transition-all duration-300 overflow-hidden"
      style={{
        backgroundColor: "var(--lnb-background)",
        borderRight: "1px solid var(--lnb-border)"
      }}
    >
      {menuOpenId && (
        <div className="fixed inset-0 z-modal" style={{ pointerEvents: "auto" }} onClick={() => { setMenuOpenId(null); setEditingId(null); setEditingValue(""); }} />
      )}
      {/* Header: 로고 + 접기 버튼 */}
      <div
        className="flex items-center justify-between px-4"
        style={{
          height: "56px",
          minHeight: "56px",
          maxHeight: "56px",
          borderBottom: "1px solid var(--lnb-border)"
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--lnb-active-bg)" }}
          >
            <span className="text-sm font-bold" style={{ color: "var(--lnb-active-text)" }}>H</span>
          </div>
          <h1
            className="text-base font-semibold leading-none whitespace-nowrap animate-fadeInText"
            style={{ color: "var(--text-primary)" }}
          >
            HAMA
          </h1>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="w-8 h-8 flex items-center justify-center rounded transition-colors duration-150 flex-shrink-0"
          style={{ color: "var(--lnb-text-muted)" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--lnb-hover-bg)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          aria-label={t("nav.collapseMenu")}
        >
          <PanelLeft className="w-5 h-5" />
        </button>
      </div>

      {/* 새 채팅 버튼 */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full h-12 flex items-center gap-2 pl-3 pr-4 rounded-lg text-sm font-medium transition-colors duration-150"
          style={{
            backgroundColor: "var(--lnb-active-bg)",
            color: "var(--lnb-active-text)"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-600)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--lnb-active-bg)"}
        >
          <Plus className="w-4 h-4" />
          <span className="whitespace-nowrap animate-fadeInText">{t("nav.newChat")}</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="px-3">
        <div className="flex flex-col gap-0.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 h-12 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{
                  backgroundColor: isActive ? "var(--lnb-hover-bg)" : "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)"
                }}
                onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = "var(--lnb-recent-hover)")}
                onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap animate-fadeInText">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Recent Chats - 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto mt-4 hover-scrollbar">
        <div className="px-3">
          <div
            className="px-3 -mx-3 pb-2"
            style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "var(--lnb-background)" }}
          >
            <h2
              className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap animate-fadeInText"
              style={{ color: "var(--lnb-text-muted)" }}
            >
              {t("nav.recentChats")}
            </h2>
          </div>
          <div className="flex flex-col gap-0.5">
            {recentChats.map((chat) => (
              <div key={chat.id} className="group relative">
                <div
                  role="button"
                  tabIndex={0}
                  className="flex items-center justify-between gap-2 px-3 h-14 rounded-lg transition-colors duration-150 text-left w-full"
                  style={{ backgroundColor: "transparent", cursor: "pointer", userSelect: "none" }}
                  onClick={() => openSession(chat.id)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--lnb-recent-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div className="flex flex-col items-start justify-center gap-0.5 overflow-hidden">
                    {editingId === chat.id ? (
                      <input
                        className="w-full text-sm px-2 py-1 rounded border"
                        style={{ borderColor: "var(--border-default)", color: "var(--lnb-text)", backgroundColor: "transparent" }}
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setEditingId(null); setEditingValue(''); } }}
                        onBlur={() => commitRename()}
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm truncate w-full animate-fadeInText" style={{ color: "var(--lnb-text)" }}>{chat.title || 'Untitled'}</span>
                    )}
                    <span
                      className="text-xs whitespace-nowrap animate-fadeInText"
                      style={{ color: "var(--lnb-text-muted)" }}
                      title={formatAbsoluteDate(chat.createdAt, i18n?.language || 'en')}
                    >
                      {formatRelative(chat.createdAt)}
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <div
                      className="w-7 h-7 flex items-center justify-center rounded hover:opacity-80"
                      style={{ backgroundColor: "var(--lnb-background)", color: "var(--lnb-text-muted)", border: "1px solid var(--border-default)", cursor: "pointer", userSelect: "none" }}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const menuW = 200; // match min-w-[200px]
                        const margin = 8;
                        const x = Math.min(
                          Math.max(margin, rect.right - menuW),
                          window.innerWidth - menuW - margin
                        );
                        const estH = 90; // estimated menu height
                        const y = Math.min(rect.bottom + margin, window.innerHeight - estH - margin);
                        setMenuPos({ x, y });
                        setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setMenuOpenId(menuOpenId === chat.id ? null : chat.id); } }}
                      aria-label="menu"
                    >
                      ⋯
                    </div>
                  </div>
                </div>
                {menuOpenId === chat.id && (
                  <div className="fixed z-toast min-w-[200px] rounded-md shadow-lg border py-1 pointer-events-auto"
                       style={{ backgroundColor: "var(--container-background)", borderColor: "var(--border-default)", left: `${menuPos.x}px`, top: `${menuPos.y}px`, zIndex: 9999 }}
                       onMouseDown={(e) => e.stopPropagation()}
                       onClick={(e) => e.stopPropagation()}>
                    <button className="w-full text-left px-3 py-2 text-sm hover:opacity-80" onClick={() => startRename(chat.id, chat.title || '')}>{t('common.rename')}</button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:opacity-80" style={{ color: "var(--text-error)" }} onClick={() => handleDeleteSession(chat.id)}>{t('common.delete')}</button>
                  </div>
                )}
              </div>
            ))}
            {mode === 'live' && sessions.length >= sessionsLimit && sessionsLimit < 100 && (
              <div className="px-3 py-2">
                <button
                  className="w-full h-9 rounded border text-sm font-medium hover:opacity-80"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)', background: 'transparent' }}
                  onClick={(e) => { e.stopPropagation(); setSessionsLimit(Math.min(100, sessionsLimit + 20)); }}
                >
                  {t('common.loadMore')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Theme Toggle, Language Selector & User Info - 하단 고정 */}
      <div
        className="p-3 space-y-2"
        style={{ borderTop: "1px solid var(--lnb-border)" }}
      >
        {/* Theme Toggle & Language Selector */}
        <div className="flex items-center justify-between px-3 py-2 gap-2">
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <DevDemoToggle />
          </div>
          <ThemeToggle />
        </div>

        {/* User Info */}
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150"
          style={{ backgroundColor: "transparent" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--lnb-hover-bg)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--lnb-text-muted)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--lnb-active-text)" }}>김</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate animate-fadeInText" style={{ color: "var(--lnb-text)" }}>
              김투자
            </p>
            <p className="text-xs truncate animate-fadeInText" style={{ color: "var(--lnb-text-muted)" }}>
              프리미엄 플랜
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

