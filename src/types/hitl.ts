/**
 * HITL (Human-in-the-Loop) Configuration Types
 *
 * 자동화 레벨 시스템의 타입 정의
 * - Preset 모드: pilot, copilot, advisor
 * - Custom 모드: phase별 개별 제어 (Phase 3+)
 *
 * @see docs/AutomationLevelIntegration.md
 * @see docs/qa/Settings_Approvals_API_Complete_Design.md - Section 5.2
 */

export type HITLPreset = "pilot" | "copilot" | "advisor" | "custom";

/**
 * Phase별 HITL 개입 여부
 *
 * trade 필드는 특별히 "conditional" 값을 가질 수 있음:
 * - true: 항상 HITL 필요
 * - false: HITL 불필요 (자동 실행)
 * - "conditional": Pilot 모드 전용 - 저위험 시 자동, 고위험 시 HITL
 */
export type HITLTradeValue = boolean | "conditional";

export interface HITLPhases {
  data_collection: boolean;
  analysis: boolean;
  portfolio: boolean;
  risk: boolean;
  trade: HITLTradeValue;
}

/**
 * HITL 설정 객체
 *
 * preset: 사전 정의된 모드 또는 custom
 * phases: 각 단계별 HITL 개입 여부
 */
export interface HITLConfig {
  preset: HITLPreset;
  phases: HITLPhases;
}

// ============================================================================
// Preset Definitions
// ============================================================================

/**
 * Pilot 모드 (Lv 1)
 *
 * AI가 대부분 자동으로 처리
 * - 저위험 매매: 자동 실행
 * - 고위험 매매: 승인 필요
 */
export const PRESET_PILOT: HITLConfig = {
  preset: "pilot",
  phases: {
    data_collection: false,
    analysis: false,
    portfolio: false,
    risk: false,
    trade: "conditional", // 저위험 시 자동, 고위험 시 HITL
  },
};

/**
 * Copilot 모드 (Lv 2) - 기본값
 *
 * AI가 제안하고, 중요한 결정은 사용자가 승인
 * - 포트폴리오 구성: 승인 필요
 * - 모든 매매: 승인 필요
 */
export const PRESET_COPILOT: HITLConfig = {
  preset: "copilot",
  phases: {
    data_collection: false,
    analysis: false,
    portfolio: true,
    risk: false,
    trade: true,
  },
};

/**
 * Advisor 모드 (Lv 3)
 *
 * AI는 정보만 제공, 모든 중요 결정은 사용자가 직접
 * - 투자 전략: 승인 필요
 * - 포트폴리오 구성: 승인 필요
 * - 모든 매매: 승인 필요
 */
export const PRESET_ADVISOR: HITLConfig = {
  preset: "advisor",
  phases: {
    data_collection: false,
    analysis: true,
    portfolio: true,
    risk: false,
    trade: true,
  },
};

// ============================================================================
// API Response Types
// ============================================================================

/**
 * GET /api/v1/settings/automation-level 응답
 */
export interface AutomationLevelResponse {
  hitl_config: HITLConfig;
  preset_name: string;
  description: string;
  interrupt_points: string[];
}

/**
 * PUT /api/v1/settings/automation-level 응답
 */
export interface AutomationLevelUpdateResponse {
  success: boolean;
  message: string;
  new_config: HITLConfig;
  effective_from: string;
}

/**
 * POST /api/v1/chat/approve 요청
 */
export interface ApprovalRequest {
  thread_id: string;
  decision: "approved" | "rejected" | "modified";
  modifications?: Record<string, any>;
  user_notes?: string;
}

/**
 * POST /api/v1/chat/approve 응답
 */
export interface ApprovalResponse {
  success: boolean;
  message: string;
  result?: Record<string, any>;
  graph_completed: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Preset 이름으로 HITLConfig 가져오기
 */
export function getPresetConfig(preset: HITLPreset): HITLConfig {
  switch (preset) {
    case "pilot":
      return PRESET_PILOT;
    case "advisor":
      return PRESET_ADVISOR;
    case "copilot":
    default:
      return PRESET_COPILOT;
  }
}

/**
 * automation_level (숫자) → HITLConfig 변환
 * LocalStorage 마이그레이션용
 */
export function migrateAutomationLevel(level: number): HITLConfig {
  switch (level) {
    case 1:
      return PRESET_PILOT;
    case 3:
      return PRESET_ADVISOR;
    case 2:
    default:
      return PRESET_COPILOT;
  }
}

/**
 * HITLConfig에서 HITL 개입 지점 추출
 * UI 표시용
 */
export function getInterruptPoints(config: HITLConfig): string[] {
  const points: string[] = [];

  if (config.phases.data_collection) {
    points.push("data_collection");
  }
  if (config.phases.analysis) {
    points.push("analysis");
  }
  if (config.phases.portfolio) {
    points.push("portfolio");
  }
  if (config.phases.risk) {
    points.push("risk");
  }
  if (config.phases.trade === true) {
    points.push("trade");
  } else if (config.phases.trade === "conditional") {
    points.push("trade (conditional)");
  }

  return points;
}
