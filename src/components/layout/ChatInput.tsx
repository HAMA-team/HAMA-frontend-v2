"use client";

import React, { useState } from "react";
import { Paperclip, ArrowUp } from "lucide-react";
import { useLNBWidth } from "@/hooks/useLNBWidth";

/**
 * ChatInput Component
 *
 * 하단 고정 채팅 입력창
 * - Chat, Artifact 상세, Portfolio 페이지에서 사용
 * - 중앙 정렬, 최대 너비 제한
 * - 파일 첨부, 전송 버튼
 * - 자동 높이 조절 (텍스트 입력 시)
 * - LNB 너비를 고려한 중앙 정렬
 *
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */
export default function ChatInput() {
  const [message, setMessage] = useState("");
  const { width: lnbWidth } = useLNBWidth();
  const charLimit = 5000;
  const showCharCount = message.length >= 4900;
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && message.length <= charLimit) {
      // TODO: Phase 3에서 API 연동
      console.log("Message:", message);
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea (1 line ~ 5 lines)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24; // 24px per line
      const maxHeight = lineHeight * 5; // Max 5 lines
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  const isOverLimit = message.length > charLimit;
  const isMultiLine = textareaRef.current && textareaRef.current.scrollHeight > 24;

  return (
    <div
      className="fixed bottom-0 right-0 z-[var(--z-chat-input)] pointer-events-none transition-[left] duration-300 ease-in-out"
      style={{ left: `${lnbWidth}px` }}
    >
      <div className="max-w-[800px] mx-auto px-4 pb-6 pointer-events-auto">
        <form onSubmit={handleSubmit} className="relative">
          {/* Input Container */}
          <div
            className={`flex gap-2 px-4 py-3 rounded-2xl border transition-colors duration-150 ${isMultiLine ? "items-end" : "items-center"}`}
            style={{
              backgroundColor: "var(--container-background)",
              borderColor: message.trim() ? "var(--border-input-focus)" : "var(--border-input)",
            }}
          >
            {/* Attach Button */}
            <button
              type="button"
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-150 mb-0"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--lnb-hover-bg)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              aria-label="파일 첨부"
            >
              <Paperclip className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="메시지를 입력하세요..."
              className="flex-1 resize-none outline-none"
              style={{
                color: "var(--text-primary)",
                backgroundColor: "transparent",
                fontSize: "15px",
                lineHeight: "24px",
                height: "24px",
                maxHeight: "120px",
                overflowY: "auto",
              }}
              rows={1}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || isOverLimit}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-150 mb-0"
              style={{
                backgroundColor: message.trim() && !isOverLimit ? "var(--primary-500)" : "var(--border-default)",
                cursor: message.trim() && !isOverLimit ? "pointer" : "not-allowed",
              }}
              aria-label="전송"
            >
              <ArrowUp
                className="w-5 h-5"
                style={{ color: message.trim() && !isOverLimit ? "var(--lnb-active-text)" : "var(--text-muted)" }}
              />
            </button>
          </div>

          {/* Helper Text & Character Count */}
          <div className={`flex items-center mt-2 text-xs ${showCharCount ? "justify-between" : "justify-center"}`}>
            <p style={{ color: "var(--text-muted)" }}>
              AI가 실수할 수 있습니다. 중요한 정보는 확인하세요.
            </p>
            {showCharCount && (
              <p
                style={{
                  color: isOverLimit ? "var(--text-error)" : "var(--text-muted)",
                  fontWeight: isOverLimit ? 600 : 400,
                }}
              >
                {message.length} / {charLimit}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
