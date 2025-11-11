"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Search, AlertCircle } from "lucide-react";
import type { ResearchApprovalRequest } from "@/lib/types/chat";
import { useLNBWidth } from "@/hooks/useLNBWidth";

interface ResearchApprovalPanelProps {
  request: ResearchApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
  variant?: "drawer" | "floating";
  disabled?: boolean;
}

/**
 * Research Agent 승인 패널
 *
 * 종목 분석 실행 전 승인 요청
 * - 복잡도 기반 HITL (Advisor 레벨에서만 expert/comprehensive 분석 승인)
 * - 질문 내용, 복잡도, 분석 깊이 표시
 *
 * @see docs/HITL_Panel_Specifications.md - Section 1
 */
export default function ResearchApprovalPanel({
  request,
  onApprove,
  onReject,
  variant = "drawer",
  disabled = false,
}: ResearchApprovalPanelProps) {
  const { t } = useTranslation();
  const { width: lnbWidth } = useLNBWidth();
  const panelWidth = Math.max(360, Math.min(Math.round((lnbWidth || 240) * 1.5), 720));

  const getComplexityLabel = (complexity: string) => {
    const labels: Record<string, string> = {
      simple: t("hitl.research.complexity.simple") || "단순",
      moderate: t("hitl.research.complexity.moderate") || "중간",
      expert: t("hitl.research.complexity.expert") || "전문가",
    };
    return labels[complexity] || complexity;
  };

  const getDepthLabel = (depth: string) => {
    const labels: Record<string, string> = {
      brief: t("hitl.research.depth.brief") || "간략",
      detailed: t("hitl.research.depth.detailed") || "상세",
      comprehensive: t("hitl.research.depth.comprehensive") || "종합",
    };
    return labels[depth] || depth;
  };

  return (
    <div
      className={
        variant === "floating"
          ? "fixed bottom-4 right-4 flex flex-col z-hitl-panel shadow-2xl rounded-xl overflow-hidden"
          : "fixed top-0 right-0 h-screen flex flex-col z-hitl-panel shadow-2xl"
      }
      style={{
        width: `${panelWidth}px`,
        maxHeight: variant === "floating" ? "72vh" : undefined,
        backgroundColor: "var(--container-background)",
        borderLeft: variant === "floating" ? undefined : "1px solid var(--border-default)",
        border: variant === "floating" ? "1px solid var(--border-default)" : undefined,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6" style={{ color: "var(--primary-500)" }} />
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {t("hitl.research.title") || "분석 실행 승인"}
          </h2>
        </div>
        <span
          className="px-3 py-1 text-sm font-medium rounded-full"
          style={{
            backgroundColor: "var(--warning-50)",
            color: "var(--warning-600)",
          }}
        >
          {t("hitl.pending")}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* 종목 정보 */}
        {request.stock_code && request.stock_name && (
          <div>
            <div
              className="text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("hitl.stockName") || "종목"}
            </div>
            <div
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {request.stock_name} ({request.stock_code})
            </div>
          </div>
        )}

        {/* 사용자 질문 */}
        <div>
          <div
            className="text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("hitl.research.query") || "질문"}
          </div>
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "var(--lnb-background)",
              color: "var(--text-primary)",
            }}
          >
            {request.query}
          </div>
        </div>

        {/* 분석 복잡도 & 깊이 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div
              className="text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              📊 {t("hitl.research.complexityLabel") || "분석 복잡도"}
            </div>
            <div
              className="text-lg font-semibold"
              style={{ color: "var(--primary-500)" }}
            >
              {getComplexityLabel(request.query_complexity)}
            </div>
          </div>
          <div>
            <div
              className="text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              📖 {t("hitl.research.depthLabel") || "분석 깊이"}
            </div>
            <div
              className="text-lg font-semibold"
              style={{ color: "var(--primary-500)" }}
            >
              {getDepthLabel(request.depth_level)}
            </div>
          </div>
        </div>

        {/* 라우팅 이유 */}
        <div>
          <div
            className="text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            💡 {t("hitl.research.reason") || "분석이 필요한 이유"}
          </div>
          <div
            className="text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {request.routing_reason}
          </div>
        </div>

        {/* Info Box */}
        <div
          className="flex gap-3 p-4 rounded-lg border"
          style={{
            backgroundColor: "var(--lnb-background)",
            borderColor: "var(--primary-200)",
          }}
        >
          <AlertCircle
            className="w-5 h-5 flex-shrink-0"
            style={{ color: "var(--primary-500)" }}
          />
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("hitl.research.info") ||
              "전문가 수준의 복잡한 분석만 승인이 필요합니다. 단순 질문은 자동으로 처리됩니다."}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div
        className="flex gap-3 px-6 py-4 border-t"
        style={{ borderColor: "var(--border-default)" }}
      >
        <button
          onClick={disabled ? undefined : onReject}
          disabled={disabled}
          className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: disabled ? "var(--border-default)" : "var(--container-background)",
            color: disabled ? "var(--text-secondary)" : "var(--text-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          {t("hitl.reject")}
        </button>
        <button
          onClick={disabled ? undefined : onApprove}
          disabled={disabled}
          className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: disabled ? "var(--primary-400)" : "var(--primary-500)",
            color: disabled ? "var(--text-secondary)" : "white",
          }}
        >
          {t("hitl.approve")}
        </button>
      </div>
    </div>
  );
}
