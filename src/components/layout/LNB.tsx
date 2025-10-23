"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/common/LanguageSelector";
import ThemeToggle from "@/components/common/ThemeToggle";

/**
 * LNB (Left Navigation Bar) Component
 *
 * 좌측 고정 사이드바 (260px)
 * - 라이트 테마 (흰색 배경)
 * - 상단: 로고 + 접기 버튼
 * - + 새 채팅 버튼
 * - 주요 내비게이션: 채팅, 아티팩트, 포트폴리오, 마이페이지, 디스커버
 * - 최근 채팅 (스크롤 영역)
 * - 하단: 사용자 정보
 *
 * Mockup 이미지 기반 (시작 제안 카드뷰.png)
 */
export default function LNB() {
  const pathname = usePathname();
  const { isCollapsed, setCollapsed } = useLNBWidth();
  const { t } = useTranslation();

  const mainNavItems = [
    { href: "/", icon: MessageSquare, label: t("nav.chat") },
    { href: "/artifacts", icon: FileText, label: t("nav.artifacts") },
    { href: "/portfolio", icon: PieChart, label: t("nav.portfolio") },
    { href: "/settings", icon: User, label: t("nav.mypage") },
    { href: "/discover", icon: Sparkles, label: t("nav.discover") },
  ];

  // Phase 1: Recent Chats는 하드코딩 (Phase 3에서 API 연동)
  const recentChats = [
    { id: "1", title: "삼성전자 투자 분석 요청", date: "2일 전" },
    { id: "2", title: "포트폴리오 리밸런싱", date: "5일 전" },
    { id: "3", title: "미국 주식 시장 전망", date: "1주 전" },
  ];

  if (isCollapsed) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-[60px] bg-white border-r border-[#e5e7eb] flex flex-col z-10 transition-all duration-300">
        {/* Collapsed Header: 펼치기 버튼만 */}
        <div className="flex items-center justify-center border-b border-[#e5e7eb]" style={{ height: "56px", minHeight: "56px", maxHeight: "56px" }}>
          <button
            onClick={() => setCollapsed(false)}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f4f6] transition-colors duration-150"
            aria-label="사이드바 펼치기"
          >
            <PanelLeft className="w-5 h-5" style={{ color: "#6b7280" }} />
          </button>
        </div>

        {/* 새 채팅 버튼 (collapsed) */}
        <div className="p-3">
          <button
            className="w-10 h-12 flex items-center justify-center rounded-lg transition-colors duration-150"
            style={{ backgroundColor: "#3b82f6" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
            aria-label="새 채팅 시작"
          >
            <Plus className="w-4 h-4 text-white" />
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
                className={`
                  flex items-center justify-center w-10 h-12 rounded-lg
                  transition-colors duration-150
                  ${
                    isActive
                      ? "bg-[#e5e7eb]"
                      : "hover:bg-[#f9fafb]"
                  }
                `}
                style={{ color: isActive ? "#171717" : "#6b7280" }}
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
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-[#e5e7eb] flex flex-col z-10 transition-all duration-300 overflow-hidden">
      {/* Header: 로고 + 접기 버튼 */}
      <div className="flex items-center justify-between px-4 border-b border-[#e5e7eb]" style={{ height: "56px", minHeight: "56px", maxHeight: "56px" }}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#3b82f6" }}>
            <span className="text-sm font-bold text-white">H</span>
          </div>
          <h1
            className="text-base font-semibold leading-none whitespace-nowrap animate-fadeInText"
            style={{ color: "#171717" }}
          >
            HAMA
          </h1>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f4f6] transition-colors duration-150 flex-shrink-0"
          aria-label="사이드바 접기"
        >
          <PanelLeft className="w-5 h-5" style={{ color: "#6b7280" }} />
        </button>
      </div>

      {/* 새 채팅 버튼 */}
      <div className="p-3">
        <button
          className="w-full h-12 flex items-center gap-2 pl-3 pr-4 text-white rounded-lg text-sm font-medium transition-colors duration-150"
          style={{ backgroundColor: "#3b82f6" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
        >
          <Plus className="w-4 h-4" />
          <span className="whitespace-nowrap animate-fadeInText">새 채팅</span>
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
                className={`
                  flex items-center gap-3 px-3 h-12 rounded-lg text-sm
                  transition-colors duration-150
                  ${
                    isActive
                      ? "bg-[#e5e7eb] font-medium"
                      : "hover:bg-[#f9fafb]"
                }
              `}
                style={{ color: isActive ? "#171717" : "#6b7280" }}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium whitespace-nowrap animate-fadeInText">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Recent Chats - 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin mt-4">
        <div className="px-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-2 px-3 whitespace-nowrap animate-fadeInText" style={{ color: "#9ca3af" }}>
            최근 채팅
          </h2>
          <div className="flex flex-col gap-0.5">
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                className="
                  flex flex-col items-start justify-center gap-0.5 px-3 h-14 rounded-lg
                  hover:bg-[#f9fafb]
                  transition-colors duration-150
                  text-left w-full
                "
              >
                <span className="text-sm truncate w-full animate-fadeInText" style={{ color: "#374151" }}>{chat.title}</span>
                <span className="text-xs whitespace-nowrap animate-fadeInText" style={{ color: "#9ca3af" }}>{chat.date}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Theme Toggle, Language Selector & User Info - 하단 고정 */}
      <div className="border-t border-[#e5e7eb] p-3 space-y-2">
        {/* Theme Toggle & Language Selector */}
        <div className="flex items-center justify-between px-3 py-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f3f4f6] transition-colors duration-150">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#9ca3af" }}>
            <span className="text-sm font-semibold text-white">김</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate animate-fadeInText" style={{ color: "#374151" }}>
              김투자
            </p>
            <p className="text-xs truncate animate-fadeInText" style={{ color: "#9ca3af" }}>
              프리미엄 플랜
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
