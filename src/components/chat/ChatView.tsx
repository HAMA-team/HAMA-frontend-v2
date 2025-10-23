"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "@/lib/types/chat";
import ChatMessage from "./ChatMessage";

/**
 * ChatView Component
 *
 * 채팅 메시지 목록을 표시하고 스크롤 관리
 * - 새 메시지 추가 시 자동 하단 스크롤
 * - 메시지가 없으면 Empty State 표시
 *
 * @see DesignSystem.md - Section 4.2 Content Max Width
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
 */

interface ChatViewProps {
  messages: Message[];
  onRetryMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onSaveArtifact?: (messageId: string) => void;
}

export default function ChatView({
  messages,
  onRetryMessage,
  onDeleteMessage,
  onSaveArtifact,
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 새 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden py-8"
      style={{
        backgroundColor: "var(--main-background)",
        paddingBottom: "120px" // ChatInput 높이 + 최소 여유 공간
      }}
      role="log"
      aria-live="polite"
      aria-label="채팅 메시지 목록"
    >
      {/* Chat Container - Centered with max-width */}
      <div className="max-w-[800px] mx-auto px-4 w-full min-w-0">
        {messages.length === 0 ? (
          // Empty State는 page.tsx에서 처리
          <div className="flex items-center justify-center h-full">
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              대화를 시작해보세요
            </p>
          </div>
        ) : (
          // Messages List
          <div>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onRetry={
                  onRetryMessage ? () => onRetryMessage(message.id) : undefined
                }
                onDelete={
                  onDeleteMessage ? () => onDeleteMessage(message.id) : undefined
                }
                onSaveArtifact={
                  onSaveArtifact && message.role === "assistant"
                    ? () => onSaveArtifact(message.id)
                    : undefined
                }
              />
            ))}
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
