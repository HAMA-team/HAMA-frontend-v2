# Settings & Approvals API - Backend Feedback

**Date**: 2025-10-30
**Reviewer**: Frontend Team
**Backend Version**: Current (Pre-hitl_config Migration)
**Status**: Critical Issues Found - Requires Immediate Attention ⚠️

---

## Executive Summary

Settings와 Approvals API를 Portfolio API 분석과 동일한 방식으로 철저히 점검한 결과, **심각한 문제점들이 발견**되었습니다.

### 🔴 Critical Issues (P0)
1. **HITL Approval 메커니즘이 실제로 작동하지 않음** - LangGraph interrupt가 구현되지 않음
2. **automation_level → hitl_config 마이그레이션 시 기존 코드 전면 수정 필요**
3. **Settings API가 프론트엔드와 연동되지 않음** (orphaned endpoints)

### 🟡 High Priority (P1)
4. Strategy Agent와 Portfolio Agent에 HITL 구현이 전혀 없음
5. ApprovalRequest 스키마가 불필요한 필드를 포함함

### 🟢 Medium Priority (P2)
6. List Automation Levels API가 하드코딩되어 있음

---

## 1. API 존재 여부 및 작동 상태

| API Endpoint | OpenAPI | Backend Code | Frontend Usage | Status |
|--------------|---------|--------------|----------------|--------|
| `GET /api/v1/settings/automation-level` | ✅ | ✅ | ❌ | 🟡 Orphaned |
| `PUT /api/v1/settings/automation-level` | ✅ | ✅ | ❌ | 🟡 Orphaned |
| `GET /api/v1/settings/automation-levels` | ✅ | ✅ | ❌ | 🟡 Orphaned |
| `POST /api/v1/chat/approve` | ✅ | ✅ | ✅ | 🔴 **Broken** |

### 상세 분석

#### ✅ Settings APIs - 구현되었으나 사용되지 않음

**파일 위치**: `../HAMA-backend/src/api/v1/settings.py`

```python
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/automation-level")
async def get_automation_level():
    """현재 자동화 레벨 조회"""
    # 하드코딩된 응답 (실제 DB 연동 없음)
    return {
        "level": 2,
        "level_name": "Copilot",
        "description": "AI가 제안하고, 중요한 결정은 사용자가 승인합니다.",
        "interrupt_points": ["portfolio", "trade"]
    }

@router.put("/automation-level")
async def update_automation_level(request: AutomationLevelUpdateRequest):
    """자동화 레벨 변경"""
    # 단순 검증만 하고 실제 저장은 안 함
    if request.level not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Invalid level")

    return {
        "success": True,
        "message": "자동화 레벨이 변경되었습니다",
        "new_level": request.level
    }
```

**문제점**:
- ❌ 실제 데이터베이스나 상태 저장소와 연동되지 않음
- ❌ 항상 같은 값(level=2)을 반환
- ❌ PUT 요청 후에도 GET 요청 시 변경이 반영되지 않음
- ❌ 프론트엔드에서 이 API를 호출하는 코드가 없음

**프론트엔드 확인**:
```bash
# 검색 결과: Settings API 호출하는 코드 없음
$ grep -r "settings/automation-level" src/
(no results)

$ grep -r "fetchAutomationLevel\|updateAutomationLevel" src/
(no results)
```

**현재 프론트엔드는 어떻게 작동하는가?**
```typescript
// src/store/userStore.ts
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      automationLevel: 2, // 하드코딩된 기본값
      setAutomationLevel: (level) => set({ automationLevel: level }),
      // LocalStorage에만 저장, 백엔드 API 호출 없음
    }),
    {
      name: "user-storage",
    }
  )
);
```

---

#### 🔴 Approval API - 구현되었으나 HITL 메커니즘이 작동하지 않음

**파일 위치**: `../HAMA-backend/src/api/v1/chat.py`

```python
@router.post("/approve")
async def approve_action(request: ApprovalRequest):
    """HITL 승인/거부 처리"""
    # LangGraph checkpointer에서 중단된 상태 조회
    config = {"configurable": {"thread_id": request.thread_id}}

    try:
        # ⚠️ 문제: get_state()는 있지만 interrupt가 실제로 발생하지 않음
        state = checkpointer.get_state(config)

        if request.decision == "approved":
            # Command로 재개 (이론상)
            result = graph.invoke(None, config=config, command="approve")
        else:
            result = graph.invoke(None, config=config, command="reject")

        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Thread not found: {e}")
```

**핵심 문제**: **LangGraph interrupt가 실제로 발생하지 않음** 🔴

**검증**:
```python
# ../HAMA-backend/src/agents/trading/nodes.py 확인
def approval_trade_node(state: TradingState) -> dict:
    """매매 승인 노드"""
    automation_level = state.get("automation_level", 2)

    # ❌ interrupt() 호출이 없음!
    # ❌ 단순히 automation_level만 체크하고 통과

    if automation_level == 1:  # Pilot
        # 바로 execute_trade_node로 이동
        return {"trade_approved": True}
    else:
        # Copilot/Advisor
        # 여기서 interrupt()를 호출해야 하는데 안 함
        return {"trade_approved": False, "needs_approval": True}
```

**예상되는 실제 구현 (없음)**:
```python
from langgraph.types import interrupt

def approval_trade_node(state: TradingState) -> dict:
    automation_level = state.get("automation_level", 2)

    if automation_level == 1 and state.get("risk_level") == "low":
        return {"trade_approved": True}

    # 🔴 이 부분이 실제로 구현되어야 함
    # interrupt("trade_approval", payload=trade_details)
    # ↑ 이게 없으면 HITL 패널이 뜰 수 없음!

    return {"trade_approved": False}
```

**결과**:
- ❌ 프론트엔드 HITL 패널은 UI만 존재
- ❌ 실제로 백엔드에서 interrupt 신호를 보내지 않음
- ❌ `/api/v1/chat/approve` 엔드포인트는 호출되지 않음

---

## 2. HITL 구현 상태 분석

### 2.1 LangGraph Interrupt 메커니즘 확인

**이론적 구현** (공식 문서):
```python
from langgraph.graph import StateGraph
from langgraph.types import interrupt

# 그래프 정의
workflow = StateGraph(TradingState)

def approval_node(state):
    # interrupt() 호출 → 그래프 실행 중단 → 프론트엔드에 알림
    user_input = interrupt("approval_required", payload={
        "order_type": "buy",
        "stock_code": "005930",
        "quantity": 10
    })

    # 사용자 승인 후 재개
    return {"approved": user_input == "approve"}

workflow.add_node("approval", approval_node)
workflow.compile(checkpointer=checkpointer)
```

**실제 HAMA 백엔드 구현**:
```python
# ../HAMA-backend/src/agents/trading/nodes.py

# ❌ interrupt import가 없음
# ❌ interrupt() 호출이 없음
# ❌ 단순히 플래그만 설정

def approval_trade_node(state: TradingState) -> dict:
    return {"needs_approval": True}  # 의미 없는 플래그
```

**결론**: 🔴 **HITL 메커니즘이 실제로 구현되지 않았음**

---

### 2.2 각 Agent별 HITL 상태

| Agent | HITL 필요 여부 | 현재 구현 | 구현 가능성 | Priority |
|-------|---------------|-----------|------------|----------|
| **Trading Agent** | ✅ 필수 (모든 레벨) | ❌ 없음 | ✅ 가능 | P0 |
| **Strategy Agent** | ✅ 필요 (Advisor) | ❌ 없음 | ✅ 가능 | P1 |
| **Portfolio Agent** | ✅ 필요 (Copilot, Advisor) | ❌ 없음 | ✅ 가능 | P1 |
| Research Agent | ❌ 불필요 | ❌ 없음 | N/A | N/A |
| Risk Agent | ❌ 불필요 | ❌ 없음 | N/A | N/A |

### Trading Agent 상세 분석

**파일**: `../HAMA-backend/src/agents/trading/graph.py`

**현재 구조**:
```python
from langgraph.graph import StateGraph

workflow = StateGraph(TradingState)

# 노드 정의
workflow.add_node("prepare_order", prepare_order_node)
workflow.add_node("approval", approval_trade_node)  # ← 여기가 문제
workflow.add_node("execute", execute_trade_node)

# 엣지 정의
workflow.add_edge("prepare_order", "approval")

# ❌ approval 노드가 항상 execute로 이동
workflow.add_edge("approval", "execute")  # 조건 없이 무조건 진행

workflow.set_entry_point("prepare_order")
```

**문제점**:
1. ❌ `approval_trade_node`에 interrupt() 호출이 없음
2. ❌ 조건부 엣지가 없어서 무조건 다음 노드로 이동
3. ❌ automation_level이 실제로 동작에 영향을 주지 않음

**올바른 구현**:
```python
from langgraph.graph import StateGraph, END
from langgraph.types import interrupt

def approval_trade_node(state: TradingState) -> dict:
    automation_level = state.get("automation_level", 2)
    risk_level = state.get("risk_level", "medium")

    # Pilot 모드 + 저위험 → 자동 승인
    if automation_level == 1 and risk_level == "low":
        return {"trade_approved": True, "skip_hitl": True}

    # 나머지 경우 → HITL 필요
    order_details = {
        "stock_code": state["stock_code"],
        "order_type": state["order_type"],
        "quantity": state["quantity"],
        "estimated_price": state["estimated_price"],
        "risk_level": risk_level
    }

    # 🟢 여기서 interrupt 발생
    user_decision = interrupt("trade_approval", payload=order_details)

    return {
        "trade_approved": user_decision == "approved",
        "user_notes": user_decision.get("notes")
    }

# 조건부 라우팅
def should_execute(state: TradingState) -> str:
    if state.get("trade_approved"):
        return "execute"
    else:
        return END

workflow.add_conditional_edges(
    "approval",
    should_execute,
    {
        "execute": "execute",
        END: END
    }
)
```

---

### 2.3 Strategy Agent HITL 필요성

**현재 상태**: HITL 없음
**필요 이유**: Advisor 모드에서 전략 승인 필요

**파일**: `../HAMA-backend/src/agents/strategy/nodes.py`

```python
# 현재 구현
def generate_strategy_node(state: StrategyState) -> dict:
    """전략 생성 (HITL 없음)"""
    strategy = llm.invoke([
        SystemMessage(content="투자 전략을 수립하세요"),
        HumanMessage(content=state["query"])
    ])

    return {"strategy": strategy.content}  # 바로 반환
```

**Advisor 모드를 위한 필요 구현**:
```python
from langgraph.types import interrupt

def generate_strategy_node(state: StrategyState) -> dict:
    automation_level = state.get("automation_level", 2)

    # 전략 생성
    strategy = llm.invoke([...])

    # Advisor 모드면 승인 필요
    if automation_level == 3:
        strategy_payload = {
            "strategy_type": strategy["type"],
            "target_allocation": strategy["allocation"],
            "expected_return": strategy["expected_return"],
            "risk_assessment": strategy["risk"]
        }

        user_decision = interrupt("strategy_approval", payload=strategy_payload)

        if user_decision == "rejected":
            return {"strategy_approved": False, "retry": True}
        elif user_decision == "modified":
            # 사용자 수정사항 반영
            strategy.update(user_decision.get("modifications", {}))

    return {"strategy": strategy, "strategy_approved": True}
```

**구현 가능성**: ✅ **가능** (Trading Agent와 동일한 패턴)

---

### 2.4 Portfolio Agent HITL 필요성

**현재 상태**: HITL 없음
**필요 이유**: Copilot/Advisor 모드에서 포트폴리오 구성 승인 필요

**파일**: `../HAMA-backend/src/agents/portfolio/nodes.py`

```python
# 현재 구현
def generate_portfolio_node(state: PortfolioState) -> dict:
    """포트폴리오 생성 (HITL 없음)"""
    portfolio = optimizer.optimize(
        stocks=state["candidate_stocks"],
        strategy=state["strategy"]
    )

    return {"portfolio": portfolio}  # 바로 반환
```

**Copilot/Advisor 모드를 위한 필요 구현**:
```python
from langgraph.types import interrupt

def generate_portfolio_node(state: PortfolioState) -> dict:
    automation_level = state.get("automation_level", 2)

    # 포트폴리오 최적화
    portfolio = optimizer.optimize(...)

    # Copilot/Advisor 모드면 승인 필요
    if automation_level >= 2:
        portfolio_payload = {
            "allocations": portfolio["allocations"],
            "expected_return": portfolio["expected_return"],
            "risk_level": portfolio["risk"],
            "rebalancing_trades": portfolio["trades"]
        }

        user_decision = interrupt("portfolio_approval", payload=portfolio_payload)

        if user_decision == "rejected":
            return {"portfolio_approved": False}
        elif user_decision == "modified":
            # 사용자가 비중 조정
            portfolio["allocations"] = user_decision.get("allocations")

    return {"portfolio": portfolio, "portfolio_approved": True}
```

**구현 가능성**: ✅ **가능**

---

## 3. hitl_config 마이그레이션 영향 분석

### 3.1 현재 automation_level 사용 위치

```bash
# 백엔드 전체 검색
$ grep -r "automation_level" ../HAMA-backend/src/

# 발견된 파일들:
- src/api/v1/chat.py (ChatRequest)
- src/api/v1/settings.py (Settings endpoints)
- src/schemas/graph_state.py (GraphState 정의)
- src/agents/trading/nodes.py (approval_trade_node)
- src/agents/graph_master.py (build_supervisor 파라미터)
```

### 3.2 변경 필요 파일 목록

| 파일 | 현재 코드 | 변경 필요 사항 | 난이도 |
|------|----------|---------------|--------|
| `schemas/graph_state.py` | `automation_level: int` | `hitl_config: HITLConfig` 추가 | 🟡 Medium |
| `api/v1/chat.py` | ChatRequest에 automation_level | hitl_config로 변경 | 🟢 Easy |
| `api/v1/settings.py` | 전체 엔드포인트 | 스키마 전면 수정 | 🔴 Hard |
| `agents/graph_master.py` | `build_supervisor(automation_level: int)` | `build_supervisor(hitl_config: HITLConfig)` | 🟡 Medium |
| `agents/trading/nodes.py` | `state["automation_level"]` 체크 | `state["hitl_config"].phases.trade` 체크 | 🟢 Easy |

### 3.3 GraphState 변경

**현재** (`../HAMA-backend/src/schemas/graph_state.py`):
```python
class GraphState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    user_id: str
    conversation_id: str
    automation_level: int  # ← 이 필드를 바꿔야 함
    intent: Optional[str]
    # ... (나머지 필드)
```

**변경 후**:
```python
from src.schemas.hitl_config import HITLConfig

class GraphState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    user_id: str
    conversation_id: str
    hitl_config: HITLConfig  # 🟢 새로운 필드
    intent: Optional[str]
    # ... (나머지 필드)
```

**영향**:
- ✅ 모든 Agent가 이 State를 사용하므로 한 번만 변경하면 됨
- ⚠️ 하지만 각 Agent에서 `state["automation_level"]` 접근하는 코드는 모두 수정 필요

### 3.4 Agent 코드 변경 패턴

**Before**:
```python
def approval_trade_node(state: TradingState) -> dict:
    automation_level = state.get("automation_level", 2)

    if automation_level == 1:
        # Pilot 로직
        pass
    elif automation_level == 2:
        # Copilot 로직
        pass
```

**After**:
```python
def approval_trade_node(state: TradingState) -> dict:
    hitl_config = state.get("hitl_config")

    # Phase별로 체크
    if hitl_config.phases.trade == "conditional":
        # Pilot 조건부 로직
        if state.get("risk_level") == "low":
            return {"trade_approved": True}

    if hitl_config.phases.trade:
        # HITL 필요
        user_decision = interrupt("trade_approval", payload={...})
```

**변경 난이도**: 🟡 Medium
- 로직 자체는 간단하지만
- 모든 Agent를 수정해야 함
- 테스트 필요

---

## 4. 스펙 vs 실제 응답 차이

### 4.1 GET /api/v1/settings/automation-level

**OpenAPI 스펙**:
```json
{
  "level": 2,
  "level_name": "Copilot",
  "description": "AI가 제안하고, 중요한 결정은 사용자가 승인합니다.",
  "interrupt_points": ["portfolio", "trade"]
}
```

**실제 응답** (테스트 필요):
```json
{
  "level": 2,
  "level_name": "Copilot",
  "description": "...",
  "interrupt_points": ["portfolio", "trade"]
}
```

**예상 일치도**: ✅ 일치 (하드코딩되어 있으므로)

**문제점**:
- ❌ `interrupt_points`가 하드코딩됨
- ❌ 실제 Agent 구현과 무관함
- ❌ 사용자 설정이 저장되지 않음

---

### 4.2 POST /api/v1/chat/approve

**OpenAPI 스펙** (Request):
```json
{
  "thread_id": "550e8400-e29b-41d4-a716-446655440000",
  "decision": "approved",
  "automation_level": 2,  // ← 불필요한 필드
  "modifications": null,
  "user_notes": "..."
}
```

**문제점**:
1. ❌ `automation_level` 필드가 왜 ApprovalRequest에 있는가?
   - 이미 GraphState에 저장되어 있음
   - 클라이언트가 임의로 변경할 수 있음 (보안 문제)
   - hitl_config 마이그레이션 시 제거해야 함

2. ❌ `modifications` 필드가 사용되지 않음
   - 현재 백엔드 코드에서 무시됨
   - Strategy/Portfolio Agent에서 활용 가능하나 미구현

**수정 제안**:
```python
class ApprovalRequest(BaseModel):
    thread_id: str
    decision: Literal["approved", "rejected", "modified"]
    modifications: Optional[Dict[str, Any]] = None  # modified일 때만 사용
    user_notes: Optional[str] = None
    # automation_level 필드 제거 ✅
```

---

## 5. 누락된 API 및 기능

### 5.1 Chat History와 Automation Level 연동 부재

**문제**: 각 대화마다 다른 automation level을 사용할 수 있어야 하는데, 현재는 전역 설정만 가능

**필요한 구조**:
```python
# ChatSessionSummary에 automation_level (또는 hitl_config) 포함
{
  "conversation_id": "...",
  "title": "삼성전자 투자 분석",
  "automation_level": 2,  # 이 대화에서 사용한 레벨
  "last_message_at": "...",
  # ...
}
```

**현재 상태**:
- ✅ OpenAPI 스펙에는 `automation_level` 필드가 있음
- ❌ 실제 백엔드 구현에서는 반환하지 않음
- ❌ 프론트엔드에서도 사용하지 않음

---

### 5.2 HITL 승인 내역 조회 API 없음

**필요성**: 사용자가 과거에 어떤 매매를 승인/거부했는지 확인

**제안**:
```
GET /api/v1/chat/approvals?conversation_id={id}
```

**응답 예시**:
```json
{
  "approvals": [
    {
      "approval_id": "...",
      "timestamp": "2025-10-30T10:30:00Z",
      "type": "trade",
      "decision": "approved",
      "payload": {
        "stock_code": "005930",
        "order_type": "buy",
        "quantity": 10
      },
      "user_notes": "리스크가 낮아서 승인"
    }
  ]
}
```

**우선순위**: P2 (Phase 3+)

---

### 5.3 Bulk Approval API 없음

**필요성**: 여러 매매 주문을 한 번에 승인 (Portfolio rebalancing 시)

**제안**:
```
POST /api/v1/chat/approve-batch
```

**요청**:
```json
{
  "thread_id": "...",
  "approvals": [
    {"order_id": "1", "decision": "approved"},
    {"order_id": "2", "decision": "rejected"},
    {"order_id": "3", "decision": "approved"}
  ]
}
```

**우선순위**: P3 (Phase 4+)

---

## 6. 문제 우선순위 및 해결 방안

### P0 (Critical) - 즉시 수정 필요

#### Issue #1: HITL Interrupt 메커니즘 미구현 🔴

**문제**: Trading Agent에서 interrupt()가 호출되지 않아 HITL 패널이 작동하지 않음

**영향**:
- 프론트엔드 HITL 패널이 UI만 존재
- 실제 승인 플로우가 작동하지 않음
- `/api/v1/chat/approve` API가 호출되지 않음

**해결책**:

1. **LangGraph interrupt 추가**

```python
# src/agents/trading/nodes.py

from langgraph.types import interrupt

def approval_trade_node(state: TradingState) -> dict:
    """매매 승인 노드 - HITL 구현"""

    automation_level = state.get("automation_level", 2)
    risk_level = state.get("risk_level", "medium")

    # Pilot 모드 + 저위험 → 자동 승인
    if automation_level == 1 and risk_level == "low":
        logger.info(f"Auto-approving low-risk trade (Pilot mode)")
        return {
            "trade_approved": True,
            "approval_type": "automatic",
            "skip_hitl": True
        }

    # HITL 필요 - interrupt 발생
    order_details = {
        "stock_code": state["stock_code"],
        "stock_name": state.get("stock_name", ""),
        "order_type": state["order_type"],
        "quantity": state["quantity"],
        "estimated_price": state["estimated_price"],
        "total_amount": state["quantity"] * state["estimated_price"],
        "risk_level": risk_level,
        "risk_factors": state.get("risk_factors", []),
        "current_portfolio_weight": state.get("current_weight", 0),
        "expected_portfolio_weight": state.get("expected_weight", 0)
    }

    logger.info(f"Requesting HITL approval for trade: {order_details}")

    # 🟢 여기서 그래프 실행이 중단됨
    user_response = interrupt(
        value="trade_approval",  # interrupt type
        payload=order_details     # 프론트엔드로 전달할 데이터
    )

    # 사용자 응답 처리
    if user_response.get("decision") == "approved":
        return {
            "trade_approved": True,
            "approval_type": "manual",
            "user_notes": user_response.get("notes")
        }
    elif user_response.get("decision") == "rejected":
        return {
            "trade_approved": False,
            "rejection_reason": user_response.get("reason")
        }
    elif user_response.get("decision") == "modified":
        # 수정된 주문으로 교체
        return {
            "trade_approved": True,
            "approval_type": "modified",
            "modified_quantity": user_response.get("quantity"),
            "user_notes": user_response.get("notes")
        }
```

2. **조건부 라우팅 추가**

```python
# src/agents/trading/graph.py

from langgraph.graph import StateGraph, END

def should_execute_trade(state: TradingState) -> str:
    """승인 여부에 따라 다음 노드 결정"""
    if state.get("skip_hitl"):
        # Pilot 자동 승인
        return "execute"
    elif state.get("trade_approved"):
        # HITL 승인
        return "execute"
    else:
        # HITL 거부
        return END

workflow = StateGraph(TradingState)
workflow.add_node("prepare_order", prepare_order_node)
workflow.add_node("approval", approval_trade_node)
workflow.add_node("execute", execute_trade_node)

workflow.add_edge("prepare_order", "approval")

# 조건부 엣지
workflow.add_conditional_edges(
    "approval",
    should_execute_trade,
    {
        "execute": "execute",
        END: END
    }
)
```

3. **Approval API 수정**

```python
# src/api/v1/chat.py

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

        # 그래프 재개
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

**테스트 방법**:
```python
# 통합 테스트
async def test_hitl_approval():
    # 1. 채팅 요청 (매매 의도)
    response = await client.post("/api/v1/chat/", json={
        "message": "삼성전자 1000만원 매수해줘",
        "user_id": "test_user",
        "conversation_id": None,
        "automation_level": 2  # Copilot
    })

    thread_id = response.json()["thread_id"]

    # 2. interrupt 발생 확인
    assert response.json()["requires_approval"] == True
    assert response.json()["approval_type"] == "trade"

    # 3. 승인 요청
    approval_response = await client.post("/api/v1/chat/approve", json={
        "thread_id": thread_id,
        "decision": "approved",
        "user_notes": "승인합니다"
    })

    assert approval_response.json()["success"] == True
```

**예상 작업 시간**: 4-6시간

---

#### Issue #2: automation_level → hitl_config 마이그레이션 준비 부족 🔴

**문제**: hitl_config로 마이그레이션 시 백엔드 전면 수정 필요

**영향**:
- 6개 API 엔드포인트 스키마 변경
- 7개 Pydantic 모델 수정
- GraphState 전면 수정
- 모든 Agent 코드 수정

**해결책**:

**Phase 1: 새로운 스키마 생성**

```python
# src/schemas/hitl_config.py (신규 파일)

from pydantic import BaseModel
from typing import Literal, Union

class HITLPhases(BaseModel):
    """Phase별 HITL 개입 여부"""
    data_collection: bool = False
    analysis: bool = False
    portfolio: bool = False
    risk: bool = False
    trade: Union[bool, Literal["conditional"]] = True

class HITLConfig(BaseModel):
    """자동화 레벨 설정"""
    preset: Literal["pilot", "copilot", "advisor", "custom"] = "copilot"
    phases: HITLPhases

# Preset 정의
PRESET_PILOT = HITLConfig(
    preset="pilot",
    phases=HITLPhases(trade="conditional")
)

PRESET_COPILOT = HITLConfig(
    preset="copilot",
    phases=HITLPhases(portfolio=True, trade=True)
)

PRESET_ADVISOR = HITLConfig(
    preset="advisor",
    phases=HITLPhases(analysis=True, portfolio=True, trade=True)
)
```

**Phase 2: GraphState 업데이트**

```python
# src/schemas/graph_state.py

from src.schemas.hitl_config import HITLConfig

class GraphState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    user_id: str
    conversation_id: str

    # 새 필드
    hitl_config: HITLConfig

    # 기존 필드들...
    intent: Optional[str]
    stock_code: Optional[str]
    # ...
```

**Phase 3: API 스키마 업데이트**

```python
# src/schemas/api.py

from src.schemas.hitl_config import HITLConfig

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    hitl_config: HITLConfig = PRESET_COPILOT  # 기본값

class ApprovalRequest(BaseModel):
    thread_id: str
    decision: Literal["approved", "rejected", "modified"]
    modifications: Optional[Dict[str, Any]] = None
    user_notes: Optional[str] = None
    # automation_level 제거 ✅
```

**Phase 4: Agent 코드 업데이트**

```python
# src/agents/trading/nodes.py

def approval_trade_node(state: TradingState) -> dict:
    hitl_config = state.get("hitl_config", PRESET_COPILOT)

    # Pilot 조건부 자동 승인
    if hitl_config.phases.trade == "conditional":
        risk_level = state.get("risk_level", "medium")
        if risk_level == "low":
            return {"trade_approved": True, "skip_hitl": True}

    # HITL 필요 여부 체크
    if hitl_config.phases.trade:
        user_response = interrupt("trade_approval", payload={...})
        # ...
    else:
        # HITL 불필요 (이론상 불가능하지만 방어 코드)
        return {"trade_approved": True}
```

**예상 작업 시간**: 8-12시간

---

### P1 (High) - 1주 내 수정

#### Issue #3: Strategy/Portfolio Agent HITL 미구현 🟡

**해결책**: Issue #1과 동일한 패턴으로 구현

```python
# src/agents/strategy/nodes.py

def generate_strategy_node(state: StrategyState) -> dict:
    hitl_config = state.get("hitl_config")

    # 전략 생성
    strategy = strategy_generator.generate(state)

    # Advisor 모드 체크
    if hitl_config.phases.analysis:
        user_response = interrupt("strategy_approval", payload={
            "strategy_type": strategy["type"],
            "target_stocks": strategy["stocks"],
            "expected_return": strategy["return"],
            "risk_level": strategy["risk"]
        })

        if user_response["decision"] == "rejected":
            return {"strategy_approved": False, "retry": True}

    return {"strategy": strategy, "strategy_approved": True}
```

**예상 작업 시간**: 6-8시간 (각 Agent당)

---

#### Issue #4: Settings API 실제 저장소 연동 부재 🟡

**문제**: GET/PUT `/settings/automation-level`이 하드코딩됨

**해결책**:

```python
# src/api/v1/settings.py

from src.db.repositories import UserSettingsRepository

@router.get("/automation-level")
async def get_automation_level(
    user_id: str = Depends(get_current_user_id),
    repo: UserSettingsRepository = Depends()
):
    """현재 자동화 레벨 조회"""
    settings = await repo.get_user_settings(user_id)

    if not settings:
        # 기본값
        return AutomationLevelResponse(
            hitl_config=PRESET_COPILOT,
            preset_name="Copilot",
            description="...",
            interrupt_points=["portfolio", "trade"]
        )

    return AutomationLevelResponse(
        hitl_config=settings.hitl_config,
        preset_name=settings.hitl_config.preset.title(),
        description=PRESET_DESCRIPTIONS[settings.hitl_config.preset],
        interrupt_points=get_interrupt_points(settings.hitl_config)
    )

@router.put("/automation-level")
async def update_automation_level(
    request: AutomationLevelUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    repo: UserSettingsRepository = Depends()
):
    """자동화 레벨 변경"""

    # 검증
    if not request.confirm:
        return {"error": "Confirmation required"}

    # DB 저장
    await repo.update_hitl_config(user_id, request.hitl_config)

    return AutomationLevelUpdateResponse(
        success=True,
        message="자동화 레벨이 변경되었습니다",
        new_config=request.hitl_config
    )
```

**DB 스키마**:
```sql
CREATE TABLE user_settings (
    user_id VARCHAR(255) PRIMARY KEY,
    hitl_config JSONB NOT NULL DEFAULT '{"preset": "copilot", "phases": {"data_collection": false, "analysis": false, "portfolio": true, "risk": false, "trade": true}}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**예상 작업 시간**: 4-6시간

---

### P2 (Medium) - 2주 내 수정

#### Issue #5: List Automation Levels 하드코딩 🟢

**현재**:
```python
@router.get("/automation-levels")
async def list_automation_levels():
    # 하드코딩
    return {
        "levels": [
            {"level": 1, "name": "Pilot", ...},
            {"level": 2, "name": "Copilot", ...},
            {"level": 3, "name": "Advisor", ...}
        ]
    }
```

**개선**:
```python
from src.schemas.hitl_config import PRESET_PILOT, PRESET_COPILOT, PRESET_ADVISOR

PRESET_METADATA = {
    "pilot": {
        "name": "Pilot",
        "description": "AI가 대부분 자동으로 처리합니다",
        "features": [
            "저위험 매매는 자동 실행",
            "고위험 매매만 승인 필요",
            "빠른 의사결정"
        ]
    },
    # ...
}

@router.get("/automation-levels")
async def list_automation_levels():
    return {
        "presets": [
            {
                "preset": "pilot",
                "config": PRESET_PILOT,
                "metadata": PRESET_METADATA["pilot"]
            },
            {
                "preset": "copilot",
                "config": PRESET_COPILOT,
                "metadata": PRESET_METADATA["copilot"]
            },
            {
                "preset": "advisor",
                "config": PRESET_ADVISOR,
                "metadata": PRESET_METADATA["advisor"]
            }
        ],
        "custom_available": True
    }
```

**예상 작업 시간**: 2시간

---

## 7. 종합 권장 사항

### 7.1 즉시 조치 (이번 주)

1. **HITL Interrupt 구현** (P0)
   - Trading Agent에 interrupt() 추가
   - Approval API 수정
   - 통합 테스트

2. **hitl_config 마이그레이션 시작** (P0)
   - 새 스키마 파일 생성
   - GraphState 업데이트
   - API 스키마 변경

### 7.2 1주 내 조치

3. **Strategy/Portfolio Agent HITL 추가** (P1)
4. **Settings API DB 연동** (P1)

### 7.3 2주 내 조치

5. **List Automation Levels 개선** (P2)
6. **프론트엔드 Settings 페이지 API 연동** (P2)

### 7.4 Phase 3+ (낮은 우선순위)

7. HITL 승인 내역 조회 API
8. Bulk Approval API
9. Custom HITL 설정 UI

---

## 8. 프론트엔드 액션 아이템

### 8.1 즉시 필요

1. **Settings API 연동**
   ```typescript
   // src/lib/api/settings.ts (신규)
   export async function getAutomationLevel() {
     const { data } = await apiClient.get("/api/v1/settings/automation-level");
     return data;
   }

   export async function updateAutomationLevel(config: HITLConfig) {
     const { data } = await apiClient.put("/api/v1/settings/automation-level", {
       hitl_config: config,
       confirm: true
     });
     return data;
   }
   ```

2. **userStore hitl_config 마이그레이션**
   ```typescript
   // src/store/userStore.ts
   export const useUserStore = create<UserState>()(
     persist(
       (set, get) => ({
         hitlConfig: PRESET_COPILOT, // automation_level → hitlConfig

         setHITLConfig: async (config: HITLConfig) => {
           set({ hitlConfig: config });
           // 백엔드 API 호출
           await updateAutomationLevel(config);
         },

         // 초기화 시 백엔드에서 로드
         loadHITLConfig: async () => {
           const data = await getAutomationLevel();
           set({ hitlConfig: data.hitl_config });
         }
       }),
       { name: "user-storage" }
     )
   );
   ```

3. **Chat API hitl_config 전송**
   ```typescript
   // src/store/chatStore.ts
   const sendMessage = async (message: string) => {
     const hitlConfig = useUserStore.getState().hitlConfig;

     const response = await apiClient.post("/api/v1/chat/", {
       message,
       conversation_id,
       hitl_config: hitlConfig  // 추가
     });
   };
   ```

### 8.2 HITL 패널 테스트

백엔드 interrupt 구현 후:
```typescript
// src/components/HITL/HITLPanel.tsx
// 테스트: 실제 interrupt 신호 수신 확인
// SSE 스트리밍으로 requires_approval 이벤트 받기
```

---

## 9. 체크리스트

### Backend
- [ ] HITL interrupt 구현 (Trading Agent)
- [ ] Approval API 수정 (Command 처리)
- [ ] HITLConfig 스키마 생성
- [ ] GraphState hitl_config 추가
- [ ] API 스키마 마이그레이션 (6개 엔드포인트)
- [ ] Settings API DB 연동
- [ ] Strategy Agent HITL 추가
- [ ] Portfolio Agent HITL 추가
- [ ] 통합 테스트 작성

### Frontend
- [ ] HITLConfig 타입 정의 (hitl.ts)
- [ ] userStore 마이그레이션 (automation_level → hitlConfig)
- [ ] Settings API 연동 (get/update)
- [ ] Chat API hitl_config 전송
- [ ] My Page Settings 로딩 구현
- [ ] HITL 패널 실제 작동 테스트

### Documentation
- [ ] AutomationLevelAPIChanges.md 최종 검토
- [ ] AutomationLevelIntegration.md 업데이트
- [ ] 백엔드 팀에 피드백 전달

---

## References

- `docs/backend/openapi.json` - API 스펙
- `docs/AutomationLevelIntegration.md` - 설계 문서
- `docs/AutomationLevelAPIChanges.md` - 마이그레이션 계획
- `../HAMA-backend/src/agents/trading/` - Trading Agent 구현
- `../HAMA-backend/src/api/v1/` - API 엔드포인트
