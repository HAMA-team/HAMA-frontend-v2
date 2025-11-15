"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, TrendingUp, TrendingDown, Edit2, Layers, DollarSign, Send } from "lucide-react";

interface UnifiedTradingApprovalRequest {
  // Trade Info
  stock_name: string;
  stock_code: string;
  action: "BUY" | "SELL" | "buy" | "sell";
  quantity: number;
  price: number;
  total_amount: number;

  // Portfolio Impact
  current_weight?: number;
  expected_weight?: number;
  quantity_after_trade?: number;

  // Risk Info (optional, from backend)
  risk_level?: "high" | "medium" | "low";
  risk_warnings?: string[]; // Backend provides simple string array
}

interface UnifiedTradingApprovalPanelProps {
  request: UnifiedTradingApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
  onModify?: (modifications: { quantity?: number; price?: number; action?: string }, userInput?: string) => void;
  variant?: "drawer" | "floating";
  disabled?: boolean;
}

export default function UnifiedTradingApprovalPanel({
  request,
  onApprove,
  onReject,
  onModify,
  variant = "drawer",
  disabled = false,
}: UnifiedTradingApprovalPanelProps) {
  const { t } = useTranslation();
  const [adjustmentRequest, setAdjustmentRequest] = useState("");
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `${num.toLocaleString()} KRW`;
  const formatPercentage = (num: number) => `${num.toFixed(1)}%`;

  const getRiskColor = (level?: string) => {
    switch (level) {
      case "high":
        return "#dc2626";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "var(--text-secondary)";
    }
  };

  const getRiskBgColor = (level?: string) => {
    switch (level) {
      case "high":
        return "#fef2f2";
      case "medium":
        return "#fef3c7";
      case "low":
        return "#f0fdf4";
      default:
        return "var(--lnb-background)";
    }
  };

  const hasRiskInfo = request.risk_level && request.risk_warnings && request.risk_warnings.length > 0;

  const isSell = request.action === "SELL" || request.action === "sell";

  const handleModify = () => {
    if (onModify) {
      // TODO: 현재는 user_input만 지원. 향후 quantity/price/action 수정 UI 추가 필요
      const modifications: { quantity?: number; price?: number; action?: string } = {};
      const userInput = adjustmentRequest.trim() || undefined;

      onModify(modifications, userInput);
      setAdjustmentRequest("");
    }
  };

  return (
    <div
      className={
        variant === "floating"
          ? "fixed bottom-4 right-4 flex flex-col z-hitl-panel shadow-2xl rounded-xl overflow-hidden overflow-x-hidden transition-transform duration-300"
          : "fixed top-0 right-0 h-screen flex flex-col z-hitl-panel shadow-2xl overflow-x-hidden transition-transform duration-300"
      }
      style={{
        width: "min(90vw, 500px)",
        maxHeight: variant === "floating" ? "80vh" : undefined,
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
          {!isSell ? (
            <TrendingUp className="w-6 h-6" style={{ color: "var(--primary-500)" }} />
          ) : (
            <TrendingDown className="w-6 h-6" style={{ color: "#ef4444" }} />
          )}
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {t("hitl.unified.title")}
          </h2>
        </div>
        {request.risk_level && (
          <span
            className="px-3 py-1 text-xs font-semibold rounded-full"
            style={{
              backgroundColor: isDark
                ? (request.risk_level === "high" ? "rgba(127, 29, 29, 0.3)" :
                   request.risk_level === "medium" ? "rgba(120, 53, 15, 0.3)" :
                   "rgba(20, 83, 45, 0.3)")
                : getRiskBgColor(request.risk_level),
              color: isDark
                ? (request.risk_level === "high" ? "#f87171" :
                   request.risk_level === "medium" ? "#fbbf24" :
                   "#4ade80")
                : getRiskColor(request.risk_level),
            }}
          >
            {request.risk_level.toUpperCase()} RISK
          </span>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 whitespace-pre-wrap break-words">
        {/* Trade Information */}
        <div>
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            {t("hitl.unified.tradeInformation")}
          </h3>

          {/* Stock & Trade Type */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {t("hitl.unified.stock")}
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {request.stock_name} ({request.stock_code})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {t("hitl.unified.tradingType")}
              </span>
              <span
                className="text-sm font-semibold"
                style={{
                  color: isSell ? "#ef4444" : "#2563eb",
                }}
              >
                {isSell ? t("hitl.sell") : t("hitl.buy")}
              </span>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Quantity Card */}
            <div
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: "var(--container-background)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {t("hitl.unified.quantity")}
                  </span>
                </div>
                <button
                  className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{t("common.edit")}</span>
                </button>
              </div>
              <div className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                {formatNumber(request.quantity)} {t("hitl.shares")}
              </div>
            </div>

            {/* Price/Share Card */}
            <div
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: "var(--container-background)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {t("hitl.unified.pricePerShare")}
                  </span>
                </div>
                <button
                  className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{t("common.edit")}</span>
                </button>
              </div>
              <div className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(request.price)}
              </div>
            </div>

            {/* Total Amount Card */}
            <div
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: "var(--container-background)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {t("hitl.unified.totalAmount")}
                </span>
              </div>
              <div className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(request.total_amount)}
              </div>
            </div>

            {/* Quantity After Trading Card */}
            {request.quantity_after_trade !== undefined && (
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: "var(--container-background)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {t("hitl.unified.quantityAfterTrade")}
                  </span>
                </div>
                <div className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  {formatNumber(request.quantity_after_trade)} {t("hitl.shares")}
                </div>
              </div>
            )}

            {/* Portfolio Impact Card */}
            {request.current_weight !== undefined && request.expected_weight !== undefined && (
              <div
                className="p-3 rounded-lg border dark:border-yellow-800/30"
                style={{
                  backgroundColor: "var(--container-background)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {t("hitl.unified.portfolioImpact")}
                  </span>
                </div>
                <div className="text-base font-bold flex items-center gap-1">
                  <span className="text-yellow-600 dark:text-yellow-500">{formatPercentage(request.current_weight)}</span>
                  <span style={{ color: "var(--text-secondary)" }}>→</span>
                  <span className="text-red-600 dark:text-red-500">{formatPercentage(request.expected_weight)}</span>
                </div>
              </div>
            )}

            {/* Risk Detection Card */}
            {request.risk_level && (
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: isDark ? "rgba(127, 29, 29, 0.2)" : "#fef2f2",
                  borderColor: isDark ? "rgba(127, 29, 29, 0.3)" : "#fecaca",
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" style={{ color: isDark ? "#f87171" : "#dc2626" }} />
                  <span className="text-xs" style={{ color: isDark ? "#f87171" : "#dc2626" }}>
                    {t("hitl.unified.riskDetection")}
                  </span>
                </div>
                <div className="text-base font-bold" style={{ color: isDark ? "#f87171" : "#dc2626" }}>
                  {t("hitl.unified.highRiskDetected")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Risk Warnings (원래 있던 요소들) */}
        {request.risk_warnings && request.risk_warnings.length > 0 && (
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("hitl.unified.riskFactors")}
            </h3>
            <div className="space-y-2">
              {request.risk_warnings.map((warning, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: isDark ? "rgba(67, 20, 7, 0.2)" : "#fff7ed",
                    borderColor: isDark ? "rgba(124, 45, 18, 0.3)" : "#fed7aa",
                  }}
                >
                  <p className="text-sm break-words" style={{ color: isDark ? "#fdba74" : "#7c2d12" }}>
                    {warning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adjustment Request */}
        <div>
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {t("hitl.unified.adjustmentRequest")}
          </h3>
          <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
            {t("hitl.unified.adjustmentDescription")}
          </p>
          <div className="relative">
            <textarea
              value={adjustmentRequest}
              onChange={(e) => setAdjustmentRequest(e.target.value)}
              placeholder={t("hitl.unified.adjustmentPlaceholder")}
              className="w-full px-3 py-2.5 pr-12 rounded-lg border resize-none"
              style={{
                backgroundColor: "var(--container-background)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
                minHeight: "80px",
              }}
            />
            <button
              onClick={handleModify}
              disabled={!adjustmentRequest.trim()}
              className="absolute bottom-2.5 right-2.5 p-2 rounded-lg transition-colors disabled:opacity-40"
              style={{
                backgroundColor: "#60a5fa",
                color: "white",
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div
        className="px-6 py-4 border-t"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="flex gap-3">
          {/* Reject Button */}
          <button
            onClick={onReject}
            disabled={disabled}
            className="flex-1 px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#ef4444",
              color: "white",
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = "#dc2626";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ef4444";
            }}
          >
            {t("hitl.reject")}
          </button>

          {/* Modify Button */}
          <button
            onClick={handleModify}
            disabled={disabled || !adjustmentRequest.trim()}
            className="flex-1 px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: adjustmentRequest.trim()
                ? (isDark ? "#374151" : "#ffffff")
                : "var(--container-background)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
            }}
            onMouseEnter={(e) => {
              if (!disabled && adjustmentRequest.trim()) {
                e.currentTarget.style.backgroundColor = isDark ? "#4b5563" : "#f9fafb";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = adjustmentRequest.trim()
                ? (isDark ? "#374151" : "#ffffff")
                : "var(--container-background)";
            }}
          >
            {t("hitl.unified.modify")}
          </button>

          {/* Approve Button */}
          <button
            onClick={onApprove}
            disabled={disabled}
            className="flex-1 px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#2563eb",
              color: "white",
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = "#1d4ed8";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2563eb";
            }}
          >
            {t("hitl.approve")}
          </button>
        </div>
      </div>
    </div>
  );
}
