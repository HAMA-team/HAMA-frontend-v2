import { create } from 'zustand';

/**
 * Toast Store (Zustand)
 *
 * 토스트 메시지 관련 전역 상태 관리
 * - 토스트 표시/숨김
 * - 메시지, 타입, 링크 관리
 *
 * @see ProductRequirements.md - US-1.3
 */

interface ToastState {
  isVisible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  linkText?: string;
  linkHref?: string;
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info',
    linkText?: string,
    linkHref?: string
  ) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  isVisible: false,
  message: '',
  type: 'success',
  linkText: undefined,
  linkHref: undefined,
  showToast: (message, type = 'success', linkText, linkHref) =>
    set({
      isVisible: true,
      message,
      type,
      linkText,
      linkHref,
    }),
  hideToast: () =>
    set({
      isVisible: false,
      message: '',
      linkText: undefined,
      linkHref: undefined,
    }),
}));
