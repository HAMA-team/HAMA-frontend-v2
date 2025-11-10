# HITL Frontend Contract

프론트에서 HITL(승인 패널)이 언제/어떻게 열리고, 어떤 데이터를 주고받는지에 대한 실제 구현 기준 계약입니다. 스트림 중심 동작을 1순위로 설명하고, 현재/목표(호환) 차이를 명시합니다.

**핵심 요약**
- 프론트는 스트림 호출 시 `hitl_config`를 전달합니다.
- 서버는 스트림 이벤트에서 승인 필요 시 신호를 보냅니다. 현재는 `agent_complete`의 `result.requires_approval`을 활용하고, 목표는 `event: hitl.request` 표준화입니다.
- 승인/거부는 `POST /api/v1/chat/approve`로 전달하며, `automation_level`은 제거되었고 `thread_id, decision, modifications?, user_notes?`만 전달합니다.

## 1) 호출(요청) 규칙 — hitl_config 전달

- 스트림 시작: `POST /api/v1/chat/multi-stream`
- 프론트 요청 본문(실제 구현)
  - `message: string`
  - `conversation_id?: string`
  - `hitl_config: { preset: 'pilot'|'copilot'|'advisor'|'custom', phases: { data_collection: boolean, analysis: boolean, portfolio: boolean, risk: boolean, trade: true|false|"conditional" } }`
  - `stream_thinking: true`

참고 소스: `src/lib/api/chatStream.ts`, `src/store/userStore.ts`, `src/types/hitl.ts`

백엔드 현재 상태(참조): 요청 스키마는 legacy `automation_level`을 받도록 되어 있으나, 내부에서 `automation_level_to_hitl_config(...)` 변환을 사용 중. 목표는 `hitl_config` 직접 수신으로의 이행(백엔드 스펙 정비 필요).

## 2) 트리거(수신) 구조 — 스트림 이벤트

현재(Current)
- `event: agent_complete`의 `data.result.requires_approval === true`이면 패널 오픈
  - Trading 에이전트에 대해 확실히 지원 (주문 요약 포함)
- `event: hitl.request` 이벤트도 처리 분기 존재(예비)

목표(Target)
- `event: hitl.request`로 통일
  - 공통 필드: `{ type, conversation_id, requires_approval: true, created_at, ... }`
  - 타입: `trading | portfolio | strategy | research | risk`
  - 타입별 상세 페이로드는 백엔드 계약 문서(HITLStreamContract.md) 참조

UI 오픈 소스: `src/components/layout/ChatInput.tsx` (`agent_complete` 처리), `src/app/page.tsx` (`openApprovalPanel`)

## 3) approval_request(타입별) 스키마 — 표시 우선순위

공통 표시 규칙
- 값이 없거나 타입 불일치 시 해당 행 숨김 또는 "-" 처리
- 통화/수치 포맷은 프론트가 처리하므로 원시 number 권장
- `thread_id`는 대개 `conversation_id`로 취급(프론트는 패널 오픈 시점의 currentThreadId 사용)

Trading(매매) — 권장 필드
- `action: 'buy'|'sell'`
- `stock_code: string`, `stock_name: string`
- `quantity: number`, `price: number`, `total_amount: number`
- `current_weight?: number`, `expected_weight?: number`
- `risk_warning?: string`
- `alternatives?: Array<{ suggestion: string, adjusted_quantity: number, adjusted_amount: number }>`

Portfolio(리밸런싱) — 권장 필드
- `rebalancing_needed: boolean`
- `trades_required: Array<{ stock_code, order_type: 'buy'|'sell', quantity, estimated_amount }>`
- `proposed_allocation: Array<{ stock_code, stock_name, target_weight, action, quantity_change }>`
- `expected_return?: number`, `expected_volatility?: number`, `sharpe_ratio?: number`
- `constraint_violations?: string[]`

Strategy/Research/Risk — 권장 필드 예시(요약)
- Strategy: `strategy_type`, `market_outlook`, `sector_strategy`, `target_allocation`, `expected_return`, `expected_risk`
- Research: `query`, `routing_reason`, `depth_level`, `expected_workers`
- Risk: `risk_level`, `risk_factors[]`, `portfolio_metrics{ ... }`, `recommended_actions[]`

패널 라우팅: `src/components/hitl/HITLPanel.tsx`

## 4) 승인/거부 API 입력 — 최신 규약

- `thread_id: string`
- `decision: 'approved' | 'rejected' | 'modified'`
- `modifications?: object`
- `user_notes?: string`

예시
{
  "thread_id": "3dd9b2fb-6bbc-42cb-8b3e-a7e5a1f9bfe5",
  "decision": "approved",
  "modifications": {
    "stock_code": "005930",
    "quantity": 100,
    "price": 70000,
    "action": "buy"
  }
}

호출 소스: `src/app/page.tsx` → `approveAction()` → `src/lib/api/approvals.ts`

## 5) 프리셋/커스텀 의미 — phase ⇄ Interrupt 매핑(개념)

- `data_collection: true` → 데이터 수집 시작 전 승인(Worker 호출 전)
- `analysis: true` → 분석/종합 단계 전 승인(Research/Strategy 주요 노드)
- `portfolio: true` → 리밸런싱 계획 승인(`approval_rebalance_node`)
- `risk: true` → 임계 이상 리스크 경고 시 승인(경고 확인/대안 선택)
- `trade: true` → 모든 매매 승인(`approval_trade_node`)
- `trade: "conditional"` → 저위험 자동, 그 외 승인(서버 리스크 판정 필요)

참고: 프론트는 신호 수신에만 관여하며, 실제 Interrupt 발생 여부/지점 결정은 서버가 수행.

## 6) 예시 페이로드 (현재/목표)

현재(Current)
{
  "event": "agent_complete",
  "data": {
    "agent": "trading",
    "result": {
      "requires_approval": true,
      "stock_code": "005930",
      "stock_name": "삼성전자",
      "action": "buy",
      "quantity": 131,
      "price": 76300,
      "total_amount": 999,
      "current_weight": 25.0,
      "expected_weight": 43.2
    }
  }
}

목표(Target)
{
  "event": "hitl.request",
  "data": {
    "type": "trading",
    "conversation_id": "...",
    "requires_approval": true,
    "stock_code": "005930",
    "stock_name": "삼성전자",
    "action": "buy",
    "quantity": 131,
    "price": 76300,
    "total_amount": 999,
    "current_weight": 25.0,
    "expected_weight": 43.2
  }
}

## 7) 에러/불완전 데이터 처리 가이드

- 승인 신호(`requires_approval`)가 있으면 최대한 패널을 띄우고, 누락 필드는 숨김/"-"로 표시
- 통화/퍼센트 포맷은 프론트 처리. 문자열 숫자 금지(원시 number 권장)
- 서버 오류는 4xx/친화적 메시지로 반환 권장(UX degrade 가능)

## 8) 프론트 처리 참고(파일 경로)

- 패널 라우터: `src/components/hitl/HITLPanel.tsx`
- Trading 패널: `src/components/hitl/TradingApprovalPanel.tsx`
- Portfolio 패널: `src/components/hitl/PortfolioApprovalPanel.tsx`
- 스트림 클라이언트: `src/lib/api/chatStream.ts`
- 승인 API: `src/lib/api/approvals.ts`, 호출부 `src/app/page.tsx`
