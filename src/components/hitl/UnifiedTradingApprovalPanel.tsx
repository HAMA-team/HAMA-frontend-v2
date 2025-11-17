"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, TrendingUp, TrendingDown, Edit2, Layers, DollarSign, Send } from "lucide-react";
import type { TradingApprovalRequest } from "@/lib/types/chat";

interface UnifiedTradingApprovalPanelProps {
  request: TradingApprovalRequest;
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

  // 구조화된 수정 상태 (HITL-MODIFY-PATTERN.md)
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedAction, setEditedAction] = useState<"BUY" | "SELL" | "buy" | "sell">(request.action || "buy");
  const [editedQuantity, setEditedQuantity] = useState<number | "">(request.quantity || 0);
  const [editedPrice, setEditedPrice] = useState<number | "">(request.price || 0);

  const modifiableFields = request.modifiable_fields ?? ["quantity", "price", "action"];
  const supportsUserInput = request.supports_user_input ?? false;
  const canEditQuantity = modifiableFields.includes("quantity");
  const canEditPrice = modifiableFields.includes("price");
  const canEditAction = modifiableFields.includes("action");

  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const formatNumber = (num?: number) => (num ?? 0).toLocaleString();
  const formatCurrency = (num?: number) => `${(num ?? 0).toLocaleString()} KRW`;
  const formatPercentage = (num?: number) => `${(num ?? 0).toFixed(1)}%`;

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

  const isSell = (request.action || "buy").toLowerCase() === "sell";
  const isEdited =
    editedQuantity !== (request.quantity || 0) ||
    editedPrice !== (request.price || 0) ||
    editedAction.toLowerCase() !== (request.action || "buy").toLowerCase();

  // 수정된 총 금액 계산 (빈 문자열은 0으로 처리)
  const editedTotalAmount = (editedQuantity || 0) * (editedPrice || 0);

  const handleModify = () => {
    if (onModify) {
      // 구조화된 수정사항 생성 (HITL-MODIFY-PATTERN.md)
      const modifications: { quantity?: number; price?: number; action?: string } = {};

      // 변경된 값만 포함 (빈 문자열은 0으로 변환)
      const finalQuantity = editedQuantity || 0;
      const finalPrice = editedPrice || 0;

      if (canEditQuantity && finalQuantity !== (request.quantity || 0)) {
        modifications.quantity = finalQuantity;
      }
      if (canEditPrice && finalPrice !== (request.price || 0)) {
        modifications.price = finalPrice;
      }
      if (canEditAction && editedAction.toLowerCase() !== (request.action || "buy").toLowerCase()) {
        modifications.action = editedAction.toLowerCase();
      }

      // user_input은 선택사항 (supports_user_input 기준)
      const userInput = supportsUserInput ? adjustmentRequest.trim() || undefined : undefined;

      // 수정사항이 있거나 텍스트 입력이 있을 때만 전송
      if (Object.keys(modifications).length > 0 || userInput) {
        onModify(modifications, userInput);
        setAdjustmentRequest("");
        // Edit 모드 종료
        setIsEditingQuantity(false);
        setIsEditingPrice(false);
      }
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
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!canEditAction || disabled) return;
                    setEditedAction(editedAction.toUpperCase() === "BUY" ? "BUY" : "buy");
                  }}
                  className="px-3 py-1 text-xs font-semibold rounded transition-colors"
                  style={{
                    backgroundColor: editedAction.toUpperCase() === "BUY" ? "#2563eb" : "transparent",
                    color: editedAction.toUpperCase() === "BUY" ? "white" : "var(--text-secondary)",
                    border: `1px solid ${editedAction.toUpperCase() === "BUY" ? "#2563eb" : "var(--border-default)"}`,
                  }}
                >
                  {t("hitl.buy")}
                </button>
                <button
                  onClick={() => {
                    if (!canEditAction || disabled) return;
                    setEditedAction(editedAction.toUpperCase() === "SELL" ? "SELL" : "sell");
                  }}
                  className="px-3 py-1 text-xs font-semibold rounded transition-colors"
                  style={{
                    backgroundColor: editedAction.toUpperCase() === "SELL" ? "#ef4444" : "transparent",
                    color: editedAction.toUpperCase() === "SELL" ? "white" : "var(--text-secondary)",
                    border: `1px solid ${editedAction.toUpperCase() === "SELL" ? "#ef4444" : "var(--border-default)"}`,
                  }}
                >
                  {t("hitl.sell")}
                </button>
              </div>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Quantity Card */}
            <div
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: isEditingQuantity ? (isDark ? "#374151" : "#f3f4f6") : "var(--container-background)",
                borderColor: isEditingQuantity ? "var(--primary-500)" : "var(--border-default)",
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
                  onClick={() => setIsEditingQuantity(!isEditingQuantity)}
                  className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded hover:bg-opacity-10 hover:bg-black transition-colors"
                  style={{ color: isEditingQuantity ? "var(--primary-500)" : "var(--text-secondary)" }}
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{t("common.edit")}</span>
                </button>
              </div>
              {isEditingQuantity ? (
                <input
                  type="number"
                  value={editedQuantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditedQuantity(val === "" ? "" : Number(val));
                  }}
                  className="w-full px-2 py-1 text-base font-bold rounded border"
                  style={{
                    backgroundColor: "var(--container-background)",
                    borderColor: "var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                  step="1"
                />
              ) : (
                <div className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  {formatNumber(editedQuantity || 0)} {t("hitl.shares")}
                </div>
              )}
            </div>

            {/* Price/Share Card */}
            <div
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: isEditingPrice ? (isDark ? "#374151" : "#f3f4f6") : "var(--container-background)",
                borderColor: isEditingPrice ? "var(--primary-500)" : "var(--border-default)",
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
                  onClick={() => setIsEditingPrice(!isEditingPrice)}
                  className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded hover:bg-opacity-10 hover:bg-black transition-colors"
                  style={{ color: isEditingPrice ? "var(--primary-500)" : "var(--text-secondary)" }}
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{t("common.edit")}</span>
                </button>
              </div>
              {isEditingPrice ? (
                <input
                  type="number"
                  value={editedPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditedPrice(val === "" ? "" : Number(val));
                  }}
                  className="w-full px-2 py-1 text-base font-bold rounded border"
                  style={{
                    backgroundColor: "var(--container-background)",
                    borderColor: "var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                  step="100"
                />
              ) : (
                <div className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(editedPrice || 0)}
                </div>
              )}
            </div>

            {/* Total Amount Card */}
            <div
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: isEdited ? (isDark ? "#374151" : "#f3f4f6") : "var(--container-background)",
                borderColor: isEdited ? "var(--primary-500)" : "var(--border-default)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {t("hitl.unified.totalAmount")}
                  {isEdited && <span style={{ color: "var(--primary-500)", marginLeft: "4px" }}>({t("common.modified")})</span>}
                </span>
              </div>
              <div className="text-base font-bold" style={{ color: isEdited ? "var(--primary-500)" : "var(--text-primary)" }}>
                {formatCurrency(editedTotalAmount)}
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

        {/* Portfolio Simulator: 전/후 비교 (HITL-MODIFY-PATTERN.md 2025-11-16) */}
        {request.portfolio_before && request.portfolio_after && (
          <div>
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              📊 {t("hitl.simulator.portfolioChanges") || "포트폴리오 변화"}
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* 현금 비중 변화 */}
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: "var(--container-background)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                  {t("hitl.simulator.cashBalance") || "현금"}
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <span style={{ color: "var(--text-primary)" }}>
                    {formatPercentage(((request.portfolio_before?.cash_balance ?? 0) / (request.portfolio_before?.total_value ?? 1)) * 100)}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>→</span>
                  <span style={{ color: ((request.portfolio_after?.cash_balance ?? 0) < (request.portfolio_before?.cash_balance ?? 0)) ? "#ef4444" : "#10b981" }}>
                    {formatPercentage(((request.portfolio_after?.cash_balance ?? 0) / (request.portfolio_after?.total_value ?? 1)) * 100)}
                  </span>
                </div>
              </div>

              {/* 종목 비중 변화 */}
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: "var(--container-background)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                  {request.stock_name} {t("hitl.simulator.weight") || "비중"}
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  {(() => {
                    const before = request.portfolio_before?.holdings?.find(h => h.stock_code === request.stock_code);
                    const after = request.portfolio_after?.holdings?.find(h => h.stock_code === request.stock_code);
                    return (
                      <>
                        <span style={{ color: "var(--text-primary)" }}>
                          {formatPercentage((before?.weight ?? 0) * 100)}
                        </span>
                        <span style={{ color: "var(--text-secondary)" }}>→</span>
                        <span style={{ color: (after && before && after.weight > before.weight) ? "#10b981" : "#ef4444" }}>
                          {formatPercentage((after?.weight ?? 0) * 100)}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Metrics: 전/후 비교 */}
        {request.risk_before && request.risk_after && (
          <div>
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              📈 {t("hitl.simulator.riskChanges") || "리스크 변화"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* 변동성 */}
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: "var(--container-background)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                  {t("hitl.simulator.volatility") || "변동성"}
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <span style={{ color: "var(--text-primary)" }}>
                    {formatPercentage((request.risk_before?.portfolio_volatility ?? 0) * 100)}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>→</span>
                  <span style={{ color: (request.risk_after?.portfolio_volatility ?? 0) > (request.risk_before?.portfolio_volatility ?? 0) ? "#ef4444" : "#10b981" }}>
                    {formatPercentage((request.risk_after?.portfolio_volatility ?? 0) * 100)}
                  </span>
                </div>
              </div>

              {/* Sharpe Ratio */}
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: "var(--container-background)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                  Sharpe Ratio
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <span style={{ color: "var(--text-primary)" }}>
                    {(request.risk_before?.sharpe_ratio ?? 0).toFixed(2)}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>→</span>
                  <span style={{ color: (request.risk_after?.sharpe_ratio ?? 0) > (request.risk_before?.sharpe_ratio ?? 0) ? "#10b981" : "#ef4444" }}>
                    {(request.risk_after?.sharpe_ratio ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* VaR */}
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: "var(--container-background)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                  VaR (95%)
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <span style={{ color: "var(--text-primary)" }}>
                    {formatPercentage((request.risk_before?.var_95 ?? 0) * 100)}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>→</span>
                  <span style={{ color: (request.risk_after?.var_95 ?? 0) < (request.risk_before?.var_95 ?? 0) ? "#ef4444" : "#10b981" }}>
                    {formatPercentage((request.risk_after?.var_95 ?? 0) * 100)}
                  </span>
                </div>
              </div>

              {/* Max Drawdown */}
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: "var(--container-background)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                  {t("hitl.simulator.maxDrawdown") || "최대 낙폭"}
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <span style={{ color: "var(--text-primary)" }}>
                    {formatPercentage((request.risk_before?.max_drawdown_estimate ?? 0) * 100)}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>→</span>
                  <span style={{ color: (request.risk_after?.max_drawdown_estimate ?? 0) > (request.risk_before?.max_drawdown_estimate ?? 0) ? "#ef4444" : "#10b981" }}>
                    {formatPercentage((request.risk_after?.max_drawdown_estimate ?? 0) * 100)}
                  </span>
                </div>
              </div>
            </div>

            {/* 재시뮬레이션 안내 메시지 */}
            {isEdited && (
              <div
                className="mt-3 p-3 rounded-lg border"
                style={{
                  backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "#eff6ff",
                  borderColor: isDark ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe",
                }}
              >
                <p className="text-sm" style={{ color: isDark ? "#93c5fd" : "#1e40af" }}>
                  ℹ️ {t("hitl.simulator.recalculation") || "수정 후 서버에서 재계산하여 새로운 전/후 비교 데이터를 제공합니다."}
                </p>
              </div>
            )}
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
              disabled={!supportsUserInput || disabled}
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
              disabled={disabled || !supportsUserInput || !adjustmentRequest.trim()}
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
            disabled={disabled || (!adjustmentRequest.trim() && !isEdited) || !editedQuantity || editedQuantity <= 0 || !editedPrice || editedPrice <= 0}
            className="flex-1 px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: (adjustmentRequest.trim() || isEdited)
                ? (isDark ? "#374151" : "#ffffff")
                : "var(--container-background)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
            }}
            onMouseEnter={(e) => {
              if (!disabled && (adjustmentRequest.trim() || isEdited)) {
                e.currentTarget.style.backgroundColor = isDark ? "#4b5563" : "#f9fafb";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = (adjustmentRequest.trim() || isEdited)
                ? (isDark ? "#374151" : "#ffffff")
                : "var(--container-background)";
            }}
          >
            {t("hitl.unified.modify")}
            {isEdited && <span style={{ marginLeft: "4px", fontSize: "0.75rem" }}>({editedQuantity !== (request.quantity || 0) || editedPrice !== (request.price || 0) ? "수정됨" : ""})</span>}
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
