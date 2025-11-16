# HITL SSE 스트리밍 구현 가이드

**Date**: 2025-11-02
**Urgency**: 🔴 Critical - HITL 기능이 작동하지 않음
**For**: Backend Team
**Status**: 긴급 구현 필요

---

## 문제 상황

사용자가 "삼성전자 10주 매수" 요청 시 HITL 패널이 뜨지 않음.

### 현재 구현 상태

| 구성 요소 | 상태 | 위치 |
|----------|------|------|
| Trading Agent `interrupt()` 호출 | ✅ 구현됨 | `src/agents/trading/nodes.py:116` |
| Portfolio Agent approval 로직 | ⚠️ interrupt 미호출 | `src/agents/portfolio/nodes.py:479-531` |
| Strategy Agent approval | ❌ 미구현 | - |
| Research Agent approval | ❌ 미구현 | - |
| Risk Agent approval | ❌ 미구현 | - |
| **SSE 스트리밍 interrupt 이벤트 발신** | ❌ **미구현** | `src/api/routes/multi_agent_stream.py` |
| 프론트엔드 hitl_config 전송 | ✅ 정상 | `ChatInput.tsx:195` |
| 프론트엔드 approval 이벤트 수신 준비 | ⚠️ 케이스 추가 필요 | `ChatInput.tsx:196-314` |

### 핵심 문제

**`multi_agent_stream.py`에서 LangGraph interrupt를 감지하고 SSE로 프론트엔드에 알리는 로직이 없습니다.**

---

## 필요한 구현

### 1. Trading Agent (이미 구현됨 ✅)

**위치**: `src/agents/trading/nodes.py:64-149`

```python
from langgraph.types import interrupt

def approval_trade_node(state: TradingState) -> dict:
    # ... (생략)

    # ✅ 이미 구현됨
    user_response = interrupt(value="trade_approval", payload=order_details)

    decision = (user_response or {}).get("decision")
    if decision == "approved":
        return {"trade_approved": True, ...}
    # ...
```

**Payload 구조**:
```python
{
    "type": "trade_approval",
    "order_id": "...",
    "stock_code": "005930",
    "quantity": 10,
    "order_type": "BUY",
    "estimated_price": 70000,
    "total_amount": 700000,
    "risk_level": "medium",
    "risk_factors": [...],
    "message": "매매 주문을 승인하시겠습니까?"
}
```

---

### 2. Portfolio Agent (interrupt 호출 추가 필요 ⚠️)

**위치**: `src/agents/portfolio/nodes.py:479-531`

**현재 상태**:
```python
def approval_rebalance_node(state: PortfolioState) -> dict:
    # ... 승인 payload 생성
    interrupt_payload = {
        "type": "rebalance_approval",
        "order_id": state.get("rebalance_order_id"),
        "trades_required": trades_required,
        "proposed_allocation": proposed_allocation,
        # ...
    }

    # ❌ interrupt_payload를 만들기만 하고 interrupt() 호출 안 함!
    approval: Interrupt = {
        "id": f"rebalance-{interrupt_payload['order_id']}",
        "value": interrupt_payload,
    }

    # 그냥 자동 승인 처리
    return {"rebalance_approved": True, "messages": messages}
```

**수정 필요**:
```python
from langgraph.types import interrupt

def approval_rebalance_node(state: PortfolioState) -> dict:
    # ... (기존 로직)

    interrupt_payload = {
        "type": "rebalance_approval",
        # ...
    }

    # ✅ interrupt 호출 추가
    user_response = interrupt(value="rebalance_approval", payload=interrupt_payload)

    decision = (user_response or {}).get("decision")
    if decision == "approved":
        return {"rebalance_approved": True, ...}
    elif decision == "rejected":
        return {"rebalance_approved": False, ...}
    elif decision == "modified":
        modifications = user_response.get("modifications", {})
        return {"rebalance_approved": True, "modified_allocation": modifications, ...}
```

---

### 3. Strategy Agent (interrupt 추가 필요 ❌)

**참고**: `docs/HITL_Panel_Specifications.md:169-260`

**구현 위치**: `src/agents/strategy/nodes.py` (새로운 approval 노드 필요)

```python
from langgraph.types import interrupt

def approval_strategy_node(state: StrategyState) -> dict:
    """
    투자 전략 승인 노드 (HITL Interrupt Point)

    Advisor 레벨에서만 승인 필요
    """
    if state.get("strategy_approved"):
        return {}

    hitl_config = state.get("hitl_config")
    if not hitl_config.phases.analysis:  # Advisor만
        return {"strategy_approved": True}

    strategy = state.get("strategy", {})
    interrupt_payload = {
        "type": "strategy_approval",
        "strategy_type": strategy.get("type"),
        "target_allocation": strategy.get("allocation"),
        "expected_return": strategy.get("expected_return"),
        "risk_level": strategy.get("risk"),
        "rebalancing_frequency": strategy.get("rebalancing_frequency"),
        "message": "투자 전략을 승인하시겠습니까?"
    }

    user_response = interrupt(value="strategy_approval", payload=interrupt_payload)

    decision = (user_response or {}).get("decision")
    if decision == "approved":
        return {"strategy_approved": True}
    elif decision == "rejected":
        return {"strategy_approved": False}
    elif decision == "modified":
        modifications = user_response.get("modifications", {})
        return {"strategy_approved": True, "modified_strategy": modifications}
```

**그래프 수정**:
```python
# src/agents/strategy/graph.py
workflow.add_node("approval_strategy", approval_strategy_node)
workflow.add_edge("generate_strategy", "approval_strategy")
workflow.add_conditional_edges(
    "approval_strategy",
    lambda s: "finalize" if s.get("strategy_approved") else END
)
```

---

### 4. Research Agent (Master 레벨 interrupt 권장 ❌)

**참고**: `docs/HITL_Panel_Specifications.md:26-167`

**구현 위치**: `src/api/routes/multi_agent_stream.py` (Master Agent에서 처리)

**이유**:
- Research Agent는 내부적으로 5개 Worker를 동적으로 선택함
- Worker 레벨에서 interrupt하면 사용자가 혼란스러움
- **Master Agent에서 Research 실행 전에 한 번만 승인받는 것이 UX상 최적**

```python
# multi_agent_stream.py
routing_decision = await route_query(message, user_profile)

for agent_name in routing_decision.agents_to_call:
    should_interrupt = False

    if agent_name == "research":
        hitl_config = request.hitl_config
        if hitl_config.phases.analysis:  # Advisor 레벨
            # 복잡도 기반 HITL
            if routing_decision.query_complexity == "expert" or \
               routing_decision.depth_level == "comprehensive":
                should_interrupt = True

    elif agent_name == "strategy":
        if hitl_config.phases.analysis:
            should_interrupt = True

    elif agent_name == "portfolio":
        if hitl_config.phases.portfolio:
            should_interrupt = True

    elif agent_name == "trading":
        # Trading은 자체 노드에서 처리
        pass

    if should_interrupt:
        # ✅ Master 레벨 interrupt
        approval_payload = {
            "type": f"{agent_name}_approval",
            "agent": agent_name.title(),
            "query": message,
            "routing_reason": routing_decision.reason,
            "query_complexity": routing_decision.query_complexity,
            "depth_level": routing_decision.depth_level,
        }

        # 여기서 interrupt 발생 → SSE로 전송 필요 (아래 5번 참조)
        # user_response = interrupt(value=f"{agent_name}_approval", payload=approval_payload)
        # if user_response.get("decision") != "approved":
        #     continue  # 이 Agent 스킵

    # Agent 실행
    result = await agent.ainvoke(...)
```

---

### 5. **SSE 스트리밍에서 interrupt 이벤트 감지 및 전송 (핵심!) 🔴**

**위치**: `src/api/routes/multi_agent_stream.py`

**현재 문제**:
- LangGraph `interrupt()`가 호출되어도 프론트엔드로 알리는 로직이 없음
- SSE 스트리밍이 그냥 멈춰버림

**필요한 구현**:

```python
async def stream_multi_agent_response(request: ChatStreamRequest):
    """멀티 에이전트 SSE 스트리밍"""

    # ... (기존 코드)

    async def event_generator():
        try:
            # LangGraph astream_events 사용
            async for event in graph.astream_events(
                initial_state,
                config=config,
                version="v2"
            ):
                event_type = event.get("event")
                event_data = event.get("data", {})

                # ✅ interrupt 이벤트 감지
                if event_type == "__interrupt__":
                    interrupt_value = event_data.get("value")  # "trade_approval", "rebalance_approval" 등
                    interrupt_payload = event_data.get("payload", {})

                    # SSE로 프론트엔드에 전송
                    yield {
                        "event": "approval_required",
                        "data": json.dumps({
                            "type": interrupt_value,
                            "payload": interrupt_payload,
                            "thread_id": thread_id,
                            "conversation_id": conversation_id,
                        })
                    }

                    # 그래프 실행이 여기서 일시 정지됨
                    # 사용자가 /api/v1/chat/approve로 응답하면 재개
                    break

                # 기존 이벤트 처리
                elif event_type == "on_chain_start":
                    # ...
                elif event_type == "on_chat_model_stream":
                    # ...
                # ...

        except Exception as e:
            logger.exception("Stream error: %s", e)
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

**핵심 포인트**:
1. `astream_events(..., version="v2")` 사용 (interrupt 이벤트 포함)
2. `event["event"] == "__interrupt__"` 감지
3. SSE로 `approval_required` 이벤트 전송
4. 프론트엔드가 `/api/v1/chat/approve` 호출하면 재개

---

### 6. Approval API 업데이트 (Command 처리)

**위치**: `src/api/routes/chat.py`

**현재 상태**: 확인 필요

**필요한 구현**:
```python
from langgraph.types import Command

@router.post("/approve")
async def approve_action(request: ApprovalRequest):
    """HITL 승인/거부 처리"""

    config = {
        "configurable": {
            "thread_id": request.thread_id
        }
    }

    try:
        # 중단된 그래프 상태 확인
        state = await checkpointer.aget_state(config)

        if not state.next:
            raise HTTPException(
                status_code=400,
                detail="No pending approval for this thread"
            )

        # Command로 재개
        if request.decision == "approved":
            command = Command(
                resume={"decision": "approved", "notes": request.user_notes}
            )
        elif request.decision == "rejected":
            command = Command(
                resume={"decision": "rejected", "reason": request.user_notes}
            )
        elif request.decision == "modified":
            command = Command(
                resume={
                    "decision": "modified",
                    "modifications": request.modifications,
                    "notes": request.user_notes
                }
            )

        # 그래프 재개 (SSE 스트리밍 계속됨)
        result = await graph.ainvoke(None, config=config, command=command)

        return ApprovalResponse(
            success=True,
            message="승인이 처리되었습니다",
            result=result
        )

    except Exception as e:
        logger.error(f"Approval failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 프론트엔드 대응

### ChatInput.tsx 수정 필요

**위치**: `src/components/layout/ChatInput.tsx:196-314` (onEvent 핸들러)

**추가할 케이스**:
```typescript
switch (ev.event) {
  // ... 기존 케이스들

  case "approval_required": {
    const approvalData = ev.data;
    openApprovalPanel({
      type: approvalData.type,  // "trade_approval", "rebalance_approval" 등
      payload: approvalData.payload,
      threadId: approvalData.thread_id,
      conversationId: approvalData.conversation_id,
    });
    break;
  }

  // ...
}
```

---

## 구현 우선순위

### P0 (즉시)
1. ✅ **SSE 스트리밍 interrupt 이벤트 감지 및 전송** (`multi_agent_stream.py`)
2. ✅ **프론트엔드 approval 이벤트 케이스 추가** (`ChatInput.tsx`)
3. ⚠️ **Portfolio Agent interrupt 호출 추가** (`portfolio/nodes.py`)

### P1
4. ❌ **Strategy Agent approval 노드 구현** (`strategy/nodes.py`, `strategy/graph.py`)
5. ❌ **Research Agent Master 레벨 interrupt** (`multi_agent_stream.py`)

### P2
6. ❌ **Risk Agent approval 노드 구현**

---

## 테스트 시나리오

### 1. Trading Agent HITL
```
사용자: "삼성전자 10주 매수"
→ Trading Agent 실행
→ approval_trade_node에서 interrupt 발생
→ SSE로 approval_required 이벤트 전송
→ 프론트엔드 HITL 패널 표시
→ 사용자 승인
→ /api/v1/chat/approve 호출
→ Command로 재개
→ execute_trade_node 실행
```

### 2. Portfolio Agent HITL
```
사용자: "포트폴리오 리밸런싱 해줘"
→ Portfolio Agent 실행
→ approval_rebalance_node에서 interrupt 발생
→ SSE로 approval_required 이벤트 전송
→ 프론트엔드 HITL 패널 표시 (매수/매도 목록)
→ 사용자 승인
→ execute_rebalance_node 실행
```

### 3. Research Agent HITL (복잡도 기반)
```
사용자: "삼성전자 종합 분석해줘" (Advisor 레벨)
→ Router: query_complexity="expert", depth="comprehensive"
→ Master Agent에서 Research 실행 전 interrupt
→ SSE로 approval_required 이벤트 전송
→ 프론트엔드 HITL 패널 표시 (분석 복잡도 표시)
→ 사용자 승인
→ Research Agent 실행 (Worker 동적 선택)
```

---

## 참고 문서

- `HITL_Panel_Specifications.md` - 5개 Agent별 HITL 패널 UI 구조
- `Settings_Approvals_API_Backend_Feedback.md` - 기존 피드백 문서 (10월 30일)
- `AutomationLevelAPIChanges.md` - hitl_config 마이그레이션 가이드

---

## 추가 이슈: Settings API 경로 중복 🔴

**발견일**: 2025-11-02
**Severity**: P1 (High)

### 문제

Settings API 엔드포인트 경로가 중복되어 `/api/v1/settings/settings/...` 형태로 되어있습니다.

**현재 상태**:
```
실제 경로: /api/v1/settings/settings/automation-level ❌
의도한 경로: /api/v1/settings/automation-level ✅
```

### 원인

**위치 1**: `src/api/routes/settings.py:34`

```python
# ❌ 문제: prefix="/settings"가 이미 포함됨
router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/automation-level")
# 이 라우터의 실제 경로: /settings/automation-level
```

**위치 2**: `src/main.py:134`

```python
# main.py에서 또 prefix를 추가
app.include_router(
    settings_router.router,
    prefix=f"{api_prefix}/settings",  # /api/v1/settings 추가
    tags=["settings"]
)
```

**결과**: `/api/v1/settings` + `/settings` + `/automation-level` = `/api/v1/settings/settings/automation-level`

### 해결 방법 (권장)

**`settings.py`에서 prefix 제거**

```python
# src/api/routes/settings.py:34
# Before
router = APIRouter(prefix="/settings", tags=["settings"])

# After
router = APIRouter(tags=["settings"])
```

이렇게 하면:
- `main.py`의 `prefix=f"{api_prefix}/settings"`만 적용
- 최종 경로: `/api/v1/settings/automation-level` ✅

### 영향받는 엔드포인트

| 현재 (잘못됨) | 수정 후 |
|-------------|---------|
| `GET /api/v1/settings/settings/automation-level` | `GET /api/v1/settings/automation-level` |
| `PUT /api/v1/settings/settings/automation-level` | `PUT /api/v1/settings/automation-level` |
| `GET /api/v1/settings/settings/automation-levels` | `GET /api/v1/settings/automation-levels` |

### 참고

이 문제는 `docs/qa/Settings_Approvals_API_Backend_Feedback.md` (10월 30일 작성)에서 의도한 설계와 다릅니다.

---

## 요약

### 현재 상황
- Trading Agent는 `interrupt()` 호출함 ✅
- **BUT**: SSE 스트리밍에서 interrupt 이벤트를 프론트엔드로 보내지 않음 ❌
- 따라서 HITL 패널이 절대 뜨지 않음
- Settings API 경로 중복 (`/settings/settings/...`) ⚠️

### 필요한 작업

#### HITL 관련 (P0 - 긴급)
1. **`multi_agent_stream.py`에 `__interrupt__` 이벤트 감지 로직 추가** (핵심!)
2. Portfolio Agent에 `interrupt()` 호출 추가
3. Strategy/Research Agent에 approval 노드 추가

#### Settings API 관련 (P1 - 높음)
4. **`src/api/routes/settings.py:34`에서 `prefix="/settings"` 제거**

---