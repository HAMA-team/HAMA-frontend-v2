"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, AlertTriangle, Copy, Check } from "lucide-react";
import { Message } from "@/lib/types/chat";
import ThinkingSection from "./ThinkingSection";
import SaveArtifactButton from "./SaveArtifactButton";
import { useTranslation } from "react-i18next";

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
 * @see DESIGN_RULES.md - 모든 색상은 CSS 변수 사용 필수
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
  const { t } = useTranslation();

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
            backgroundColor: "var(--primary-100)",
            color: "var(--primary-700)",
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
          style={{ backgroundColor: "var(--primary-500)" }}
          aria-hidden="true"
        >
          <span className="text-base font-bold" style={{ color: "var(--lnb-active-text)" }}>H</span>
        </div>
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
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
          color: "var(--text-primary)",
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
                  color: "var(--text-primary)",
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
                  color: "var(--text-primary)",
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
                  color: "var(--text-primary)",
                }}
                {...props}
              />
            ),
            // Paragraph
            p: ({ node, ...props }) => (
              <p style={{ marginBottom: "16px", color: "var(--text-primary)" }} {...props} />
            ),
            // Lists
            ul: ({ node, ...props }) => (
              <ul
                style={{
                  marginBottom: "16px",
                  paddingLeft: "24px",
                  color: "var(--text-primary)",
                  listStyleType: "disc",
                  listStylePosition: "outside",
                }}
                {...props}
              />
            ),
            ol: ({ node, ...props }) => (
              <ol
                style={{
                  marginBottom: "16px",
                  paddingLeft: "24px",
                  color: "var(--text-primary)",
                  listStyleType: "decimal",
                  listStylePosition: "outside",
                }}
                {...props}
              />
            ),
            li: ({ node, ...props }) => (
              <li
                style={{
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                  display: "list-item",
                }}
                {...props}
              />
            ),
            // Code
            code: ({ node, inline, ...props }: any) =>
              inline ? (
                <code
                  style={{
                    backgroundColor: "var(--lnb-hover-bg)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontFamily: "'Monaco', 'Menlo', 'Courier New', monospace",
                    color: "var(--primary-600)",
                  }}
                  {...props}
                />
              ) : (
                <code
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "'Monaco', 'Menlo', 'Courier New', monospace",
                  }}
                  {...props}
                />
              ),
            pre: ({ node, ...props }) => (
              <pre
                style={{
                  backgroundColor: "var(--lnb-background)",
                  color: "var(--text-primary)",
                  padding: "16px",
                  borderRadius: "8px",
                  overflowX: "auto",
                  marginBottom: "16px",
                  border: "1px solid var(--border-default)",
                }}
                {...props}
              />
            ),
            // Links
            a: ({ node, ...props }) => (
              <a
                style={{
                  color: "var(--text-link)",
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
                  border: "1px solid var(--border-default)",
                  padding: "8px",
                  backgroundColor: "var(--lnb-recent-hover)",
                  textAlign: "left",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td
                style={{
                  border: "1px solid var(--border-default)",
                  padding: "8px",
                  color: "var(--text-primary)",
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
        <div className="mb-4" aria-live="polite" aria-busy="true">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--primary-500)" }} strokeWidth={1.5} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {t("chat.generating")}
            </span>
          </div>
          {/* Subtle skeleton lines */}
          <div className="space-y-2 animate-pulse">
            <div className="h-4 rounded" style={{ backgroundColor: "var(--lnb-hover-bg)", width: "85%" }} />
            <div className="h-4 rounded" style={{ backgroundColor: "var(--lnb-hover-bg)", width: "72%" }} />
            <div className="h-4 rounded" style={{ backgroundColor: "var(--lnb-hover-bg)", width: "60%" }} />
          </div>
        </div>
      )}

      {/* Error State */}
      {message.status === "error" && (
        <div
          className="flex flex-col gap-3 mb-4 p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: "var(--error-50)",
            borderLeftColor: "var(--error-500)",
            borderTop: "1px solid var(--error-500)",
            borderRight: "1px solid var(--error-500)",
            borderBottom: "1px solid var(--error-500)",
          }}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: "var(--error-500)" }} strokeWidth={1.5} />
            <span className="text-sm font-semibold" style={{ color: "var(--error-600)" }}>
              {t("chat.sendFailed")}
            </span>
          </div>
          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150"
                style={{
                  backgroundColor: "var(--error-500)",
                  color: "var(--lnb-active-text)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--error-600)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--error-500)";
                }}
              >
                {t("chat.retry")}
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 border"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--error-600)",
                  borderColor: "var(--error-500)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--error-50)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {t("common.delete")}
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
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--lnb-recent-hover)";
              e.currentTarget.style.borderColor = "var(--border-emphasis)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "var(--border-default)";
            }}
            aria-label={isCopied ? t("chat.copied") : t("chat.copy")}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4" strokeWidth={1.5} />
                <span>{t("chat.copied")}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" strokeWidth={1.5} />
                <span>{t("chat.copy")}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
