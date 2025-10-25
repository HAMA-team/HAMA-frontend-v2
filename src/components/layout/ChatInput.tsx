"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Paperclip, ArrowUp } from "lucide-react";
import { useLNBWidth } from "@/hooks/useLNBWidth";
import { useChatStore } from "@/store/chatStore";
import { Message } from "@/lib/types/chat";

interface ChatInputProps {
  placeholder?: string;
  contextArtifactId?: string; // For context-aware chat (Phase 3+)
}

/**
 * ChatInput Component (also exported as PersistentChatInput)
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
export default function ChatInput({
  placeholder,
  contextArtifactId,
}: ChatInputProps = {}) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const { width: lnbWidth } = useLNBWidth();
  const { addMessage } = useChatStore();
  const charLimit = 5000;
  const showCharCount = message.length >= 4900;
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const defaultPlaceholder = placeholder || t("chat.inputPlaceholder");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && message.length <= charLimit) {
      const userMessageContent = message.trim();

      // 사용자 메시지 추가
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessageContent,
        timestamp: new Date().toISOString(),
        status: "sent",
      };
      addMessage(userMessage);

      // 입력창 초기화
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      // API 호출
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(`${apiBaseUrl}/api/v1/chat/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessageContent,
            automation_level: 2, // Default: Copilot
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // AI 응답 메시지 추가
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.message || t("chat.receivedResponse"),
          timestamp: new Date().toISOString(),
          status: "sent",
        };
        addMessage(aiMessage);

        // TODO: HITL 승인 요청 처리
        if (data.requires_approval) {
          console.log("Approval required:", data.approval_request);
          // openApprovalPanel(data.approval_request);
        }
      } catch (error) {
        // API 연결 실패 시 에러 메시지
        const errorMessage: Message = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: `${t("chat.backendError")}\n\n**오류 내용:**\n\`\`\`\n${error instanceof Error ? error.message : "알 수 없는 오류"}\n\`\`\`\n\n**해결 방법:**\n1. 백엔드 서버가 실행 중인지 확인하세요 (\`http://localhost:8000\`)\n2. 서버 실행: \`python -m uvicorn src.main:app --reload\`\n3. API 문서 확인: http://localhost:8000/docs\n\n${t("chat.backendErrorDetail")}`,
          timestamp: new Date().toISOString(),
          status: "error",
        };
        addMessage(errorMessage);
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
              aria-label={t("chat.attachFile")}
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
              placeholder={defaultPlaceholder}
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
              aria-label={t("chat.send")}
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
              {t("chat.helperTextFull")}
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
