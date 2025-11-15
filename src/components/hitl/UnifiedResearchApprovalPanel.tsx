"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Send } from "lucide-react";
import type { ResearchApprovalRequest } from "@/lib/types/chat";

interface UnifiedResearchApprovalPanelProps {
  request: ResearchApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
  onModify?: (modifications: { depth?: string; scope?: string; perspectives?: string[] }, userInput?: string) => void;
  variant?: "drawer" | "floating";
  disabled?: boolean;
}

/**
 * UnifiedResearchApprovalPanel
 *
 * 개인 투자자 친화 UI로 재구성된 Research HITL 패널 (Demo 우선 적용)
 * - 폭: UnifiedTrading 패널과 동일한 최대폭 유지
 * - 쉬운 라벨/설명 위주, 내부 워커 명칭 노출 지양
 */
export default function UnifiedResearchApprovalPanel({
  request,
  onApprove,
  onReject,
  onModify,
  variant = "drawer",
  disabled = false,
}: UnifiedResearchApprovalPanelProps) {
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

  // 선택 상태(데모용 로컬 상태) – 백엔드 권장값이 오면 기본값으로 매핑
  const [subgraph, setSubgraph] = React.useState<"qualitative" | "quantitative" | "both">("both");
  const [depth, setDepth] = React.useState<"brief" | "detailed" | "comprehensive">(request.depth_level || "detailed");
  const [scope, setScope] = React.useState<"narrow" | "balanced" | "broad">("balanced");
  const [perspectives, setPerspectives] = React.useState<string[]>(["macro", "fundamental", "technical"]);

  const handleModify = () => {
    if (onModify) {
      // 구조화된 수정사항 생성
      const modifications: { depth?: string; scope?: string; perspectives?: string[] } = {};

      // 변경된 값만 포함
      if (depth !== request.depth_level) {
        modifications.depth = depth;
      }
      // scope는 request에 없으므로 항상 포함
      modifications.scope = scope;
      // perspectives 변경 확인
      const originalPerspectives = (request as any).perspectives || [];
      if (JSON.stringify(perspectives.sort()) !== JSON.stringify(originalPerspectives.sort())) {
        modifications.perspectives = perspectives;
      }

      // user_input은 선택사항
      const userInput = adjustmentRequest.trim() || undefined;

      onModify(modifications, userInput);
      setAdjustmentRequest("");
    }
  };

  const depthLabel = (key: string) =>
    key === "brief"
      ? t("hitl.research.depth.brief")
      : key === "detailed"
      ? t("hitl.research.depth.detailed")
      : t("hitl.research.depth.comprehensive");
  const scopeLabel = (key: string) =>
    key === "narrow"
      ? t("hitl.researchUnified.scope.narrow")
      : key === "balanced"
      ? t("hitl.researchUnified.scope.balanced")
      : t("hitl.researchUnified.scope.broad");
  const methodLabel = (key: string) =>
    key === "qualitative"
      ? t("hitl.researchUnified.method.qualitative")
      : key === "quantitative"
      ? t("hitl.researchUnified.method.quantitative")
      : t("hitl.researchUnified.method.both");

  const chipStyle = (selected: boolean) => ({
    backgroundColor: selected ? (isDark ? "#ffffff" : "#000000") : "var(--container-background)",
    color: selected ? (isDark ? "#000000" : "#ffffff") : "var(--text-secondary)",
    borderColor: selected ? (isDark ? "#ffffff" : "#000000") : "var(--border-default)",
    fontWeight: selected ? 600 : 500,
  } as React.CSSProperties);

  const togglePerspective = (key: string) => {
    setPerspectives((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
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
          <Search className="w-6 h-6" style={{ color: "var(--primary-500)" }} />
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {t("hitl.researchUnified.title")}
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
        {/* Stock & Query */}
        <div
          className="rounded-lg p-4 space-y-3"
          style={{
            backgroundColor: isDark ? "#374151" : "#e5e7eb",
          }}
        >
          {request.stock_code && request.stock_name && (
            <div>
              <div className="text-sm mb-1" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                {t("hitl.unified.stock")}
              </div>
              <div className="text-base font-semibold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                {request.stock_name} ({request.stock_code})
              </div>
            </div>
          )}
          <div>
            <div className="text-sm mb-1" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
              {t("hitl.research.query")}
            </div>
            <div className="text-sm whitespace-pre-wrap break-words" style={{ color: isDark ? "#e5e7eb" : "#374151" }}>
              {request.query}
            </div>
          </div>
        </div>

        {/* Plan Summary Line */}
        <div className="flex items-center justify-between py-2 border-b"
             style={{ borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            {t("hitl.researchUnified.plan.title")}
          </h3>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {`${depthLabel(depth)} • ${scopeLabel(scope)} • ${methodLabel(subgraph)}`}
          </div>
        </div>

        {/* Plan: Depth / Scope / Perspectives */}
        <div className="space-y-4">
          {/* Depth */}
          <div>
            <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
              {t("hitl.researchUnified.plan.depth")}
            </div>
            <div className="flex gap-2">
              {([
                { key: "brief", label: t("hitl.research.depth.brief") },
                { key: "detailed", label: t("hitl.research.depth.detailed") },
                { key: "comprehensive", label: t("hitl.research.depth.comprehensive") },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setDepth(opt.key as any)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm border"
                  style={chipStyle(depth === opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div>
            <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
              {t("hitl.researchUnified.plan.scope")}
            </div>
            <div className="flex gap-2">
              {([
                { key: "narrow", label: t("hitl.researchUnified.scope.narrow") },
                { key: "balanced", label: t("hitl.researchUnified.scope.balanced") },
                { key: "broad", label: t("hitl.researchUnified.scope.broad") },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setScope(opt.key as any)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm border"
                  style={chipStyle(scope === opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Perspectives */}
          <div>
            <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
              {t("hitl.researchUnified.plan.perspectives")}
            </div>
            <div className="space-y-2">
              {/* 언어별 레이아웃: 한국어 4-3, 영어 3-4 */}
              {t("language.ko") === "한국어" ? (
                // 한국어: 첫째 줄 4개, 둘째 줄 3개
                <>
                  <div className="flex gap-2">
                    {["macro", "fundamental", "technical", "flow"].map((key) => (
                      <button
                        key={key}
                        onClick={() => togglePerspective(key)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm border"
                        style={chipStyle(perspectives.includes(key))}
                      >
                        {t(`hitl.researchUnified.perspective.${key}`)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {["strategy", "bull", "bear"].map((key) => (
                      <button
                        key={key}
                        onClick={() => togglePerspective(key)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm border"
                        style={chipStyle(perspectives.includes(key))}
                      >
                        {t(`hitl.researchUnified.perspective.${key}`)}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                // 영어: 첫째 줄 3개, 둘째 줄 4개
                <>
                  <div className="flex gap-2">
                    {["macro", "fundamental", "technical"].map((key) => (
                      <button
                        key={key}
                        onClick={() => togglePerspective(key)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm border"
                        style={chipStyle(perspectives.includes(key))}
                      >
                        {t(`hitl.researchUnified.perspective.${key}`)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {["flow", "strategy", "bull", "bear"].map((key) => (
                      <button
                        key={key}
                        onClick={() => togglePerspective(key)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm border"
                        style={chipStyle(perspectives.includes(key))}
                      >
                        {t(`hitl.researchUnified.perspective.${key}`)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Method: Qualitative / Quantitative / Both */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            {t("hitl.researchUnified.method.title")}
          </h3>
          <div className="flex gap-2">
            {([
              { key: "qualitative", label: t("hitl.researchUnified.method.qualitative") },
              { key: "quantitative", label: t("hitl.researchUnified.method.quantitative") },
              { key: "both", label: t("hitl.researchUnified.method.both") },
            ] as const).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSubgraph(opt.key as any)}
                className="flex-1 px-3 py-2 rounded-lg text-sm border"
                style={chipStyle(subgraph === opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

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
