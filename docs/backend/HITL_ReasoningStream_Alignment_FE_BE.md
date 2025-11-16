# HITL 스트리밍 정합성 정리 (FE → BE 전달용)

## 1. 현재 관찰된 상태

- 프런트에서 `POST /api/v1/chat/multi-stream` SSE를 수신할 때,
  - `reasoning_event`는 잘 오지만,
  - 어떤 이벤트의 `data`에도 `approval_request` 필드가 존재하지 않음.
- `/api/v1/chat/approve` 호출 시, 특정 케이스에서
  - `500 Internal Server Error` + `Approval processing error: NotImplementedError` 발생.
- 즉, HITL-MODIFY-PATTERN.md / OpenAPI에 정의된 HITL interrupt 페이로드가
  - REST `/chat` 응답이나 SSE 이벤트 어느 쪽에서도 완전히 구현되어 있지 않은 상태로 보임.

## 2. 프런트 기준 기대 스펙 (요약)

### 2.1 REST `/api/v1/chat/` 응답

HITL-MODIFY-PATTERN.md 2.1의 예시대로, **HITL interrupt 발생 시** `ChatResponse`는 아래 형태를 기대합니다.

```json
{
  "message": "🔔 사용자 승인이 필요합니다.",
  "conversation_id": "...",
  "requires_approval": true,
  "metadata": {
    "interrupted": true,
    "intervention_required": false
  },
  "approval_request": {
    "type": "trade_approval",
    "request_id": "c1c5...",
    "thread_id": "...",
    "action": "buy",
    "stock_code": "005930",
    "stock_name": "삼성전자",
    "quantity": 10,
    "price": 75000,
    "total_amount": 750000,
    "current_weight": 0.12,
    "expected_weight": 0.18,
    "risk_warning": "⚠️ 단일 종목 18%",
    "portfolio_before": { "...": "..." },
    "portfolio_after": { "...": "..." },
    "risk_before": { "...": "..." },
    "risk_after": { "...": "..." },
    "modifiable_fields": ["quantity", "price", "action"],
    "supports_user_input": true,
    "pending_node": "trade_hitl",
    "message": "삼성전자 10주를 75,000원에 매수할까요?"
  }
}
```

프런트는 **`requires_approval === true && approval_request 존재`** 를 HITL 신호로 인식합니다.

### 2.2 SSE `/api/v1/chat/multi-stream` 이벤트

ReasoningEventStreamGuide 기준으로, 프런트는 다음 두 가지 패턴 중 하나로 HITL interrupt를 받기를 기대합니다.

1. **전용 HITL 이벤트** (권장)

```text
event: hitl_interrupt  (또는 hitl.request)
data: {
  "message": "...",
  "conversation_id": "...",
  "requires_approval": true,
  "metadata": { "interrupted": true, "intervention_required": false },
  "approval_request": { ... },
  "reasoning_event": {
    "event_label": "hitl_interrupt",
    "phase": "hitl",
    "status": "start|complete",
    "message": "승인 필요",
    "...": "..."
  }
}
```

2. **슈퍼바이저 agent_complete 내 HITL 표현**

```text
event: agent_complete
data: {
  "message": "...",
  "conversation_id": "...",
  "requires_approval": true,
  "approval_request": { ... },
  "reasoning_event": {
    "event_label": "agent_complete",
    "phase": "supervision",
    "status": "complete",
    "message": "branch:to:supervisor 작업 완료",
    "...": "..."
  }
}
```

프런트는 현재 다음 조건으로 패널을 엽니다.

- `data.reasoning_event.phase === "hitl" && data.approval_request 존재`
- 또는 `event === "agent_complete" && reasoning_event.phase === "supervision" && data.approval_request 존재`

즉, **어떤 이벤트든 상관없이 `data.approval_request`가 포함되면 HITL 패널이 열릴 수 있도록 구현해 두었고**, 현재는 이 필드 자체가 전혀 오지 않고 있습니다.

## 3. `/api/v1/chat/approve` 관련

OpenAPI 상 `ApprovalRequest` 스키마는 다음과 같습니다.

```json
{
  "thread_id": "string",
  "decision": "approved | rejected | modified",
  "request_id": "string | null",
  "modifications": { "...": "..." } | null,
  "user_input": "string | null",
  "user_notes": "string | null"
}
```

프런트는 현재 다음과 같이 전송합니다.

- 승인:
  ```json
  { "thread_id": "...", "decision": "approved", "request_id": "..." }
  ```
- 수정:
  ```json
  {
    "thread_id": "...",
    "decision": "modified",
    "request_id": "...",
    "modifications": { ... },
    "user_input": "..."
  }
  ```

지금은 이 요청에 대해 `/chat/approve` 쪽에서 `Approval processing error: NotImplementedError`로 500을 반환하고 있습니다.  
→ 즉, 스키마는 맞지만 실제 처리 로직(특히 `decision="modified"` 케이스)이 아직 구현되어 있지 않은 상태입니다.

## 4. 백엔드 측 TODO 제안

1. **HITL interrupt 페이로드를 SSE에도 실어주기**
   - 위 2.1 / 2.2 예시 중 하나의 형태로,
   - 최소한 하나의 SSE 이벤트의 `data` 안에
     - `requires_approval: true`
     - `approval_request: { type: "trade_approval" | "research_plan_approval" | "rebalance_approval", ... }`
     를 포함해 주세요.
   - ReasoningEventStreamGuide에 맞춰 `reasoning_event.phase = "hitl"` 로 표현해 주면, 프런트는 그걸 1차 신호로 사용합니다.

2. **`/api/v1/chat/approve` 처리 로직 구현**
   - `ApprovalRequest` 스키마 기준으로 `decision` 값별 행동을 구현:
     - `approved`: 그래프 resume + 실행
     - `rejected`: 그래프 중단 / 사용자 알림용 응답
     - `modified`: `modifications` / `user_input`를 LangGraph state에 반영 후 실행
   - 현재 `NotImplementedError`인 부분을 제거하고, 최소 happy-path(approved/modified)가 동작하도록 해 주시면 프런트는 그대로 응답만 소비하면 됩니다.

3. **동작 확인용 체크리스트 (FE 관점)**

- 브라우저 DevTools → Network → `chat/multi-stream` → `Messages`/`EventStream` 탭에서:
  - `data.approval_request`가 포함된 이벤트가 1개 이상 존재하는지 확인
  - 해당 이벤트에 `reasoning_event.phase === "hitl"` 또는
    `event === "agent_complete" && reasoning_event.phase === "supervision"`가 함께 오는지 확인
- 같은 시점에 프런트 콘솔에 다음 로그가 찍히면 HITL 패널이 열립니다.
  - `[HITL][open-panel][reasoning] ...` 또는
  - `[HITL][open-panel][stream-event] ...`

이 문서는 **프런트가 실제로 기대하는 HITL 이벤트/페이로드 형태**를 명시하기 위한 것이며,  
HITL-MODIFY-PATTERN.md + OpenAPI 정의에 맞춰 백엔드 동작을 정렬하는 데 사용하면 됩니다.

