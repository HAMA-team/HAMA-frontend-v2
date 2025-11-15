# HITL Stream Contract (SSE)

본 문서는 스트림 기반(HITL-first) 연동을 위한 서버↔클라이언트 계약을 정의합니다. 실제 구현 상태(현재)와 목표 상태(표준화)를 병기하여 점진적 마이그레이션을 지원합니다.

**범위**
- Endpoint: `POST /api/v1/chat/multi-stream`
- MIME: `text/event-stream`
- 전송 방향: Server → Client (단방향)

## 1) 요청(Request) 스키마

현재(Current)
- `automation_level?: number` (1|2|3) — legacy

목표(Target)
- `message: string`
- `conversation_id?: string`
- `hitl_config: {
    preset: 'pilot'|'copilot'|'advisor'|'custom',
    phases: {
      data_collection: boolean,
      analysis: boolean,
      portfolio: boolean,
      risk: boolean,
      trade: true|false|"conditional"
    }
  }`
- `stream_thinking?: boolean` (기본 true)

서버 처리
- `hitl_config` 우선, 미제공 시 `automation_level`을 `hitl_config`로 변환(하위호환)

## 2) 이벤트(Event) 타입

공통(현재/목표 공통)
- `master_start`, `master_routing`, `agent_start`, `agent_node`, `agent_llm_start`, `agent_llm_end`, `agent_complete`, `master_complete`, `error`, `done`

HITL 트리거(표준)
- `event: hitl.request`
  - 승인 필요 시 전송되는 표준 이벤트
  - `data.requires_approval === true`

호환 경로(현재)
- Trading 등 일부 단계는 `agent_complete`의 `data.result.requires_approval`로 신호

## 3) HITL 요청 데이터 스키마

공통 필드
- `type: 'trading'|'portfolio'|'strategy'|'research'|'risk'`
- `conversation_id: string`
- `requires_approval: true`
- `created_at?: string` (ISO 8601)

Trading
- 필수: `action: 'buy'|'sell'`, `stock_code`, `stock_name`, `quantity: number`, `price: number`, `total_amount: number`
- 선택: `current_weight?: number`, `expected_weight?: number`, `risk_warning?: string`,
  `alternatives?: Array<{ suggestion: string, adjusted_quantity: number, adjusted_amount: number }>`

Portfolio (Rebalancing)
- 필수: `rebalancing_needed: boolean`, `trades_required: Array<{ stock_code, order_type: 'buy'|'sell', quantity, estimated_amount }>`
- 선택: `proposed_allocation[]`, `expected_return?: number`, `expected_volatility?: number`, `sharpe_ratio?: number`, `constraint_violations?: string[]`

Strategy / Research / Risk (요약)
- Strategy: `strategy_type`, `market_outlook`, `sector_strategy`, `target_allocation`, `expected_return`, `expected_risk`
- Research: `query`, `routing_reason`, `depth_level`, `expected_workers[]`
- Risk: `risk_level`, `risk_factors[]`, `portfolio_metrics{ ... }`, `recommended_actions[]`

예시(hitl.request, trading)
```
event: hitl.request
data: {
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

```

## 4) 상태 플래그 / 멱등성

- Trading: `trade_prepared`, `trade_approved`, `trade_executed`
- Portfolio: `rebalance_prepared`, `rebalance_approved`, `rebalance_executed`
- Strategy/Research: `{action}_approved` 등 필요 시 확장

규칙
- 동일 스레드에서 재개(resume) 시, 이미 `*_approved=True`이면 동일 노드에서 중복 승인 요청 금지

## 5) 에러 및 경계 케이스

- 불완전 데이터: 승인 신호만 우선 전송 가능(UX degrade 허용). 권장 필드는 최대한 포함
- 메시지 순서: `hitl.request`는 관련 `agent_*` 이벤트 직후 전송 권장
- 종료: `done` 또는 `master_complete`로 명시

## 6) 마이그레이션 가이드

- v1: `agent_complete`의 `result.requires_approval` 사용(현행)
- v2: `hitl.request` 표준 이벤트 도입(권장)
- 과도기: 양 경로 병행 송출(프론트는 둘 다 처리)

