import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * User Store (Zustand + Persist)
 *
 * 사용자 설정 관련 전역 상태 관리
 * - 자동화 레벨
 * - 투자 성향 프로필
 * - 사용자 정보
 *
 * @see PRD - US-4 (Automation Level), US-5 (Investment Profile)
 */

export type AutomationLevel = 1 | 2 | 3;

export interface InvestmentProfile {
  type: '안정형' | '안정추구형' | '위험중립형' | '공격투자형';
  description: string; // LLM 생성 서술형 프로필
  last_updated: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface UserStore {
  // State
  userInfo: UserInfo | null;
  automationLevel: AutomationLevel;
  investmentProfile: InvestmentProfile | null;
  isLoadingProfile: boolean;

  // Actions
  setUserInfo: (userInfo: UserInfo) => void;
  setAutomationLevel: (level: AutomationLevel) => void;
  setInvestmentProfile: (profile: InvestmentProfile) => void;
  setLoadingProfile: (loading: boolean) => void;
  clearUserData: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // Initial State
      userInfo: null,
      automationLevel: 2, // Default: Copilot
      investmentProfile: null,
      isLoadingProfile: false,

      // Actions
      setUserInfo: (userInfo) =>
        set({
          userInfo,
        }),

      setAutomationLevel: (level) =>
        set({
          automationLevel: level,
        }),

      setInvestmentProfile: (profile) =>
        set({
          investmentProfile: profile,
        }),

      setLoadingProfile: (loading) =>
        set({
          isLoadingProfile: loading,
        }),

      clearUserData: () =>
        set({
          userInfo: null,
          automationLevel: 2,
          investmentProfile: null,
        }),
    }),
    {
      name: 'hama-user-storage', // LocalStorage key
      partialize: (state) => ({
        // 저장할 state만 선택 (userInfo는 제외 - 보안)
        automationLevel: state.automationLevel,
      }),
    }
  )
);
