"use client";

import React, { useState } from "react";
import { ChevronDown, FileText, Search, Lightbulb } from "lucide-react";
import { ThinkingStep, AgentType } from "@/lib/types/chat";

/**
 * ThinkingSection Component
 *
 * AI 사고 과정을 접기/펼치기 가능한 Accordion으로 표시
 * - Claude 스타일 디자인
 * - 기본 접힘 상태
 * - 각 Step: 아이콘 + 제목 + 설명 + 시간
 *
 * @see DesignSystem.md - Section 11.3 Thinking Section
 * @see references/mockup_references/AI 생각 과정 뷰.png
 * @see references/img_references/Claude LLM Thinking.png
 */

interface ThinkingSectionProps {
  steps: ThinkingStep[];
}

/**
 * 에이전트 타입별 아이콘 매핑
 */
const getAgentIcon = (agent: AgentType) => {
  switch (agent) {
    case "planner":
      return FileText;
    case "researcher":
      return Search;
    case "strategy":
      return Lightbulb;
    default:
      return FileText;
  }
};

/**
 * 에이전트 타입별 한글 이름
 * TODO: i18n 적용 시 번역 키로 변경
 */
const getAgentName = (agent: AgentType): string => {
  switch (agent) {
    case "planner":
      return "계획 수립";
    case "researcher":
      return "데이터 수집";
    case "strategy":
      return "전략 분석";
    default:
      return "분석 중";
  }
};

/**
 * 시간 포맷팅 (예: "2초 전")
 * TODO: i18n 적용 시 번역 필요
 */
const formatTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  return `${Math.floor(diff / 3600)}시간 전`;
};

export default function ThinkingSection({ steps }: ThinkingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-lg border overflow-hidden mb-4"
      style={{
        backgroundColor: "#f9fafb",
        borderColor: "#e5e7eb",
      }}
      role="region"
      aria-label="AI 생각 과정"
    >
      {/* Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between transition-colors duration-150"
        style={{ cursor: "pointer" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f3f4f6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        aria-expanded={isExpanded}
        aria-controls="thinking-content"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "#6b7280" }}>
            AI 생각 과정
          </span>
          <span className="text-xs" style={{ color: "#9ca3af" }}>
            ({steps.length}단계)
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          style={{ color: "#6b7280" }}
          strokeWidth={1.5}
        />
      </button>

      {/* Content - Accordion */}
      <div
        id="thinking-content"
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? "max-h-[1000px]" : "max-h-0"
        }`}
      >
        <div className="px-4 pb-4 pt-2">
          {steps.map((step, index) => {
            const Icon = getAgentIcon(step.agent);
            const agentName = getAgentName(step.agent);

            return (
              <div
                key={index}
                className="flex items-start gap-2 py-2"
                style={{
                  borderBottom:
                    index < steps.length - 1 ? "1px solid #e5e7eb" : "none",
                }}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <Icon
                    className="w-5 h-5"
                    style={{ color: "#6b7280" }}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <div className="text-sm font-semibold mb-1" style={{ color: "#171717" }}>
                    {agentName}
                  </div>

                  {/* Description */}
                  <div
                    className="text-xs mb-1"
                    style={{ color: "#6b7280", lineHeight: "18px" }}
                  >
                    {step.description}
                  </div>

                  {/* Time */}
                  <div className="text-xs" style={{ color: "#9ca3af" }}>
                    {formatTime(step.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
