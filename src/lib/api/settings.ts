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

/**
 * GET /api/v1/settings/automation-level
 *
 * 현재 사용자의 자동화 레벨 설정 조회
 *
 * @returns AutomationLevelResponse with hitl_config
 */
export async function getAutomationLevel(): Promise<AutomationLevelResponse> {
  const { data } = await apiClient.get<AutomationLevelResponse>(
    '/api/v1/settings/automation-level'
  );
  return data;
}

/**
 * PUT /api/v1/settings/automation-level
 *
 * 자동화 레벨 설정 변경
 *
 * @param config - 새로운 HITL 설정
 * @returns AutomationLevelUpdateResponse with success status
 */
export async function updateAutomationLevel(
  config: HITLConfig
): Promise<AutomationLevelUpdateResponse> {
  const { data } = await apiClient.put<AutomationLevelUpdateResponse>(
    '/api/v1/settings/automation-level',
    {
      hitl_config: config,
      confirm: true, // 변경 확인 (사용자 의도 검증)
    }
  );
  return data;
}

/**
 * GET /api/v1/settings/automation-levels
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
  const { data } = await apiClient.get('/api/v1/settings/automation-levels');
  return data;
}

