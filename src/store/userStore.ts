import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HITLConfig, HITLPhases } from '@/types/hitl';
import { PRESET_COPILOT, migrateAutomationLevel } from '@/types/hitl';

/**
 * User Store (Zustand + Persist)
 *
 * 사용자 설정 관련 전역 상태 관리
 * - HITL 설정 (automation_level → hitl_config 마이그레이션)
 * - 투자 성향 프로필
 * - 사용자 정보
 *
 * @see PRD - US-4 (Automation Level), US-5 (Investment Profile)
 * @see docs/AutomationLevelAPIChanges.md - Frontend Migration
 */

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
  hitlConfig: HITLConfig;
  customModePhases: HITLPhases | null; // Custom 모드의 마지막 설정 (기억용)
  investmentProfile: InvestmentProfile | null;
  isLoadingProfile: boolean;
  isLoading: boolean; // Settings API 로딩 상태
  lastSyncedConfig: HITLConfig | null; // 서버와 마지막 동기화된 설정 (롤백용)
  _hasHydrated: boolean; // Zustand persist hydration 완료 여부

  // Actions
  setUserInfo: (userInfo: UserInfo) => void;
  setHITLConfig: (config: HITLConfig) => void;
  setCustomModePhases: (phases: HITLPhases) => void; // Custom 모드 설정 저장
  setInvestmentProfile: (profile: InvestmentProfile) => void;
  setLoadingProfile: (loading: boolean) => void;
  setLoading: (loading: boolean) => void;
  setLastSyncedConfig: (config: HITLConfig) => void;
  rollbackHITLConfig: () => void; // API 실패 시 이전 설정으로 복구
  clearUserData: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

const initialState = {
  userInfo: null,
  hitlConfig: PRESET_COPILOT, // Default: Copilot
  customModePhases: null, // Custom 모드 설정 기억
  investmentProfile: null,
  isLoadingProfile: false,
  isLoading: false,
  lastSyncedConfig: null,
  _hasHydrated: false,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial State
      ...initialState,

      // Actions
      setUserInfo: (userInfo) =>
        set({
          userInfo,
        }),

      setHasHydrated: (hydrated) =>
        set({
          _hasHydrated: hydrated,
        }),

      setCustomModePhases: (phases) =>
        set({
          customModePhases: phases,
        }),

      setHITLConfig: (config) => {
        // Custom 모드로 설정 시 phases를 기억
        if (config.preset === 'custom') {
          set({
            hitlConfig: config,
            customModePhases: config.phases,
          });
          return;
        }

        // 다른 프리셋으로 변경 시
        // LocalStorage 에러 처리
        try {
          set({
            hitlConfig: config,
          });
        } catch (error) {
          console.error('Failed to save HITL config to LocalStorage:', error);
          // QuotaExceededError 등 - 메모리에만 저장하고 계속 진행
          set({
            hitlConfig: config,
          });
        }
      },

      setInvestmentProfile: (profile) =>
        set({
          investmentProfile: profile,
        }),

      setLoadingProfile: (loading) =>
        set({
          isLoadingProfile: loading,
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      setLastSyncedConfig: (config) =>
        set({
          lastSyncedConfig: config,
        }),

      rollbackHITLConfig: () => {
        const { lastSyncedConfig } = get();
        if (lastSyncedConfig) {
          set({
            hitlConfig: lastSyncedConfig,
          });
        }
      },

      clearUserData: () =>
        set({
          ...initialState,
          _hasHydrated: true, // 이미 hydration은 완료된 상태
        }),
    }),
    {
      name: 'hama-user-storage', // LocalStorage key
      version: 2, // automation_level → hitlConfig 마이그레이션

      // 마이그레이션 함수
      migrate: (persistedState: any, version: number) => {
        // v1 → v2: automation_level → hitlConfig 변환
        if (version < 2 && persistedState.automationLevel) {
          const level = persistedState.automationLevel as number;
          persistedState.hitlConfig = migrateAutomationLevel(level);
          delete persistedState.automationLevel;
        }

        // hitlConfig가 없으면 기본값 설정 (방어 코드)
        if (!persistedState.hitlConfig) {
          persistedState.hitlConfig = PRESET_COPILOT;
        }

        return persistedState as UserStore;
      },

      partialize: (state) => ({
        // 저장할 state만 선택 (userInfo는 제외 - 보안)
        hitlConfig: state.hitlConfig,
        customModePhases: state.customModePhases, // Custom 모드 설정도 저장
      }),

      // Hydration 완료 후 기본값 병합
      merge: (persistedState: any, currentState: UserStore) => {
        return {
          ...currentState,
          ...persistedState,
          // hitlConfig가 없으면 기본값 사용
          hitlConfig: persistedState.hitlConfig || PRESET_COPILOT,
        };
      },

      // Hydration 완료 시 호출
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Failed to rehydrate userStore:', error);
          }
          if (state) {
            state.setHasHydrated(true);
          }
        };
      },
    }
  )
);

// Hydration 감지 훅
export const useHydration = () => {
  return useUserStore((state) => state._hasHydrated);
};
