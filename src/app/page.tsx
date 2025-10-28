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
import { approveAction } from "@/lib/api/chat";
import { useAppModeStore } from "@/store/appModeStore";
import { useTranslation } from "react-i18next";

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
  const { messages, isHistoryLoading, addMessage, deleteMessage, approvalPanel, closeApprovalPanel, openApprovalPanel, currentThreadId } = useChatStore();
  const { addArtifact } = useArtifactStore();
  const { openAlert } = useDialogStore();

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

  const handleRetryMessage = (messageId: string) => {
    console.log("Retry message:", messageId);
    // TODO: 메시지 재전송 로직 구현
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
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
      // TODO: 실제 API 호출로 대체 필요
      await approveAction({ thread_id: currentThreadId, decision: "approved", automation_level: 2 });
      // const response = await axios.post("/api/v1/chat/approve", {
      //   thread_id: currentThreadId,
      //   decision: "approved",
      //   automation_level: 2,
      // });

      console.log("Approve:", messageId, currentThreadId);
      openAlert({ title: t("hitl.approved") });
      closeApprovalPanel();
      
    } catch (error) {
      console.error("Approval error:", error);
      openAlert({ title: t('common.error') });
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
      // TODO: 실제 API 호출로 대체 필요
      await approveAction({ thread_id: currentThreadId, decision: "rejected", automation_level: 2 });
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
      openAlert({ title: t('common.error') });
    }
  };

  // TEST: HITL 패널 테스트용 함수 (개발 완료 후 제거)
  const handleTestHITL = () => {
    openApprovalPanel({
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
    });
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
          onDeleteMessage={handleDeleteMessage}
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



