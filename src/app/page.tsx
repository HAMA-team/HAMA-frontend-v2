"use client";

import React from "react";
import dynamic from "next/dynamic";
import ChatView from "@/components/chat/ChatView";
import HITLPanel from "@/components/hitl/HITLPanel";
import { useChatStore } from "@/store/chatStore";
import { useArtifactStore } from "@/store/artifactStore";
import { createArtifact } from "@/lib/api/artifacts";
import { Message, ThinkingStep } from "@/lib/types/chat";
import { useDialogStore } from "@/store/dialogStore";
import { approveAction } from "@/lib/api/approvals";
import { useAppModeStore } from "@/store/appModeStore";
import { useTranslation } from "react-i18next";
import { sendChat } from "@/lib/api/chat";
import { startMultiAgentStream } from "@/lib/api/chatStream";
import { useUserStore } from "@/store/userStore";

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
  const { t } = useTranslation();
  const { mode } = useAppModeStore();
  const { messages, isHistoryLoading, addMessage, deleteMessage, approvalPanel, closeApprovalPanel, openApprovalPanel, currentThreadId, updateMessage, setLoading, setCurrentThreadId } = useChatStore();
  const { addArtifact } = useArtifactStore();
  const { openAlert } = useDialogStore();
  const { hitlConfig } = useUserStore();

  const handleSuggestionClick = (prompt: string) => {
    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date().toISOString(),
      status: "sent",
    };
    addMessage(userMessage);

    // TODO: 실제 API 호출로 대체 필요
    // 테스트용 AI 응답 추가
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

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: `# ${prompt.includes("포트폴리오") ? "포트폴리오 분석 결과" : "분석 결과"}

현재 질문에 대한 답변을 생성하고 있습니다.

## 주요 포인트

- **항목 1**: 첫 번째 중요한 정보입니다
- **항목 2**: 두 번째 분석 내용입니다
- **항목 3**: 세 번째 권장사항입니다

## 코드 예시

\`\`\`python
def calculate_portfolio():
    return "Portfolio Analysis"
\`\`\`

## 다음 단계

1. 추가 질문이 있으시면 말씀해주세요
2. 더 자세한 분석이 필요하면 요청해주세요

> **참고**: 이것은 테스트용 메시지입니다.`,
        thinking: thinkingSteps,
        timestamp: new Date().toISOString(),
        status: "sent",
      };
      addMessage(aiMessage);
    }, 1000);
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
              const now = new Date().toISOString();
              try {
                const providedId = ev?.data?.conversation_id || ev?.data?.thread_id || ev?.data?.id;
                if (providedId && !useChatStore.getState().currentThreadId) {
                  setCurrentThreadId(String(providedId));
                }
              } catch {}

              switch (ev.event) {
                case "master_start":
                  updateMessage(tempId, { status: "sending" });
                  break;
                case "master_complete": {
                  const text = typeof ev.data?.message === "string" ? ev.data.message : t("chat.receivedResponse");
                  updateMessage(tempId, { content: text, status: "sent" });
                  const cid = ev?.data?.conversation_id || ev?.data?.thread_id || ev?.data?.id;
                  if (cid) setCurrentThreadId(String(cid));
                  break;
                }
                case "error": {
                  const msg = ev.data?.message || "Stream error";
                  updateMessage(tempId, { content: msg, status: "error" });
                  break;
                }
                default:
                  // 다른 이벤트는 무시 (간단한 버전)
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
      const errorText = `${t("chat.backendError")}\n\n**오류 내용:**\n\`\`\`\n${error instanceof Error ? error.message : "알 수 없는 오류"}\n\`\`\`\n\n**해결 방법:**\n1. 백엔드 서버가 실행 중인지 확인하세요 (\`${apiBase}\`)\n2. 서버 실행: \`python -m uvicorn src.main:app --reload\`\n3. API 문서 확인: ${docsUrl}\n\n${t("chat.backendErrorDetail")}`;
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

  const handleApprove = async (messageId: string) => {
    try {
      if (mode === "demo") {
        openAlert({ title: t('hitl.approved') });
        closeApprovalPanel();
        return;
      }
      if (!currentThreadId) {
        openAlert({ title: t('common.error'), message: t('hitl.noActiveThread') });
        return;
      }
      console.log("🔑 Approving with thread_id:", currentThreadId);
      console.log("📋 Approval panel data:", approvalPanel.data);
      // Approval API 호출 (automation_level 제거됨 - hitl_config는 GraphState에 저장됨)
      await approveAction({
        thread_id: currentThreadId,
        decision: "approved"
      });

      console.log("Approve:", messageId, currentThreadId);
      openAlert({ title: t("hitl.approved") });
      closeApprovalPanel();

    } catch (error) {
      console.error("Approval error:", error);
      // 백엔드 에러 메시지 출력
      const errorMsg = error instanceof Error ? error.message : String(error);
      const axiosError = error as any;
      const serverMsg = axiosError?.response?.data?.detail || axiosError?.response?.data?.message || errorMsg;
      console.error("Server error detail:", serverMsg);
      openAlert({
        title: t('common.error'),
        message: `승인 실패: ${serverMsg}`
      });
    }
  };

  const handleReject = async (messageId: string) => {
    try {
      if (mode === "demo") {
        openAlert({ title: t('hitl.rejected') });
        closeApprovalPanel();
        return;
      }
      if (!currentThreadId) {
        openAlert({ title: t('common.error'), message: t('hitl.noActiveThread') });
        return;
      }
      // Approval API 호출 (automation_level 제거됨 - hitl_config는 GraphState에 저장됨)
      await approveAction({
        thread_id: currentThreadId,
        decision: "rejected"
      });
      // const response = await axios.post("/api/v1/chat/approve", {
      //   thread_id: currentThreadId,
      //   decision: "rejected",
      //   automation_level: 2,
      // });

      console.log("Reject:", messageId, currentThreadId);
      openAlert({ title: t('hitl.rejected') });
      closeApprovalPanel();
    } catch (error) {
      console.error("Rejection error:", error);
      // 백엔드 에러 메시지 출력
      const errorMsg = error instanceof Error ? error.message : String(error);
      const axiosError = error as any;
      const serverMsg = axiosError?.response?.data?.detail || axiosError?.response?.data?.message || errorMsg;
      console.error("Server error detail:", serverMsg);
      openAlert({
        title: t('common.error'),
        message: `거부 실패: ${serverMsg}`
      });
    }
  };

  // TEST: HITL 패널 테스트용 함수 (개발 완료 후 제거)
  const handleTestHITL = (agentType: string) => {
    const testData: Record<string, any> = {
      research: {
        type: "research",
        agent: "Research",
        stock_code: "005930",
        stock_name: "삼성전자",
        query: "삼성전자의 최근 실적과 향후 전망을 분석해주세요",
        routing_reason: "기업 재무 분석 및 산업 동향 파악 필요",
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
        action: "buy",
        stock_code: "005930",
        stock_name: "삼성전자",
        quantity: 100,
        price: 70000,
        total_amount: 7000000,
        current_weight: 25.0,
        expected_weight: 43.2,
        risk_warning: "이 거래는 포트폴리오의 43.2%를 차지하게 되어 과도한 집중 리스크가 발생할 수 있습니다.",
        alternatives: [
          {
            suggestion: "매수 수량을 50주로 조정하여 포트폴리오 비중을 34%로 유지",
            adjusted_quantity: 50,
            adjusted_amount: 3500000,
          },
          {
            suggestion: "매수 수량을 30주로 조정하여 포트폴리오 비중을 28%로 유지",
            adjusted_quantity: 30,
            adjusted_amount: 2100000,
          },
        ],
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

      {/* HITL Approval Panel - Overlay + Panel */}
      {approvalPanel.isOpen && approvalPanel.data && (
        <>
          {/* Overlay - Left Side Dimming */}
          <div
            className="fixed top-0 left-0 w-full h-full z-40"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
          />
          {/* HITL Panel */}
          <HITLPanel
            request={approvalPanel.data}
            messageId="temp-message-id"
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </>
      )}
    </div>
  );
}



