"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Stock } from "@/lib/types/portfolio";
import { getReturnColor } from "@/lib/mock/portfolioData";

interface PortfolioBarChartProps {
  stocks: Stock[];
}

/**
 * PortfolioBarChart Component
 *
 * 막대 차트 - 종목별 수익률 순위
 * - X축: 종목명
 * - Y축: 수익률 (%)
 * - 색상: 양수(초록), 음수(빨강)
 * - 수익률 높은 순으로 정렬
 *
 * @see DesignSystem.md - Chart Colors
 * @see ProductRequirements.md - US-3.1 포트폴리오 즉시 시각화
 */
export default function PortfolioBarChart({ stocks }: PortfolioBarChartProps) {
  // 수익률 높은 순으로 정렬
  const data = [...stocks]
    .sort((a, b) => b.returnRate - a.returnRate)
    .map((stock) => ({
      name: stock.name,
      returnRate: stock.returnRate,
      value: stock.value,
      return: stock.return,
    }));

  const formatCurrency = (value: number) => {
    return `₩${value.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="rounded-lg p-3 shadow-lg border"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#e5e7eb",
          }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "#171717" }}>
            {data.name}
          </p>
          <p
            className="text-xs font-semibold mb-0.5"
            style={{
              color: data.returnRate >= 0 ? "#10b981" : "#ef4444",
            }}
          >
            수익률: {formatPercentage(data.returnRate)}
          </p>
          <p className="text-xs mb-0.5" style={{ color: "#6b7280" }}>
            수익금액: {formatCurrency(data.return)}
          </p>
          <p className="text-xs" style={{ color: "#6b7280" }}>
            평가금액: {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="rounded-xl p-6 border"
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#e5e7eb",
      }}
    >
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
          <Bar dataKey="returnRate" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getReturnColor(entry.returnRate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
