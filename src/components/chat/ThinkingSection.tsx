"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatRelativeTime, formatAbsoluteDate } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
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
 * - Phase/Agent 그룹화 (요약 헤더)
 * - Content 미리보기 (160자 제한)
 *
 * @see docs/reasoningEventStreamGuide.md
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */

interface ThinkingSectionProps {
  steps: ThinkingStep[];
}

interface StepGroup {
  phase: string;
  steps: ThinkingStep[];
  startIndex: number;
  endIndex: number;
}

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

/**
 * Phase별 번역 키
 */
const getPhaseNameKey = (phase: string): string => {
  const phaseKeys: Record<string, string> = {
    planning: "chat.thinking.phases.planning",
    data_collection: "chat.thinking.phases.dataCollection",
    llm: "chat.thinking.phases.llm",
    tool: "chat.thinking.phases.tool",
    finalization: "chat.thinking.phases.finalization",
    supervision: "chat.thinking.phases.supervision",
    routing: "chat.thinking.phases.routing",
    agent_execution: "chat.thinking.phases.agentExecution",
    hitl: "chat.thinking.phases.hitl",
    system: "chat.thinking.phases.system",
  };
  return phaseKeys[phase] || "chat.thinking.phases.unknown";
};

/**
 * Description에서 Phase 추론 (임시 방편)
 *
 * TODO: 백엔드에서 reasoning_event.phase를 올바르게 설정하면 이 함수 제거
 *
 * @see docs/reasoningEventStreamGuide.md - Phase 정의
 */
function inferPhaseFromDescription(description: string): string {
  const desc = description.toLowerCase();

  // 백엔드 실제 패턴 우선 매칭 (ThinkingStep3.png 분석 기반)
  // Supervision 패턴
  if (desc.includes("supervise") || desc.includes("supervisor") || desc.includes("master")) return "supervision";

  // Tool 실행 패턴 (call, import, export, API 호출 등)
  if (desc.includes("call end") || desc.includes("call start")) return "tool";
  if (desc.includes("/import") || desc.includes("/export")) return "tool";
  if (desc.includes("insertgraph") || desc.includes("insert_graph")) return "tool";
  if (desc.includes("api") || desc.includes("fetch_") || desc.includes("get_")) return "tool";

  // Data Collection 패턴
  if (desc.includes("data_worker") || desc.includes("collector") || desc.includes("database")) return "data_collection";
  if (desc.includes("loading") || desc.includes("fetching") || desc.includes("collecting")) return "data_collection";
  if (desc.includes("scraping") || desc.includes("crawling")) return "data_collection";

  // LLM 추론 패턴
  if (desc.includes("llm") || desc.includes("reasoning") || desc.includes("thinking")) return "llm";
  if (desc.includes("generating") || desc.includes("analyzing")) return "llm";
  if (desc.includes("completion") || desc.includes("chat")) return "llm";

  // Planning 패턴
  if (desc.includes("planner") || desc.includes("planning")) return "planning";
  if (desc.includes("strategy") || desc.includes("route")) return "planning";

  // 명시적 Phase 키워드 매칭 (한글)
  if (desc.includes("계획")) return "planning";
  if (desc.includes("데이터 수집")) return "data_collection";
  if (desc.includes("추론")) return "llm";
  if (desc.includes("도구 실행")) return "tool";
  if (desc.includes("조율")) return "supervision";
  if (desc.includes("라우팅")) return "routing";
  if (desc.includes("마무리")) return "finalization";
  if (desc.includes("승인") || desc.includes("hitl") || desc.includes("approval")) return "hitl";

  // Routing 패턴
  if (desc.includes("routing") || desc.includes("router")) return "routing";

  // Finalization 패턴 (구체적인 키워드만 사용, complete/done은 너무 광범위)
  if (desc.includes("finalization") || desc.includes("finalizing")) return "finalization";
  if (desc.includes("summary") || desc.includes("summarizing") || desc.includes("결론")) return "finalization";
  if (desc.includes("wrapping up") || desc.includes("finishing")) return "finalization";
  if (desc.includes("final response") || desc.includes("최종 응답")) return "finalization";

  // Fallback
  return "agent_execution";
}

/**
 * Steps를 Phase/Agent별로 그룹화
 */
function groupStepsByPhase(steps: ThinkingStep[]): StepGroup[] {
  const groups: StepGroup[] = [];
  let currentGroup: StepGroup | null = null;

  steps.forEach((step, index) => {
    // TODO: 백엔드에서 reasoning_event.phase를 올바르게 설정하면 inferPhaseFromDescription 제거
    const phase = step.reasoning_event?.phase || inferPhaseFromDescription(step.description);

    // 새로운 phase 그룹 시작 조건 (agent는 무시, phase만으로 그룹화)
    if (!currentGroup || currentGroup.phase !== phase) {
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = {
        phase,
        steps: [step],
        startIndex: index,
        endIndex: index,
      };
    } else {
      // 기존 그룹에 추가
      currentGroup.steps.push(step);
      currentGroup.endIndex = index;
    }
  });

  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
}

export default function ThinkingSection({ steps }: ThinkingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedContents, setExpandedContents] = useState<Set<string>>(new Set());
  const { t, i18n } = useTranslation();

  if (!steps || steps.length === 0) {
    return null;
  }

  // 가장 최근 thinking step (현재 진행 중인 작업)
  const latestStep = steps[steps.length - 1];

  // Phase/Agent별 그룹화
  const groups = groupStepsByPhase(steps);

  const toggleGroup = (groupIndex: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupIndex)) {
      newExpanded.delete(groupIndex);
    } else {
      newExpanded.add(groupIndex);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleContent = (stepKey: string) => {
    const newExpanded = new Set(expandedContents);
    if (newExpanded.has(stepKey)) {
      newExpanded.delete(stepKey);
    } else {
      newExpanded.add(stepKey);
    }
    setExpandedContents(newExpanded);
  };

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
          {groups.map((group, groupIndex) => {
            const isGroupExpanded = expandedGroups.has(groupIndex);
            const PhaseIcon = getPhaseIcon(group.phase);
            const phaseColor = getPhaseColor(group.phase);

            // 그룹 상태 계산
            const hasError = group.steps.some(s => s.reasoning_event?.status === "error");
            const hasInProgress = group.steps.some(s => s.reasoning_event?.status === "in_progress");
            const allComplete = group.steps.every(s => s.reasoning_event?.status === "complete");

            const groupStatus = hasError ? "error" : hasInProgress ? "in_progress" : allComplete ? "complete" : "info";
            const StatusIcon = getStatusIcon(groupStatus);

            return (
              <div
                key={`group-${groupIndex}`}
                className="mb-2"
                style={{
                  borderBottom: groupIndex < groups.length - 1 ? "1px solid var(--border-default)" : "none",
                  paddingBottom: "8px",
                }}
              >
                {/* 그룹 헤더 - 요약 (Phase · N단계 완료) */}
                <button
                  onClick={() => toggleGroup(groupIndex)}
                  className="w-full flex items-center gap-2 py-1.5 px-2 rounded transition-colors duration-150"
                  style={{
                    cursor: "pointer",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--lnb-hover-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* 펼침/접기 아이콘 */}
                  {isGroupExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: phaseColor }} strokeWidth={1.5} />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: phaseColor }} strokeWidth={1.5} />
                  )}

                  {/* Phase 아이콘 */}
                  <PhaseIcon
                    className={`w-4 h-4 flex-shrink-0 ${groupStatus === "in_progress" ? "animate-spin" : ""}`}
                    style={{ color: phaseColor }}
                    strokeWidth={1.5}
                  />

                  {/* Phase 이름 · N단계 */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-xs font-semibold" style={{ color: phaseColor }}>
                      {t(getPhaseNameKey(group.phase))}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      · {group.steps.length}{t("chat.thinking.steps")}
                    </span>
                    {groupStatus === "complete" && (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {t("chat.thinking.complete")}
                      </span>
                    )}
                  </div>

                  {/* Status 아이콘 */}
                  {StatusIcon && (
                    <StatusIcon
                      className={`w-3.5 h-3.5 flex-shrink-0 ${groupStatus === "in_progress" ? "animate-spin" : ""}`}
                      style={{ color: groupStatus === "error" ? "var(--error-500)" : "var(--text-muted)" }}
                      strokeWidth={1.5}
                    />
                  )}
                </button>

                {/* 그룹 내 Steps (펼쳐졌을 때만) */}
                {isGroupExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {group.steps.map((step, stepIndex) => {
                      const reasoning = step.reasoning_event;
                      const status = reasoning?.status || "complete";
                      const depth = reasoning?.depth || 0;
                      const stepKey = `${step.timestamp}-${groupIndex}-${stepIndex}`;

                      const StepStatusIcon = getStatusIcon(status);
                      const agentNameKey = getAgentNameKey(step.agent);

                      // Depth 기반 들여쓰기 (8px per level)
                      const indentation = depth * 8;

                      // Content 미리보기 (160자 제한)
                      const hasContent = step.content && step.content.length > 0;
                      const isContentExpanded = expandedContents.has(stepKey);
                      const contentPreviewLimit = 160;
                      const needsExpand = hasContent && step.content!.length > contentPreviewLimit;
                      const displayContent = needsExpand && !isContentExpanded
                        ? step.content!.slice(0, contentPreviewLimit) + "..."
                        : step.content;

                      return (
                        <div
                          key={stepKey}
                          className="py-1"
                          style={{ paddingLeft: `${indentation}px` }}
                        >
                          {/* Step Header */}
                          <div className="flex items-center gap-2">
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

                              {/* Status 아이콘 */}
                              {StepStatusIcon && (
                                <div className="flex-shrink-0">
                                  <StepStatusIcon
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

                          {/* Thinking Content (실시간 사고 과정) - 160자 제한 */}
                          {hasContent && (
                            <div className="ml-6 mt-1">
                              <div className="flex items-start gap-1">
                                <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>💭</span>
                                <div className="flex-1">
                                  <div
                                    className="text-xs"
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
                                        ul: ({ node, children, ...props }) => (
                                          <ul style={{ marginLeft: "16px", marginBottom: "8px", listStyleType: "disc" }} {...props}>
                                            {children}
                                          </ul>
                                        ),
                                        li: ({ node, children, ...props }) => (
                                          <li style={{ marginBottom: "4px" }} {...props}>
                                            {children}
                                          </li>
                                        ),
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
                                      {displayContent!.replace(/\\n/g, '\n')}
                                    </ReactMarkdown>
                                  </div>

                                  {/* 더 보기 버튼 */}
                                  {needsExpand && (
                                    <button
                                      onClick={() => toggleContent(stepKey)}
                                      className="text-xs mt-1 px-2 py-0.5 rounded transition-colors duration-150"
                                      style={{
                                        color: phaseColor,
                                        backgroundColor: "transparent",
                                        border: `1px solid ${phaseColor}`,
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = phaseColor;
                                        e.currentTarget.style.color = "var(--lnb-active-text)";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                        e.currentTarget.style.color = phaseColor;
                                      }}
                                    >
                                      {isContentExpanded ? t("chat.thinking.showLess") : t("chat.thinking.showMore")}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
