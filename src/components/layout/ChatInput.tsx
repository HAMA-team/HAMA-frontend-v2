"use client";

import React, { useState } from "react";
import { Paperclip, ArrowUp } from "lucide-react";

/**
 * ChatInput Component
 *
 * 하단 고정 채팅 입력창
 * - Chat, Artifact 상세, Portfolio 페이지에서 사용
 * - 중앙 정렬, 최대 너비 제한
 * - 파일 첨부, 전송 버튼
 * - 자동 높이 조절 (텍스트 입력 시)
 */
export default function ChatInput() {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // TODO: Phase 3에서 API 연동
      console.log("Message:", message);
      setMessage("");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[var(--z-chat-input)] pointer-events-none">
      <div className="max-w-[800px] mx-auto px-4 pb-6 pointer-events-auto">
        <form onSubmit={handleSubmit} className="relative">
          {/* Input Container */}
          <div
            className="flex items-end gap-2 px-4 py-3 rounded-2xl border transition-colors duration-150"
            style={{
              backgroundColor: "#ffffff",
              borderColor: message.trim() ? "#3b82f6" : "#d1d5db",
            }}
          >
            {/* Attach Button */}
            <button
              type="button"
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f3f4f6] transition-colors duration-150"
              aria-label="파일 첨부"
            >
              <Paperclip className="w-5 h-5" style={{ color: "#6b7280" }} />
            </button>

            {/* Textarea */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="메시지를 입력하세요..."
              className="flex-1 resize-none outline-none text-sm"
              style={{
                color: "#171717",
                minHeight: "36px",
                maxHeight: "200px",
                lineHeight: "1.5",
              }}
              rows={1}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim()}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-150"
              style={{
                backgroundColor: message.trim() ? "#3b82f6" : "#e5e7eb",
                cursor: message.trim() ? "pointer" : "not-allowed",
              }}
              aria-label="전송"
            >
              <ArrowUp
                className="w-5 h-5"
                style={{ color: message.trim() ? "#ffffff" : "#9ca3af" }}
              />
            </button>
          </div>

          {/* Helper Text */}
          <p
            className="text-xs text-center mt-2"
            style={{ color: "#9ca3af" }}
          >
            AI가 실수할 수 있습니다. 중요한 정보는 확인하세요.
          </p>
        </form>
      </div>
    </div>
  );
}
