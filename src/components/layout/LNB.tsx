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
import { getChatSessions, getChatHistory } from "@/lib/api/chat";

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
  const { clearMessages, addMessage, setCurrentThreadId } = useChatStore();
  const { t, i18n } = useTranslation();
  const { mode } = useAppModeStore();
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = React.useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;
    if (mode === "live") {
      setLoadingSessions(true);
      getChatSessions(20)
        .then((data: any[]) => {
          if (!mounted) return;
          setSessions(Array.isArray(data) ? data : []);
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
  }, [mode]);

  const openSession = async (conversationId: string) => {
    if (mode !== "live") return;
    try {
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

      list.forEach((m: any, idx: number) => {
        const rawRole = m.role ?? m.sender ?? m.author ?? "assistant";
        const role = String(rawRole).toLowerCase().includes("user") ? "user" : "assistant";
        const content = m.message ?? m.content ?? m.text ?? "";
        const ts = m.timestamp ?? m.created_at ?? m.time ?? new Date().toISOString();
        addMessage({ id: `restored-${idx}-${Date.now()}`, role, content, timestamp: ts, status: "sent" });
      });
      if (pathname !== "/") {
        router.push("/");
      }
    } catch (e) {
      console.error("Failed to open session", e);
      if (pathname !== "/") router.push("/");
    }
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
          id: s.conversation_id,
          title: s.title || "Untitled",
          createdAt: s.last_message_at ? Date.parse(s.last_message_at) : (s.created_at ? Date.parse(s.created_at) : now),
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
      <div className="flex-1 overflow-y-auto scrollbar-thin mt-4">
        <div className="px-3">
          <h2
            className="text-xs font-semibold uppercase tracking-wide mb-2 px-3 whitespace-nowrap animate-fadeInText"
            style={{ color: "var(--lnb-text-muted)" }}
          >
            {t("nav.recentChats")}
          </h2>
          <div className="flex flex-col gap-0.5">
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                className="flex flex-col items-start justify-center gap-0.5 px-3 h-14 rounded-lg transition-colors duration-150 text-left w-full"
                style={{ backgroundColor: "transparent" }}
                onClick={() => openSession(chat.id)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--lnb-recent-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <span className="text-sm truncate w-full animate-fadeInText" style={{ color: "var(--lnb-text)" }}>{chat.title}</span>
                <span
                  className="text-xs whitespace-nowrap animate-fadeInText"
                  style={{ color: "var(--lnb-text-muted)" }}
                  title={formatAbsoluteDate(chat.createdAt, i18n?.language || 'en')}
                >
                  {formatRelative(chat.createdAt)}
                </span>
              </button>
            ))}
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
