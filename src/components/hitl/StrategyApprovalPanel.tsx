"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Target, TrendingUp, TrendingDown } from "lucide-react";
import type { StrategyApprovalRequest } from "@/lib/types/chat";
import { useLNBWidth } from "@/hooks/useLNBWidth";

interface StrategyApprovalPanelProps {
  request: StrategyApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
  variant?: "drawer" | "floating";
  disabled?: boolean;
}

/**
 * Strategy Agent 승인 패널
 *
 * 투자 전략 적용 전 승인 요청
 * - 전략 유형, 시장 전망, 섹터 전략 표시
 * - 예상 수익률 & 리스크 표시
 *
 * @see docs/HITL_Panel_Specifications.md - Section 2
 */
export default function StrategyApprovalPanel({
  request,
  onApprove,
  onReject,
  variant = "drawer",
  disabled = false,
}: StrategyApprovalPanelProps) {
  const { t } = useTranslation();
  const { width: lnbWidth } = useLNBWidth();
  const panelWidth = Math.max(360, Math.min(Math.round((lnbWidth || 240) * 1.5), 720));

  const getStrategyLabel = (type: string) => {
    const labels: Record<string, string> = {
      MOMENTUM: t("hitl.strategy.types.momentum") || "모멘텀",
      VALUE: t("hitl.strategy.types.value") || "가치투자",
      GROWTH: t("hitl.strategy.types.growth") || "성장주",
      DEFENSIVE: t("hitl.strategy.types.defensive") || "방어적",
    };
    return labels[type] || type;
  };

  const getCycleLabel = (cycle: string) => {
    const labels: Record<string, string> = {
      expansion: t("hitl.strategy.cycle.expansion") || "확장기",
      peak: t("hitl.strategy.cycle.peak") || "정점",
      contraction: t("hitl.strategy.cycle.contraction") || "수축기",
      trough: t("hitl.strategy.cycle.trough") || "저점",
    };
    return labels[cycle] || cycle;
  };

  const getSentimentLabel = (sentiment: string) => {
    const labels: Record<string, string> = {
      bullish: t("hitl.strategy.sentiment.bullish") || "강세",
      neutral: t("hitl.strategy.sentiment.neutral") || "중립",
      bearish: t("hitl.strategy.sentiment.bearish") || "약세",
    };
    return labels[sentiment] || sentiment;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "var(--text-secondary)";
    }
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
          <Target className="w-6 h-6" style={{ color: "var(--primary-500)" }} />
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {t("hitl.strategy.title") || "투자 전략 승인"}
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
        {/* 전략 유형 */}
        <div>
          <div
            className="text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("hitl.strategy.type") || "전략 유형"}
          </div>
          <div
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--primary-500)" }}
          >
            {getStrategyLabel(request.strategy_type)}
          </div>
        </div>

        {/* 시장 전망 */}
        <div>
          <div
            className="text-sm font-medium mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            📊 {t("hitl.strategy.marketOutlook") || "시장 전망"}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: "var(--lnb-background)" }}
            >
              <div
                className="text-xs mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {t("hitl.strategy.cycle") || "사이클"}
              </div>
              <div
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {getCycleLabel(request.market_outlook.cycle)}
              </div>
            </div>
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: "var(--lnb-background)" }}
            >
              <div
                className="text-xs mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {t("hitl.strategy.sentiment") || "심리"}
              </div>
              <div
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {getSentimentLabel(request.market_outlook.sentiment)}
              </div>
            </div>
          </div>
        </div>

        {/* 섹터 전략 */}
        <div>
          <div
            className="text-sm font-medium mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            🔄 {t("hitl.strategy.sectorStrategy") || "섹터 전략"}
          </div>
          <div className="space-y-3">
            {/* 비중 확대 */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: "var(--lnb-background)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: "#10b981" }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("hitl.strategy.overweight") || "비중 확대"}
                </span>
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {request.sector_strategy.overweight.join(", ")}
              </div>
            </div>
            {/* 비중 축소 */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: "var(--lnb-background)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4" style={{ color: "#ef4444" }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("hitl.strategy.underweight") || "비중 축소"}
                </span>
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {request.sector_strategy.underweight.join(", ")}
              </div>
            </div>
          </div>
        </div>

        {/* 목표 자산배분 */}
        <div>
          <div
            className="text-sm font-medium mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            📈 {t("hitl.strategy.targetAllocation") || "목표 자산배분"}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: "var(--lnb-background)" }}
            >
              <div
                className="text-xs mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {t("hitl.strategy.stocks") || "주식"}
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--primary-500)" }}
              >
                {request.target_allocation.stocks}%
              </div>
            </div>
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: "var(--lnb-background)" }}
            >
              <div
                className="text-xs mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {t("hitl.strategy.cash") || "현금"}
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--text-secondary)" }}
              >
                {request.target_allocation.cash}%
              </div>
            </div>
          </div>
        </div>

        {/* 예상 수익률 & 리스크 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div
              className="text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              💰 {t("hitl.strategy.expectedReturn") || "예상 수익률"}
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: "#10b981" }}
            >
              +{request.expected_return}%
            </div>
          </div>
          <div>
            <div
              className="text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              ⚠️ {t("hitl.strategy.expectedRisk") || "예상 리스크"}
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: getRiskColor(request.expected_risk) }}
            >
              {request.expected_risk.toUpperCase()}
            </div>
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
