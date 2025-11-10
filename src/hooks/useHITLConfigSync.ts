import { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/userStore';
import { useAppModeStore } from '@/store/appModeStore';
import { getAutomationLevel } from '@/lib/api/settings';

/**
 * HITL Config 동기화 훅
 *
 * 기능:
 * 1. 앱 시작 시 서버에서 설정 가져오기 (Live 모드)
 * 2. 모드 전환 시 동기화 (Demo → Live)
 * 3. 멀티탭 동기화 (storage event)
 *
 * @see docs/AutomationLevelAPIChanges.md
 */
export function useHITLConfigSync() {
  const { mode } = useAppModeStore();
  const { hitlConfig, setHITLConfig, setLastSyncedConfig, setLoading } = useUserStore();
  const hasInitialSyncRef = useRef(false);

  // 1. 앱 시작 시 + 모드 전환 시 서버 동기화
  useEffect(() => {
    const syncFromServer = async () => {
      if (mode !== 'live') return;
      if (hasInitialSyncRef.current) return; // 이미 동기화했으면 스킵

      setLoading(true);
      try {
        const response = await getAutomationLevel();

        // 서버 설정이 로컬과 다르면 서버 우선
        if (JSON.stringify(response.hitl_config) !== JSON.stringify(hitlConfig)) {
          console.log('[Sync] Server config differs from local, updating to server config');
          setHITLConfig(response.hitl_config);
          setLastSyncedConfig(response.hitl_config);
        } else {
          // 같으면 lastSyncedConfig만 업데이트
          setLastSyncedConfig(response.hitl_config);
        }

        hasInitialSyncRef.current = true;
      } catch (error) {
        console.warn('[Sync] Failed to sync from server, using local config:', error);
        // 실패해도 로컬 설정으로 계속 사용 (오프라인 지원)
        setLastSyncedConfig(hitlConfig);
      } finally {
        setLoading(false);
      }
    };

    syncFromServer();
  }, [mode]); // mode 변경 시에도 재동기화

  // 2. 멀티탭 동기화 (storage event)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // hama-user-storage 변경 감지
      if (e.key === 'hama-user-storage' && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          const newConfig = newData.state?.hitlConfig;

          if (newConfig && JSON.stringify(newConfig) !== JSON.stringify(hitlConfig)) {
            console.log('[Sync] Another tab changed config, syncing...');
            setHITLConfig(newConfig);
          }
        } catch (error) {
          console.error('[Sync] Failed to parse storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [hitlConfig, setHITLConfig]);

  // 3. 주기적 동기화 (Live 모드에서만, 5분마다)
  useEffect(() => {
    if (mode !== 'live') return;

    const interval = setInterval(async () => {
      try {
        const response = await getAutomationLevel();

        if (JSON.stringify(response.hitl_config) !== JSON.stringify(hitlConfig)) {
          console.warn('[Sync] Server config changed remotely. Local and server are out of sync.');
          // 조용히 동기화 (사용자가 수정 중일 수 있으므로 강제 덮어쓰지 않음)
          // 필요시 토스트로 알림 가능
        }
      } catch (error) {
        // 조용히 실패 (백그라운드 동기화)
      }
    }, 5 * 60 * 1000); // 5분

    return () => clearInterval(interval);
  }, [mode, hitlConfig]);
}
