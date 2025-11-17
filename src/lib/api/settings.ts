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
  InterventionSettingsResponse,
  InterventionSettingsUpdateRequest,
  InterventionSettingsUpdateResponse,
  // Legacy aliases for backwards compatibility
  AutomationLevelResponse,
  AutomationLevelUpdateResponse,
} from '@/types/hitl';

// Intervention 설정 엔드포인트 (최신)
// 백엔드 OpenAPI: /api/v1/settings/intervention
const NEW_BASE = '/api/v1/settings/intervention';

// 과거 automation-level 기반 엔드포인트 (백엔드 레거시 호환용)
const LEGACY_LEVEL = '/api/v1/settings/settings/automation-level';
const LEGACY_LEVELS = '/api/v1/settings/settings/automation-levels';

/**
 * GET /api/v1/settings/intervention
 *
 * 현재 사용자의 HITL Intervention 설정 조회
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
 * PUT /api/v1/settings/intervention
 *
 * HITL Intervention 설정 변경
 *
 * @param config - 새로운 HITL 설정
 * @returns AutomationLevelUpdateResponse with success status
 */
export async function updateAutomationLevel(
  config: HITLConfig
): Promise<AutomationLevelUpdateResponse> {
  try {
    // 백엔드 스키마(HITLConfig)는 phases만 포함하므로, 프론트 전용 필드(preset 등)는 제거하고 전송
    const payloadConfig = {
      phases: config.phases,
    };

    const { data } = await apiClient.put<AutomationLevelUpdateResponse>(
      NEW_BASE,
      {
        hitl_config: payloadConfig,
        confirm: true, // 변경 확인 (사용자 의도 검증)
      }
    );
    return data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status && (status === 404 || status === 405 || status === 500)) {
      const legacyPayloadConfig = {
        phases: config.phases,
      };
      const { data } = await apiClient.put<AutomationLevelUpdateResponse>(
        LEGACY_LEVEL,
        {
          hitl_config: legacyPayloadConfig,
          confirm: true,
        }
      );
      return data;
    }
    throw err;
  }
}

/**
 * GET /api/v1/settings/intervention/presets (백엔드에서 제공 시 사용)
 *
 * 사용 가능한 자동화 레벨 프리셋 목록 조회
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

