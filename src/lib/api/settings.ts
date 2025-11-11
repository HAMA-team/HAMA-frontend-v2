/**
 * Settings API Client
 *
 * 자동화 레벨 설정 관련 API 호출
 *
 * @see docs/qa/Settings_Approvals_API_Complete_Design.md - Section 2
 */

import apiClient from '@/lib/api';
import type {
  HITLConfig,
  AutomationLevelResponse,
  AutomationLevelUpdateResponse,
} from '@/types/hitl';

// 신규 경로 우선 사용, 필요 시 구(legacy) 경로로 폴백
const NEW_BASE = '/api/v1/settings/hitl-config';
const LEGACY_LEVEL = '/api/v1/settings/settings/automation-level';
const LEGACY_LEVELS = '/api/v1/settings/settings/automation-levels';

/**
 * GET /api/v1/settings/hitl-config (alias: /settings/automation-level)
 *
 * 현재 사용자의 자동화 레벨 설정 조회
 *
 * @note TEMPORARY FIX: 백엔드에서 prefix 중복 (/settings/settings/)
 * @todo 백엔드 수정 후 /api/v1/settings/automation-level로 변경 필요
 *
 * @returns AutomationLevelResponse with hitl_config
 */
export async function getAutomationLevel(): Promise<AutomationLevelResponse> {
  try {
    const { data } = await apiClient.get<AutomationLevelResponse>(NEW_BASE);
    return data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status && (status === 404 || status === 405 || status === 500)) {
      // 백엔드 과도기: 구 경로 폴백
      const { data } = await apiClient.get<AutomationLevelResponse>(LEGACY_LEVEL);
      return data;
    }
    throw err;
  }
}

/**
 * PUT /api/v1/settings/hitl-config (alias: /settings/automation-level)
 *
 * 자동화 레벨 설정 변경
 *
 * @note TEMPORARY FIX: 백엔드에서 prefix 중복 (/settings/settings/)
 * @todo 백엔드 수정 후 /api/v1/settings/automation-level로 변경 필요
 *
 * @param config - 새로운 HITL 설정
 * @returns AutomationLevelUpdateResponse with success status
 */
export async function updateAutomationLevel(
  config: HITLConfig
): Promise<AutomationLevelUpdateResponse> {
  try {
    const { data } = await apiClient.put<AutomationLevelUpdateResponse>(
      NEW_BASE,
      {
        hitl_config: config,
        confirm: true, // 변경 확인 (사용자 의도 검증)
      }
    );
    return data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status && (status === 404 || status === 405 || status === 500)) {
      const { data } = await apiClient.put<AutomationLevelUpdateResponse>(
        LEGACY_LEVEL,
        {
          hitl_config: config,
          confirm: true,
        }
      );
      return data;
    }
    throw err;
  }
}

/**
 * GET /api/v1/settings/hitl-config/presets (alias: /settings/automation-levels)
 *
 * 사용 가능한 자동화 레벨 프리셋 목록 조회
 *
 * @note TEMPORARY FIX: 백엔드에서 prefix 중복 (/settings/settings/)
 * @todo 백엔드 수정 후 /api/v1/settings/automation-levels로 변경 필요
 *
 * @returns Presets list with metadata
 */
export async function listAutomationLevels(): Promise<{
  presets: Array<{
    preset: string;
    config: HITLConfig;
    metadata: {
      name: string;
      description: string;
      features: string[];
      recommended_for: string;
    };
  }>;
  custom_available: boolean;
}> {
  try {
    const { data } = await apiClient.get(`${NEW_BASE}/presets`);
    return data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status && (status === 404 || status === 405 || status === 500)) {
      const { data } = await apiClient.get(LEGACY_LEVELS);
      return data;
    }
    throw err;
  }
}

