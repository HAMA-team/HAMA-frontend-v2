"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Paperclip, ArrowUp } from "lucide-react";
import { useLNBWidth } from "@/hooks/useLNBWidth";
import { usePathname, useRouter } from "next/navigation";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { Message } from "@/lib/types/chat";
import { sendChat, getChatSessions } from "@/lib/api/chat";
import { startMultiAgentStream } from "@/lib/api/chatStream";
import { useAppModeStore } from "@/store/appModeStore";
import { useArtifactStore } from "@/store/artifactStore";
import { ThinkingStep } from "@/lib/types/chat";
import { PRESET_ADVISOR } from "@/types/hitl";

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
  const { addMessage, updateMessage, isLoading, setLoading, setCurrentThreadId, openApprovalPanel, currentThreadId, clearMessages } = useChatStore();
  const { mode } = useAppModeStore();
  const { getArtifact } = useArtifactStore();
  const { hitlConfig } = useUserStore();
  const charLimit = 5000;
  const showCharCount = message.length >= 4900;
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const defaultPlaceholder = placeholder || t("chat.inputPlaceholder");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && message.length <= charLimit) {
      const userMessageContent = message.trim();
      const fromExternalPage = pathname !== "/";

      if (fromExternalPage) {
        // 외부 페이지에서 입력 시 항상 새 세션으로 시작
        clearMessages();
        setCurrentThreadId("");
      }

      // 아티팩트 컨텍스트가 있으면 사용자 메시지 이전에 컨텍스트를 '기존 LLM 답변'처럼 표시
      if (fromExternalPage && contextArtifactId) {
        const art = useArtifactStore.getState().getArtifact?.(contextArtifactId);
        if (art?.content) {
          const contextAssistant: Message = {
            id: `ctx-${Date.now()}`,
            role: "assistant",
            content: art.content,
            timestamp: new Date().toISOString(),
            status: "sent",
          };
          addMessage(contextAssistant);
        }
      }

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

      if (fromExternalPage) {
        router.push("/");
      }

      // API 호출
      try {
        setLoading(true);

        // Demo 모드에서는 백엔드 호출 스킵하고 더미 응답 표시
        // 아티팩트 컨텍스트가 있으면 LLM 입력에는 아티팩트 내용을 안전하게 선행해 전송(화면에는 미표시)
        let composedForLLM = userMessageContent;
        let desiredConfig = hitlConfig; // 기본: userStore의 hitlConfig
        if (fromExternalPage && contextArtifactId) {
          const art = getArtifact?.(contextArtifactId);
          if (art?.content) {
            const sep = t("chat.artifactPromptSeparator");
            const preamble = t("chat.artifactContextPreamble");
            const maxLen = 6000;
            const rawCtx = art.content.length > maxLen ? art.content.slice(0, maxLen) + "\n\n…(truncated)" : art.content;
            // 숫자식 종목코드(6자리)와 A+6자리 패턴은 공백 삽입으로 마스킹하여 도구 파이프라인 추출 회피
            const maskedCtx = rawCtx
              .replace(/\b(\d{6})\b/g, (_m: string, g1: string) => g1.split("").join(" "))
              .replace(/\bA(\d{6})\b/g, (_m: string, g1: string) => `A ${g1.split("").join(" ")}`);
            composedForLLM = `${preamble}\n\n\`\`\`context\n${maskedCtx}\n\`\`\`\n\n---\n${sep}\n\n${userMessageContent}`;
            // 외부 컨텍스트 기반 질의는 도구 호출을 피하기 위해 Advisor 모드로 유도
            desiredConfig = PRESET_ADVISOR;
          }
        }

        // 새 세션 강제 시작 시, 이번 요청의 conversation_id는 무조건 undefined로 보냄
        const conversationIdForRequest = fromExternalPage ? undefined : (currentThreadId || undefined);

        // 헬퍼: 스트림 최종 페이로드를 Markdown으로 정리
        const formatFinalMarkdown = (data: any): string => {
          try {
            if (!data) return t("chat.receivedResponse");
            if (typeof data === "string") return data;
            if (typeof data?.message === "string" && data.message.trim()) return data.message;
            // Consensus 기반 요약 구성
            const c = data?.consensus;
            if (c) {
              const rec = c.recommendation ?? "";
              const tp = c.target_price ?? c.targetPrice ?? "";
              const cp = c.current_price ?? c.currentPrice ?? "";
              const up = c.upside_potential ?? c.upsidePotential ?? "";
              const conf = c.confidence ?? "";
              const summary = c.summary ?? "";
              const bulls: string[] = Array.isArray(c.bull_case) ? c.bull_case.slice(0, 5) : [];
              const bears: string[] = Array.isArray(c.bear_case) ? c.bear_case.slice(0, 5) : [];
              let md = `# 추천: ${rec}\n\n- 목표가: ${tp}\n- 현재가: ${cp}\n- 상승여력: ${up}\n- 신뢰도: ${conf}/5`;
              if (summary) md += `\n\n## 요약\n${summary}`;
              if (bulls.length) md += `\n\n## Bull Case\n${bulls.map((b) => `- ${b}`).join("\n")}`;
              if (bears.length) md += `\n\n## Bear Case\n${bears.map((b) => `- ${b}`).join("\n")}`;
              return md;
            }
            // Research 메시지의 마지막 ai 응답 사용
            const msgs = data?.research?.messages;
            if (Array.isArray(msgs)) {
              const lastAI = [...msgs].reverse().find((m: any) => (m?.type || m?.role) === "ai");
              if (lastAI?.content) return String(lastAI.content);
            }
            // 알 수 없는 경우: JSON 을 코드블럭으로 정리하여 덤프 (가로 스크롤 방지)
            return "```json\n" + JSON.stringify(data, null, 2) + "\n```";
          } catch {
            return t("chat.receivedResponse");
          }
        };

        if (mode === "demo") {
          const data = {
            message: t("chat.receivedResponse"),
            conversation_id: `demo-${Date.now()}`,
            requires_approval: false,
          };
          updateMessage(tempId, {
            content: data.message,
            status: "sent",
          });
          setCurrentThreadId(data.conversation_id);
        } else {
          // Live: 우선 스트림 시도, 실패 시 REST 폴백
          try {
            // 스트림 시작 전, pending 메시지는 이미 추가됨 (tempId)
            let lastCid: string | null = null;
            await startMultiAgentStream({
              message: composedForLLM,
              conversation_id: conversationIdForRequest,
              hitl_config: desiredConfig,
              onEvent: (ev) => {
                const now = new Date().toISOString();
                // 스트림 중 서버가 thread/conversation id를 제공하면 즉시 저장하여 LNB 갱신 유도
                try {
                  const providedId = ev?.data?.conversation_id || ev?.data?.thread_id || ev?.data?.id;
                  if (providedId && !useChatStore.getState().currentThreadId) {
                    setCurrentThreadId(String(providedId));
                  }
                } catch {}
                switch (ev.event) {
                  case "master_start":
                    updateMessage(tempId, { status: "sending" });
                    break;
                  case "master_routing": {
                    const agents = ev.data?.agents?.join?.(", ") || "agents";
                    useChatStore.getState().addThinkingStep(tempId, {
                      agent: "planner",
                      description: `Routing: ${agents}`,
                      timestamp: now,
                    });
                    break; }
                  case "agent_start": {
                    const agent = String(ev.data?.agent || "researcher").toLowerCase().includes("strategy") ? "strategy" : (String(ev.data?.agent||"").toLowerCase().includes("research") ? "researcher" : "planner");
                    useChatStore.getState().addThinkingStep(tempId, {
                      agent: agent as any,
                      description: `${ev.data?.agent || "Agent"} start`,
                      timestamp: now,
                    });
                    break; }
                  case "agent_node": {
                    const label = ev.data?.node ? `${ev.data.agent}: ${ev.data.node} ${ev.data.status || "running"}` : `${ev.data?.agent}: running`;
                    useChatStore.getState().addThinkingStep(tempId, {
                      agent: "researcher",
                      description: label,
                      timestamp: now,
                    });
                    break; }
                  case "agent_llm_start":
                  case "agent_llm_end": {
                    useChatStore.getState().addThinkingStep(tempId, {
                      agent: "researcher",
                      description: `${ev.data?.agent || "LLM"} ${ev.event.replace("agent_llm_", "LLM ")}`,
                      timestamp: now,
                    });
                    break; }
                  case "agent_complete": {
                    const summary = ev.data?.result ? String(ev.data.result).slice(0, 120) : "complete";
                    useChatStore.getState().addThinkingStep(tempId, {
                      agent: "researcher",
                      description: `${ev.data?.agent || "Agent"} complete: ${summary}`,
                      timestamp: now,
                    });
                    break; }
                  case "message_delta":
                  case "delta": {
                    let delta: any = ev.data?.delta ?? ev.data?.contentDelta ?? ev.data;
                    if (typeof delta === "string") {
                      if (delta) useChatStore.getState().appendAssistantContent(tempId, delta);
                    } else if (delta && typeof delta?.text === "string") {
                      useChatStore.getState().appendAssistantContent(tempId, delta.text);
                    }
                    break; }
                  case "master_aggregating": {
                    useChatStore.getState().addThinkingStep(tempId, {
                      agent: "planner",
                      description: "Aggregating results…",
                      timestamp: now,
                    });
                    break; }
                  case "master_complete": {
                    const text = formatFinalMarkdown(ev.data);
                    updateMessage(tempId, { content: text, status: "sent" });
                    const cid = ev?.data?.conversation_id || ev?.data?.thread_id || ev?.data?.id;
                    if (cid) { lastCid = String(cid); setCurrentThreadId(String(cid)); }
                    // LNB 세션 목록 새로고침 알림
                    try { window.dispatchEvent(new Event('chat-session-updated')); } catch {}
                    break; }
                  case "done": {
                    // 최종 텍스트가 JSON 그대로 누적된 경우 Markdown으로 정리
                    const m = useChatStore.getState().messages.find(m => m.id === tempId);
                  if (m && m.content && m.content.trim().startsWith('{')) {
                    try {
                      const obj = JSON.parse(m.content);
                      const text = formatFinalMarkdown(obj);
                      updateMessage(tempId, { content: text, status: m.status === 'error' ? 'error' : 'sent' });
                    } catch { /* ignore */ }
                  }
                  // 스트림 종료 시 CID가 없으면 최신 세션으로 보정 시도
                  (async () => {
                    try {
                      const cur = useChatStore.getState().currentThreadId;
                      if (!cur && !lastCid && mode === 'live') {
                        const list: any[] = await getChatSessions(1);
                        const top = Array.isArray(list) ? list[0] : null;
                        const alt = top?.conversation_id || top?.id || top?.thread_id || top?.uuid;
                        if (alt) {
                          setCurrentThreadId(String(alt));
                          try { window.dispatchEvent(new Event('chat-session-updated')); } catch {}
                        }
                      }
                    } catch { /* noop */ }
                  })();
                  // 세션 목록 새로고침 트리거
                  try { window.dispatchEvent(new Event('chat-session-updated')); } catch {}
                  break; }
                  case "hitl.request": {
                    if (ev.data) {
                      try { openApprovalPanel(ev.data as any); } catch { /* noop */ }
                    }
                    break; }
                  case "error": {
                    const msg = ev.data?.message || "Stream error";
                    updateMessage(tempId, { content: msg, status: "error" });
                    break; }
                  case "done":
                  default: {
                    // no-op
                  }
                }
              },
            });
            // 만약 master_complete에서 content가 안 왔다면 안전하게 sent로 전환
            const m = useChatStore.getState().messages.find(m => m.id === tempId);
            if (m && m.status === "sending") {
              updateMessage(tempId, { status: "sent" });
            }
          } catch (streamErr) {
            // 폴백: 단발 응답 REST
            const data = await sendChat({
              message: composedForLLM,
              conversation_id: conversationIdForRequest,
              hitl_config: desiredConfig,
            });
            updateMessage(tempId, { content: data.message || t("chat.receivedResponse"), status: "sent" });
            const cid = (data as any)?.conversation_id || (data as any)?.thread_id || (data as any)?.id || (data as any)?.metadata?.conversation_id;
            if (cid) {
              setCurrentThreadId(String(cid));
              // LNB 세션 목록 새로고침 알림 (REST 폴백 경로에서도 보장)
              try { window.dispatchEvent(new Event('chat-session-updated')); } catch {}
            } else if (mode === 'live') {
              // 응답에 CID가 없으면 최신 세션으로 보정 시도
              try {
                const list: any[] = await getChatSessions(1);
                const top = Array.isArray(list) ? list[0] : null;
                const alt = top?.conversation_id || top?.id || top?.thread_id || top?.uuid;
                if (alt) {
                  setCurrentThreadId(String(alt));
                  try { window.dispatchEvent(new Event('chat-session-updated')); } catch {}
                }
              } catch { /* noop */ }
            }
            if (data.requires_approval && data.approval_request) {
              try { openApprovalPanel(data.approval_request as any); } catch {}
            }
          }
        }
      } catch (error) {
        // API 연결 실패 시: 대기 메시지를 에러로 업데이트
        const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
        const docsUrl = `${apiBase}/docs`;
        const errorText = `${t("chat.backendError")}\n\n**오류 내용:**\n\`\`\`\n${error instanceof Error ? error.message : "알 수 없는 오류"}\n\`\`\`\n\n**해결 방법:**\n1. 백엔드 서버가 실행 중인지 확인하세요 (\`${apiBase}\`)\n2. 서버 실행: \`python -m uvicorn src.main:app --reload\`\n3. API 문서 확인: ${docsUrl}\n\n${t("chat.backendErrorDetail")}`;
        updateMessage(tempId, {
          content: errorText,
          status: "error",
        });
      } finally {
        setLoading(false);
        // 전송 후에도 입력창 포커스를 유지하여 즉시 추가 입력 가능
        if (textareaRef.current) {
          setTimeout(() => textareaRef.current?.focus(), 0);
        }
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isLoading) handleSubmit(e);
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
