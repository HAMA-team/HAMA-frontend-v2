"use client";

import React from "react";
import type { ApprovalRequest } from "@/lib/types/chat";
import ResearchApprovalPanel from "./ResearchApprovalPanel";
import UnifiedResearchApprovalPanel from "./UnifiedResearchApprovalPanel";
import { useAppModeStore } from "@/store/appModeStore";
import StrategyApprovalPanel from "./StrategyApprovalPanel";
import PortfolioApprovalPanel from "./PortfolioApprovalPanel";
import RiskApprovalPanel from "./RiskApprovalPanel";
import UnifiedTradingApprovalPanel from "./UnifiedTradingApprovalPanel";

interface HITLPanelProps {
  request: ApprovalRequest;
  messageId: string;
  onApprove: (messageId: string) => void;
  onReject: (messageId: string) => void;
  variant?: "drawer" | "floating";
  disabled?: boolean;
}

/**
 * HITLPanel Router Component
 *
 * Agent type에 따라 적절한 승인 패널을 렌더링합니다.
 * - Research Agent: 분석 실행 승인
 * - Strategy Agent: 투자 전략 승인
 * - Portfolio Agent: 포트폴리오 리밸런싱 승인
 * - Risk Agent: 리스크 경고 확인
 * - Trading Agent: 매매 주문 승인
 *
 * @see docs/HITL_Panel_Specifications.md
 */
export default function HITLPanel({
  request,
  messageId,
  onApprove,
  onReject,
  variant = "drawer",
  disabled = false,
}: HITLPanelProps) {
  // Demo/Live 모드에 따라 Research 패널 분기
  // 데모에서는 개인 투자자 친화 UI(UnifiedResearchApprovalPanel)를 사용
  const { mode } = useAppModeStore();
  // Agent type에 따른 handlers
  const handleApprove = () => onApprove(messageId);
  const handleReject = () => onReject(messageId);

  // Agent type 기반 라우팅
  switch (request.type) {
    case "research":
      if (mode === "demo") {
        return (
          <UnifiedResearchApprovalPanel
            request={request}
            onApprove={handleApprove}
            onReject={handleReject}
            variant={variant}
            disabled={disabled}
          />
        );
      }
      return (
        <ResearchApprovalPanel
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
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

    case "portfolio":
      return (
        <PortfolioApprovalPanel
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          variant={variant}
          disabled={disabled}
        />
      );

    case "risk":
      return (
        <RiskApprovalPanel
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          variant={variant}
          disabled={disabled}
        />
      );

    case "trading":
    default:
      return (
        <UnifiedTradingApprovalPanel
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          variant={variant}
          disabled={disabled}
        />
      );
  }
}
