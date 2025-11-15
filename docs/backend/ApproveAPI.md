# Approve API (HITL Decision)

HITL 승인/거부/수정 결정을 서버에 전달하는 REST API 계약입니다. LangGraph 인터럽트 지점에서 재개(resume)하여 후속 노드를 실행합니다.

**Endpoint**
- `POST /api/v1/chat/approve`

## 1) Request

```
{
  "thread_id": "<conversation id>",
  "decision": "approved" | "rejected" | "modified",
  "modifications": { ... },   // optional
  "user_notes": "..."         // optional
}
```

설명
- `thread_id`: 스트림/대화 스레드 식별자(프론트는 currentThreadId 사용)
- `decision`: 승인/거부/수정
- `modifications`: 수정 승인 시 필요한 델타(예: 수량/가격 수정)
- `user_notes`: 사용자 메모

## 2) Response

호환형(프론트 타입과 일치)
```
{
  "success": true,
  "message": "✅ 승인 완료 - 매수 주문이 실행되었습니다",
  "conversation_id": "...",
  "graph_completed": true,
  "result": {                // optional, 실행 결과 요약
    "order_id": "...",
    "status": "filled|simulated",
    "price": 76300,
    "quantity": 131
  }
}
```

또는 백엔드 내부 스키마(상위 호환)
```
{
  "status": "approved|rejected|modified",
  "message": "...",
  "conversation_id": "...",
  "result": { ... }
}
```

## 3) 동작 규칙

- 인터럽트 지점에서 LangGraph resume
  - Trading: `approval_trade_node` → `execute_trade_node`로 진행
  - Portfolio: `approval_rebalance_node` → `execute_rebalance_node` (시뮬/실행)
- 상태 플래그 멱등성
  - `{action}_prepared/approved/executed`로 중복 실행 방지
  - 이미 `*_approved=True`이면 동일 승인 재요청 시 no-op
- 이력 저장
  - 승인 요청: `approval_requests`
  - 사용자 결정: `user_decisions` (approved/rejected/modified)

## 4) 에러 케이스

- `404`: 알 수 없는 thread_id 또는 승인 대기 상태가 아님
- `409`: 이미 처리된 승인 요청(멱등성 위반)
- `422`: 유효하지 않은 `modifications` (예: 음수 수량)
- `500`: 내부 오류(LLM 호출/외부 연동 실패 등)

응답 메시지는 i18n 프런트 토스트/다이얼로그에 표시 가능하도록 간결/친화적 문구 권장.

## 5) 예시

승인(approved)
```
POST /api/v1/chat/approve
{
  "thread_id": "550e8400-e29b-41d4-a716-446655440000",
  "decision": "approved"
}
```

수정(modified)
```
POST /api/v1/chat/approve
{
  "thread_id": "...",
  "decision": "modified",
  "modifications": {
    "quantity": 50,
    "price": 76000
  },
  "user_notes": "비중 과도 방지 위해 절반만"
}
```

거부(rejected)
```
POST /api/v1/chat/approve
{
  "thread_id": "...",
  "decision": "rejected",
  "user_notes": "시장 변동성 과도"
}
```

## 6) 구현 메모(서버)

- 스트림 전용 플로우와 자연스럽게 결합되도록, 승인 처리 후 후속 이벤트/최종 응답을 대화 로그에 남김
- 승인 직후 실행 결과를 즉시 반환하거나, 후속 메시지로 별도 전송하는 하이브리드 고려 가능
- 기존 `automation_level`은 제거하고, Interrupt 여부는 `hitl_config` 기반으로 판단

