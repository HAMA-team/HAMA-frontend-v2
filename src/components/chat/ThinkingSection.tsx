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
 * 에이전트 타입별 번역 키
 */
const getAgentNameKey = (agent: string): string => {
  // agent 문자열을 소문자로 변환하여 매핑
  const agentLower = agent.toLowerCase();

  // 알려진 에이전트 타입
  const knownAgents = ["planner", "researcher", "strategy", "portfolio", "risk", "trading"];

  if (knownAgents.includes(agentLower)) {
    return `chat.thinking.agents.${agentLower}`;
  }

  return "chat.thinking.agents.unknown";
};


export default function ThinkingSection({ steps }: ThinkingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, i18n } = useTranslation();

  if (!steps || steps.length === 0) {
    return null;
  }

  // 가장 최근 thinking step (현재 진행 중인 작업)
  const latestStep = steps[steps.length - 1];

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
        className="w-full px-3 py-2.5 flex flex-col gap-1.5 transition-colors duration-150"
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
        {/* 첫 번째 줄: 제목 + 단계 수 + 아이콘 */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              {t("chat.thinking.title")}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              ({steps.length}{t("chat.thinking.steps")})
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            style={{ color: "var(--text-secondary)" }}
            strokeWidth={1.5}
          />
        </div>

        {/* 두 번째 줄: 현재 진행 중인 작업 (접혀있을 때만) */}
        {!isExpanded && latestStep && (
          <div className="flex items-center gap-1.5 w-full text-left">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {t("chat.thinking.current")}:
            </span>
            <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
              {latestStep.description}
            </span>
          </div>
        )}
      </button>

      {/* Content - Accordion */}
      <div
        id="thinking-content"
        className={`${isExpanded ? "" : "max-h-0 overflow-hidden"}`}
      >
        <div className="px-3 pb-3 pt-1">
          {steps.map((step, index) => {
            const Icon = getAgentIcon(step.agent);
            const agentNameKey = getAgentNameKey(step.agent);

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
                    <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{t(agentNameKey)}</span>
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
