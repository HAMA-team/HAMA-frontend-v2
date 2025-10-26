"use client";

import React from "react";
import { PieChart, TrendingUp, Sparkles, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppModeStore } from "@/store/appModeStore";

interface SuggestionCard {
  icon: React.ElementType;
  iconBg: string;
  iconFg: string;
  title: string;
  description: string;
  prompt: string;
}

interface ChatEmptyStateProps {
  onSuggestionClick: (prompt: string) => void;
  onTestHITL: () => void;
}

/**
 * ChatEmptyState Component
 *
 * Chat 빈 상태 UI (환영 메시지 + 제안 카드 4개)
 * - i18n 적용 (useTranslation 사용)
 * - Dynamic import로 SSR hydration 에러 방지
 */
export default function ChatEmptyState({ onSuggestionClick, onTestHITL }: ChatEmptyStateProps) {
  const { t } = useTranslation();
  const { mode } = useAppModeStore();

  const suggestions: SuggestionCard[] = [
    {
      icon: PieChart,
      iconBg: "var(--icon-blue-bg)",
      iconFg: "var(--icon-blue-fg)",
      title: t("chat.emptyState.suggestions.portfolio.title"),
      description: t("chat.emptyState.suggestions.portfolio.description"),
      prompt: t("chat.emptyState.suggestions.portfolio.prompt"),
    },
    {
      icon: TrendingUp,
      iconBg: "var(--icon-green-bg)",
      iconFg: "var(--icon-green-fg)",
      title: t("chat.emptyState.suggestions.market.title"),
      description: t("chat.emptyState.suggestions.market.description"),
      prompt: t("chat.emptyState.suggestions.market.prompt"),
    },
    {
      icon: Sparkles,
      iconBg: "var(--icon-purple-bg)",
      iconFg: "var(--icon-purple-fg)",
      title: t("chat.emptyState.suggestions.recommendation.title"),
      description: t("chat.emptyState.suggestions.recommendation.description"),
      prompt: t("chat.emptyState.suggestions.recommendation.prompt"),
    },
    {
      icon: Shield,
      iconBg: "var(--icon-orange-bg)",
      iconFg: "var(--icon-orange-fg)",
      title: t("chat.emptyState.suggestions.risk.title"),
      description: t("chat.emptyState.suggestions.risk.description"),
      prompt: t("chat.emptyState.suggestions.risk.prompt"),
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center pb-32">
      <div className="max-w-[800px] mx-auto px-4 w-full flex flex-col items-center">
        {/* Logo */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ backgroundColor: "var(--primary-500)" }}
        >
          <span className="text-2xl font-bold" style={{ color: "var(--lnb-active-text)" }}>H</span>
        </div>

        {/* Greeting */}
        <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: "var(--text-primary)" }}>
          {t("chat.emptyState.greeting")}
        </h1>
        <p className="text-base mb-12 text-center" style={{ color: "var(--text-secondary)" }}>
          {t("chat.emptyState.subGreeting")}
        </p>

        {/* Suggestion Cards - 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[600px] w-full">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion.prompt)}
                className="flex flex-col items-start p-5 rounded-2xl border transition-all duration-150 hover:shadow-md min-w-0"
                style={{
                  backgroundColor: "var(--container-background)",
                  borderColor: "var(--border-default)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-emphasis)";
                  e.currentTarget.style.backgroundColor = "var(--lnb-recent-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.backgroundColor = "var(--container-background)";
                }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: suggestion.iconBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: suggestion.iconFg }} />
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold mb-1 break-words" style={{ color: "var(--text-primary)" }}>
                  {suggestion.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-left break-words" style={{ color: "var(--text-secondary)" }}>
                  {suggestion.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* TEST: HITL 패널 테스트 버튼 (Demo 모드에서만 표시) */}
        {mode === "demo" && (
          <button
            onClick={onTestHITL}
            className="mt-8 px-6 py-3 rounded-lg font-medium transition-colors duration-150"
            style={{
              backgroundColor: "var(--warning-500)",
              color: "var(--lnb-active-text)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--warning-600)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--warning-500)"}
          >
            {t("chat.hitlTest")}
          </button>
        )}
      </div>
    </div>
  );
}
