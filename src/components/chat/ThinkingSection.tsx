"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatRelativeTime, formatAbsoluteDate } from "@/lib/utils";
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
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
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


export default function ThinkingSection({ steps }: ThinkingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { i18n } = useTranslation();

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-lg border overflow-hidden mb-4"
      style={{
        backgroundColor: "var(--lnb-recent-hover)",
        borderColor: "var(--border-default)",
      }}
      role="region"
      aria-label="AI 생각 과정"
    >
      {/* Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2.5 flex items-center justify-between transition-colors duration-150"
        style={{
          cursor: "pointer",
          backgroundColor: "transparent"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--lnb-hover-bg)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        aria-expanded={isExpanded}
        aria-controls="thinking-content"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            AI 생각 과정
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            ({steps.length}단계)
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          style={{ color: "var(--text-secondary)" }}
          strokeWidth={1.5}
        />
      </button>

      {/* Content - Accordion */}
      <div
        id="thinking-content"
        className={`${isExpanded ? "" : "max-h-0 overflow-hidden"}`}
      >
        <div className="px-3 pb-3 pt-1">
          {steps.map((step, index) => {
            const Icon = getAgentIcon(step.agent);
            const agentName = getAgentName(step.agent);

            return (
              <div
                key={index}
                className="flex items-center gap-2 py-1.5"
                style={{
                  borderBottom:
                    index < steps.length - 1 ? "1px solid var(--border-default)" : "none",
                }}
              >
                <div className="flex-shrink-0">
                  <Icon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div className="text-xs" style={{ color: "var(--text-primary)", lineHeight: "18px" }}>
                    <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{agentName}</span>
                    <span> · {step.description}</span>
                  </div>
                  <div
                    className="text-[11px] ml-3 whitespace-nowrap"
                    style={{ color: "var(--text-muted)" }}
                    title={formatAbsoluteDate(step.timestamp, i18n?.language || 'en')}
                  >
                    {formatRelativeTime(step.timestamp, i18n?.language || 'en')}
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
