"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, AlertTriangle, Copy, Check } from "lucide-react";
import { Message } from "@/lib/types/chat";
import ThinkingSection from "./ThinkingSection";
import SaveArtifactButton from "./SaveArtifactButton";

/**
 * ChatMessage Component
 *
 * 사용자 메시지와 AI 메시지를 구분하여 표시
 * - 사용자: 우측 정렬, 말풍선 없음, 최대 70% 너비
 * - AI: 전체 너비, 아바타, Markdown 렌더링, Thinking, Save 버튼
 *
 * @see DesignSystem.md - Section 11 Chat Messages
 * @see references/mockup_references/대화 기록 뷰.png
 * @see references/img_references/Gemini 챗 도중..png
 */

interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
  onDelete?: () => void;
  onSaveArtifact?: () => void;
}

export default function ChatMessage({
  message,
  onRetry,
  onDelete,
  onSaveArtifact,
}: ChatMessageProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  // 사용자 메시지
  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-6" role="article" aria-label="사용자 메시지">
        <div
          className="max-w-[70%] px-4 py-3 rounded-2xl"
          style={{
            backgroundColor: "#dbeafe",
            color: "#171717",
            fontSize: "15px",
            lineHeight: "22px",
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  // AI 메시지
  return (
    <div className="mb-8 w-full" role="article" aria-label="AI 메시지">
      {/* Header - Avatar + Name */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#3b82f6" }}
          aria-hidden="true"
        >
          <span className="text-base font-bold text-white">H</span>
        </div>
        <span className="text-sm font-semibold" style={{ color: "#171717" }}>
          HAMA
        </span>
      </div>

      {/* Thinking Section */}
      {message.thinking && message.thinking.length > 0 && (
        <ThinkingSection steps={message.thinking} />
      )}

      {/* Content - Markdown */}
      <div
        className="prose prose-sm max-w-none mb-4"
        style={{
          fontSize: "15px",
          lineHeight: "24px",
          color: "#171717",
        }}
      >
        <ReactMarkdown
          components={{
            // Headings
            h1: ({ node, ...props }) => (
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  marginBottom: "16px",
                  letterSpacing: "-0.02em",
                  color: "#171717",
                }}
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  marginBottom: "12px",
                  letterSpacing: "-0.01em",
                  color: "#171717",
                }}
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#171717",
                }}
                {...props}
              />
            ),
            // Paragraph
            p: ({ node, ...props }) => (
              <p style={{ marginBottom: "16px", color: "#171717" }} {...props} />
            ),
            // Lists
            ul: ({ node, ...props }) => (
              <ul
                style={{ marginBottom: "16px", paddingLeft: "24px", color: "#171717" }}
                {...props}
              />
            ),
            ol: ({ node, ...props }) => (
              <ol
                style={{ marginBottom: "16px", paddingLeft: "24px", color: "#171717" }}
                {...props}
              />
            ),
            li: ({ node, ...props }) => (
              <li style={{ marginBottom: "8px", color: "#171717" }} {...props} />
            ),
            // Code
            code: ({ node, inline, ...props }: any) =>
              inline ? (
                <code
                  style={{
                    backgroundColor: "#f3f4f6",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontFamily: "'Monaco', 'Menlo', 'Courier New', monospace",
                    color: "#171717",
                  }}
                  {...props}
                />
              ) : (
                <code
                  style={{
                    color: "#e5e7eb",
                    fontFamily: "'Monaco', 'Menlo', 'Courier New', monospace",
                  }}
                  {...props}
                />
              ),
            pre: ({ node, ...props }) => (
              <pre
                style={{
                  backgroundColor: "#1f2937",
                  color: "#e5e7eb",
                  padding: "16px",
                  borderRadius: "8px",
                  overflowX: "auto",
                  marginBottom: "16px",
                }}
                {...props}
              />
            ),
            // Links
            a: ({ node, ...props }) => (
              <a
                style={{
                  color: "#3b82f6",
                  textDecoration: "underline",
                }}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            // Tables
            table: ({ node, ...props }) => (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "16px",
                }}
                {...props}
              />
            ),
            th: ({ node, ...props }) => (
              <th
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "8px",
                  backgroundColor: "#f9fafb",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "#171717",
                }}
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "8px",
                  color: "#171717",
                }}
                {...props}
              />
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>

      {/* Loading State */}
      {message.status === "sending" && (
        <div className="flex items-center gap-2 mb-4" aria-live="polite" aria-busy="true">
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#3b82f6" }} strokeWidth={1.5} />
          <span className="text-sm" style={{ color: "#6b7280" }}>
            응답 생성 중...
          </span>
        </div>
      )}

      {/* Error State */}
      {message.status === "error" && (
        <div
          className="flex flex-col gap-3 mb-4 p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: "#fee2e2",
            borderLeftColor: "#ef4444",
            borderTop: "1px solid #fecaca",
            borderRight: "1px solid #fecaca",
            borderBottom: "1px solid #fecaca",
          }}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: "#ef4444" }} strokeWidth={1.5} />
            <span className="text-sm font-semibold" style={{ color: "#dc2626" }}>
              전송 실패
            </span>
          </div>
          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150"
                style={{
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ef4444";
                }}
              >
                재전송
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 border"
                style={{
                  backgroundColor: "transparent",
                  color: "#dc2626",
                  borderColor: "#fecaca",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fef2f2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                삭제
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {message.status === "sent" && (
        <div className="flex items-center gap-2">
          {onSaveArtifact && <SaveArtifactButton messageId={message.id} onClick={onSaveArtifact} />}

          {/* Copy Button */}
          <button
            onClick={handleCopyContent}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-150"
            style={{
              backgroundColor: "transparent",
              borderColor: "#e5e7eb",
              color: "#171717",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
            aria-label={isCopied ? "복사됨" : "복사"}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4" strokeWidth={1.5} />
                <span>복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" strokeWidth={1.5} />
                <span>복사</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
