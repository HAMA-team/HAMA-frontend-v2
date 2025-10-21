"use client";

import React from "react";
import { PieChart, TrendingUp, Sparkles, Shield } from "lucide-react";
import ChatInput from "@/components/layout/ChatInput";

/**
 * Home Page - Chat Empty State
 *
 * 채팅 시작 전 초기 화면
 * - 환영 메시지
 * - 4개의 제안 카드 (2x2 그리드)
 * - 하단 고정 ChatInput
 */

interface SuggestionCard {
  icon: React.ElementType;
  iconBg: string;
  iconFg: string;
  title: string;
  description: string;
  prompt: string;
}

export default function Home() {
  const suggestions: SuggestionCard[] = [
    {
      icon: PieChart,
      iconBg: "#dbeafe",
      iconFg: "#3b82f6",
      title: "포트폴리오 현황",
      description: "현재 보유 자산과 수익률을 확인하세요",
      prompt: "내 포트폴리오 현황을 보여줘",
    },
    {
      icon: TrendingUp,
      iconBg: "#d1fae5",
      iconFg: "#10b981",
      title: "시장 분석",
      description: "최신 시장 동향과 투자 전략",
      prompt: "최근 시장 동향을 분석해줘",
    },
    {
      icon: Sparkles,
      iconBg: "#ede9fe",
      iconFg: "#8b5cf6",
      title: "종목 추천",
      description: "AI 기반 맞춤형 투자 아이디어",
      prompt: "내 투자 성향에 맞는 종목을 추천해줘",
    },
    {
      icon: Shield,
      iconBg: "#fed7aa",
      iconFg: "#f59e0b",
      title: "리스크 분석",
      description: "포트폴리오 위험 요소 점검",
      prompt: "내 포트폴리오의 리스크를 분석해줘",
    },
  ];

  const handleSuggestionClick = (prompt: string) => {
    // TODO: Phase 3에서 실제 채팅 전송 구현
    console.log("Suggestion clicked:", prompt);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#f5f5f5" }}>
      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-32">
        {/* Logo */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ backgroundColor: "#3b82f6" }}
        >
          <span className="text-2xl font-bold text-white">H</span>
        </div>

        {/* Greeting */}
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#171717" }}>
          안녕하세요!
        </h1>
        <p className="text-base mb-12" style={{ color: "#6b7280" }}>
          무엇을 도와드릴까요?
        </p>

        {/* Suggestion Cards - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-[600px] w-full">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.prompt)}
                className="flex flex-col items-start p-5 rounded-2xl border transition-all duration-150 hover:shadow-md"
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e5e7eb",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.backgroundColor = "#fafafa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.backgroundColor = "#ffffff";
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
                <h3 className="text-sm font-semibold mb-1" style={{ color: "#171717" }}>
                  {suggestion.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-left" style={{ color: "#6b7280" }}>
                  {suggestion.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Input - Fixed Bottom */}
      <ChatInput />
    </div>
  );
}
