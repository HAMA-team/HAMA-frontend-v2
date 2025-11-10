# HITL 승인/거부 기록 자동 저장 구현 가이드

## 문제
프론트엔드에서 HITL 승인/거부 시 로컬 chatStore에만 기록 추가되고 백엔드 채팅 히스토리에 저장되지 않아 채팅 히스토리 불러올 때 HITL 기록 사라짐

## 해결 방안
새로운 `/api/v1/chat/approve` POST 엔드포인트 생성 → 승인/거부/수정 처리 + 채팅 히스토리 자동 저장

스트림 연동(트리거)
- SSE에서 HITL 승인 신호 수신 시점에 “승인 요청”을 자동 저장합니다.
  - 표준: `event: hitl.request`
  - 현행 호환: `agent_complete`의 `result.requires_approval === true`
  - 저장 위치: `approval_requests`(요청 요약) + 대화 히스토리(assistant, approval_request)

## 구현 상세

### 1. 새 파일 생성: `src/api/routes/approval_handler.py`

```python
"""
HITL Approval Handler API
승인/거부 처리 + 채팅 히스토리 자동 저장
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import uuid
import logging

from src.services import chat_history_service
from src.config.settings import settings

logger = logging.getLogger(__name__)
router = APIRouter()


class ApprovalRequest(BaseModel):
    """승인/거부/수정 요청"""
    thread_id: str
    decision: str = Field(..., regex="^(approved|rejected|modified)$")
    modifications: Optional[Dict[str, Any]] = None
    user_notes: Optional[str] = None


class ApprovalResponse(BaseModel):
    """승인/거부/수정 응답"""
    success: bool
    message: str
    conversation_id: str
    graph_completed: bool = False
    result: Optional[Dict[str, Any]] = None


@router.post("/approve", response_model=ApprovalResponse)
async def handle_approval(request: ApprovalRequest):
    """
    HITL 승인/거부 처리

    1. 채팅 히스토리에 2개 메시지 저장:
       - 승인 요청 내용 (assistant)
       - 사용자 결정 (user)
    2. LangGraph state update (향후 구현)

    **⚠️ 중요: 채팅 히스토리 저장이 먼저, state 업데이트는 나중**
    """
    try:
        conversation_uuid = uuid.UUID(request.thread_id)

        # ✅ 1. 승인 요청 내용을 assistant 메시지로 저장
        # TODO: 실제 approval request 데이터를 state나 DB에서 가져와야 함
        # 지금은 간단한 메시지로 저장
        approval_request_msg = "💰 매매 주문 승인 요청\n\n(승인 요청 상세 내용)"

        await chat_history_service.append_message(
            conversation_id=conversation_uuid,
            role="assistant",
            content=approval_request_msg,
            metadata={"type": "approval_request"}
        )

        # ✅ 2. 사용자 결정을 user 메시지로 저장
        decision_emoji = "✅" if request.decision == "approved" else ("✏️" if request.decision == "modified" else "❌")
        decision_text = (
            "승인됨" if request.decision == "approved" else (
                "수정 승인" if request.decision == "modified" else "거부됨"
            )
        )
        decision_msg = f"{decision_emoji} **{decision_text}**"

        await chat_history_service.append_message(
            conversation_id=conversation_uuid,
            role="user",
            content=decision_msg,
            metadata={
                "type": "approval_decision",
                "decision": request.decision,
                "modifications": request.modifications,
                "user_notes": request.user_notes,
            }
        )

        # TODO: 3. LangGraph state update
        # await update_graph_state(request.thread_id, {
        #     "trade_approved": request.decision == "approved",
        #     "user_decision": request.decision,
        #     "user_modifications": request.modifications
        # })

        # 예시: 실행 결과(옵션)
        exec_result: Dict[str, Any] = {}

        return ApprovalResponse(
            success=True,
            message=f"승인 처리 완료: {decision_text}",
            conversation_id=request.thread_id,
            graph_completed=False,  # LangGraph resume 후 완료 시 true로 반환
            result=exec_result or None,
        )

    except ValueError as e:
        logger.error(f"잘못된 UUID: {request.thread_id}")
        raise HTTPException(status_code=400, detail=f"Invalid thread_id: {str(e)}")
    except Exception as e:
        logger.error(f"승인 처리 실패: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Approval failed: {str(e)}")
```

### 2. Router 등록: `src/api/routes/__init__.py`

```python
from fastapi import APIRouter
from .approvals import router as approvals_router
from .approval_handler import router as approval_handler_router  # 추가
from .multi_agent_stream import router as chat_router
# ... 기타 router들

api_router = APIRouter()
api_router.include_router(approvals_router, prefix="/approvals", tags=["approvals"])
api_router.include_router(approval_handler_router, prefix="/chat", tags=["chat"])  # 추가
api_router.include_router(chat_router, prefix="/chat", tags=["chat"])
# ... 기타 router들
```

### 3. 승인 요청 데이터 포맷팅 함수

approval_request 데이터를 마크다운으로 변환하는 함수를 `approval_handler.py`에 추가:

```python
def format_approval_request(approval_data: Dict[str, Any]) -> str:
    """
    승인 요청 데이터를 마크다운 포맷으로 변환

    Args:
        approval_data: Trading Agent가 생성한 approval request

    Returns:
        마크다운 포맷 문자열
    """
    request_type = approval_data.get("type", "trading")

    if request_type == "trading":
        action = approval_data.get("action", "BUY")
        action_kr = "매수" if action == "BUY" else "매도"

        return f"""## 💰 매매 주문 승인 요청

**거래 유형**: {action_kr}
**종목**: {approval_data.get('stock_name')} ({approval_data.get('stock_code')})
**수량**: {approval_data.get('quantity'):,}주
**가격**: {approval_data.get('price'):,}원
**총 금액**: {approval_data.get('total_amount'):,}원

**포트폴리오 영향**:
- 현재 비중: {approval_data.get('current_weight', 0):.1f}%
- 예상 비중: {approval_data.get('expected_weight', 0):.1f}%

{f"⚠️ **리스크 경고**: {approval_data.get('risk_warning')}" if approval_data.get('risk_warning') else ''}"""

    # research, strategy, portfolio, risk 타입도 추가 가능
    return f"## 승인 요청\n\n{approval_data}"
```

### 4. TODO: LangGraph State Update (향후 구현)

현재 백엔드에는 LangGraph의 state를 외부에서 업데이트하는 메커니즘이 없음.
Trading Agent는 `trade_approved` 플래그를 state에서 체크하므로 이를 업데이트해야 함.

```python
# ⚠️ LangGraph에서 공식적으로 지원하는 방법 확인 필요
# Option 1: Checkpointer를 통한 state 수정
# Option 2: 새로운 이벤트로 graph resume
# Option 3: 별도 테이블에 approval 상태 저장 후 graph에서 조회

# 예시 (구현 필요):
# from langgraph.checkpoint import get_checkpointer
# checkpointer = get_checkpointer()
# current_state = checkpointer.get(thread_id)
# current_state["trade_approved"] = True
# checkpointer.put(thread_id, current_state)
```

### 5. 승인 요청 데이터 저장 (Trading Agent 수정)

`src/agents/trading/nodes.py`의 `approval_trade_node` 수정:

```python
# approval_trade_node 끝부분에 추가
# 승인 요청 데이터를 state나 별도 테이블에 저장
approval_request_data = {
    "type": "trading",
    "thread_id": state.get("request_id"),  # conversation_id
    "stock_code": summary.get("stock_code"),
    "stock_name": "...",  # DB 조회 필요
    "action": summary.get("order_type"),
    "quantity": summary.get("order_quantity"),
    "price": summary.get("order_price"),
    "total_amount": ...,
    "current_weight": ...,
    "expected_weight": ...,
    "risk_warning": state.get("risk_warning"),
}

# Option 1: state에 저장
return {"approval_request_data": approval_request_data, ...}

# Option 2: 별도 테이블에 저장 (권장)
# approval_requests 테이블에 저장하고 status=pending 으로 마킹
# await save_approval_request(approval_request_data)
```

### 6. 프론트엔드 변경 (정책 권장: 즉시 메시지 + 백엔드 자동 저장 병행)

현재 프론트엔드는 승인/거부 시 `addMessage()`로 로컬 state에 기록을 추가함.
백엔드가 자동 저장하므로 이 부분을 **제거할 수 있음**:

```typescript
// src/app/page.tsx - handleApprove
await approveAction({
  thread_id: currentThreadId,
  decision: "approved",
  modifications: modifications
});

closeApprovalPanel();
// ❌ addMessage() 호출 제거 - 백엔드가 자동 저장
```

권장 정책(A): 프론트 즉시 메시지 + 백엔드 자동 저장 병행
- 프론트는 승인/거부 클릭 즉시 메시지 2개(assistant 요약, user 결정)를 추가해 즉시 피드백 제공
- 백엔드는 동일 내역을 채팅 히스토리에 저장(출처 구분을 위해 metadata.type 사용)
- 중복 렌더 방지: 프론트가 히스토리 재로딩 시 metadata.type(approval_request/approval_decision)와 타임스탬프 범위로 중복 억제

대안(B): 프론트 메시지 추가 제거, 백엔드 자동 저장만 사용(즉시성 저하를 로더/토스트로 보완)

## 테스트

1. HITL 승인/거부 실행
2. `GET /api/v1/chat/sessions/{conversation_id}` 호출
3. 승인 요청(assistant) + 결정(user) 메시지 2개 확인
4. 브라우저 새로고침 후 채팅 히스토리 불러와서 기록 유지 확인

## 상태/이력 저장 범위(권장)

- 승인 요청 생성 시
  - `approval_requests` upsert (status=pending, 요청 요약/영향/리스크/대안 저장)
  - 채팅 히스토리에 assistant 메시지(approval_request) 저장
- 승인 결정 수신 시
  - `user_decisions` insert (decision, decided_at, modifications, user_notes)
  - `approval_requests.status` 업데이트(pending → approved|rejected|modified)
  - 필요 시 실행 결과 요약(result)을 채팅 히스토리에 반영

## 참고

- `src/services/chat_history_service.py`: 메시지 저장 서비스
- `src/agents/trading/nodes.py`: Trading Agent HITL 로직
- `src/api/routes/multi_agent_stream.py`: 채팅 메시지 저장 예시 (line 323-333, 829-834)
