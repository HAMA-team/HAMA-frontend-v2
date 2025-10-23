"use client";

import React from "react";
import { ChartType } from "@/lib/types/portfolio";
import { LayoutGrid, PieChart, BarChart3 } from "lucide-react";

interface ChartTypeSelectorProps {
  selectedType: ChartType;
  onTypeChange: (type: ChartType) => void;
}

/**
 * ChartTypeSelector Component
 *
 * 차트 타입 선택 버튼 (트리맵 / 원형 / 막대)
 * - 선택된 버튼은 primary 색상으로 표시
 * - 선택 상태는 LocalStorage에 저장 (부모 컴포넌트에서 처리)
 *
 * @see DesignSystem.md - Buttons
 * @see Userflow.md - 차트 타입 변경
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */
export default function ChartTypeSelector({
  selectedType,
  onTypeChange,
}: ChartTypeSelectorProps) {
  const chartTypes: { type: ChartType; label: string; icon: React.ElementType }[] = [
    { type: "treemap", label: "트리맵", icon: LayoutGrid },
    { type: "pie", label: "원형", icon: PieChart },
    { type: "bar", label: "막대", icon: BarChart3 },
  ];

  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        차트 타입:
      </span>
      <div className="flex gap-2">
        {chartTypes.map(({ type, label, icon: Icon }) => {
          const isSelected = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 border"
              style={{
                backgroundColor: isSelected ? "var(--primary-500)" : "var(--container-background)",
                borderColor: isSelected ? "var(--primary-500)" : "var(--border-default)",
                color: isSelected ? "var(--lnb-active-text)" : "var(--lnb-text)",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = "var(--lnb-recent-hover)";
                  e.currentTarget.style.borderColor = "var(--border-emphasis)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = "var(--container-background)";
                  e.currentTarget.style.borderColor = "var(--border-default)";
                }
              }}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
