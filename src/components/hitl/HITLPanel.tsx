"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { ApprovalRequest } from "@/lib/types/chat";

interface HITLPanelProps {
  request: ApprovalRequest;
  messageId: string;
  onApprove: (messageId: string) => void;
  onReject: (messageId: string) => void;
}

/**
 * HITLPanel Component
 *
 * 매매 승인 요청 패널 (우측 사이드 패널)
 * - Claude Artifacts 스타일 우측 패널
 * - 주문 내역, AI 분석 근거, 리스크 요인 표시
 * - 승인/거부 버튼
 * - 승인/거부 전까지 닫기 불가
 *
 * @see ProductRequirements.md - US-2.1 매매 승인 필수
 * @see references/mockup_references/HITL 승인 패널.png
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */
export default function HITLPanel({
  request,
  messageId,
  onApprove,
  onReject,
}: HITLPanelProps) {
  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getTradeTypeLabel = (type: "buy" | "sell") => {
    return type === "buy" ? "매수" : "매도";
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
        <h2
          className="text-xl font-semibold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          매매 승인 요청
        </h2>
        {/* Status Badge */}
        <span
          className="px-3 py-1 text-sm font-medium rounded-full"
          style={{
            backgroundColor: "var(--warning-50)",
            color: "var(--warning-600)",
          }}
        >
          승인 대기
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
                거래 승인 필요
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
            주문 내역
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                종목명
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {request.stock_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                종목코드
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {request.stock_code}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                거래 유형
              </span>
              <span
                className="text-sm font-medium"
                style={{
                  color: request.action === "buy" ? "var(--primary-500)" : "var(--error-500)",
                }}
              >
                {getTradeTypeLabel(request.action)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                주문 수량
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {formatNumber(request.quantity)}주
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                현재 시세가
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(request.price)}
              </span>
            </div>
            <div
              className="flex justify-between pt-3 border-t"
              style={{ borderColor: "var(--border-default)" }}
            >
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                예상 {getTradeTypeLabel(request.action)}금액
              </span>
              <span className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(request.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Portfolio Weight Impact */}
        <div className="mb-6">
          <h3
            className="text-base font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            포트폴리오 비중 변화
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: "var(--text-secondary)" }}>현재 비중:</span>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {formatPercentage(request.current_weight)}
            </span>
            <span style={{ color: "var(--text-muted)" }}>→</span>
            <span style={{ color: "var(--text-secondary)" }}>예상 비중:</span>
            <span
              className="font-semibold"
              style={{
                color:
                  request.expected_weight > 40
                    ? "var(--error-500)"
                    : request.expected_weight > 30
                    ? "var(--warning-500)"
                    : "var(--success-500)",
              }}
            >
              {formatPercentage(request.expected_weight)}
            </span>
          </div>
        </div>

        {/* Alternatives */}
        {request.alternatives && request.alternatives.length > 0 && (
          <div className="mb-6">
            <h3
              className="text-base font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              권장 대안
            </h3>
            <div className="space-y-3">
              {request.alternatives.map((alt, index) => (
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
                    <span>수량: {formatNumber(alt.adjusted_quantity)}주</span>
                    <span>금액: {formatCurrency(alt.adjusted_amount)}</span>
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
            onClick={() => onReject(messageId)}
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
            거부
          </button>
          <button
            onClick={() => onApprove(messageId)}
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
            승인
          </button>
        </div>
        <p
          className="text-xs text-center mt-3"
          style={{ color: "var(--text-muted)" }}
        >
          승인 시 즉시 주문이 체결됩니다
        </p>
      </div>
    </div>
  );
}
