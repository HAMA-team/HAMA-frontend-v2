"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, DollarSign } from "lucide-react";
import type { TradingApprovalRequest } from "@/lib/types/chat";
import { useAppModeStore } from "@/store/appModeStore";

interface TradingApprovalPanelProps {
  request: TradingApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * Trading Agent 승인 패널
 *
 * 개별 매매 주문 실행 전 승인 요청
 * - 종목, 수량, 금액, 포트폴리오 비중 변화 표시
 * - 리스크 경고 & 대안 제시
 *
 * @see docs/HITL_Panel_Specifications.md - Section 5
 */
export default function TradingApprovalPanel({
  request,
  onApprove,
  onReject,
}: TradingApprovalPanelProps) {
  const { t } = useTranslation();
  const { mode } = useAppModeStore();

  const formatCurrency = (amount?: number) => {
    if (typeof amount !== "number" || Number.isNaN(amount)) return "-";
    try { return `₩${amount.toLocaleString()}`; } catch { return `₩${amount}`; }
  };

  const formatNumber = (num?: number) => {
    if (typeof num !== "number" || Number.isNaN(num)) return "-";
    try { return num.toLocaleString(); } catch { return String(num); }
  };

  const getTradeTypeLabel = (type?: "buy" | "sell") => {
    if (type === "sell") return t("hitl.sell");
    return t("hitl.buy");
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div
      className="fixed top-0 right-0 h-screen flex flex-col z-50 shadow-2xl transition-transform duration-300"
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
          <DollarSign className="w-6 h-6" style={{ color: "var(--primary-500)" }} />
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {t("hitl.title")}
          </h2>
        </div>
        {/* Status Badge */}
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Warning Message */}
        {request.risk_warning && (
          <div
            className="flex gap-3 p-4 rounded-lg mb-6 border"
            style={{
              backgroundColor: "var(--lnb-background)",
              borderColor: "var(--warning-500)"
            }}
          >
            <AlertTriangle
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "var(--warning-500)" }}
            />
            <div>
              <h3
                className="text-sm font-semibold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {t("hitl.approvalRequired")}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {request.risk_warning}
              </p>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="mb-6">
          <h3
            className="text-base font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            {t("hitl.orderDetails")}
          </h3>
          <div className="space-y-3">
            {(() => {
              const raw: any = request as any;
              const rows: Array<{ label: string; value: React.ReactNode; present: boolean }[]> = [
                [
                  { label: t("hitl.stockName"), value: raw.stock_name ?? "-", present: !!raw.stock_name },
                  { label: t("hitl.stockCode"), value: raw.stock_code ?? "-", present: !!raw.stock_code },
                ],
                [
                  { label: t("hitl.tradeType"), value: (
                    <span style={{ color: raw.action === "sell" ? "var(--error-500)" : "var(--primary-500)" }}>
                      {getTradeTypeLabel(raw.action)}
                    </span>
                  ), present: !!raw.action },
                ],
                [
                  { label: t("hitl.orderQuantity"), value: (<>
                    {formatNumber(raw.quantity)}{typeof raw.quantity === 'number' ? t('hitl.shares') : ''}
                  </>), present: typeof raw.quantity === 'number' },
                ],
                [
                  { label: t("hitl.currentPrice"), value: formatCurrency(raw.price), present: typeof raw.price === 'number' },
                ],
              ];
              const flat = rows.flat();
              const filtered = mode === 'live' ? flat.filter(r => r.present) : flat;
              return (
                <>
                  {filtered.map((r, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.value}</span>
                    </div>
                  ))}
                  {(mode !== 'live' || typeof raw.total_amount === 'number') && (
                    <div className="flex justify-between pt-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {t('hitl.expectedAmount')} {getTradeTypeLabel(raw.action)} {t('hitl.totalAmount')}
                      </span>
                      <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(raw.total_amount)}
                      </span>
                    </div>
                  )}
                  {mode === 'live' && filtered.length === 0 && typeof raw.total_amount !== 'number' && (
                    <div className="p-3 rounded border" style={{ borderColor: 'var(--border-default)' }}>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {raw.message || t('hitl.noDetails')}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Portfolio Weight Impact (optional) */}
        {(request as any).current_weight !== undefined && (request as any).expected_weight !== undefined && (
        <div className="mb-6">
          <h3
            className="text-base font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            {t("hitl.portfolioWeightChange")}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: "var(--text-secondary)" }}>{t("hitl.currentWeight")}:</span>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {formatPercentage((request as any).current_weight)}
            </span>
            <span style={{ color: "var(--text-muted)" }}>→</span>
            <span style={{ color: "var(--text-secondary)" }}>{t("hitl.expectedWeight")}:</span>
            <span
              className="font-semibold"
              style={{
                color:
                  (request as any).expected_weight > 40
                    ? "var(--error-500)"
                    : (request as any).expected_weight > 30
                    ? "var(--warning-500)"
                    : "var(--success-500)",
              }}
            >
              {formatPercentage((request as any).expected_weight)}
            </span>
          </div>
        </div>
        )}

        {/* Alternatives */}
        {(request as any).alternatives && (request as any).alternatives.length > 0 && (
          <div className="mb-6">
            <h3
              className="text-base font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              {t("hitl.alternatives")}
            </h3>
            <div className="space-y-3">
              {(request as any).alternatives.map((alt: any, index: number) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: "var(--lnb-background)",
                    borderColor: "var(--primary-500)"
                  }}
                >
                  <p className="text-sm mb-2" style={{ color: "var(--text-primary)" }}>
                    {alt.suggestion}
                  </p>
                  <div className="flex gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>{t("hitl.quantity")}: {formatNumber(alt.adjusted_quantity)}{typeof alt.adjusted_quantity === "number" ? t("hitl.shares") : ""}</span>
                    <span>{t("hitl.amount")}: {formatCurrency(alt.adjusted_amount)}</span>
                  </div>
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
            className="flex-1 h-12 rounded-lg text-sm font-medium transition-colors duration-150 border"
            style={{
              backgroundColor: "var(--container-background)",
              borderColor: "var(--border-emphasis)",
              color: "var(--lnb-text)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--lnb-recent-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--container-background)";
            }}
          >
            {t("hitl.reject")}
          </button>
          <button
            onClick={onApprove}
            className="flex-1 h-12 rounded-lg text-sm font-medium transition-colors duration-150"
            style={{
              backgroundColor: "var(--primary-500)",
              color: "var(--lnb-active-text)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--primary-600)";
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
          {t("hitl.approvalNote")}
        </p>
      </div>
    </div>
  );
}
