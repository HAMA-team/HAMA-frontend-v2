"use client";

import React from "react";
import type { ApprovalRequest } from "@/lib/types/chat";
import UnifiedResearchApprovalPanel from "./UnifiedResearchApprovalPanel";
import UnifiedTradingApprovalPanel from "./UnifiedTradingApprovalPanel";
import UnifiedPortfolioApprovalPanel from "./UnifiedPortfolioApprovalPanel";
import StrategyApprovalPanel from "./StrategyApprovalPanel";

interface HITLPanelProps {
  request: ApprovalRequest;
  messageId: string;
  onApprove: (messageId: string) => void;
  onReject: (messageId: string) => void;
  onModify?: (messageId: string, modifications: Record<string, any>, userInput?: string) => void;
  variant?: "drawer" | "floating";
  disabled?: boolean;
}

/**
 * HITLPanel Router Component
 *
 * HITL 승인 요청 타입에 따라 적절한 Unified 패널을 렌더링합니다.
 * - research_plan_approval: UnifiedResearchApprovalPanel
 * - trade_approval: UnifiedTradingApprovalPanel
 * - rebalance_approval: UnifiedPortfolioApprovalPanel
 * - strategy: StrategyApprovalPanel (legacy)
 *
 * @see docs/HITL-MODIFY-PATTERN.md
 */
export default function HITLPanel({
  request,
  messageId,
  onApprove,
  onReject,
  onModify,
  variant = "drawer",
  disabled = false,
}: HITLPanelProps) {
  const handleApprove = () => onApprove(messageId);
  const handleReject = () => onReject(messageId);
  const handleModify = (modifications: Record<string, any>, userInput?: string) => {
    if (onModify) {
      onModify(messageId, modifications, userInput);
    }
  };

  // HITL-MODIFY-PATTERN.md에 따른 타입 라우팅
  switch (request.type) {
    case "research":
    case "research_plan_approval":
      return (
        <UnifiedResearchApprovalPanel
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          onModify={handleModify}
          variant={variant}
          disabled={disabled}
        />
      );

    case "trading":
    case "trade_approval":
      return (
        <UnifiedTradingApprovalPanel
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          onModify={handleModify}
          variant={variant}
          disabled={disabled}
        />
      );

    case "portfolio":
    case "rebalance_approval":
      return (
        <UnifiedPortfolioApprovalPanel
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          onModify={handleModify as any} // Portfolio only uses string userInput
          variant={variant}
          disabled={disabled}
        />
      );

    case "strategy":
      return (
        <StrategyApprovalPanel
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          variant={variant}
          disabled={disabled}
        />
      );

    case "risk":
      // Risk 패널은 삭제되었으므로 Strategy 패널로 대체 (임시)
      // TODO: Risk 전용 Unified 패널 필요 시 구현
      return (
        <StrategyApprovalPanel
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          variant={variant}
          disabled={disabled}
        />
      );

    default:
      // 지원하지 않는 타입 - 에러 패널 표시
      console.error("Unsupported approval request type:", request.type);
      return (
        <div
          className={
            variant === "floating"
              ? "fixed bottom-4 right-4 z-hitl-panel shadow-2xl rounded-xl overflow-hidden"
              : "fixed top-0 right-0 h-screen z-hitl-panel shadow-2xl overflow-hidden"
          }
          style={{
            width: "min(90vw, 500px)",
            maxHeight: variant === "floating" ? "80vh" : undefined,
            backgroundColor: "var(--container-background)",
            borderLeft: variant === "floating" ? undefined : "1px solid var(--border-default)",
            border: variant === "floating" ? "1px solid var(--border-default)" : undefined,
          }}
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Unsupported Request Type
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              The approval request type "{request.type}" is not supported.
            </p>
            <button
              onClick={handleReject}
              className="px-4 py-2 rounded-lg font-semibold"
              style={{
                backgroundColor: "#ef4444",
                color: "white",
              }}
            >
              Close
            </button>
          </div>
        </div>
      );
  }
}
