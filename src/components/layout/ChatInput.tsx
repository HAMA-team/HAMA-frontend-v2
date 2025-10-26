"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Paperclip, ArrowUp } from "lucide-react";
import { useLNBWidth } from "@/hooks/useLNBWidth";
import { useChatStore } from "@/store/chatStore";
import { Message } from "@/lib/types/chat";
import { sendChat } from "@/lib/api/chat";
import { useAppModeStore } from "@/store/appModeStore";

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
  const { addMessage, updateMessage, isLoading, setLoading, setCurrentThreadId, openApprovalPanel, currentThreadId } = useChatStore();
  const { mode } = useAppModeStore();
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

      // API 호출 전: 대기용 assistant 메시지 추가 (로딩 표시)
      const tempId = `ai-${Date.now()}`;
      const pendingMessage: Message = {
        id: tempId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        status: "sending",
      };
      addMessage(pendingMessage);

      // API 호출
      try {
        setLoading(true);

        // Demo 모드에서는 백엔드 호출 스킵하고 더미 응답 표시
        const data =
          mode === "demo"
            ? {
                message: t("chat.receivedResponse"),
                conversation_id: `demo-${Date.now()}`,
                requires_approval: false,
              }
            : await sendChat({
                message: userMessageContent,
                conversation_id: currentThreadId || undefined,
                automation_level: 2,
              });

        // 대기 메시지 업데이트 (콘텐츠 채우기 + 상태 전환)
        updateMessage(tempId, {
          content: data.message || t("chat.receivedResponse"),
          status: "sent",
        });

        // 스레드 ID 저장 (승인/후속 대화용)
        if (data.conversation_id) {
          setCurrentThreadId(data.conversation_id);
        }

        // 승인 필요 시 패널 오픈
        if (data.requires_approval && data.approval_request) {
          try {
            // 백엔드 approval_request는 유연 스키마이므로 그대로 전달
            // 패널에서는 기대하는 필드가 없을 수 있어, 최소 가드만 두고 시도
            openApprovalPanel(data.approval_request as any);
          } catch (e) {
            // 패널 스키마 불일치 시에도 채팅은 정상 동작하도록 무시
            console.warn("Approval panel data mismatch", e);
          }
        }

        // TODO: HITL 승인 요청 처리
        if (data.requires_approval) {
          console.log("Approval required:", data.approval_request);
          // openApprovalPanel(data.approval_request);
        }
      } catch (error) {
        // API 연결 실패 시: 대기 메시지를 에러로 업데이트
        const errorText = `${t("chat.backendError")}\n\n**오류 내용:**\n\`\`\`\n${error instanceof Error ? error.message : "알 수 없는 오류"}\n\`\`\`\n\n**해결 방법:**\n1. 백엔드 서버가 실행 중인지 확인하세요 (\`http://localhost:8000\`)\n2. 서버 실행: \`python -m uvicorn src.main:app --reload\`\n3. API 문서 확인: http://localhost:8000/docs\n\n${t("chat.backendErrorDetail")}`;
        updateMessage(tempId, {
          content: errorText,
          status: "error",
        });
      } finally {
        setLoading(false);
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
      className="fixed bottom-0 right-0 z-chat-input pointer-events-none transition-[left] duration-300 ease-in-out"
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
              disabled={isLoading}
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
              disabled={isLoading || !message.trim() || isOverLimit}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-150 mb-0"
              style={{
                backgroundColor: !isLoading && message.trim() && !isOverLimit ? "var(--primary-500)" : "var(--border-default)",
                cursor: !isLoading && message.trim() && !isOverLimit ? "pointer" : "not-allowed",
              }}
              aria-label={t("chat.send")}
            >
              <ArrowUp
                className="w-5 h-5"
                style={{ color: !isLoading && message.trim() && !isOverLimit ? "var(--lnb-active-text)" : "var(--text-muted)" }}
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
