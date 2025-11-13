"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

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

  // Risk Info (optional, from backend)
  risk_level?: "high" | "medium" | "low";
  risk_warnings?: string[]; // Backend provides simple string array
}

interface UnifiedTradingApprovalPanelProps {
  request: UnifiedTradingApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
  variant?: "drawer" | "floating";
  disabled?: boolean;
}

export default function UnifiedTradingApprovalPanel({
  request,
  onApprove,
  onReject,
  variant = "drawer",
  disabled = false,
}: UnifiedTradingApprovalPanelProps) {
  const { t } = useTranslation();

  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `${num.toLocaleString()}${t("common.won")}`;
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
              backgroundColor: getRiskBgColor(request.risk_level),
              color: getRiskColor(request.risk_level),
            }}
          >
            {request.risk_level.toUpperCase()} RISK
          </span>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 whitespace-pre-wrap break-words">
        {/* Risk Alert (if high risk) */}
        {hasRiskInfo && request.risk_level === "high" && (
          <div
            className="flex gap-3 p-4 rounded-lg border"
            style={{
              backgroundColor: "#fef2f2",
              borderColor: "#ef4444",
            }}
          >
            <AlertTriangle
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "#ef4444" }}
            />
            <div>
              <h3
                className="text-sm font-semibold mb-1"
                style={{ color: "#dc2626" }}
              >
                {t("hitl.unified.highRiskDetected")}
              </h3>
              <p className="text-sm" style={{ color: "#7f1d1d" }}>
                {t("hitl.unified.reviewCarefully")}
              </p>
            </div>
          </div>
        )}

        {/* Trade Details */}
        <div>
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("hitl.unified.tradeDetails")}
          </h3>
          <div className="space-y-3">
            {/* Stock Info */}
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {t("hitl.unified.stock")}
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {request.stock_name} ({request.stock_code})
              </span>
            </div>

            {/* Trade Type */}
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {t("hitl.unified.tradeType")}
              </span>
              <span
                className="text-sm font-semibold"
                style={{
                  color: isSell ? "#ef4444" : "var(--primary-500)",
                }}
              >
                {isSell ? t("hitl.sell") : t("hitl.buy")}
              </span>
            </div>

            {/* Quantity */}
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {t("hitl.unified.quantity")}
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {formatNumber(request.quantity)} {t("hitl.shares")}
              </span>
            </div>

            {/* Price */}
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {t("hitl.unified.price")}
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(request.price)}
              </span>
            </div>

            {/* Total Amount */}
            <div
              className="flex justify-between pt-3 border-t"
              style={{ borderColor: "var(--border-default)" }}
            >
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {t("hitl.unified.totalAmount")}
              </span>
              <span className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(request.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Portfolio Weight Impact */}
        {request.current_weight !== undefined && request.expected_weight !== undefined && (
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("hitl.unified.portfolioImpact")}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: "var(--text-secondary)" }}>
                {t("hitl.unified.currentWeight")}:
              </span>
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                {formatPercentage(request.current_weight)}
              </span>
              <span style={{ color: "var(--text-muted)" }}>→</span>
              <span style={{ color: "var(--text-secondary)" }}>
                {t("hitl.unified.expectedWeight")}:
              </span>
              <span
                className="font-bold"
                style={{
                  color:
                    request.expected_weight > 40
                      ? "#ef4444"
                      : request.expected_weight > 30
                      ? "#f59e0b"
                      : "var(--text-primary)",
                }}
              >
                {formatPercentage(request.expected_weight)}
              </span>
            </div>
          </div>
        )}

        {/* Risk Warnings */}
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
                    backgroundColor: "#fff7ed", // orange-50
                    borderColor: "#fed7aa", // orange-200
                  }}
                >
                  <p className="text-sm break-words" style={{ color: "#7c2d12" }}>
                    {warning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div
        className="px-6 py-4 border-t"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="flex gap-3">
          <button
            onClick={onReject}
            disabled={disabled}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--container-background)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = "var(--lnb-background)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--container-background)";
            }}
          >
            {t("hitl.reject")}
          </button>
          <button
            onClick={onApprove}
            disabled={disabled}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--primary-500)",
              color: "white",
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = "var(--primary-600)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--primary-500)";
            }}
          >
            {t("hitl.approve")}
          </button>
        </div>

        <p
          className="text-xs text-center mt-3"
          style={{ color: "var(--text-muted)" }}
        >
          {t("hitl.unified.approvalNote")}
        </p>
      </div>
    </div>
  );
}
