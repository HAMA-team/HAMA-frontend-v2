"use client";

import React from "react";
import { PieChart, TrendingUp, Sparkles, Shield } from "lucide-react";
import ChatInput from "@/components/layout/ChatInput";
import ChatView from "@/components/chat/ChatView";
import HITLPanel from "@/components/hitl/HITLPanel";
import { useChatStore } from "@/store/chatStore";
import { Message, ThinkingStep } from "@/lib/types/chat";

/**
 * Home Page - Chat Interface
 *
 * Empty State와 Chat View를 조건부 렌더링
 * - messages.length === 0: Empty State
 * - messages.length > 0: ChatView
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
  const { messages, addMessage, deleteMessage, approvalPanel, closeApprovalPanel, openApprovalPanel, currentThreadId } = useChatStore();

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

  const handleSaveArtifact = (messageId: string) => {
    console.log("Save artifact:", messageId);
    // TODO: Artifact 저장 로직 구현 (Phase 3)
    alert("Artifact가 저장되었습니다!");
  };

  const handleApprove = async (messageId: string) => {
    try {
      // TODO: 실제 API 호출로 대체 필요
      // const response = await axios.post("/api/v1/chat/approve", {
      //   thread_id: currentThreadId,
      //   decision: "approved",
      //   automation_level: 2,
      // });

      console.log("Approve:", messageId, currentThreadId);
      alert("매수 주문이 실행되었습니다");
      closeApprovalPanel();
    } catch (error) {
      console.error("Approval error:", error);
      alert("승인 처리 중 오류가 발생했습니다");
    }
  };

  const handleReject = async (messageId: string) => {
    try {
      // TODO: 실제 API 호출로 대체 필요
      // const response = await axios.post("/api/v1/chat/approve", {
      //   thread_id: currentThreadId,
      //   decision: "rejected",
      //   automation_level: 2,
      // });

      console.log("Reject:", messageId, currentThreadId);
      alert("매수 주문이 거부되었습니다");
      closeApprovalPanel();
    } catch (error) {
      console.error("Rejection error:", error);
      alert("거부 처리 중 오류가 발생했습니다");
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
    <div className="flex flex-col h-full w-full overflow-x-hidden" style={{ backgroundColor: "#f5f5f5" }}>
      {/* Conditional Rendering: Empty State or Chat View */}
      {messages.length === 0 ? (
        // Empty State
        <div className="flex-1 flex flex-col items-center justify-center pb-32">
          <div className="max-w-[800px] mx-auto px-4 w-full flex flex-col items-center">
          {/* Logo */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ backgroundColor: "#3b82f6" }}
          >
            <span className="text-2xl font-bold text-white">H</span>
          </div>

          {/* Greeting */}
          <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: "#171717" }}>
            안녕하세요!
          </h1>
          <p className="text-base mb-12 text-center" style={{ color: "#6b7280" }}>
            무엇을 도와드릴까요?
          </p>

          {/* Suggestion Cards - 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[600px] w-full">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.prompt)}
                  className="flex flex-col items-start p-5 rounded-2xl border transition-all duration-150 hover:shadow-md min-w-0"
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
                  <h3 className="text-sm font-semibold mb-1 break-words" style={{ color: "#171717" }}>
                    {suggestion.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-left break-words" style={{ color: "#6b7280" }}>
                    {suggestion.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* TEST: HITL 패널 테스트 버튼 (개발 완료 후 제거) */}
          <button
            onClick={handleTestHITL}
            className="mt-8 px-6 py-3 rounded-lg font-medium transition-colors duration-150"
            style={{
              backgroundColor: "#f59e0b",
              color: "#ffffff",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#d97706"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f59e0b"}
          >
            🧪 HITL 패널 테스트
          </button>
          </div>
        </div>
      ) : (
        // Chat View
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
