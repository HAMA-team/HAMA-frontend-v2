"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { PieChart, TrendingUp, TrendingDown } from "lucide-react";
import type { PortfolioApprovalRequest } from "@/lib/types/chat";

interface PortfolioApprovalPanelProps {
  request: PortfolioApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * Portfolio Agent 승인 패널
 *
 * 포트폴리오 리밸런싱 전 승인 요청
 * - 매수/매도 종목 목록, 필요 금액 표시
 * - 예상 포트폴리오 지표 표시
 *
 * @see docs/HITL_Panel_Specifications.md - Section 3
 */
export default function PortfolioApprovalPanel({
  request,
  onApprove,
  onReject,
}: PortfolioApprovalPanelProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  const buyTrades = request.trades_required.filter((t) => t.order_type === "buy");
  const sellTrades = request.trades_required.filter((t) => t.order_type === "sell");

  const totalBuyAmount = buyTrades.reduce((sum, t) => sum + t.estimated_amount, 0);
  const totalSellAmount = sellTrades.reduce((sum, t) => sum + t.estimated_amount, 0);
  const netAmount = totalBuyAmount - totalSellAmount;

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
          <PieChart className="w-6 h-6" style={{ color: "var(--primary-500)" }} />
          <h2
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {t("hitl.portfolio.title") || "포트폴리오 리밸런싱"}
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
        {/* 필요한 거래 */}
        <div>
          <div
            className="text-sm font-medium mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            🔄 {t("hitl.portfolio.tradesRequired") || "필요한 거래"}
          </div>

          {/* 매수 */}
          {buyTrades.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: "#10b981" }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("hitl.buy") || "매수"}
                </span>
              </div>
              <div className="space-y-2">
                {buyTrades.map((trade, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: "var(--lnb-background)" }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {trade.stock_code}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {trade.quantity}{t("hitl.shares")} ({formatCurrency(trade.estimated_amount)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 매도 */}
          {sellTrades.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4" style={{ color: "#ef4444" }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("hitl.sell") || "매도"}
                </span>
              </div>
              <div className="space-y-2">
                {sellTrades.map((trade, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: "var(--lnb-background)" }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {trade.stock_code}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {trade.quantity}{t("hitl.shares")} ({formatCurrency(trade.estimated_amount)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 총 필요 금액 */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: "var(--lnb-background)" }}
        >
          <div
            className="text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            💵 {t("hitl.portfolio.netAmount") || "순 필요 금액"}
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: netAmount >= 0 ? "#ef4444" : "#10b981" }}
          >
            {netAmount >= 0 ? "+" : ""}{formatCurrency(netAmount)}
          </div>
        </div>

        {/* 예상 포트폴리오 지표 */}
        <div>
          <div
            className="text-sm font-medium mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            📊 {t("hitl.portfolio.metrics") || "예상 지표"}
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
                {t("hitl.portfolio.expectedReturn") || "예상 수익률"}
              </div>
              <div
                className="text-lg font-bold"
                style={{ color: "#10b981" }}
              >
                +{request.portfolio_metrics.expected_return}%
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
                {t("hitl.portfolio.risk") || "리스크"}
              </div>
              <div
                className="text-lg font-bold"
                style={{ color: "var(--warning-500)" }}
              >
                {request.portfolio_metrics.expected_risk}%
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
                {t("hitl.portfolio.diversification") || "분산도"}
              </div>
              <div
                className="text-lg font-bold"
                style={{ color: "var(--primary-500)" }}
              >
                {request.portfolio_metrics.diversification_score}/10
              </div>
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
          onClick={onReject}
          className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "var(--container-background)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          {t("hitl.reject")}
        </button>
        <button
          onClick={onApprove}
          className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "var(--primary-500)",
            color: "white",
          }}
        >
          {t("hitl.approve")}
        </button>
      </div>
    </div>
  );
}
