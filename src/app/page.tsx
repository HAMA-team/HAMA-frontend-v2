"use client";

import React from "react";
import dynamic from "next/dynamic";
import ChatView from "@/components/chat/ChatView";
import HITLPanel from "@/components/hitl/HITLPanel";
import { useChatStore } from "@/store/chatStore";
import { useArtifactStore } from "@/store/artifactStore";
import { createArtifact } from "@/lib/api/artifacts";
import { Message, ThinkingStep, ApprovalRequest } from "@/lib/types/chat";
import { useDialogStore } from "@/store/dialogStore";
import { approveAction } from "@/lib/api/approvals";
import { useAppModeStore } from "@/store/appModeStore";
import { useTranslation } from "react-i18next";
import { sendChat } from "@/lib/api/chat";
import { startMultiAgentStream } from "@/lib/api/chatStream";
import { useUserStore } from "@/store/userStore";
import { MOCK_UNIFIED_TRADING_HIGH_RISK } from "@/lib/mock/unifiedTradingMock";
import { getAgentActivityLabel, parseAgentMessage } from "@/lib/agentLabels";

/**
 * Home Page - Chat Interface
 *
 * Empty State와 Chat View를 조건부 렌더링
 * - messages.length === 0: Empty State (Dynamic import로 SSR 비활성화)
 * - messages.length > 0: ChatView
 * - ChatInput도 i18n 사용으로 dynamic import 필요
 */

// Dynamic import로 i18n 사용 컴포넌트들을 불러와 hydration 에러 방지
const ChatEmptyState = dynamic(() => import("@/components/chat/ChatEmptyState"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
           style={{ borderColor: "var(--primary-500)", borderTopColor: "transparent" }} />
    </div>
  ),
});

const ChatInput = dynamic(() => import("@/components/layout/ChatInput"), {
  ssr: false,
  loading: () => null, // ChatInput은 하단 고정이라 로딩 UI 불필요
});

export default function Home() {
  const { t, i18n } = useTranslation();
  const { mode } = useAppModeStore();
  const { messages, isHistoryLoading, addMessage, deleteMessage, approvalPanel, closeApprovalPanel, openApprovalPanel, currentThreadId, updateMessage, setLoading, setCurrentThreadId } = useChatStore();
  const { addArtifact } = useArtifactStore();
  const { openAlert } = useDialogStore();
  const { hitlConfig } = useUserStore();

  // Sanitize noisy agent_thinking payloads (Supervisor raw dumps → concise text)
  const sanitizeThinkingDelta = (data: any): string => {
    if (!data) return "";

    // Helper: normalize possible inputs to a candidate string
    const pick = (s: any) => (typeof s === "string" ? s : "");
    const candidate = pick((data as any).message) || pick((data as any).content) || pick((data as any).delta?.text) || (typeof data === "string" ? String(data) : "");

    if (candidate) {
      const raw = candidate.trim();
      // 1) Pure JSON-ish blobs → drop
      if (raw.startsWith("{") || raw.startsWith("[")) return "";

      // 2) LangChain/Anthropic repr like:
      //    content=[{'text': '...'}] additional_kwargs={} response_metadata=...
      //    Extract only the text tokens
      if (/content=\[/.test(raw) || /response_metadata=/.test(raw) || /additional_kwargs=/.test(raw) || /id='lc_run-/.test(raw)) {
        const parts: string[] = [];
        // 'text': '...'
        const rxSingle = /'text':\s*'([^']+)'/g;
        // "text": "..."
        const rxDouble = /\"text\":\s*\"([^\"]+)\"/g;
        let m: RegExpExecArray | null;
        while ((m = rxSingle.exec(raw)) !== null) parts.push(m[1]);
        while ((m = rxDouble.exec(raw)) !== null) parts.push(m[1]);
        const joined = parts.join("");
        return joined.trim();
      }

      // 3) Otherwise, if it's a short sentence without obvious debug keys, keep it
      if (/\b(additional_kwargs|response_metadata|tool_call|invalid_tool_call|args:|type:)\b/.test(raw)) return "";
      return raw;
    }

    // 4) Tool call chunks → summarize to a short label
    const name = (data?.tool_call_chunk?.name || data?.tool_call?.name || data?.name) as any;
    if (name) return `🔧 Tool: ${String(name)}`;

    // 5) Invalid tool noise or generic metadata → ignore
    const type = String((data as any)?.type || "").toLowerCase();
    if (type.includes("invalid") || type.includes("metadata")) return "";
    return "";
  };
  const [approvalBusy, setApprovalBusy] = React.useState(false);

  const handleSuggestionClick = async (prompt: string) => {
    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date().toISOString(),
      status: "sent",
    };
    addMessage(userMessage);

    // 대기용 assistant 메시지 추가
    const tempId = `ai-${Date.now()}`;
    const pendingMessage: Message = {
      id: tempId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      status: "sending",
    };
    addMessage(pendingMessage);

    // Demo 모드: 더미 응답 생성
    if (mode === "demo") {
      setTimeout(() => {
        const thinkingSteps: ThinkingStep[] = [
          {
            agent: "planner",
            description: "요구사항을 분석하고 답변 계획을 수립합니다.",
            timestamp: new Date(Date.now() - 2000).toISOString(),
          },
          {
            agent: "researcher",
            description: "포트폴리오 데이터를 조회하고 최신 시장 정보를 수집합니다.",
            timestamp: new Date(Date.now() - 1000).toISOString(),
          },
          {
            agent: "strategy",
            description: "수집한 데이터를 바탕으로 투자 전략을 분석합니다.",
            timestamp: new Date().toISOString(),
          },
        ];

        updateMessage(tempId, {
          content: `# ${prompt.includes("포트폴리오") || prompt.includes("Portfolio") ? t("portfolio.title") : t("chat.emptyState.suggestions.market.title")}

${t("chat.receivedResponse")}

## ${t("hitl.keyPoints") || "주요 포인트"}

- **${t("common.item")} 1**: 첫 번째 중요한 정보입니다
- **${t("common.item")} 2**: 두 번째 분석 내용입니다
- **${t("common.item")} 3**: 세 번째 권장사항입니다

## ${t("common.nextSteps") || "다음 단계"}

1. 추가 질문이 있으시면 말씀해주세요
2. 더 자세한 분석이 필요하면 요청해주세요

> **${t("common.note") || "참고"}**: 이것은 테스트용 메시지입니다.`,
          thinking: thinkingSteps,
          status: "sent",
        });
      }, 1000);
      return;
    }

    // Live 모드: 실제 API 호출
    try {
      setLoading(true);

      try {
        await startMultiAgentStream({
          message: prompt,
          conversation_id: currentThreadId || undefined,
          hitl_config: hitlConfig,
          onEvent: (ev) => {
            console.log("📥 SSE Event:", ev.event, ev.data);
            const now = new Date().toISOString();
            try {
              const providedId = ev?.data?.conversation_id || ev?.data?.thread_id || ev?.data?.id;
              if (providedId && !useChatStore.getState().currentThreadId) {
                setCurrentThreadId(String(providedId));
              }
            } catch {}

            switch (ev.event) {
              case "master_start": {
                updateMessage(tempId, { status: "sending" });
                // "분석을 시작합니다..." 메시지도 thinking에 추가
                if (ev.data?.message) {
                  const { addThinkingStep } = useChatStore.getState();
                  addThinkingStep(tempId, {
                    agent: "planner",
                    description: ev.data.message,
                    timestamp: now,
                  });
                  console.log("✅ Added thinking step (master_start):", ev.data.message);
                }
                break;
              }
              case "agent_start": {
                // Agent 시작 메시지를 사용자 친화적으로 변환
                const { addThinkingStep } = useChatStore.getState();
                const agent = ev.data?.agent;
                const node = ev.data?.node;
                const originalMessage = ev.data?.message;

                // 원본 메시지에서 agent/node 파싱 시도
                const parsed = originalMessage ? parseAgentMessage(originalMessage) : {};
                const finalAgent = agent || parsed.agent;
                const finalNode = node || parsed.node;

                // 사용자 친화적인 메시지 생성
                const friendlyMessage = getAgentActivityLabel(finalAgent, finalNode, i18n.language as "ko" | "en");

                addThinkingStep(tempId, {
                  agent: finalAgent || "unknown",
                  description: friendlyMessage,
                  timestamp: now,
                });
                console.log("✅ Agent start:", finalAgent, "→", friendlyMessage);
                break;
              }
              case "agent_node": {
                const { addThinkingStep } = useChatStore.getState();
                const agent = ev.data?.agent;
                const node = ev.data?.node;
                const originalMessage = ev.data?.message;

                // 원본 메시지에서 agent/node 파싱
                const parsed = originalMessage ? parseAgentMessage(originalMessage) : {};
                const finalAgent = agent || parsed.agent;
                const finalNode = node || parsed.node;

                // 사용자 친화적인 메시지 생성
                const friendlyMessage = getAgentActivityLabel(finalAgent, finalNode, i18n.language as "ko" | "en");

                // complete 상태
                if (ev.data?.status === "complete") {
                  addThinkingStep(tempId, {
                    agent: finalAgent || finalNode || "unknown",
                    description: friendlyMessage,
                    timestamp: now,
                  });
                  console.log("✅ Node complete:", finalNode, "→", friendlyMessage);
                }

                // running 상태 (content는 agent_thinking에서 채움)
                if (ev.data?.status === "running") {
                  addThinkingStep(tempId, {
                    agent: finalAgent || "unknown",
                    description: friendlyMessage,
                    timestamp: now,
                    node: finalNode,
                    content: "",
                  });
                  console.log("🔄 Node running:", finalNode, "→", friendlyMessage);
                }
                break;
              }
              case "agent_thinking": {
                // AI 사고 내용을 실시간으로 마지막 thinking step에 추가 (노이즈 제거)
                console.log("🔍 [DEBUG] agent_thinking received, raw data:", ev.data);
                const clean = sanitizeThinkingDelta(ev.data);
                console.log("🔍 [DEBUG] sanitized thinking:", clean ? `"${clean}"` : "(empty)");
                if (clean) {
                  const { appendThinkingContent } = useChatStore.getState();
                  appendThinkingContent(tempId, clean);
                  console.log("✅ Thinking appended to message:", tempId);
                }
                break;
              }
              case "master_complete": {
                const text = typeof ev.data?.message === "string" ? ev.data.message : t("chat.receivedResponse");
                // master_complete에서 온 thinking은 무시 (이미 실시간으로 추가됨)
                console.log("📊 Final message received");
                updateMessage(tempId, { content: text, status: "sent" });
                const cid = ev?.data?.conversation_id || ev?.data?.thread_id || ev?.data?.id;
                if (cid) setCurrentThreadId(String(cid));
                try { window.dispatchEvent(new Event('chat-session-updated')); } catch {}
                break;
              }
              // TODO(HITL): 백엔드 이벤트가 `hitl.request`로 표준화되면,
              // `hitl_interrupt` 분기는 제거하고 `hitl.request`만 유지한다.
              case "hitl_interrupt": {
                const raw = ev?.data?.approval_request ?? ev?.data;
                if (raw) {
                  const norm: any = { ...raw };
                  if (norm.type === 'trade_approval') norm.type = 'trading';
                  try { openApprovalPanel(norm as any); } catch {}
                }
                break;
              }
              case "error": {
                const msg = ev.data?.message || "Stream error";
                updateMessage(tempId, { content: msg, status: "error" });
                break;
              }
              default:
                // 다른 이벤트는 로그만 (master_routing, master_aggregating 등)
                break;
            }
          },
        });

        // 스트림 완료 후 상태 확인
        const m = useChatStore.getState().messages.find(m => m.id === tempId);
        if (m && m.status === "sending") {
          updateMessage(tempId, { status: "sent" });
        }
      } catch (streamErr) {
        // 폴백: REST API
        const data = await sendChat({
          message: prompt,
          conversation_id: currentThreadId || undefined,
          hitl_config: hitlConfig,
        });
        updateMessage(tempId, {
          content: data.message || t("chat.receivedResponse"),
          status: "sent"
        });
        const cid = (data as any)?.conversation_id || (data as any)?.thread_id || (data as any)?.id;
        if (cid) setCurrentThreadId(String(cid));
        try { window.dispatchEvent(new Event('chat-session-updated')); } catch {}
      }
    } catch (error) {
      // API 연결 실패
      const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
      const docsUrl = `${apiBase}/docs`;
      const errorText = `${t("chat.backendError")}\n\n**${t("chat.errorContent")}**\n\`\`\`\n${error instanceof Error ? error.message : t("chat.unknownError")}\n\`\`\`\n\n**${t("chat.solution")}**\n1. ${t("chat.checkBackendRunning")} (\`${apiBase}\`)\n2. ${t("chat.startServer")}: \`python -m uvicorn src.main:app --reload\`\n3. ${t("chat.checkApiDocs")}: ${docsUrl}\n\n${t("chat.backendErrorDetail")}`;
      updateMessage(tempId, {
        content: errorText,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    // 1. 실패한 assistant 메시지 찾기
    const failedMessage = messages.find((msg) => msg.id === messageId);
    if (!failedMessage || failedMessage.role !== "assistant") {
      console.error("Failed message not found or not an assistant message");
      return;
    }

    // 2. 직전 사용자 메시지 찾기
    const failedIndex = messages.findIndex((msg) => msg.id === messageId);
    const userMessage = messages
      .slice(0, failedIndex)
      .reverse()
      .find((msg) => msg.role === "user");

    if (!userMessage) {
      console.error("Previous user message not found");
      return;
    }

    // 3. 사용자 메시지와 실패한 assistant 메시지 모두 삭제 (중복 방지)
    deleteMessage(userMessage.id);
    deleteMessage(messageId);

    // 4. 사용자 메시지 다시 추가
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage.content,
      timestamp: new Date().toISOString(),
      status: "sent",
    };
    addMessage(newUserMessage);

    // 5. 대기용 assistant 메시지 추가
    const tempId = `ai-${Date.now()}`;
    const pendingMessage: Message = {
      id: tempId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      status: "sending",
    };
    addMessage(pendingMessage);

    // 6. 실제 API 호출
    try {
      setLoading(true);

      if (mode === "demo") {
        // Demo 모드: 더미 응답
        const data = {
          message: t("chat.receivedResponse"),
          conversation_id: `demo-${Date.now()}`,
          requires_approval: false,
        };
        updateMessage(tempId, {
          content: data.message,
          status: "sent",
        });
        setCurrentThreadId(data.conversation_id);
      } else {
        // Live 모드: 실제 API 호출 (스트림 시도, 실패 시 REST 폴백)
        try {
          await startMultiAgentStream({
            message: userMessage.content,
            conversation_id: currentThreadId || undefined,
            hitl_config: hitlConfig,
            onEvent: (ev) => {
              console.log("📥 SSE Event (Retry):", ev.event, ev.data);
              const now = new Date().toISOString();
              try {
                const providedId = ev?.data?.conversation_id || ev?.data?.thread_id || ev?.data?.id;
                if (providedId && !useChatStore.getState().currentThreadId) {
                  setCurrentThreadId(String(providedId));
                }
              } catch {}

              switch (ev.event) {
                case "master_start": {
                  updateMessage(tempId, { status: "sending" });
                  if (ev.data?.message) {
                    const { addThinkingStep } = useChatStore.getState();
                    addThinkingStep(tempId, {
                      agent: "planner",
                      description: ev.data.message,
                      timestamp: now,
                    });
                    console.log("✅ Added thinking step (master_start):", ev.data.message);
                  }
                  break;
                }
                case "agent_start": {
                  const { addThinkingStep } = useChatStore.getState();
                  const agent = ev.data?.agent;
                  const node = ev.data?.node;
                  const originalMessage = ev.data?.message;

                  const parsed = originalMessage ? parseAgentMessage(originalMessage) : {};
                  const finalAgent = agent || parsed.agent;
                  const finalNode = node || parsed.node;
                  const friendlyMessage = getAgentActivityLabel(finalAgent, finalNode, i18n.language as "ko" | "en");

                  addThinkingStep(tempId, {
                    agent: finalAgent || "unknown",
                    description: friendlyMessage,
                    timestamp: now,
                  });
                  console.log("✅ Agent start (retry):", finalAgent, "→", friendlyMessage);
                  break;
                }
                case "agent_node": {
                  const { addThinkingStep } = useChatStore.getState();
                  const agent = ev.data?.agent;
                  const node = ev.data?.node;
                  const originalMessage = ev.data?.message;

                  const parsed = originalMessage ? parseAgentMessage(originalMessage) : {};
                  const finalAgent = agent || parsed.agent;
                  const finalNode = node || parsed.node;
                  const friendlyMessage = getAgentActivityLabel(finalAgent, finalNode, i18n.language as "ko" | "en");

                  if (ev.data?.status === "complete") {
                    addThinkingStep(tempId, {
                      agent: finalAgent || finalNode || "unknown",
                      description: friendlyMessage,
                      timestamp: now,
                    });
                    console.log("✅ Node complete (retry):", finalNode, "→", friendlyMessage);
                  }

                  if (ev.data?.status === "running") {
                    addThinkingStep(tempId, {
                      agent: finalAgent || "unknown",
                      description: friendlyMessage,
                      timestamp: now,
                      node: finalNode,
                      content: "",
                    });
                    console.log("🔄 Node running (retry):", finalNode, "→", friendlyMessage);
                  }
                  break;
                }
                case "agent_thinking": {
                  const clean = sanitizeThinkingDelta(ev.data);
                  if (clean) {
                    const { appendThinkingContent } = useChatStore.getState();
                    appendThinkingContent(tempId, clean);
                  }
                  break;
                }
              case "master_complete": {
                const text = typeof ev.data?.message === "string" ? ev.data.message : t("chat.receivedResponse");
                console.log("📊 Final message received");
                updateMessage(tempId, { content: text, status: "sent" });
                const cid = ev?.data?.conversation_id || ev?.data?.thread_id || ev?.data?.id;
                if (cid) setCurrentThreadId(String(cid));
                break;
              }
              case "hitl_interrupt": {
                const req = ev?.data?.approval_request ?? ev?.data;
                if (req) {
                  try { openApprovalPanel(req as any); } catch {}
                }
                break;
              }
              case "error": {
                const msg = ev.data?.message || "Stream error";
                updateMessage(tempId, { content: msg, status: "error" });
                break;
              }
                default:
                  // 다른 이벤트는 로그만
                  break;
              }
            },
          });

          // 스트림 완료 후 상태 확인
          const m = useChatStore.getState().messages.find(m => m.id === tempId);
          if (m && m.status === "sending") {
            updateMessage(tempId, { status: "sent" });
          }
        } catch (streamErr) {
          // 폴백: REST API
          const data = await sendChat({
            message: userMessage.content,
            conversation_id: currentThreadId || undefined,
            hitl_config: hitlConfig,
          });
          updateMessage(tempId, {
            content: data.message || t("chat.receivedResponse"),
            status: "sent"
          });
          const cid = (data as any)?.conversation_id || (data as any)?.thread_id || (data as any)?.id;
          if (cid) setCurrentThreadId(String(cid));
        }
      }
    } catch (error) {
      // API 연결 실패
      const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
      const docsUrl = `${apiBase}/docs`;
      const errorText = `${t("chat.backendError")}\n\n**${t("chat.errorContent")}**\n\`\`\`\n${error instanceof Error ? error.message : t("chat.unknownError")}\n\`\`\`\n\n**${t("chat.solution")}**\n1. ${t("chat.checkBackendRunning")} (\`${apiBase}\`)\n2. ${t("chat.startServer")}: \`python -m uvicorn src.main:app --reload\`\n3. ${t("chat.checkApiDocs")}: ${docsUrl}\n\n${t("chat.backendErrorDetail")}`;
      updateMessage(tempId, {
        content: errorText,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = (messageId: string) => {
    // 에러 상태만 해제 (메시지는 유지하되 에러 바 숨김)
    const { updateMessage } = useChatStore.getState();
    updateMessage(messageId, { status: "sent" });
  };

  const handleSaveArtifact = async (messageId: string) => {
    // Find the message to save
    const message = messages.find((msg) => msg.id === messageId);
    if (!message || message.role !== "assistant") {
      console.error("Message not found or not an assistant message");
      return;
    }

    // Save as artifact
    if (mode === "live") {
      try {
        const firstLine = (message.content || "").split("\n")[0]?.replace(/^#\s*/, "").trim() || "Artifact";
        const res = await createArtifact({
          title: firstLine,
          content: message.content,
          artifact_type: "analysis",
          metadata: { created_from_message_id: messageId },
        });
        const artifact = addArtifact(message.content, "📄");
        console.log("Artifact saved (server+local):", res?.artifact_id || res?.id, artifact.id);
      } catch (e) {
        console.error("Server artifact save failed; using local store only:", e);
        const artifact = addArtifact(message.content, "📄");
        console.log("Artifact saved (local):", artifact.id);
      }
    } else {
      const artifact = addArtifact(message.content, "📄");
      console.log("Artifact saved:", artifact);
    }

    // Note: Toast is automatically shown by SaveArtifactButton
  };

  // HITL 승인 요청을 마크다운 메시지로 포맷팅
  const formatApprovalRequest = (request: ApprovalRequest): string => {
    const data = request as any;
    // Normalize backend alias 'trade_approval' to 'trading' for typing safety
    const ttype = (data?.type === 'trade_approval' ? 'trading' : (data?.type || request.type)) as 'research' | 'strategy' | 'portfolio' | 'risk' | 'trading';

    switch (ttype) {
      case "research":
        return `## 🔍 ${t("hitl.research.title") || "분석 실행 승인 요청"}

**${t("hitl.research.query") || "분석 질문"}**: ${data.query}

**${t("hitl.research.complexity.label") || "복잡도"}**: ${data.query_complexity}
**${t("hitl.research.depth.label") || "상세도"}**: ${data.depth_level}

${data.routing_reason ? `**${t("hitl.research.routingReason") || "라우팅 이유"}**: ${data.routing_reason}` : ""}

${data.rationale ? `\n---\n\n${data.rationale}` : ""}`;

      case "strategy":
        return `## 📊 ${t("hitl.strategy.title") || "투자 전략 승인 요청"}

**${t("hitl.strategy.strategyType") || "전략 유형"}**: ${data.strategy_type}

**${t("hitl.strategy.marketOutlook") || "시장 전망"}**:
- ${t("hitl.strategy.cycle") || "사이클"}: ${data.market_outlook?.cycle}
- ${t("hitl.strategy.sentiment") || "투자 심리"}: ${data.market_outlook?.sentiment}

**${t("hitl.strategy.targetAllocation") || "목표 자산 배분"}**:
- ${t("common.stocks") || "주식"}: ${data.target_allocation?.stocks}%
- ${t("common.cash") || "현금"}: ${data.target_allocation?.cash}%

**${t("hitl.strategy.expectedReturn") || "기대 수익률"}**: ${data.expected_return}%
**${t("hitl.strategy.expectedRisk") || "예상 리스크"}**: ${data.expected_risk}

${data.rationale ? `\n---\n\n${data.rationale}` : ""}`;

      case "portfolio":
        return `## 💼 ${t("hitl.portfolio.title") || "포트폴리오 리밸런싱 승인 요청"}

**${t("hitl.portfolio.tradesRequired") || "필요한 거래"}**:

${data.trades_required?.map((trade: any) =>
  `- **${trade.stock_code}**: ${trade.order_type === "buy" ? "매수" : "매도"} ${trade.quantity}주 (약 ${(trade.estimated_amount / 10000).toFixed(0)}만원)`
).join("\n")}

**${t("hitl.portfolio.portfolioMetrics") || "포트폴리오 지표"}**:
- ${t("hitl.portfolio.expectedReturn") || "기대 수익률"}: ${data.portfolio_metrics?.expected_return}%
- ${t("hitl.portfolio.expectedRisk") || "예상 리스크"}: ${data.portfolio_metrics?.expected_risk}%
- ${t("hitl.portfolio.turnoverRatio") || "회전율"}: ${data.portfolio_metrics?.turnover_ratio}%

${data.rationale ? `\n---\n\n${data.rationale}` : ""}`;

      case "risk":
        return `## ⚠️ ${t("hitl.risk.title") || "리스크 경고"}

**${t("hitl.risk.riskLevel") || "리스크 수준"}**: ${data.risk_level}

**${t("hitl.risk.riskFactors") || "리스크 요인"}**:

${data.risk_factors?.map((factor: any) =>
  `- **${factor.category}** (${factor.severity}): ${factor.description}\n  → ${t("hitl.risk.mitigation") || "완화 방안"}: ${factor.mitigation}`
).join("\n\n")}

${data.rationale ? `\n---\n\n${data.rationale}` : ""}`;

      case "trading":
        return `## 💰 ${t("hitl.trading.title") || "매매 주문 승인 요청"}

**${t("hitl.trading.action") || "거래 유형"}**: ${data.action?.toUpperCase() === "BUY" ? t("hitl.trading.buy") || "매수" : t("hitl.trading.sell") || "매도"}
**${t("common.stock") || "종목"}**: ${data.stock_name} (${data.stock_code})
**${t("hitl.trading.quantity") || "수량"}**: ${data.quantity}${t("common.shares") || "주"}
**${t("hitl.trading.price") || "가격"}**: ${data.price?.toLocaleString()}${t("common.won") || "원"}
**${t("hitl.trading.totalAmount") || "총 금액"}**: ${data.total_amount?.toLocaleString()}${t("common.won") || "원"}

**${t("hitl.trading.portfolioImpact") || "포트폴리오 영향"}**:
- ${t("hitl.trading.currentWeight") || "현재 비중"}: ${data.current_weight}%
- ${t("hitl.trading.expectedWeight") || "예상 비중"}: ${data.expected_weight}%

${data.risk_warning ? `\n⚠️ **${t("hitl.trading.riskWarning") || "리스크 경고"}**: ${data.risk_warning}` : ""}`;

      default:
        return `## 승인 요청\n\n${JSON.stringify(data, null, 2)}`;
    }
  };

  const handleApprove = async (messageId: string) => {
    if (approvalBusy) return;
    setApprovalBusy(true);
    try {
      // 승인 결정을 사용자 메시지로 추가 (요청 요약은 백엔드 자동 저장)
      const approvalDecisionMessage: Message = {
        id: `approval-decision-${Date.now()}`,
        role: "user",
        content: `✅ **${t("hitl.approved") || "승인됨"}**`,
        timestamp: new Date().toISOString(),
        status: "sent",
      };
      addMessage(approvalDecisionMessage);

      if (mode === "demo") {
        closeApprovalPanel();
        return;
      }
      if (!currentThreadId) {
        openAlert({ title: t('common.error'), message: t('hitl.noActiveThread') });
        return;
      }
      console.log("🔑 Approving with thread_id:", currentThreadId);
      console.log("📋 Approval panel data:", approvalPanel.data);

      // HITL 패널 데이터에서 거래 정보 추출 (백엔드에서 사용할 수 있도록 전달)
      const modifications: Record<string, any> = {};
      let requestId: string | undefined;
      if (approvalPanel.data) {
        const data = approvalPanel.data as any;
        if (data.request_id) requestId = String(data.request_id);
        // Trading Agent의 경우 종목 코드, 수량 등 정보 포함
        if (data.type === "trading" || data.stock_code) {
          modifications.stock_code = data.stock_code;
          modifications.stock_name = data.stock_name;
          modifications.quantity = data.quantity;
          modifications.price = data.price;
          modifications.action = data.action;
          modifications.total_amount = data.total_amount;
        }
        // 다른 Agent type의 경우도 필요한 데이터 포함 가능
      }

      // Approval API 호출 (automation_level 제거됨 - hitl_config는 GraphState에 저장됨)
      await approveAction({
        thread_id: currentThreadId,
        decision: "approved",
        request_id: requestId,
        modifications: Object.keys(modifications).length > 0 ? modifications : undefined,
      });

      console.log("Approve:", messageId, currentThreadId);
      closeApprovalPanel();

    } catch (error) {
      console.error("Approval error:", error);
      closeApprovalPanel(); // HITL 패널 먼저 닫기
      // 백엔드 에러 메시지 출력
      const errorMsg = error instanceof Error ? error.message : String(error);
      const axiosError = error as any;
      const serverMsg = axiosError?.response?.data?.detail || axiosError?.response?.data?.message || errorMsg;
      console.error("Server error detail:", serverMsg);
      openAlert({
        title: t('common.error'),
        message: `승인 실패: ${serverMsg}`
      });
    } finally {
      try { setApprovalBusy(false); } catch {}
    }
  };

  const handleReject = async (messageId: string) => {
    if (approvalBusy) return;
    setApprovalBusy(true);
    try {
      // 거부 결정을 사용자 메시지로 추가 (요청 요약은 백엔드 자동 저장)
      const approvalDecisionMessage: Message = {
        id: `approval-decision-${Date.now()}`,
        role: "user",
        content: `❌ **${t("hitl.rejected") || "거부됨"}**`,
        timestamp: new Date().toISOString(),
        status: "sent",
      };
      addMessage(approvalDecisionMessage);

      if (mode === "demo") {
        closeApprovalPanel();
        return;
      }
      if (!currentThreadId) {
        openAlert({ title: t('common.error'), message: t('hitl.noActiveThread') });
        return;
      }
      // Approval API 호출 (automation_level 제거됨 - hitl_config는 GraphState에 저장됨)
      let requestId: string | undefined;
      if (approvalPanel.data && (approvalPanel.data as any).request_id) {
        requestId = String((approvalPanel.data as any).request_id);
      }
      await approveAction({
        thread_id: currentThreadId,
        decision: "rejected",
        request_id: requestId,
      });

      console.log("Reject:", messageId, currentThreadId);
      closeApprovalPanel();
    } catch (error) {
      console.error("Rejection error:", error);
      // 백엔드 에러 메시지 출력
      const errorMsg = error instanceof Error ? error.message : String(error);
      const axiosError = error as any;
      const serverMsg = axiosError?.response?.data?.detail || axiosError?.response?.data?.message || errorMsg;
      console.error("Server error detail:", serverMsg);
      closeApprovalPanel(); // 에러 다이얼로그 표시 전 패널 닫기
      openAlert({
        title: t('common.error'),
        message: `거부 실패: ${serverMsg}`
      });
    } finally {
      try { setApprovalBusy(false); } catch {}
    }
  };

  // TEST: HITL 패널 테스트용 함수 (개발 완료 후 제거)
  const handleTestHITL = (agentType: string) => {
    const testData: Record<string, any> = {
      research: {
        type: "research",
        agent: "Research",
        stock_code: "005930",
        stock_name: t("hitl.demo.stocks.samsungElectronics"),
        query: t("hitl.demo.research.query"),
        routing_reason: t("hitl.demo.research.routingReason"),
        query_complexity: "expert",
        depth_level: "comprehensive",
        expected_workers: ["data_collector", "bull_analyst", "bear_analyst"],
        rationale: "HBM3 양산 본격화와 AI 반도체 수요 증가로 실적 개선 예상. 메모리 업황 회복 사이클 진입 중",
        alternatives: [
          {
            suggestion: "간단한 정보 조회만 실행 (depth_level: brief)",
            query_complexity: "simple",
            depth_level: "brief",
          },
        ],
      },
      strategy: {
        type: "strategy",
        agent: "Strategy",
        strategy_type: "GROWTH",
        market_outlook: {
          cycle: "expansion",
          sentiment: "bullish",
        },
        sector_strategy: {
          overweight: ["반도체", "AI", "클라우드"],
          underweight: ["건설", "조선"],
        },
        target_allocation: {
          stocks: 85,
          cash: 15,
        },
        expected_return: 15.8,
        expected_risk: "medium",
        rationale: "AI 반도체 업황 회복과 성장 전망이 밝아 성장주 중심 전략 추천",
        alternatives: [
          {
            suggestion: "보수적 전략: 배당주 비중 확대 (주식 70%, 현금 30%)",
            expected_return: 10.2,
            expected_risk: "low",
          },
          {
            suggestion: "공격적 전략: 성장주 집중 (주식 95%, 현금 5%)",
            expected_return: 22.5,
            expected_risk: "high",
          },
        ],
      },
      portfolio: {
        type: "portfolio",
        agent: "Portfolio",
        rebalancing_needed: true,
        current_holdings: [
          { stock_code: "005930", stock_name: "삼성전자", quantity: 100, current_weight: 30 },
          { stock_code: "000660", stock_name: "SK하이닉스", quantity: 50, current_weight: 15 },
          { stock_code: "035420", stock_name: "NAVER", quantity: 80, current_weight: 20 },
        ],
        proposed_allocation: [
          { stock_code: "005930", stock_name: "삼성전자", target_weight: 25, action: "SELL", quantity_change: -20 },
          { stock_code: "000660", stock_name: "SK하이닉스", target_weight: 20, action: "BUY", quantity_change: 15 },
          { stock_code: "035420", stock_name: "NAVER", target_weight: 15, action: "SELL", quantity_change: -25 },
        ],
        trades_required: [
          { stock_code: "005930", order_type: "sell", quantity: 20, estimated_amount: 1400000 },
          { stock_code: "000660", order_type: "buy", quantity: 15, estimated_amount: 2100000 },
          { stock_code: "035420", order_type: "sell", quantity: 25, estimated_amount: 5000000 },
        ],
        portfolio_metrics: {
          expected_return: 12.5,
          expected_risk: 8.2,
          turnover_ratio: 5.2,
        },
        rationale: "반도체 업황 회복 기대감으로 SK하이닉스 비중 확대, 테크주 과열 우려로 NAVER 축소",
        alternatives: [
          {
            suggestion: "점진적 리밸런싱: 3회로 나누어 실행하여 시장 충격 최소화",
            turnover_ratio: 1.8,
          },
        ],
      },
      risk: {
        type: "risk",
        agent: "Risk",
        risk_level: "medium",
        risk_factors: [
          {
            category: "집중 리스크",
            severity: "warning",
            description: "반도체 업종 비중 45%로 산업 사이클 리스크 존재",
            mitigation: "방어적 자산 10% 이상 편입 권장",
          },
          {
            category: "시장 리스크",
            severity: "critical",
            description: "포트폴리오의 섹터 집중도가 높아 체계적 위험 증가",
            mitigation: "글로벌 분산 투자를 통한 지역 리스크 완화",
          },
        ],
        portfolio_metrics: {
          concentration: 45.0,
          volatility: 18.5,
          max_drawdown: 15.8,
        },
        recommended_actions: [
          "방어적 자산(배당주, 채권) 10% 이상 편입",
          "글로벌 분산 투자 확대",
          "헤지 전략 검토",
        ],
        rationale: "현재 포트폴리오는 반도체 섹터에 과도하게 집중되어 있어 산업 사이클 변동 시 큰 손실 가능성 있음",
        alternatives: [
          {
            suggestion: "리스크 완화 포트폴리오: 채권 20% 편입, 반도체 비중 30%로 축소",
            risk_level: "low",
          },
        ],
      },
      trading: {
        type: "trading",
        agent: "Trading",
        ...MOCK_UNIFIED_TRADING_HIGH_RISK,
      },
    };

    const data = testData[agentType];
    if (data) {
      openApprovalPanel(data);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-x-hidden" style={{ backgroundColor: "var(--main-background)" }}>
      {/* Conditional Rendering: Session Loading / Empty / Chat View */}
      {isHistoryLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--primary-500)", borderTopColor: "transparent" }}
          />
        </div>
      ) : messages.length === 0 ? (
        <ChatEmptyState onSuggestionClick={handleSuggestionClick} onTestHITL={handleTestHITL} />
      ) : (
        <ChatView
          messages={messages}
          onRetryMessage={handleRetryMessage}
          onCloseError={handleCloseError}
          onSaveArtifact={handleSaveArtifact}
        />
      )}

      {/* Chat Input - Fixed Bottom */}
      <ChatInput />

      {/* HITL Approval Panel - Floating variant (no overlay) */}
      {approvalPanel.isOpen && approvalPanel.data && (
        <HITLPanel
          request={approvalPanel.data}
          messageId="temp-message-id"
          onApprove={handleApprove}
          onReject={handleReject}
          variant="floating" disabled={approvalBusy}
        />
      )}
    </div>
  );
}

