"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Shield } from "lucide-react";
import type { RiskApprovalRequest } from "@/lib/types/chat";

interface RiskApprovalPanelProps {
  request: RiskApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * Risk Agent 승인 패널
 *
 * 고위험 상황에서 진행 확인
 * - 리스크 요인, 포트폴리오 지표 표시
 * - 완화 방법 제시
 *
 * @see docs/HITL_Panel_Specifications.md - Section 4
 */
export default function RiskApprovalPanel({
  request,
  onApprove,
  onReject,
}: RiskApprovalPanelProps) {
  const { t } = useTranslation();

  const getRiskColor = (level: string) => {
    switch (level) {
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

  const getSeverityIcon = (severity: string) => {
    return severity === "critical" ? "🔴" : "⚠️";
  };

  return (
    <div
      className="fixed top-0 right-0 h-screen flex flex-col z-50 shadow-2xl"
      style={{
        width: "50vw",
        backgroundColor: "var(--container-background)",
        borderLeft: "1px solid var(--border-default)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6" style={{ color: "#ef4444" }} />
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {t("hitl.risk.title") || "리스크 경고"}
          </h2>
        </div>
        <span
          className="px-3 py-1 text-sm font-medium rounded-full"
          style={{
            backgroundColor: "#fef2f2",
            color: "#dc2626",
          }}
        >
          {request.risk_level.toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* 경고 메시지 */}
        <div
          className="flex gap-3 p-4 rounded-lg border"
          style={{
            backgroundColor: "#fef2f2",
            borderColor: "#ef4444",
          }}
        >
          <AlertTriangle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: "#ef4444" }}
          />
          <div>
            <div
              className="font-semibold mb-1"
              style={{ color: "#dc2626" }}
            >
              {t("hitl.risk.detectedTitle") || "고위험 상황 감지"}
            </div>
            <div
              className="text-sm"
              style={{ color: "#7f1d1d" }}
            >
              {t("hitl.risk.detectedDesc") || "다음 리스크 요인을 확인하고 신중하게 결정하세요."}
            </div>
          </div>
        </div>

        {/* 주요 리스크 */}
        <div>
          <div
            className="text-sm font-medium mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("hitl.risk.factors") || "주요 리스크"}
          </div>
          <div className="space-y-3">
            {request.risk_factors.map((factor, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: "var(--lnb-background)",
                  borderColor:
                    factor.severity === "critical"
                      ? "#ef4444"
                      : "var(--border-default)",
                }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span>{getSeverityIcon(factor.severity)}</span>
                  <div className="flex-1">
                    <div
                      className="font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {factor.severity === "critical"
                        ? t("hitl.risk.critical") || "심각"
                        : t("hitl.risk.warning") || "경고"}: {factor.category}
                    </div>
                    <div
                      className="text-sm mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {factor.description}
                    </div>
                    <div
                      className="text-sm p-2 rounded"
                      style={{
                        backgroundColor: "var(--primary-50)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      💡 {t("hitl.risk.mitigation") || "완화 방법"}: {factor.mitigation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 포트폴리오 지표 */}
        <div>
          <div
            className="text-sm font-medium mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            📊 {t("hitl.risk.portfolioMetrics") || "포트폴리오 지표"}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: "var(--lnb-background)" }}
            >
              <div
                className="text-xs mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {t("hitl.risk.concentration") || "집중도"}
              </div>
              <div
                className="text-xl font-bold"
                style={{
                  color:
                    request.portfolio_metrics.concentration > 50
                      ? "#ef4444"
                      : "var(--text-primary)",
                }}
              >
                {request.portfolio_metrics.concentration}%
                {request.portfolio_metrics.concentration > 50 && " ⚠️"}
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
                {t("hitl.risk.volatility") || "변동성"}
              </div>
              <div
                className="text-xl font-bold"
                style={{
                  color:
                    request.portfolio_metrics.volatility > 15
                      ? "#f59e0b"
                      : "var(--text-primary)",
                }}
              >
                {request.portfolio_metrics.volatility}%
                {request.portfolio_metrics.volatility > 15 && " ⚠️"}
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
                {t("hitl.risk.maxDrawdown") || "최대 낙폭"}
              </div>
              <div
                className="text-xl font-bold"
                style={{ color: "#ef4444" }}
              >
                {request.portfolio_metrics.max_drawdown}%
              </div>
            </div>
          </div>
        </div>

        {/* 권장 조치 */}
        {request.recommended_actions && request.recommended_actions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5" style={{ color: "var(--primary-500)" }} />
              <div
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("hitl.risk.recommendedActions") || "권장 조치"}
              </div>
            </div>
            <div className="space-y-2">
              {request.recommended_actions.map((action, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-sm p-3 rounded-lg"
                  style={{
                    backgroundColor: "var(--primary-50)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>•</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div
        className="flex gap-3 px-6 py-4 border-t"
        style={{ borderColor: "var(--border-default)" }}
      >
        <button
          onClick={onReject}
          className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "var(--container-background)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          {t("hitl.risk.cancel") || "취소"}
        </button>
        <button
          onClick={onApprove}
          className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "#ef4444",
            color: "white",
          }}
        >
          {t("hitl.risk.proceedAnyway") || "경고 무시하고 진행"}
        </button>
      </div>
    </div>
  );
}
