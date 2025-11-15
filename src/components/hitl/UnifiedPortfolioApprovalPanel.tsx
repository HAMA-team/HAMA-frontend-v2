"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PieChart, Send } from "lucide-react";

interface UnifiedPortfolioApprovalRequest {
  // Minimal info display for now
  title?: string;
  description?: string;
  changes?: Array<{
    stock_name: string;
    stock_code: string;
    current_weight?: number;
    target_weight?: number;
  }>;
}

interface UnifiedPortfolioApprovalPanelProps {
  request: UnifiedPortfolioApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
  onModify?: (userInput: string) => void;
  variant?: "drawer" | "floating";
  disabled?: boolean;
}

/**
 * UnifiedPortfolioApprovalPanel
 *
 * 포트폴리오 리밸런싱 승인 패널 (간단한 정보 표시만)
 * - Modify는 user_input만 지원 (HITL-MODIFY-PATTERN.md 참고)
 */
export default function UnifiedPortfolioApprovalPanel({
  request,
  onApprove,
  onReject,
  onModify,
  variant = "drawer",
  disabled = false,
}: UnifiedPortfolioApprovalPanelProps) {
  const { t } = useTranslation();
  const [userInput, setUserInput] = useState("");
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

  const handleModify = () => {
    if (onModify) {
      // Portfolio Rebalancing은 user_input만 지원 (HITL-MODIFY-PATTERN.md 참고)
      const userInputText = userInput.trim() || undefined;
      if (userInputText) {
        onModify(userInputText);
        setUserInput("");
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
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-default)" }}>
        <div className="flex items-center gap-3">
          <PieChart className="w-6 h-6" style={{ color: "var(--primary-500)" }} />
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {request.title || t("hitl.portfolio.title")}
          </h2>
        </div>
        <span
          className="px-3 py-1 text-xs font-semibold rounded-full"
          style={{ backgroundColor: "var(--lnb-background)", color: "var(--text-secondary)" }}
        >
          {t("hitl.pending")}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {/* Description */}
        {request.description && (
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: isDark ? "#374151" : "#e5e7eb",
            }}
          >
            <p className="text-sm whitespace-pre-wrap break-words" style={{ color: isDark ? "#e5e7eb" : "#374151" }}>
              {request.description}
            </p>
          </div>
        )}

        {/* Changes Table */}
        {request.changes && request.changes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
              {t("hitl.portfolio.changes")}
            </h3>
            <div className="space-y-2">
              {request.changes.map((change, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: "var(--container-background)",
                    borderColor: "var(--border-default)",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {change.stock_name} ({change.stock_code})
                      </div>
                    </div>
                    {change.current_weight !== undefined && change.target_weight !== undefined && (
                      <div className="text-sm flex items-center gap-1">
                        <span style={{ color: "var(--text-secondary)" }}>
                          {change.current_weight.toFixed(1)}%
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>→</span>
                        <span style={{ color: "var(--primary-500)" }}>
                          {change.target_weight.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Input (Guidance) */}
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
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
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
              disabled={!userInput.trim()}
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

      {/* Footer */}
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
            disabled={disabled || !userInput.trim()}
            className="flex-1 px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: userInput.trim()
                ? (isDark ? "#374151" : "#ffffff")
                : "var(--container-background)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
            }}
            onMouseEnter={(e) => {
              if (!disabled && userInput.trim()) {
                e.currentTarget.style.backgroundColor = isDark ? "#4b5563" : "#f9fafb";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = userInput.trim()
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
