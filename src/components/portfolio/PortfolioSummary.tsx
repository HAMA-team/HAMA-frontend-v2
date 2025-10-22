"use client";

import React from "react";
import { PortfolioSummary as PortfolioSummaryType } from "@/lib/types/portfolio";
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Wallet } from "lucide-react";

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
}

/**
 * PortfolioSummary Component
 *
 * 포트폴리오 요약 정보 (4개 카드)
 * - 총 평가금액
 * - 총 수익률 (%, 금액)
 * - 보유 종목 수
 * - 현금 보유액
 *
 * @see DesignSystem.md - Portfolio Summary Card
 * @see ProductRequirements.md - US-3.2 포트폴리오 기본 정보
 */
export default function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const isPositive = summary.totalReturnRate >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* 총 평가금액 */}
      <div
        className="rounded-xl p-5 border"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#e5e7eb",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4" style={{ color: "#6b7280" }} strokeWidth={1.5} />
          <span className="text-sm" style={{ color: "#6b7280" }}>
            총 평가금액
          </span>
        </div>
        <p
          className="text-[28px] font-bold tracking-tight"
          style={{ color: "#171717", letterSpacing: "-0.02em" }}
        >
          {formatCurrency(summary.totalValue)}
        </p>
      </div>

      {/* 총 수익률 */}
      <div
        className="rounded-xl p-5 border"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#e5e7eb",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4" style={{ color: "#6b7280" }} strokeWidth={1.5} />
          ) : (
            <TrendingDown className="w-4 h-4" style={{ color: "#6b7280" }} strokeWidth={1.5} />
          )}
          <span className="text-sm" style={{ color: "#6b7280" }}>
            총 수익률
          </span>
        </div>
        <p
          className="text-[28px] font-bold tracking-tight"
          style={{
            color: isPositive ? "#10b981" : "#ef4444",
            letterSpacing: "-0.02em",
          }}
        >
          {formatPercentage(summary.totalReturnRate)}
        </p>
        <p
          className="text-sm font-semibold mt-1"
          style={{
            color: isPositive ? "#10b981" : "#ef4444",
          }}
        >
          {formatCurrency(summary.totalReturn)}
        </p>
      </div>

      {/* 보유 종목 수 */}
      <div
        className="rounded-xl p-5 border"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#e5e7eb",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-4 h-4" style={{ color: "#6b7280" }} strokeWidth={1.5} />
          <span className="text-sm" style={{ color: "#6b7280" }}>
            보유 종목 수
          </span>
        </div>
        <p
          className="text-[28px] font-bold tracking-tight"
          style={{ color: "#171717", letterSpacing: "-0.02em" }}
        >
          {summary.stockCount}개
        </p>
      </div>

      {/* 현금 보유액 */}
      <div
        className="rounded-xl p-5 border"
        style={{
          backgroundColor: "#ffffff",
          borderColor: "#e5e7eb",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-4 h-4" style={{ color: "#6b7280" }} strokeWidth={1.5} />
          <span className="text-sm" style={{ color: "#6b7280" }}>
            현금 보유액
          </span>
        </div>
        <p
          className="text-[28px] font-bold tracking-tight"
          style={{ color: "#171717", letterSpacing: "-0.02em" }}
        >
          {formatCurrency(summary.cash)}
        </p>
      </div>
    </div>
  );
}
