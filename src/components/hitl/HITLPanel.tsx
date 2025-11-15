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

    default:
      // Fallback to Trading panel
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
  }
}
