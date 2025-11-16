"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatRelativeTime, formatAbsoluteDate } from "@/lib/utils";
import {
  ChevronDown,
  FileText,
  Search,
  Lightbulb,
  Database,
  Wrench,
  Cpu,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { ThinkingStep, AgentType } from "@/lib/types/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * ThinkingSection Component
 *
 * AI 사고 과정을 접기/펼치기 가능한 Accordion으로 표시
 * - ReasoningEventStreamGuide 기반 Phase별 색상/아이콘
 * - Depth 기반 들여쓰기
 * - Status별 시각적 구분
 *
 * @see docs/reasoningEentStreamGuide.md
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */

interface ThinkingSectionProps {
  steps: ThinkingStep[];
}

type ReasoningPhase =
  | "supervision"
  | "planning"
  | "routing"
  | "agent_execution"
  | "data_collection"
  | "tool"
  | "llm"
  | "hitl"
  | "finalization"
  | "system";

type ReasoningStatus = "start" | "in_progress" | "complete" | "info" | "error";

/**
 * Phase별 색상 매핑 (ReasoningEventStreamGuide 권장)
 */
const getPhaseColor = (phase: string): string => {
  const phaseColors: Record<string, string> = {
    planning: "#3b82f6",      // 파랑
    data_collection: "#06b6d4", // 청록
    llm: "#8b5cf6",           // 보라
    tool: "#f59e0b",          // 주황
    finalization: "#9ca3af",  // 회색
    supervision: "#10b981",   // 녹색
    routing: "#3b82f6",       // 파랑
    agent_execution: "#6366f1", // 인디고
    hitl: "#ef4444",          // 빨강
    system: "#71717a",        // 회색
  };
  return phaseColors[phase] || "#9ca3af";
};

/**
 * Phase별 아이콘 매핑
 */
const getPhaseIcon = (phase: string) => {
  const phaseIcons: Record<string, any> = {
    planning: FileText,
    data_collection: Database,
    llm: Cpu,
    tool: Wrench,
    finalization: CheckCircle,
    supervision: CheckCircle,
    routing: FileText,
    agent_execution: Search,
    hitl: AlertCircle,
    system: FileText,
  };
  return phaseIcons[phase] || FileText;
};

/**
 * Status별 아이콘 매핑
 */
const getStatusIcon = (status: string) => {
  switch (status) {
    case "start":
      return null;
    case "in_progress":
      return Loader2;
    case "complete":
      return CheckCircle;
    case "error":
      return AlertCircle;
    default:
      return null;
  }
};

/**
 * 에이전트 타입별 아이콘 매핑 (Fallback)
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
const getAgentNameKey = (agent: string | undefined | null): string => {
  const agentLower = (agent || "").toLowerCase();
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
            // ReasoningEvent 우선 사용, 없으면 fallback
            const reasoning = step.reasoning_event;
            const phase = reasoning?.phase || "agent_execution";
            const status = reasoning?.status || "complete";
            const depth = reasoning?.depth || 0;

            // Phase 기반 아이콘/색상
            const PhaseIcon = getPhaseIcon(phase);
            const phaseColor = getPhaseColor(phase);
            const StatusIcon = getStatusIcon(status);

            // Fallback: agent 기반 아이콘
            const FallbackIcon = getAgentIcon(step.agent);
            const Icon = PhaseIcon || FallbackIcon;

            const agentNameKey = getAgentNameKey(step.agent);

            // Depth 기반 들여쓰기 (8px per level)
            const indentation = depth * 8;

            return (
              <div
                key={index}
                className="flex flex-col gap-1 py-1.5"
                style={{
                  borderBottom:
                    index < steps.length - 1 ? "1px solid var(--border-default)" : "none",
                  paddingLeft: `${indentation}px`,
                }}
              >
                {/* Step Header */}
                <div className="flex items-center gap-2">
                  {/* Phase 아이콘 (색상 적용) */}
                  <div className="flex-shrink-0">
                    <Icon
                      className={`w-4 h-4 ${status === "in_progress" ? "animate-spin" : ""}`}
                      style={{ color: phaseColor }}
                      strokeWidth={1.5}
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <div className="text-xs flex items-baseline gap-1 flex-1 min-w-0" style={{ lineHeight: "18px" }}>
                      <span className="font-medium flex-shrink-0" style={{ color: phaseColor }}>
                        {t(agentNameKey)}
                      </span>
                      <span className="flex-shrink-0" style={{ color: "var(--text-muted)" }}> · </span>
                      <div className="flex-1 min-w-0" style={{ color: "var(--text-primary)" }}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ node, ...props }) => <span {...props} />,
                            strong: ({ node, ...props }) => <strong style={{ fontWeight: 600 }} {...props} />,
                            em: ({ node, ...props }) => <em {...props} />,
                            code: ({ node, className, children, ...props }) => (
                              <code
                                style={{
                                  backgroundColor: "var(--code-bg)",
                                  padding: "1px 3px",
                                  borderRadius: "2px",
                                  fontSize: "0.9em",
                                  fontFamily: "monospace",
                                }}
                                {...props}
                              >
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {step.description}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Status 아이콘 (우측) */}
                    {StatusIcon && (
                      <div className="flex-shrink-0">
                        <StatusIcon
                          className={`w-3 h-3 ${status === "in_progress" ? "animate-spin" : ""}`}
                          style={{ color: status === "error" ? "var(--error-500)" : "var(--text-muted)" }}
                          strokeWidth={1.5}
                        />
                      </div>
                    )}

                    {/* 시간 */}
                    <div
                      className="text-[11px] whitespace-nowrap flex-shrink-0"
                      style={{ color: "var(--text-muted)" }}
                      title={formatAbsoluteDate(step.timestamp, i18n?.language || 'en')}
                    >
                      {formatRelativeTime(step.timestamp, i18n?.language || 'en')}
                    </div>
                  </div>
                </div>

                {/* Thinking Content (실시간 사고 과정) */}
                {step.content && step.content.length > 0 && (
                  <div className="ml-6 mt-1">
                    <div className="flex items-start gap-1">
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>💭</span>
                      <div
                        className="text-xs flex-1"
                        style={{
                          color: "var(--text-muted)",
                          lineHeight: "1.5",
                        }}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ node, ...props }) => <p style={{ marginBottom: "8px" }} {...props} />,
                            strong: ({ node, ...props }) => <strong style={{ fontWeight: 600 }} {...props} />,
                            em: ({ node, ...props }) => <em {...props} />,
                            ul: ({ node, ...props }) => (
                              <ul style={{ marginLeft: "16px", marginBottom: "8px", listStyleType: "disc" }} {...props} />
                            ),
                            li: ({ node, ...props }) => <li style={{ marginBottom: "4px" }} {...props} />,
                            code: ({ node, className, children, ...props }) => {
                              const isInline = !className;
                              if (isInline) {
                                return (
                                  <code
                                    style={{
                                      backgroundColor: "var(--code-bg)",
                                      padding: "2px 4px",
                                      borderRadius: "3px",
                                      fontSize: "0.9em",
                                      fontFamily: "monospace",
                                    }}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }
                              // 코드 블록
                              return (
                                <code
                                  className={className}
                                  style={{
                                    display: "block",
                                    backgroundColor: "var(--code-bg)",
                                    padding: "8px",
                                    borderRadius: "4px",
                                    fontSize: "0.85em",
                                    fontFamily: "monospace",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    marginBottom: "8px",
                                  }}
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                            pre: ({ node, ...props }) => <pre style={{ margin: 0 }} {...props} />,
                            table: ({ node, ...props }) => (
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                  marginBottom: "12px",
                                  fontSize: "0.85em",
                                }}
                                {...props}
                              />
                            ),
                            thead: ({ node, ...props }) => <thead {...props} />,
                            tbody: ({ node, ...props }) => <tbody {...props} />,
                            tr: ({ node, ...props }) => <tr {...props} />,
                            th: ({ node, ...props }) => (
                              <th
                                style={{
                                  border: "1px solid var(--border-emphasis)",
                                  padding: "6px 8px",
                                  backgroundColor: "var(--lnb-background)",
                                  fontWeight: 600,
                                  textAlign: "left",
                                }}
                                {...props}
                              />
                            ),
                            td: ({ node, ...props }) => (
                              <td
                                style={{
                                  border: "1px solid var(--border-emphasis)",
                                  padding: "6px 8px",
                                }}
                                {...props}
                              />
                            ),
                          }}
                        >
                          {step.content.replace(/\\n/g, '\n')}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
