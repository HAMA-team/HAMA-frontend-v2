"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ArrowUp, Paperclip } from "lucide-react";

interface PersistentChatInputProps {
  onSend?: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function PersistentChatInput({
  onSend,
  placeholder = "메시지를 입력하세요...",
  disabled = false,
}: PersistentChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend?.(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div
      className="fixed bottom-8 z-20"
      style={{
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 320px - 8rem)",
        maxWidth: "900px",
      }}
    >
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
        <div className="flex items-end gap-3 p-4">
          <button
            type="button"
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Attach file"
          >
            <Paperclip size={20} strokeWidth={1.5} />
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none border-none bg-transparent text-base leading-6 text-gray-900 placeholder-gray-500 focus:outline-none"
            style={{
              maxHeight: "200px",
              minHeight: "24px",
            }}
            aria-label="Chat message input"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className={`rounded-lg p-2 transition-colors ${
              canSend
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "cursor-not-allowed bg-gray-200 text-gray-400"
            }`}
            aria-label="Send message"
          >
            <ArrowUp size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="mt-2 text-center text-xs text-gray-500">
        AI가 실수할 수 있습니다. 중요한 정보는 확인하세요.
      </div>
    </div>
  );
}
