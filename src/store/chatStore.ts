import { create } from "zustand";
import { Message, ApprovalRequest } from "@/lib/types/chat";

/**
 * Chat Store (Zustand)
 *
 * 채팅 관련 전역 상태 관리
 * - 메시지 목록
 * - 현재 스레드 ID
 * - 로딩 상태
 * - HITL 승인 패널 상태
 *
 * @see TechnicalSpecification.md - Section 4.1 Global State
 */

interface ChatStore {
  // State
  messages: Message[];
  currentThreadId: string;
  isLoading: boolean;
  approvalPanel: {
    isOpen: boolean;
    data: ApprovalRequest | null;
  };

  // Actions
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentThreadId: (threadId: string) => void;
  openApprovalPanel: (data: ApprovalRequest) => void;
  closeApprovalPanel: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  // Initial State
  messages: [],
  currentThreadId: "",
  isLoading: false,
  approvalPanel: {
    isOpen: false,
    data: null,
  },

  // Actions
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    })),

  deleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    })),

  clearMessages: () =>
    set({
      messages: [],
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  setCurrentThreadId: (threadId) =>
    set({
      currentThreadId: threadId,
    }),

  openApprovalPanel: (data) =>
    set({
      approvalPanel: { isOpen: true, data },
    }),

  closeApprovalPanel: () =>
    set({
      approvalPanel: { isOpen: false, data: null },
    }),
}));
