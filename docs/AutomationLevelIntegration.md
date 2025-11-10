# Automation Level Integration Guide

**Version:** 1.0
**Last Updated:** 2025-10-30
**Status:** Implementation Required

---

## 📋 개요

이 문서는 **프론트엔드와 백엔드 간 자동화 레벨 시스템의 일관성**을 보장하기 위한 구현 가이드입니다.

**목표:**
- 프론트엔드 5단계 워크플로우와 백엔드 6개 에이전트 매핑
- 자동화 레벨별 HITL 개입 지점 명확화
- 백엔드 코드 수정 사항 정리

---

## 🎯 최종 정의: 자동화 레벨 시스템

### 5단계 워크플로우 (사용자 관점)

```
Phase 1: 데이터 수집 → Phase 2: 분석 → Phase 3: 포트폴리오 → Phase 4: 리스크 평가 → Phase 5: 매매
```

### Phase → Agent 매핑 (백엔드 구현)

| Phase | 에이전트 | 설명 |
|-------|---------|------|
| **Phase 1** | Research | 종목 데이터 수집 및 기본 분석 |
| **Phase 2** | Strategy + Risk | 투자 전략 수립 + 리스크 분석 |
| **Phase 3** | Portfolio | 포트폴리오 구성 및 리밸런싱 |
| **Phase 4** | Risk | 리밸런싱 시 리스크 재평가 |
| **Phase 5** | Trading | 매매 주문 실행 |

### 자동화 레벨별 HITL 개입 지점

| Phase | Pilot | Copilot ⭐ | Advisor | Custom |
|-------|-------|-----------|---------|--------|
| **Phase 1: 데이터 수집** | ✅ 자동 | ✅ 자동 | ✅ 자동 | 🎛️ 설정 가능 |
| **Phase 2: 분석** | ✅ 자동 | ✅ 자동 | 🔵 조건부 승인 | 🎛️ 설정 가능 |
| **Phase 3: 포트폴리오** | ✅ 자동 (월 1회) | 🔴 승인 필요 | 🔴 승인 필수 | 🎛️ 설정 가능 |
| **Phase 4: 리스크 평가** | ✅ 자동 (경고만) | ✅ 자동 (경고만) | ✅ 자동 (경고만) | 🎛️ 설정 가능 |
| **Phase 5: 매매** | 🟡 저위험 시 자동 | 🔴 승인 필요 | 🔴 승인 필수 | 🎛️ 설정 가능 |

**아이콘 설명:**
- ✅ 자동 실행 (HITL 없음)
- 🔴 HITL interrupt 발생
- 🔵 조건부 승인 (복잡도 기반) ⭐ 신규
- 🟡 조건부 자동 실행 (리스크 레벨 기반)
- 🎛️ 사용자가 Phase별로 개별 설정

**🔵 조건부 승인 (Phase 2: 분석 - Advisor 레벨):**
- **Router가 질문 복잡도 판단:**
  - `query_complexity`: "simple" | "moderate" | "expert"
  - `depth_level`: "brief" | "detailed" | "comprehensive"
- **HITL 조건:**
  - `expert` 또는 `comprehensive` → 🔴 승인 필요
  - `simple`, `moderate`, `brief`, `detailed` → ✅ 자동 실행

**예시:**
| 질문 | complexity | depth | Advisor HITL? |
|------|-----------|-------|--------------|
| "시장 전망은?" | simple | brief | ✅ 자동 |
| "삼성전자 목표가?" | moderate | detailed | ✅ 자동 |
| "삼성전자 종합 분석" | expert | comprehensive | 🔴 승인 필요 |

---

## 🎛️ Custom Mode (커스텀 모드)

### 개요

**Custom Mode**는 사용자가 Phase별로 HITL 개입 여부를 직접 설정할 수 있는 모드입니다.

**예시:**
- "분석은 자동, 포트폴리오는 승인, 매매는 자동"
- "포트폴리오만 승인 필요, 나머지는 자동"

### HITL Config 객체 구조

**기존 방식 (❌ 제거 예정):**
```typescript
{
  "message": "삼성전자 매수해줘",
  "automation_level": 2  // 단순 숫자만 전달
}
```

**새로운 방식 (✅ hitl_config 객체):**
```typescript
{
  "message": "삼성전자 매수해줘",
  "hitl_config": {
    "preset": "copilot",  // "pilot" | "copilot" | "advisor" | "custom"
    "phases": {
      "data_collection": false,  // false = 자동, true = 승인 필요
      "analysis": false,
      "portfolio": true,
      "risk": false,
      "trade": true
    }
  }
}
```

**Preset 모드일 때:**
- `preset: "pilot"` → `phases`는 무시되고 Pilot 프리셋 적용
- `preset: "copilot"` → Copilot 프리셋 적용
- `preset: "advisor"` → Advisor 프리셋 적용

**Custom 모드일 때:**
- `preset: "custom"` → `phases` 객체를 직접 사용

### Preset → Phases 매핑

```typescript
const PRESET_PHASES = {
  pilot: {
    data_collection: false,
    analysis: false,
    portfolio: false,
    risk: false,
    trade: "conditional",  // 특별값: 저위험 시 자동
  },
  copilot: {
    data_collection: false,
    analysis: false,
    portfolio: true,
    risk: false,
    trade: true,
  },
  advisor: {
    data_collection: false,
    analysis: true,
    portfolio: true,
    risk: false,
    trade: true,
  },
};
```

---

## 🔧 백엔드 수정 사항

### 1. 새 파일 생성: `src/schemas/hitl_config.py` 및 `src/schemas/workflow.py`

#### 파일 1: `src/schemas/hitl_config.py`

**목적:** HITL Config 스키마 정의

**파일 경로:** `../HAMA-backend/src/schemas/hitl_config.py`

```python
"""
HITL Configuration Schema

프론트엔드에서 전달받는 HITL 설정 구조
"""
from typing import Dict, Union, Literal
from pydantic import BaseModel, Field


class HITLPhases(BaseModel):
    """Phase별 HITL 설정"""
    data_collection: bool = False
    analysis: bool = False
    portfolio: bool = True
    risk: bool = False
    trade: Union[bool, Literal["conditional"]] = True  # "conditional" = 리스크 기반


class HITLConfig(BaseModel):
    """
    HITL 설정 객체

    프론트엔드에서 전달받는 자동화 레벨 설정
    """
    preset: Literal["pilot", "copilot", "advisor", "custom"] = Field(
        default="copilot",
        description="프리셋 모드 또는 커스텀"
    )
    phases: HITLPhases = Field(
        default_factory=lambda: HITLPhases(
            data_collection=False,
            analysis=False,
            portfolio=True,
            risk=False,
            trade=True,
        ),
        description="Phase별 HITL 설정 (custom 모드일 때 사용)"
    )


# Preset별 기본 설정
PRESET_PHASES: Dict[str, HITLPhases] = {
    "pilot": HITLPhases(
        data_collection=False,
        analysis=False,
        portfolio=False,
        risk=False,
        trade="conditional",  # 저위험 시 자동
    ),
    "copilot": HITLPhases(
        data_collection=False,
        analysis=False,
        portfolio=True,
        risk=False,
        trade=True,
    ),
    "advisor": HITLPhases(
        data_collection=False,
        analysis=True,
        portfolio=True,
        risk=False,
        trade=True,
    ),
}


def get_preset_phases(preset: str) -> HITLPhases:
    """
    프리셋 이름으로 Phase 설정 가져오기

    Args:
        preset: "pilot" | "copilot" | "advisor"

    Returns:
        HITLPhases 객체
    """
    return PRESET_PHASES.get(preset, PRESET_PHASES["copilot"])
```

#### 파일 2: `src/schemas/workflow.py`

**목적:** Phase와 Agent 매핑, HITL 판단 로직

**파일 경로:** `../HAMA-backend/src/schemas/workflow.py`

```python
"""
5단계 워크플로우 Phase 정의

프론트엔드의 AutomationLevelSelector와 일치하는 Phase 구조
"""
from typing import Dict, List, Union
from enum import Enum
from .hitl_config import HITLConfig, HITLPhases, get_preset_phases


class WorkflowPhase(str, Enum):
    """5단계 투자 워크플로우"""
    DATA_COLLECTION = "data_collection"  # Phase 1
    ANALYSIS = "analysis"                # Phase 2
    PORTFOLIO = "portfolio"              # Phase 3
    RISK = "risk"                        # Phase 4
    TRADE = "trade"                      # Phase 5


# Phase → Agent 매핑
PHASE_TO_AGENTS: Dict[WorkflowPhase, List[str]] = {
    WorkflowPhase.DATA_COLLECTION: ["research"],
    WorkflowPhase.ANALYSIS: ["strategy", "risk"],
    WorkflowPhase.PORTFOLIO: ["portfolio"],
    WorkflowPhase.RISK: ["risk"],
    WorkflowPhase.TRADE: ["trading"],
}


def requires_hitl(
    phase: str,
    hitl_config: HITLConfig,
    risk_level: str = "medium"
) -> bool:
    """
    해당 Phase에서 HITL이 필요한지 판단

    Args:
        phase: Phase 이름 (문자열)
        hitl_config: HITL 설정 객체
        risk_level: 리스크 레벨 ("low", "medium", "high") - trade Phase 전용

    Returns:
        True if HITL required
    """
    # Preset 모드면 프리셋 설정 사용
    if hitl_config.preset != "custom":
        phases = get_preset_phases(hitl_config.preset)
    else:
        phases = hitl_config.phases

    # Phase별 설정 가져오기
    phase_setting = getattr(phases, phase, False)

    # "conditional" 특별 처리 (Pilot 모드 trade)
    if phase == "trade" and phase_setting == "conditional":
        # 저위험일 때만 자동 실행
        return risk_level != "low"

    return phase_setting


def get_hitl_message(phase: str) -> str:
    """
    Phase별 HITL 메시지 생성

    Args:
        phase: Phase 이름

    Returns:
        사용자에게 표시할 승인 메시지
    """
    messages = {
        "data_collection": "데이터 수집을 승인하시겠습니까?",
        "analysis": "투자 전략을 승인하시겠습니까?",
        "portfolio": "포트폴리오 리밸런싱을 승인하시겠습니까?",
        "risk": "리스크 평가를 승인하시겠습니까?",
        "trade": "매매 주문을 승인하시겠습니까?",
    }
    return messages.get(phase, "작업을 승인하시겠습니까?")
```

---

### 2. Strategy Agent에 HITL 추가

**목적:** Advisor 모드(Lv3)에서 전략 승인 필요

#### 파일 1: `src/agents/strategy/graph.py`

**변경 내용:**
```python
# 기존:
workflow.add_edge("asset_allocation", "blueprint_creation")
workflow.add_edge("blueprint_creation", END)

# 수정 후:
workflow.add_edge("asset_allocation", "blueprint_creation")
workflow.add_edge("blueprint_creation", "approval_strategy")  # ← 새 노드 추가
workflow.add_edge("approval_strategy", END)
```

#### 파일 2: `src/agents/strategy/nodes.py`

**새 노드 추가:**
```python
def approval_strategy_node(state: StrategyState) -> dict:
    """
    전략 승인 노드

    hitl_config 설정에 따라 interrupt 발생
    """
    from langgraph_sdk.schema import Interrupt
    from src.schemas.workflow import requires_hitl, get_hitl_message
    from src.schemas.hitl_config import HITLConfig

    # HITL 설정 가져오기
    hitl_config_dict = state.get("hitl_config", {})
    hitl_config = HITLConfig(**hitl_config_dict) if hitl_config_dict else HITLConfig()

    # HITL 필요 여부 체크
    if not requires_hitl("analysis", hitl_config):
        logger.info("⏭️ [Strategy] 승인 불필요 (preset=%s)", hitl_config.preset)
        return {}

    # 이미 승인됨
    if state.get("strategy_approved"):
        logger.info("⏭️ [Strategy] 이미 승인됨")
        return {}

    logger.info("🔔 [Strategy] 전략 승인 요청 (preset=%s)", hitl_config.preset)

    interrupt_payload = {
        "type": "strategy_approval",
        "phase": "analysis",
        "preset": hitl_config.preset,
        "message": get_hitl_message("analysis"),
        "strategy_blueprint": state.get("strategic_blueprint", {}),
        "market_outlook": state.get("market_outlook", {}),
        "sector_strategy": state.get("sector_strategy", {}),
    }

    approval: Interrupt = {
        "id": f"strategy-{state.get('conversation_id', 'unknown')}",
        "value": interrupt_payload,
    }

    return {"strategy_approved": True}
```

**Graph 파일에 노드 import 추가:**
```python
from .nodes import (
    market_analysis_node,
    sector_rotation_node,
    asset_allocation_node,
    blueprint_creation_node,
    approval_strategy_node,  # ← 추가
)
```

---

### 3. Portfolio Agent HITL 강화

**목적:** Copilot/Advisor 모드에서 리밸런싱 승인 필요

#### 파일 1: `src/agents/portfolio/graph.py`

**변경 내용:**
```python
# 기존:
workflow.add_edge("rebalance_plan", "summary")

# 수정 후:
workflow.add_edge("rebalance_plan", "approval_portfolio")  # ← 새 노드 추가
workflow.add_edge("approval_portfolio", "summary")
```

#### 파일 2: `src/agents/portfolio/nodes.py`

**새 노드 추가:**
```python
async def approval_portfolio_node(state: PortfolioState) -> dict:
    """
    포트폴리오 승인 노드

    hitl_config 설정에 따라 interrupt 발생
    """
    from langgraph_sdk.schema import Interrupt
    from src.schemas.workflow import requires_hitl, get_hitl_message
    from src.schemas.hitl_config import HITLConfig

    # HITL 설정 가져오기
    hitl_config_dict = state.get("hitl_config", {})
    hitl_config = HITLConfig(**hitl_config_dict) if hitl_config_dict else HITLConfig()

    rebalancing_needed = state.get("rebalancing_needed", False)

    # HITL 필요 여부 체크 (리밸런싱 필요 시만)
    if not rebalancing_needed or not requires_hitl("portfolio", hitl_config):
        logger.info("⏭️ [Portfolio] 승인 불필요 (preset=%s, rebalancing=%s)",
                    hitl_config.preset, rebalancing_needed)
        return {}

    # 이미 승인됨
    if state.get("portfolio_approved"):
        logger.info("⏭️ [Portfolio] 이미 승인됨")
        return {}

    logger.info("🔔 [Portfolio] 포트폴리오 승인 요청 (preset=%s)", hitl_config.preset)

    interrupt_payload = {
        "type": "portfolio_approval",
        "phase": "portfolio",
        "preset": hitl_config.preset,
        "message": get_hitl_message("portfolio"),
        "trades_required": state.get("trades_required", []),
        "portfolio_report": state.get("portfolio_report", {}),
        "current_holdings": state.get("current_holdings", []),
        "proposed_allocation": state.get("proposed_allocation", []),
    }

    approval: Interrupt = {
        "id": f"portfolio-{state.get('conversation_id', 'unknown')}",
        "value": interrupt_payload,
    }

    return {"portfolio_approved": True}
```

**Graph 파일에 노드 import 추가:**
```python
from .nodes import (
    collect_portfolio_node,
    optimize_allocation_node,
    rebalance_plan_node,
    approval_portfolio_node,  # ← 추가
    summary_node,
)
```

---

### 4. Trading Agent 리스크 기반 조건부 실행

**목적:** Pilot 모드에서 저위험 매매 자동 실행

#### 파일: `src/agents/trading/nodes.py`

**수정 내용:**
```python
def approval_trade_node(state: TradingState) -> dict:
    """
    2단계: 사용자 승인 (interrupt)

    hitl_config 설정에 따라 interrupt 발생
    - "conditional" 설정 시 리스크 레벨 기반 자동 승인
    """
    from langgraph_sdk.schema import Interrupt
    from src.schemas.workflow import requires_hitl, get_hitl_message
    from src.schemas.hitl_config import HITLConfig

    if state.get("trade_approved"):
        logger.info("⏭️ [Trade] 이미 승인된 주문입니다")
        return {}

    # HITL 설정 가져오기
    hitl_config_dict = state.get("hitl_config", {})
    hitl_config = HITLConfig(**hitl_config_dict) if hitl_config_dict else HITLConfig()

    risk_level = state.get("risk_level", "medium")

    # HITL 필요 여부 체크 (리스크 레벨 포함)
    if not requires_hitl("trade", hitl_config, risk_level):
        logger.info("✅ [Trade] 자동 승인 (preset=%s, risk=%s)", hitl_config.preset, risk_level)
        return {"trade_approved": True}

    logger.info("🔔 [Trade] 사용자 승인 요청 (preset=%s, risk=%s)",
                hitl_config.preset, risk_level)

    # ... (기존 interrupt 로직)
    summary = state.get("trade_summary") or {}
    interrupt_payload = {
        "type": "trade_approval",
        "order_id": state.get("trade_order_id", "UNKNOWN"),
        "query": state.get("query", ""),
        "stock_code": summary.get("stock_code") or state.get("stock_code"),
        "quantity": summary.get("order_quantity") or state.get("quantity"),
        "order_type": summary.get("order_type") or state.get("order_type"),
        "order_price": summary.get("order_price") or state.get("order_price"),
        "automation_level": automation_level,
        "risk_level": risk_level,  # ← 리스크 레벨 추가
        "message": "매매 주문을 승인하시겠습니까?",
    }
    approval: Interrupt = {
        "id": f"trade-{interrupt_payload['order_id']}",
        "value": interrupt_payload,
    }

    logger.info("✅ [Trade] 승인 요청 생성: %s", approval)

    messages = list(state.get("messages", []))
    return {"trade_approved": True, "messages": messages}
```

---

### 5. GraphState에 필드 추가

**목적:** 승인 상태 플래그 추가

#### 파일: `src/schemas/graph_state.py`

**추가 필드:**
```python
class GraphState(TypedDict):
    # ... (기존 필드들)

    # ==================== 에이전트별 승인 상태 ====================

    strategy_approved: bool
    """전략 승인 완료 여부 (Advisor 모드)"""

    portfolio_approved: bool
    """포트폴리오 승인 완료 여부 (Copilot/Advisor 모드)"""

    trade_approved: bool  # 이미 존재
    """거래 승인 완료 여부"""
```

---

## 🎨 프론트엔드 수정 사항

### 1. userStore 업데이트 - hitl_config 추가

**파일:** `src/store/userStore.ts`

**기존 구조:**
```typescript
interface UserState {
  automationLevel: AutomationLevel;  // 1 | 2 | 3
  // ...
}
```

**새 구조:**
```typescript
type AutomationPreset = "pilot" | "copilot" | "advisor" | "custom";

interface HITLPhases {
  data_collection: boolean;
  analysis: boolean;
  portfolio: boolean;
  risk: boolean;
  trade: boolean;
}

interface HITLConfig {
  preset: AutomationPreset;
  phases: HITLPhases;
}

interface UserState {
  hitlConfig: HITLConfig;

  // 편의 getter
  get automationLevel(): AutomationLevel;  // preset → 1/2/3 매핑

  // Actions
  setPreset: (preset: AutomationPreset) => void;
  setCustomPhases: (phases: Partial<HITLPhases>) => void;
}
```

**Preset → Level 매핑:**
```typescript
const PRESET_TO_LEVEL = {
  pilot: 1,
  copilot: 2,
  advisor: 3,
  custom: 2,  // Custom은 Copilot 기본값
};
```

---

### 2. AutomationLevelSelector 업데이트 ✅

**파일:** `src/components/mypage/AutomationLevelSelector.tsx`

**변경 사항:**
- ✅ Advisor (Lv3) HITL 지점 업데이트: `["data-analysis", "portfolio", "trade"]`
- ✅ Copilot (Lv2) HITL 지점 수정: `["portfolio", "trade"]`
- ✅ Pilot (Lv1) HITL 지점 유지: `["trade"]`
- [ ] Custom 모드 추가 (Phase 2)

---

### 3. CustomHITLSettings 컴포넌트 (신규 - Phase 2)

**파일:** `src/components/mypage/CustomHITLSettings.tsx` (예정)

**UI 구조:**
```tsx
<div className="space-y-4">
  <h3>커스텀 HITL 설정</h3>
  <p className="text-sm">Phase별로 승인 필요 여부를 설정하세요</p>

  {phases.map(phase => (
    <div key={phase.id} className="flex items-center justify-between">
      <div>
        <span className="font-medium">{phase.label}</span>
        <p className="text-xs text-muted">{phase.description}</p>
      </div>
      <Toggle
        checked={hitlConfig.phases[phase.id]}
        onChange={(checked) => updatePhase(phase.id, checked)}
      />
    </div>
  ))}
</div>
```

**Phase 옵션:**
```typescript
const phases = [
  {
    id: "data_collection",
    label: "데이터 수집",
    description: "종목 데이터 수집 및 기본 분석 (보통 자동)",
  },
  {
    id: "analysis",
    label: "분석",
    description: "투자 전략 수립 및 리스크 분석",
  },
  {
    id: "portfolio",
    label: "포트폴리오",
    description: "포트폴리오 구성 및 리밸런싱",
  },
  {
    id: "risk",
    label: "리스크 평가",
    description: "리밸런싱 시 리스크 재평가 (보통 자동)",
  },
  {
    id: "trade",
    label: "매매",
    description: "매매 주문 실행",
  },
];
```

---

### 4. Chat API 요청 업데이트

**파일:** `src/lib/api.ts` (또는 Chat 컴포넌트)

**기존:**
```typescript
const response = await axios.post("/api/v1/chat", {
  message: userMessage,
  automation_level: automationLevel,  // ← 제거 예정
});
```

**새로운 방식:**
```typescript
const response = await axios.post("/api/v1/chat", {
  message: userMessage,
  hitl_config: {
    preset: hitlConfig.preset,
    phases: hitlConfig.phases,
  },
});
```

---

### 5. HITL 패널 타입 확장 (Phase 2+)

**파일:** `src/components/HITL/HITLPanel.tsx` (예정)

**추가 승인 타입:**
```typescript
type ApprovalType =
  | "trade_approval"        // 기존
  | "portfolio_approval"    // 새로 추가
  | "strategy_approval";    // 새로 추가
```

**각 타입별 표시 내용:**
- `strategy_approval`: Strategic Blueprint, 예상 수익률, 섹터 비중
- `portfolio_approval`: 리밸런싱 Trade 리스트, 현재/목표 비중 비교
- `trade_approval`: 주문 상세, 리스크 경고 (기존)

---

## 📝 문서 업데이트 완료

### 1. ProductRequirements.md ✅

**위치:** `docs/ProductRequirements.md`

**업데이트 섹션:** US-4.1 (자동화 수준 설정)

**추가 내용:**
- 5단계 워크플로우 명시
- 레벨별 HITL 개입 지점 테이블
- 백엔드 구현 상태 체크리스트

---

### 2. Userflow.md ✅

**위치:** `docs/Userflow.md`

**업데이트 섹션:** Flow 5 (자동화 레벨 변경 효과 플로우)

**추가 시나리오:**
- 시나리오 A: Copilot → Pilot (저위험 자동 매매)
- 시나리오 B: Copilot → Advisor (전략 승인 추가)

---

## 🚀 구현 우선순위

### Phase 1 (현재 캡스톤 - 필수)

- ✅ 프론트엔드 AutomationLevelSelector 업데이트
- ✅ 문서 업데이트 (PRD, Userflow)
- [ ] **백엔드 workflow.py 생성**
- [ ] **Trading Agent 리스크 기반 조건부 실행**

### Phase 2 (향후 개선)

- [ ] Portfolio Agent HITL 추가
- [ ] Strategy Agent HITL 추가
- [ ] 프론트엔드 HITL 패널 타입 확장

---

## 🧪 테스트 시나리오

### 시나리오 1: Pilot 모드 저위험 자동 매매

```
Given: automation_level = 1 (Pilot)
When: 사용자가 "삼성전자 100만원 매수해줘" 입력
And: Risk Agent가 "low" 리스크 판정
Then: HITL 패널 없이 자동으로 매매 실행
And: 토스트 메시지 "매수 주문이 실행되었습니다 (자동)"
```

### 시나리오 2: Copilot 모드 포트폴리오 승인

```
Given: automation_level = 2 (Copilot)
When: 사용자가 "내 포트폴리오 리밸런싱해줘" 입력
And: Portfolio Agent가 리밸런싱 필요 판단
Then: HITL 패널 오픈 (portfolio_approval)
And: Trade 리스트 및 비중 변화 표시
When: 사용자가 "승인" 클릭
Then: 리밸런싱 실행
```

### 시나리오 3: Advisor 모드 전략 승인

```
Given: automation_level = 3 (Advisor)
When: 사용자가 "삼성전자 분석해줘" 입력
And: Strategy Agent가 전략 생성
Then: HITL 패널 오픈 (strategy_approval)
And: Strategic Blueprint 표시
When: 사용자가 "수정 요청" 클릭
Then: 패널 닫히고 Chat Input에 컨텍스트 로드
```

---

## 📚 참조 문서

- **백엔드 PRD:** `../HAMA-backend/docs/PRD.md`
- **프론트엔드 PRD:** `docs/ProductRequirements.md`
- **Userflow:** `docs/Userflow.md`
- **백엔드 에이전트 구조:** `../HAMA-backend/src/agents/`

---

## ✅ Checklist

### Phase 1: 최우선 (캡스톤 필수)

#### 백엔드
- [ ] `src/schemas/hitl_config.py` 생성 (HITLConfig 스키마)
- [ ] `src/schemas/workflow.py` 생성 (Phase 매핑, requires_hitl 함수)
- [ ] Trading Agent 리스크 조건부 실행 (Pilot 모드)
- [ ] GraphState `hitl_config` 필드 추가
- [ ] API 엔드포인트 수정 (`automation_level` → `hitl_config`)

#### 프론트엔드
- [x] AutomationLevelSelector HITL 지점 업데이트
- [ ] userStore `hitl_config` 구조 추가
- [ ] Chat API 요청에 `hitl_config` 전달
- [x] PRD 업데이트
- [x] Userflow 업데이트
- [x] AutomationLevelIntegration.md 작성 ⭐

### Phase 2: 향후 개선

#### 백엔드
- [ ] Portfolio Agent HITL 추가
- [ ] Strategy Agent HITL 추가 (Advisor 모드)
- [ ] Custom 모드 완전 지원
- [ ] 테스트 작성

#### 프론트엔드
- [ ] CustomHITLSettings 컴포넌트 구현
- [ ] AutomationLevelSelector에 Custom 옵션 추가
- [ ] HITL 패널 타입 확장 (strategy_approval, portfolio_approval)
- [ ] 다이얼로그 컴포넌트 추가 (레벨 변경 확인)

### 문서
- [x] AutomationLevelIntegration.md 작성 (커스텀 모드 포함)
- [x] PRD 업데이트
- [x] Userflow 업데이트
- [x] CLAUDE.md 업데이트
- [ ] 백엔드 CLAUDE.md 업데이트 (백엔드 팀원에게 전달)

---

**끝.**
