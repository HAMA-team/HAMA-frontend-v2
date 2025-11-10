# Settings & Approvals API - Complete Design

**Date**: 2025-10-30
**Version**: 2.0 (Post-hitl_config Migration)
**Status**: Implementation Ready ✅

---

## Document Purpose

이 문서는 **Settings & Approvals API의 완성된 설계**를 제시합니다. Portfolio API Complete Design과 동일한 형식으로, 백엔드와 프론트엔드가 이 문서 하나만 보고 완벽하게 구현할 수 있도록 모든 정보를 포함합니다.

**Companion Documents**:
- `Settings_Approvals_API_Backend_Feedback.md` - 현재 구현의 문제점 및 해결책
- `AutomationLevelIntegration.md` - 자동화 레벨 시스템 설계
- `AutomationLevelAPIChanges.md` - API 마이그레이션 상세

---

## Table of Contents

1. [API Endpoints Overview](#1-api-endpoints-overview)
2. [Settings APIs](#2-settings-apis)
3. [Approvals APIs](#3-approvals-apis)
4. [HITL Interrupt Mechanism](#4-hitl-interrupt-mechanism)
5. [Schema Definitions](#5-schema-definitions)
6. [Backend Implementation](#6-backend-implementation)
7. [Frontend Implementation](#7-frontend-implementation)
8. [Testing Strategy](#8-testing-strategy)
9. [Deployment Checklist](#9-deployment-checklist)

---

## 1. API Endpoints Overview

### 1.1 Endpoint Matrix

| Endpoint | Method | Purpose | Frontend Usage | Priority |
|----------|--------|---------|----------------|----------|
| `/api/v1/settings/automation-level` | GET | 현재 HITL 설정 조회 | My Page 로딩 시 | P1 |
| `/api/v1/settings/automation-level` | PUT | HITL 설정 변경 | My Page 레벨 변경 시 | P1 |
| `/api/v1/settings/automation-levels` | GET | 사용 가능한 프리셋 목록 | My Page 초기화 시 | P2 |
| `/api/v1/chat/approve` | POST | HITL 승인/거부 처리 | HITL Panel 승인/거부 시 | P0 |

### 1.2 Data Flow Diagram

```
[Frontend: My Page]
       ↓ (로딩)
  GET /settings/automation-level
       ↓
[Backend: Settings API]
       ↓ (DB 조회)
  return hitl_config
       ↓
[Frontend: Display Current Settings]
       ↓ (사용자 변경)
  PUT /settings/automation-level
       ↓
[Backend: Validate & Save]
       ↓
  return success

---

[Frontend: Chat]
       ↓ (메시지 전송 with hitl_config)
  POST /chat/
       ↓
[Backend: LangGraph Execution]
       ↓ (interrupt 발생)
  SSE: requires_approval event
       ↓
[Frontend: HITL Panel Open]
       ↓ (사용자 승인/거부)
  POST /chat/approve
       ↓
[Backend: Resume Graph with Command]
       ↓
  return final_result
```

---

## 2. Settings APIs

### 2.1 GET /api/v1/settings/automation-level

**Purpose**: 사용자의 현재 자동화 레벨 설정을 조회합니다.

#### Request

```http
GET /api/v1/settings/automation-level HTTP/1.1
Authorization: Bearer {token}
```

**Query Parameters**: None

**Headers**:
- `Authorization`: Bearer token (Phase 2+, Phase 1은 user_id로 대체)

#### Response (Success)

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "hitl_config": {
    "preset": "copilot",
    "phases": {
      "data_collection": false,
      "analysis": false,
      "portfolio": true,
      "risk": false,
      "trade": true
    }
  },
  "preset_name": "Copilot",
  "description": "AI가 제안하고, 중요한 결정은 사용자가 승인합니다.",
  "interrupt_points": ["portfolio", "trade"]
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `hitl_config` | HITLConfig | 전체 HITL 설정 객체 |
| `hitl_config.preset` | string | "pilot" \| "copilot" \| "advisor" \| "custom" |
| `hitl_config.phases` | HITLPhases | Phase별 HITL 개입 여부 |
| `preset_name` | string | 프리셋 표시 이름 (UI용) |
| `description` | string | 프리셋 설명 |
| `interrupt_points` | string[] | HITL 발생 지점 목록 (UI 표시용) |

#### Response (User Not Found)

```http
HTTP/1.1 404 Not Found
Content-Type: application/json
```

```json
{
  "detail": "User settings not found",
  "code": "USER_NOT_FOUND"
}
```

**Default Behavior**: 사용자 설정이 없으면 Copilot 기본값 반환

#### Backend Implementation

```python
# src/api/v1/settings.py

from fastapi import APIRouter, Depends, HTTPException
from src.db.repositories import UserSettingsRepository
from src.schemas.api import AutomationLevelResponse
from src.schemas.hitl_config import PRESET_COPILOT, PRESET_METADATA
from src.auth import get_current_user_id

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/automation-level", response_model=AutomationLevelResponse)
async def get_automation_level(
    user_id: str = Depends(get_current_user_id),
    repo: UserSettingsRepository = Depends()
):
    """
    현재 사용자의 자동화 레벨 설정 조회

    Returns:
        AutomationLevelResponse with hitl_config
    """
    settings = await repo.get_user_settings(user_id)

    if not settings or not settings.hitl_config:
        # 기본값 반환
        hitl_config = PRESET_COPILOT
    else:
        hitl_config = settings.hitl_config

    preset = hitl_config.preset
    metadata = PRESET_METADATA.get(preset, PRESET_METADATA["copilot"])

    return AutomationLevelResponse(
        hitl_config=hitl_config,
        preset_name=metadata["name"],
        description=metadata["description"],
        interrupt_points=get_interrupt_points(hitl_config)
    )

def get_interrupt_points(config: HITLConfig) -> list[str]:
    """HITLConfig에서 interrupt 발생 지점 추출"""
    points = []

    if config.phases.data_collection:
        points.append("data_collection")
    if config.phases.analysis:
        points.append("analysis")
    if config.phases.portfolio:
        points.append("portfolio")
    if config.phases.risk:
        points.append("risk")
    if config.phases.trade == True:
        points.append("trade")
    elif config.phases.trade == "conditional":
        points.append("trade (conditional)")

    return points
```

#### Frontend Implementation

```typescript
// src/lib/api/settings.ts

import apiClient from "@/lib/api";
import type { HITLConfig, AutomationLevelResponse } from "@/types/hitl";

export async function getAutomationLevel(): Promise<AutomationLevelResponse> {
  const { data } = await apiClient.get<AutomationLevelResponse>(
    "/api/v1/settings/automation-level"
  );
  return data;
}
```

```typescript
// src/components/mypage/MyPageView.tsx

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { getAutomationLevel } from "@/lib/api/settings";

export default function MyPageView() {
  const { hitlConfig, setHITLConfig, isLoading, setLoading } = useUserStore();

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const data = await getAutomationLevel();
        setHITLConfig(data.hitl_config);
      } catch (error) {
        console.error("Failed to load automation level:", error);
        // 기본값 사용 (Copilot)
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <AutomationLevelSelector
        currentConfig={hitlConfig}
        onChange={setHITLConfig}
      />
    </div>
  );
}
```

---

### 2.2 PUT /api/v1/settings/automation-level

**Purpose**: 사용자의 자동화 레벨 설정을 변경합니다.

#### Request

```http
PUT /api/v1/settings/automation-level HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "hitl_config": {
    "preset": "advisor",
    "phases": {
      "data_collection": false,
      "analysis": true,
      "portfolio": true,
      "risk": false,
      "trade": true
    }
  },
  "confirm": true
}
```

**Request Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hitl_config` | HITLConfig | ✅ Yes | 새로운 HITL 설정 |
| `confirm` | boolean | ✅ Yes | 변경 확인 (사용자 의도 검증) |

**Validation Rules**:
1. ✅ `preset`은 "pilot", "copilot", "advisor", "custom" 중 하나
2. ✅ `phases.trade`는 boolean 또는 "conditional"
3. ✅ `confirm`이 true여야 함
4. ✅ Custom 모드는 최소 1개 이상의 phase가 true여야 함

#### Response (Success)

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "message": "자동화 레벨이 변경되었습니다",
  "new_config": {
    "preset": "advisor",
    "phases": {
      "data_collection": false,
      "analysis": true,
      "portfolio": true,
      "risk": false,
      "trade": true
    }
  },
  "effective_from": "immediate"
}
```

#### Response (Validation Error)

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json
```

```json
{
  "detail": [
    {
      "loc": ["body", "hitl_config", "preset"],
      "msg": "Invalid preset value",
      "type": "value_error"
    }
  ]
}
```

#### Response (Confirmation Required)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
```

```json
{
  "detail": "Confirmation required for automation level change",
  "code": "CONFIRMATION_REQUIRED"
}
```

#### Backend Implementation

```python
# src/api/v1/settings.py

@router.put("/automation-level", response_model=AutomationLevelUpdateResponse)
async def update_automation_level(
    request: AutomationLevelUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    repo: UserSettingsRepository = Depends()
):
    """
    자동화 레벨 변경

    Args:
        request: hitl_config 및 confirm 플래그
        user_id: 현재 사용자 ID
        repo: DB repository

    Returns:
        AutomationLevelUpdateResponse with success status

    Raises:
        HTTPException(400): confirm이 false인 경우
        HTTPException(422): hitl_config 검증 실패
    """

    # 1. 확인 검증
    if not request.confirm:
        raise HTTPException(
            status_code=400,
            detail="Confirmation required for automation level change"
        )

    # 2. Custom 모드 검증
    if request.hitl_config.preset == "custom":
        phases = request.hitl_config.phases
        has_any_hitl = any([
            phases.data_collection,
            phases.analysis,
            phases.portfolio,
            phases.risk,
            phases.trade == True or phases.trade == "conditional"
        ])

        if not has_any_hitl:
            raise HTTPException(
                status_code=422,
                detail="Custom mode must have at least one HITL phase enabled"
            )

    # 3. DB 저장
    try:
        await repo.update_hitl_config(user_id, request.hitl_config)
    except Exception as e:
        logger.error(f"Failed to update hitl_config: {e}")
        raise HTTPException(status_code=500, detail="Failed to save settings")

    # 4. 응답
    return AutomationLevelUpdateResponse(
        success=True,
        message="자동화 레벨이 변경되었습니다",
        new_config=request.hitl_config,
        effective_from="immediate"
    )
```

**Database Schema**:

```sql
-- PostgreSQL
CREATE TABLE user_settings (
    user_id VARCHAR(255) PRIMARY KEY,
    hitl_config JSONB NOT NULL DEFAULT '{
        "preset": "copilot",
        "phases": {
            "data_collection": false,
            "analysis": false,
            "portfolio": true,
            "risk": false,
            "trade": true
        }
    }',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

**Repository Implementation**:

```python
# src/db/repositories/user_settings.py

from sqlalchemy.ext.asyncio import AsyncSession
from src.db.models import UserSettings
from src.schemas.hitl_config import HITLConfig

class UserSettingsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_settings(self, user_id: str) -> UserSettings | None:
        """사용자 설정 조회"""
        result = await self.session.execute(
            select(UserSettings).where(UserSettings.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def update_hitl_config(self, user_id: str, config: HITLConfig) -> None:
        """HITL 설정 업데이트 (upsert)"""
        settings = await self.get_user_settings(user_id)

        if settings:
            # UPDATE
            settings.hitl_config = config.dict()
            settings.updated_at = datetime.now()
        else:
            # INSERT
            settings = UserSettings(
                user_id=user_id,
                hitl_config=config.dict()
            )
            self.session.add(settings)

        await self.session.commit()
```

#### Frontend Implementation

```typescript
// src/lib/api/settings.ts

export async function updateAutomationLevel(
  config: HITLConfig
): Promise<AutomationLevelUpdateResponse> {
  const { data } = await apiClient.put<AutomationLevelUpdateResponse>(
    "/api/v1/settings/automation-level",
    {
      hitl_config: config,
      confirm: true,
    }
  );
  return data;
}
```

```typescript
// src/store/userStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HITLConfig } from "@/types/hitl";
import { updateAutomationLevel } from "@/lib/api/settings";
import { PRESET_COPILOT } from "@/types/hitl";

interface UserState {
  hitlConfig: HITLConfig;
  isLoading: boolean;
  setHITLConfig: (config: HITLConfig) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      hitlConfig: PRESET_COPILOT,
      isLoading: false,

      setHITLConfig: async (config: HITLConfig) => {
        set({ isLoading: true });

        try {
          // 백엔드 API 호출
          const response = await updateAutomationLevel(config);

          if (response.success) {
            // 로컬 상태 업데이트
            set({ hitlConfig: config });

            // 성공 토스트
            useToastStore.getState().addToast({
              type: "success",
              message: response.message,
            });
          }
        } catch (error) {
          console.error("Failed to update automation level:", error);

          // 에러 토스트
          useToastStore.getState().addToast({
            type: "error",
            message: "자동화 레벨 변경에 실패했습니다",
          });

          // 롤백 (이전 상태 유지)
        } finally {
          set({ isLoading: false });
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "user-storage",
      version: 2, // automation_level → hitlConfig 마이그레이션

      // 마이그레이션 함수
      migrate: (persistedState: any, version: number) => {
        if (version === 1 && persistedState.automationLevel) {
          // v1 → v2: automation_level → hitlConfig
          const level = persistedState.automationLevel;
          delete persistedState.automationLevel;

          if (level === 1) {
            persistedState.hitlConfig = PRESET_PILOT;
          } else if (level === 2) {
            persistedState.hitlConfig = PRESET_COPILOT;
          } else if (level === 3) {
            persistedState.hitlConfig = PRESET_ADVISOR;
          }
        }
        return persistedState;
      },
    }
  )
);
```

```typescript
// src/components/mypage/AutomationLevelSelector.tsx

import { useUserStore } from "@/store/userStore";
import { PRESET_PILOT, PRESET_COPILOT, PRESET_ADVISOR } from "@/types/hitl";

export default function AutomationLevelSelector() {
  const { hitlConfig, setHITLConfig, isLoading } = useUserStore();

  const handleLevelChange = async (preset: "pilot" | "copilot" | "advisor") => {
    const newConfig =
      preset === "pilot"
        ? PRESET_PILOT
        : preset === "copilot"
        ? PRESET_COPILOT
        : PRESET_ADVISOR;

    await setHITLConfig(newConfig);
  };

  return (
    <div className="space-y-4">
      {/* Pilot Button */}
      <button
        onClick={() => handleLevelChange("pilot")}
        disabled={isLoading}
        className={hitlConfig.preset === "pilot" ? "selected" : ""}
      >
        Pilot Mode
      </button>

      {/* Copilot Button */}
      <button
        onClick={() => handleLevelChange("copilot")}
        disabled={isLoading}
        className={hitlConfig.preset === "copilot" ? "selected" : ""}
      >
        Copilot Mode
      </button>

      {/* Advisor Button */}
      <button
        onClick={() => handleLevelChange("advisor")}
        disabled={isLoading}
        className={hitlConfig.preset === "advisor" ? "selected" : ""}
      >
        Advisor Mode
      </button>
    </div>
  );
}
```

---

### 2.3 GET /api/v1/settings/automation-levels

**Purpose**: 사용 가능한 자동화 레벨 프리셋 목록을 반환합니다.

#### Request

```http
GET /api/v1/settings/automation-levels HTTP/1.1
```

**Query Parameters**: None

#### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "presets": [
    {
      "preset": "pilot",
      "config": {
        "preset": "pilot",
        "phases": {
          "data_collection": false,
          "analysis": false,
          "portfolio": false,
          "risk": false,
          "trade": "conditional"
        }
      },
      "metadata": {
        "name": "Pilot",
        "description": "AI가 대부분 자동으로 처리합니다",
        "features": [
          "저위험 매매는 자동 실행",
          "고위험 매매만 승인 필요",
          "빠른 의사결정"
        ],
        "recommended_for": "경험 많은 투자자"
      }
    },
    {
      "preset": "copilot",
      "config": {
        "preset": "copilot",
        "phases": {
          "data_collection": false,
          "analysis": false,
          "portfolio": true,
          "risk": false,
          "trade": true
        }
      },
      "metadata": {
        "name": "Copilot",
        "description": "AI가 제안하고, 중요한 결정은 사용자가 승인합니다",
        "features": [
          "포트폴리오 구성 시 승인 필요",
          "모든 매매 시 승인 필요",
          "균형잡힌 자동화"
        ],
        "recommended_for": "대부분의 사용자 (권장)"
      }
    },
    {
      "preset": "advisor",
      "config": {
        "preset": "advisor",
        "phases": {
          "data_collection": false,
          "analysis": true,
          "portfolio": true,
          "risk": false,
          "trade": true
        }
      },
      "metadata": {
        "name": "Advisor",
        "description": "AI는 정보만 제공하고, 모든 중요 결정은 사용자가 직접 합니다",
        "features": [
          "투자 전략 수립 시 승인 필요",
          "포트폴리오 구성 시 승인 필요",
          "모든 매매 시 승인 필요"
        ],
        "recommended_for": "신중한 투자자"
      }
    }
  ],
  "custom_available": true
}
```

#### Backend Implementation

```python
# src/schemas/hitl_config.py (프리셋 메타데이터)

PRESET_METADATA = {
    "pilot": {
        "name": "Pilot",
        "description": "AI가 대부분 자동으로 처리합니다",
        "features": [
            "저위험 매매는 자동 실행",
            "고위험 매매만 승인 필요",
            "빠른 의사결정"
        ],
        "recommended_for": "경험 많은 투자자"
    },
    "copilot": {
        "name": "Copilot",
        "description": "AI가 제안하고, 중요한 결정은 사용자가 승인합니다",
        "features": [
            "포트폴리오 구성 시 승인 필요",
            "모든 매매 시 승인 필요",
            "균형잡힌 자동화"
        ],
        "recommended_for": "대부분의 사용자 (권장)"
    },
    "advisor": {
        "name": "Advisor",
        "description": "AI는 정보만 제공하고, 모든 중요 결정은 사용자가 직접 합니다",
        "features": [
            "투자 전략 수립 시 승인 필요",
            "포트폴리오 구성 시 승인 필요",
            "모든 매매 시 승인 필요"
        ],
        "recommended_for": "신중한 투자자"
    }
}
```

```python
# src/api/v1/settings.py

@router.get("/automation-levels")
async def list_automation_levels():
    """
    사용 가능한 자동화 레벨 프리셋 목록 반환

    Returns:
        presets: 프리셋 목록
        custom_available: Custom 모드 지원 여부
    """
    return {
        "presets": [
            {
                "preset": "pilot",
                "config": PRESET_PILOT.dict(),
                "metadata": PRESET_METADATA["pilot"]
            },
            {
                "preset": "copilot",
                "config": PRESET_COPILOT.dict(),
                "metadata": PRESET_METADATA["copilot"]
            },
            {
                "preset": "advisor",
                "config": PRESET_ADVISOR.dict(),
                "metadata": PRESET_METADATA["advisor"]
            }
        ],
        "custom_available": True  # Phase 3+에서 활성화
    }
```

---

## 3. Approvals APIs

### 3.1 POST /api/v1/chat/approve

**Purpose**: HITL 승인/거부 요청을 처리하고 LangGraph 실행을 재개합니다.

#### Request

```http
POST /api/v1/chat/approve HTTP/1.1
Content-Type: application/json
```

```json
{
  "thread_id": "550e8400-e29b-41d4-a716-446655440000",
  "decision": "approved",
  "modifications": null,
  "user_notes": "리스크가 낮아서 승인합니다"
}
```

**Request Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `thread_id` | string (UUID) | ✅ Yes | 대화 스레드 ID (LangGraph checkpoint ID) |
| `decision` | string | ✅ Yes | "approved" \| "rejected" \| "modified" |
| `modifications` | object | ❌ No | decision="modified"일 때 수정 사항 |
| `user_notes` | string | ❌ No | 사용자 메모 (승인/거부 이유 등) |

**Validation Rules**:
1. ✅ `thread_id`는 유효한 UUID
2. ✅ `decision`은 3가지 값 중 하나
3. ✅ decision="modified"면 `modifications` 필수
4. ✅ 해당 thread에 pending approval이 존재해야 함

#### Response (Success - Approved)

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "message": "매수 주문이 실행되었습니다",
  "result": {
    "order_id": "ORD-20251030-001",
    "stock_code": "005930",
    "stock_name": "삼성전자",
    "order_type": "buy",
    "quantity": 10,
    "executed_price": 76300,
    "total_amount": 763000,
    "status": "executed",
    "executed_at": "2025-10-30T10:35:22Z"
  },
  "graph_completed": true
}
```

#### Response (Success - Rejected)

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "message": "매수 주문이 거부되었습니다",
  "result": {
    "rejected": true,
    "reason": "사용자 거부",
    "alternative_suggestion": "대신 SK하이닉스를 고려해보시겠습니까?"
  },
  "graph_completed": true
}
```

#### Response (Error - No Pending Approval)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
```

```json
{
  "detail": "No pending approval for this thread",
  "code": "NO_PENDING_APPROVAL",
  "thread_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Response (Error - Thread Not Found)

```http
HTTP/1.1 404 Not Found
Content-Type: application/json
```

```json
{
  "detail": "Thread not found",
  "code": "THREAD_NOT_FOUND",
  "thread_id": "invalid-thread-id"
}
```

#### Backend Implementation

```python
# src/api/v1/chat.py

from langgraph.graph import Command

@router.post("/approve", response_model=ApprovalResponse)
async def approve_action(request: ApprovalRequest):
    """
    HITL 승인/거부 처리

    Args:
        request: ApprovalRequest with thread_id and decision

    Returns:
        ApprovalResponse with success status and result

    Raises:
        HTTPException(400): No pending approval
        HTTPException(404): Thread not found
        HTTPException(500): Graph execution failed
    """

    config = {
        "configurable": {
            "thread_id": request.thread_id
        }
    }

    try:
        # 1. 중단된 그래프 상태 확인
        state = await checkpointer.aget_state(config)

        if not state.next:
            raise HTTPException(
                status_code=400,
                detail="No pending approval for this thread"
            )

        # 2. interrupt 타입 확인
        interrupt_type = state.tasks[0].interrupts[0].value if state.tasks else None
        logger.info(f"Resuming graph with interrupt type: {interrupt_type}")

        # 3. Command 생성
        if request.decision == "approved":
            command = Command(
                resume={
                    "decision": "approved",
                    "notes": request.user_notes
                }
            )
            message = "승인이 처리되었습니다"

        elif request.decision == "rejected":
            command = Command(
                resume={
                    "decision": "rejected",
                    "reason": request.user_notes
                }
            )
            message = "거부가 처리되었습니다"

        elif request.decision == "modified":
            if not request.modifications:
                raise HTTPException(
                    status_code=422,
                    detail="Modifications required for decision=modified"
                )

            command = Command(
                resume={
                    "decision": "modified",
                    "modifications": request.modifications,
                    "notes": request.user_notes
                }
            )
            message = "수정 사항이 반영되었습니다"

        # 4. 그래프 재개
        result = await graph.ainvoke(
            input=None,  # 기존 state 사용
            config=config,
            command=command
        )

        # 5. 응답 생성
        return ApprovalResponse(
            success=True,
            message=message,
            result=result.get("trade_result") or result.get("final_response"),
            graph_completed=True
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Approval failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process approval: {str(e)}"
        )
```

**Command Resume 처리 in Agent**:

```python
# src/agents/trading/nodes.py

from langgraph.types import interrupt

def approval_trade_node(state: TradingState) -> dict:
    """
    매매 승인 노드 - HITL 구현

    Returns:
        trade_approved: bool
        skip_hitl: bool (Pilot 자동 승인 시)
        modified_quantity: int (수정된 수량)
    """

    hitl_config = state.get("hitl_config", PRESET_COPILOT)
    risk_level = state.get("risk_level", "medium")

    # Pilot 조건부 자동 승인
    if hitl_config.phases.trade == "conditional" and risk_level == "low":
        logger.info("Auto-approving low-risk trade (Pilot mode)")
        return {
            "trade_approved": True,
            "skip_hitl": True,
            "approval_type": "automatic"
        }

    # HITL 필요
    if hitl_config.phases.trade:
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

        # 🔴 여기서 그래프 실행이 중단되고 프론트엔드가 제어권을 가짐
        user_response = interrupt(
            value="trade_approval",
            payload=order_details
        )

        # 🟢 /api/v1/chat/approve 호출 후 여기서 재개
        logger.info(f"User decision received: {user_response}")

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
            # 수정된 수량으로 교체
            modifications = user_response.get("modifications", {})
            return {
                "trade_approved": True,
                "approval_type": "modified",
                "modified_quantity": modifications.get("quantity", state["quantity"]),
                "user_notes": user_response.get("notes")
            }

    # Fallback (HITL 불필요 - 이론상 불가능)
    return {"trade_approved": True}
```

**조건부 라우팅**:

```python
# src/agents/trading/graph.py

from langgraph.graph import StateGraph, END

def should_execute_trade(state: TradingState) -> str:
    """승인 여부에 따라 다음 노드 결정"""
    if state.get("skip_hitl"):
        return "execute"
    elif state.get("trade_approved"):
        return "execute"
    else:
        return END  # 거부 시 종료

workflow = StateGraph(TradingState)
workflow.add_node("prepare_order", prepare_order_node)
workflow.add_node("approval", approval_trade_node)
workflow.add_node("execute", execute_trade_node)

workflow.add_edge("prepare_order", "approval")
workflow.add_conditional_edges(
    "approval",
    should_execute_trade,
    {
        "execute": "execute",
        END: END
    }
)
```

#### Frontend Implementation

```typescript
// src/lib/api/chat.ts

export async function approveAction(
  threadId: string,
  decision: "approved" | "rejected" | "modified",
  options?: {
    modifications?: Record<string, any>;
    userNotes?: string;
  }
): Promise<ApprovalResponse> {
  const { data } = await apiClient.post<ApprovalResponse>(
    "/api/v1/chat/approve",
    {
      thread_id: threadId,
      decision,
      modifications: options?.modifications,
      user_notes: options?.userNotes,
    }
  );
  return data;
}
```

```typescript
// src/components/HITL/HITLPanel.tsx

import { useState } from "react";
import { approveAction } from "@/lib/api/chat";
import { useToastStore } from "@/store/toastStore";

interface HITLPanelProps {
  threadId: string;
  approvalType: "trade" | "strategy" | "portfolio";
  payload: Record<string, any>;
  onClose: () => void;
}

export default function HITLPanel({
  threadId,
  approvalType,
  payload,
  onClose,
}: HITLPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const { addToast } = useToastStore();

  const handleApprove = async () => {
    setIsSubmitting(true);

    try {
      const response = await approveAction(threadId, "approved", {
        userNotes,
      });

      if (response.success) {
        addToast({
          type: "success",
          message: response.message,
        });
        onClose();
      }
    } catch (error) {
      console.error("Approval failed:", error);
      addToast({
        type: "error",
        message: "승인 처리에 실패했습니다",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);

    try {
      const response = await approveAction(threadId, "rejected", {
        userNotes,
      });

      if (response.success) {
        addToast({
          type: "info",
          message: response.message,
        });
        onClose();
      }
    } catch (error) {
      console.error("Rejection failed:", error);
      addToast({
        type: "error",
        message: "거부 처리에 실패했습니다",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hitl-panel">
      <h2>승인 요청</h2>

      {/* Payload Display */}
      {approvalType === "trade" && (
        <div>
          <p>종목: {payload.stock_name} ({payload.stock_code})</p>
          <p>주문 유형: {payload.order_type}</p>
          <p>수량: {payload.quantity}주</p>
          <p>예상 금액: {payload.total_amount.toLocaleString()}원</p>
          <p>리스크: {payload.risk_level}</p>
        </div>
      )}

      {/* User Notes */}
      <textarea
        value={userNotes}
        onChange={(e) => setUserNotes(e.target.value)}
        placeholder="메모 (선택)"
      />

      {/* Actions */}
      <div className="actions">
        <button onClick={handleApprove} disabled={isSubmitting}>
          승인
        </button>
        <button onClick={handleReject} disabled={isSubmitting}>
          거부
        </button>
      </div>
    </div>
  );
}
```

**SSE Stream에서 HITL 이벤트 수신**:

```typescript
// src/lib/api/chat.ts

export function streamChat(
  message: string,
  conversationId: string | null,
  onEvent: (event: ChatEvent) => void
) {
  const hitlConfig = useUserStore.getState().hitlConfig;

  const eventSource = new EventSource("/api/v1/chat/multi-stream", {
    method: "POST",
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
      hitl_config: hitlConfig,
    }),
  });

  eventSource.addEventListener("requires_approval", (event) => {
    const data = JSON.parse(event.data);

    onEvent({
      type: "hitl_required",
      thread_id: data.thread_id,
      approval_type: data.approval_type, // "trade", "strategy", "portfolio"
      payload: data.payload,
    });

    // HITL 패널 열기
    useHITLStore.getState().openPanel({
      threadId: data.thread_id,
      approvalType: data.approval_type,
      payload: data.payload,
    });
  });

  // ... 나머지 이벤트 처리
}
```

---

## 4. HITL Interrupt Mechanism

### 4.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    LangGraph Execution                       │
│                                                              │
│  ┌──────────┐      ┌───────────┐      ┌──────────────┐    │
│  │ Prepare  │ ───> │ Approval  │ ───> │ Execute      │    │
│  │ Order    │      │ Node      │      │ Trade        │    │
│  └──────────┘      └───────────┘      └──────────────┘    │
│                          │                                  │
│                          │ interrupt("trade_approval")      │
│                          ↓                                  │
│                    Graph Paused ⏸️                          │
│                    State Saved to Checkpoint                │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ SSE: requires_approval event
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                       Frontend                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │          HITL Panel Opens (Slide-in)               │    │
│  │                                                      │    │
│  │  📊 Order Details                                   │    │
│  │  - Stock: 삼성전자 (005930)                         │    │
│  │  - Quantity: 10주                                   │    │
│  │  - Amount: 763,000원                                │    │
│  │  - Risk: Medium ⚠️                                  │    │
│  │                                                      │    │
│  │  [승인] [거부] [수정]                                │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                  │
│         User clicks [승인]                                  │
│                          ↓                                  │
│  POST /api/v1/chat/approve                                  │
│  {                                                          │
│    "thread_id": "...",                                      │
│    "decision": "approved"                                   │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Command(resume={"decision": "approved"})
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  LangGraph Resumes ▶️                        │
│                                                              │
│  approval_node receives:                                     │
│  user_response = {"decision": "approved"}                    │
│                          │                                  │
│                          ↓                                  │
│  returns: {"trade_approved": True}                          │
│                          │                                  │
│                          ↓                                  │
│  conditional_edge → "execute"                               │
│                          │                                  │
│                          ↓                                  │
│  ┌──────────────┐                                          │
│  │ Execute      │                                          │
│  │ Trade        │ ─> Order submitted to broker              │
│  └──────────────┘                                          │
│                          │                                  │
│                          ↓                                  │
│  Final response: {"order_id": "...", "status": "executed"}  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Interrupt Types

| Interrupt Type | Trigger Agent | Trigger Condition | Payload |
|----------------|---------------|-------------------|---------|
| `trade_approval` | Trading Agent | hitl_config.phases.trade == True | Order details |
| `strategy_approval` | Strategy Agent | hitl_config.phases.analysis == True | Strategy details |
| `portfolio_approval` | Portfolio Agent | hitl_config.phases.portfolio == True | Portfolio allocations |

### 4.3 SSE Event Format

**requires_approval Event**:

```typescript
{
  "event": "requires_approval",
  "data": {
    "thread_id": "550e8400-e29b-41d4-a716-446655440000",
    "approval_type": "trade",
    "payload": {
      "stock_code": "005930",
      "stock_name": "삼성전자",
      "order_type": "buy",
      "quantity": 10,
      "estimated_price": 76300,
      "total_amount": 763000,
      "risk_level": "medium",
      "risk_factors": [
        "시장 변동성 증가",
        "포트폴리오 집중도 높음"
      ],
      "current_portfolio_weight": 0.25,
      "expected_portfolio_weight": 0.35
    }
  }
}
```

---

## 5. Schema Definitions

### 5.1 Backend Schemas (Pydantic)

```python
# src/schemas/hitl_config.py

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
    phases=HITLPhases(
        data_collection=False,
        analysis=False,
        portfolio=False,
        risk=False,
        trade="conditional"
    )
)

PRESET_COPILOT = HITLConfig(
    preset="copilot",
    phases=HITLPhases(
        data_collection=False,
        analysis=False,
        portfolio=True,
        risk=False,
        trade=True
    )
)

PRESET_ADVISOR = HITLConfig(
    preset="advisor",
    phases=HITLPhases(
        data_collection=False,
        analysis=True,
        portfolio=True,
        risk=False,
        trade=True
    )
)
```

```python
# src/schemas/api.py

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from src.schemas.hitl_config import HITLConfig

# Settings APIs
class AutomationLevelResponse(BaseModel):
    """GET /settings/automation-level 응답"""
    hitl_config: HITLConfig
    preset_name: str
    description: str
    interrupt_points: List[str]

class AutomationLevelUpdateRequest(BaseModel):
    """PUT /settings/automation-level 요청"""
    hitl_config: HITLConfig
    confirm: bool = Field(..., description="변경 확인")

class AutomationLevelUpdateResponse(BaseModel):
    """PUT /settings/automation-level 응답"""
    success: bool
    message: str
    new_config: HITLConfig
    effective_from: str = "immediate"

# Approvals APIs
class ApprovalRequest(BaseModel):
    """POST /chat/approve 요청"""
    thread_id: str = Field(..., description="대화 스레드 ID")
    decision: Literal["approved", "rejected", "modified"]
    modifications: Optional[Dict[str, Any]] = None
    user_notes: Optional[str] = None

class ApprovalResponse(BaseModel):
    """POST /chat/approve 응답"""
    success: bool
    message: str
    result: Optional[Dict[str, Any]] = None
    graph_completed: bool = True

# Chat API (updated)
class ChatRequest(BaseModel):
    """POST /chat/ 요청"""
    message: str
    conversation_id: Optional[str] = None
    hitl_config: HITLConfig = PRESET_COPILOT  # 기본값
```

### 5.2 Frontend Types (TypeScript)

```typescript
// src/types/hitl.ts

export type HITLPreset = "pilot" | "copilot" | "advisor" | "custom";
export type HITLTradeValue = boolean | "conditional";

export interface HITLPhases {
  data_collection: boolean;
  analysis: boolean;
  portfolio: boolean;
  risk: boolean;
  trade: HITLTradeValue;
}

export interface HITLConfig {
  preset: HITLPreset;
  phases: HITLPhases;
}

// Preset constants
export const PRESET_PILOT: HITLConfig = {
  preset: "pilot",
  phases: {
    data_collection: false,
    analysis: false,
    portfolio: false,
    risk: false,
    trade: "conditional",
  },
};

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

// API Response Types
export interface AutomationLevelResponse {
  hitl_config: HITLConfig;
  preset_name: string;
  description: string;
  interrupt_points: string[];
}

export interface AutomationLevelUpdateResponse {
  success: boolean;
  message: string;
  new_config: HITLConfig;
  effective_from: string;
}

export interface ApprovalRequest {
  thread_id: string;
  decision: "approved" | "rejected" | "modified";
  modifications?: Record<string, any>;
  user_notes?: string;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  result?: Record<string, any>;
  graph_completed: boolean;
}
```

---

## 6. Backend Implementation

### 6.1 File Structure

```
HAMA-backend/
├── src/
│   ├── api/
│   │   └── v1/
│   │       ├── chat.py (approve endpoint)
│   │       └── settings.py (automation level endpoints)
│   ├── schemas/
│   │   ├── api.py (API request/response schemas)
│   │   ├── hitl_config.py (HITLConfig, presets)
│   │   └── graph_state.py (GraphState with hitl_config)
│   ├── agents/
│   │   ├── trading/
│   │   │   ├── nodes.py (approval_trade_node with interrupt)
│   │   │   └── graph.py (conditional routing)
│   │   ├── strategy/
│   │   │   ├── nodes.py (generate_strategy_node with interrupt)
│   │   │   └── graph.py
│   │   └── portfolio/
│   │       ├── nodes.py (generate_portfolio_node with interrupt)
│   │       └── graph.py
│   └── db/
│       ├── models.py (UserSettings model)
│       └── repositories/
│           └── user_settings.py (UserSettingsRepository)
```

### 6.2 Critical Implementation Points

#### Point 1: LangGraph Interrupt

**Must Use**:
```python
from langgraph.types import interrupt

user_response = interrupt(
    value="trade_approval",  # interrupt 타입
    payload=order_details     # 프론트엔드로 전달할 데이터
)
```

**❌ Do NOT Use**:
```python
# 이렇게 하면 작동하지 않음
return {"needs_approval": True}
```

#### Point 2: Command Resume

**Must Use**:
```python
from langgraph.graph import Command

command = Command(
    resume={"decision": "approved", "notes": "..."}
)

result = await graph.ainvoke(None, config=config, command=command)
```

#### Point 3: Conditional Edges

**Must Use**:
```python
workflow.add_conditional_edges(
    "approval",
    should_execute_trade,  # 함수로 다음 노드 결정
    {
        "execute": "execute",
        END: END
    }
)
```

**❌ Do NOT Use**:
```python
# 무조건 다음 노드로 이동 (HITL 무시됨)
workflow.add_edge("approval", "execute")
```

---

## 7. Frontend Implementation

### 7.1 File Structure

```
HAMA-frontend-v2/
├── src/
│   ├── lib/
│   │   └── api/
│   │       ├── settings.ts (Settings API 호출)
│   │       └── chat.ts (Approval API 호출)
│   ├── store/
│   │   ├── userStore.ts (hitlConfig 상태 관리)
│   │   └── hitlStore.ts (HITL 패널 상태 관리)
│   ├── types/
│   │   └── hitl.ts (HITLConfig 타입 정의)
│   ├── components/
│   │   ├── mypage/
│   │   │   ├── MyPageView.tsx (Settings API 연동)
│   │   │   └── AutomationLevelSelector.tsx (레벨 변경 UI)
│   │   └── HITL/
│   │       └── HITLPanel.tsx (승인/거부 UI)
│   └── app/
│       └── settings/
│           └── page.tsx (My Page)
```

### 7.2 Critical Implementation Points

#### Point 1: userStore Migration

```typescript
// LocalStorage 마이그레이션 필수
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({ /* ... */ }),
    {
      name: "user-storage",
      version: 2,  // 버전 변경
      migrate: (persistedState: any, version: number) => {
        // automation_level → hitlConfig 변환
        if (version === 1 && persistedState.automationLevel) {
          // 변환 로직
        }
        return persistedState;
      },
    }
  )
);
```

#### Point 2: Chat API hitl_config 전송

```typescript
// 모든 채팅 요청에 hitl_config 포함
const response = await apiClient.post("/api/v1/chat/", {
  message,
  conversation_id,
  hitl_config: useUserStore.getState().hitlConfig,  // 추가
});
```

#### Point 3: SSE requires_approval 이벤트 처리

```typescript
eventSource.addEventListener("requires_approval", (event) => {
  const data = JSON.parse(event.data);

  // HITL 패널 열기
  useHITLStore.getState().openPanel({
    threadId: data.thread_id,
    approvalType: data.approval_type,
    payload: data.payload,
  });
});
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Backend**:
```python
# tests/api/test_settings.py

async def test_get_automation_level():
    response = await client.get("/api/v1/settings/automation-level")
    assert response.status_code == 200
    assert response.json()["hitl_config"]["preset"] == "copilot"

async def test_update_automation_level():
    response = await client.put("/api/v1/settings/automation-level", json={
        "hitl_config": PRESET_PILOT.dict(),
        "confirm": True
    })
    assert response.status_code == 200
    assert response.json()["success"] == True

# tests/agents/test_trading.py

async def test_hitl_interrupt():
    """interrupt가 실제로 발생하는지 테스트"""
    state = TradingState(
        stock_code="005930",
        order_type="buy",
        quantity=10,
        hitl_config=PRESET_COPILOT
    )

    result = await trading_graph.ainvoke(state)

    # interrupt 발생 확인
    assert result.next == ["approval"]
    assert "trade_approval" in result.tasks[0].interrupts
```

**Frontend**:
```typescript
// src/lib/api/__tests__/settings.test.ts

test("getAutomationLevel returns hitl_config", async () => {
  const data = await getAutomationLevel();
  expect(data.hitl_config.preset).toBe("copilot");
});

test("updateAutomationLevel sends hitl_config", async () => {
  const response = await updateAutomationLevel(PRESET_PILOT);
  expect(response.success).toBe(true);
});
```

### 8.2 Integration Tests

```python
# tests/integration/test_hitl_flow.py

async def test_full_hitl_approval_flow():
    """전체 HITL 승인 플로우 E2E 테스트"""

    # 1. 채팅 요청 (매매 의도)
    chat_response = await client.post("/api/v1/chat/", json={
        "message": "삼성전자 1000만원 매수해줘",
        "user_id": "test_user",
        "hitl_config": PRESET_COPILOT.dict()
    })

    thread_id = chat_response.json()["thread_id"]

    # 2. interrupt 발생 확인
    assert chat_response.json()["requires_approval"] == True
    assert chat_response.json()["approval_type"] == "trade"

    # 3. 승인 요청
    approval_response = await client.post("/api/v1/chat/approve", json={
        "thread_id": thread_id,
        "decision": "approved"
    })

    assert approval_response.status_code == 200
    assert approval_response.json()["success"] == True
    assert "order_id" in approval_response.json()["result"]

    # 4. 매매 실행 확인
    result = approval_response.json()["result"]
    assert result["status"] == "executed"
```

### 8.3 E2E Tests (Frontend + Backend)

```typescript
// e2e/hitl-approval.spec.ts

test("User can approve trade from HITL panel", async ({ page }) => {
  // 1. My Page에서 Copilot 모드 설정
  await page.goto("/settings");
  await page.click('[data-testid="copilot-button"]');
  await page.waitForSelector('[data-testid="success-toast"]');

  // 2. Chat에서 매매 요청
  await page.goto("/");
  await page.fill('[data-testid="chat-input"]', "삼성전자 1000만원 매수해줘");
  await page.press('[data-testid="chat-input"]', "Enter");

  // 3. HITL 패널 나타나는지 확인
  await page.waitForSelector('[data-testid="hitl-panel"]', { timeout: 10000 });

  // 4. 승인 버튼 클릭
  await page.click('[data-testid="approve-button"]');

  // 5. 성공 토스트 확인
  await page.waitForSelector('[data-testid="success-toast"]');
  expect(await page.textContent('[data-testid="success-toast"]')).toContain(
    "매수 주문이 실행되었습니다"
  );

  // 6. HITL 패널 닫혔는지 확인
  await expect(page.locator('[data-testid="hitl-panel"]')).not.toBeVisible();
});
```

---

## 9. Deployment Checklist

### 9.1 Backend Deployment

**Pre-deployment**:
- [ ] HITLConfig 스키마 파일 생성 완료
- [ ] GraphState hitl_config 필드 추가 완료
- [ ] Settings API 엔드포인트 구현 완료
- [ ] Approval API 수정 완료 (Command 처리)
- [ ] Trading Agent interrupt 구현 완료
- [ ] Strategy/Portfolio Agent HITL 구현 완료
- [ ] DB 마이그레이션 스크립트 준비 완료
- [ ] 모든 Unit 테스트 통과
- [ ] Integration 테스트 통과

**Deployment Steps**:
1. [ ] DB 마이그레이션 실행
   ```sql
   CREATE TABLE user_settings (
       user_id VARCHAR(255) PRIMARY KEY,
       hitl_config JSONB NOT NULL DEFAULT '{...}',
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. [ ] 기존 LangGraph 체크포인트 삭제 (Design Decision #2)
   ```python
   checkpointer.clear_all()
   ```

3. [ ] 백엔드 배포
   ```bash
   docker build -t hama-backend:v2.0 .
   docker-compose up -d
   ```

4. [ ] Health check
   ```bash
   curl http://localhost:8000/health
   ```

5. [ ] API 테스트
   ```bash
   # Settings API
   curl http://localhost:8000/api/v1/settings/automation-level

   # Approval API (pending approval 있어야 함)
   # curl -X POST http://localhost:8000/api/v1/chat/approve -d '{...}'
   ```

---

### 9.2 Frontend Deployment

**Pre-deployment**:
- [ ] HITLConfig 타입 정의 완료
- [ ] userStore 마이그레이션 로직 구현 완료
- [ ] Settings API 연동 완료
- [ ] Chat API hitl_config 전송 구현 완료
- [ ] HITL 패널 SSE 이벤트 처리 구현 완료
- [ ] 모든 Component 테스트 통과
- [ ] E2E 테스트 통과

**Deployment Steps**:
1. [ ] 환경 변수 설정
   ```env
   NEXT_PUBLIC_API_URL=https://api.hama.com
   ```

2. [ ] 빌드
   ```bash
   npm run build
   ```

3. [ ] 배포
   ```bash
   npm run start
   # 또는 Vercel/Netlify 배포
   ```

4. [ ] Smoke test
   - [ ] My Page 로딩 확인
   - [ ] Settings API 호출 확인
   - [ ] HITL 패널 열리는지 확인

---

### 9.3 Post-deployment Verification

**Critical Path Testing**:
1. [ ] **Settings API 작동 확인**
   - My Page 접속 → 현재 레벨 표시되는지
   - 레벨 변경 → DB 저장되는지
   - 새로고침 → 변경사항 유지되는지

2. [ ] **HITL Approval 작동 확인**
   - Chat에서 매매 요청
   - HITL 패널 나타나는지
   - 승인 버튼 → 매매 실행되는지
   - 거부 버튼 → 매매 취소되는지

3. [ ] **Pilot 모드 자동 승인 확인**
   - Pilot 모드 설정
   - 저위험 매매 요청
   - HITL 패널 없이 자동 실행되는지

4. [ ] **Advisor 모드 다중 승인 확인**
   - Advisor 모드 설정
   - 전략 수립 요청
   - 전략 승인 패널 나타나는지
   - 전략 승인 → 포트폴리오 승인 패널 나타나는지

**Monitoring**:
- [ ] Error rate 확인
- [ ] API 응답 시간 확인
- [ ] DB 쿼리 성능 확인
- [ ] LangGraph checkpoint 저장 확인

---

## 10. References

- `Settings_Approvals_API_Backend_Feedback.md` - 백엔드 피드백
- `AutomationLevelIntegration.md` - 자동화 레벨 설계
- `AutomationLevelAPIChanges.md` - API 마이그레이션 계획
- `docs/backend/openapi.json` - API 스펙
- LangGraph Interrupt Documentation: https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/
- LangGraph Command Documentation: https://langchain-ai.github.io/langgraph/concepts/low_level/#command
