# Automation Level → HITL Config API Changes

**Date**: 2025-10-30
**Status**: Planning Phase - Design Decisions Finalized ✅
**Impact**: 6 API endpoints, 7 schemas

---

## Executive Summary

The automation system is changing from a simple integer-based `automation_level` (1-3) to a rich object-based `hitl_config` that supports:
- **Preset modes**: pilot, copilot, advisor (existing behavior)
- **Custom mode**: User-defined phase-by-phase HITL control
- **Conditional execution**: Special "conditional" value for Pilot mode's risk-based auto-trading

---

## Affected API Endpoints

**Total: 6 API endpoints**

### 1. POST /api/v1/chat/ (Chat Request)

**Operation ID**: `chat_api_v1_chat__post`

**Current Request Schema** (ChatRequest):
```json
{
  "message": "삼성전자 1000만원 매수해줘",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "automation_level": 2
}
```

**New Request Schema** (ChatRequest):
```json
{
  "message": "삼성전자 1000만원 매수해줘",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "hitl_config": {
    "preset": "copilot",
    "phases": {
      "data_collection": false,
      "analysis": false,
      "portfolio": true,
      "risk": false,
      "trade": true
    }
  }
}
```

**Changes Required**:
- ❌ Remove `automation_level: int` field
- ✅ Add `hitl_config: HITLConfig` field
- Backend: Update `ChatRequest` Pydantic model
- Frontend: Update `chatStore.ts` to send `hitl_config` object

---

### 2. POST /api/v1/chat/approve (Approval Request)

**Operation ID**: `approve_action_api_v1_chat_approve_post`

**Current Request Schema** (ApprovalRequest):
```json
{
  "thread_id": "550e8400-e29b-41d4-a716-446655440000",
  "decision": "approved",
  "automation_level": 2,
  "modifications": null,
  "user_notes": null
}
```

**New Request Schema** (ApprovalRequest):
```json
{
  "thread_id": "550e8400-e29b-41d4-a716-446655440000",
  "decision": "approved",
  "modifications": null,
  "user_notes": null
}
```

**Changes Required**:
- ❌ Remove `automation_level: int` field (no longer needed - hitl_config is stored in GraphState)
- Backend: Update `ApprovalRequest` Pydantic model
- Frontend: Remove `automation_level` from approval request payload

**Note**: `hitl_config` is NOT sent in approval requests because:
1. It's already stored in the LangGraph checkpoint (GraphState)
2. Approval is for a specific action, not for changing automation settings
3. Changing automation settings mid-conversation should use the dedicated `/api/v1/settings/automation-level` endpoint

---

### 3. POST /api/v1/chat/multi-stream (Multi-Agent Streaming)

**Operation ID**: `multi_agent_stream_api_v1_chat_multi_stream_post`

**Current Request Schema** (MultiAgentStreamRequest):
```json
{
  "message": "삼성전자 분석해줘",
  "user_id": "user123",
  "conversation_id": null,
  "automation_level": 2
}
```

**New Request Schema** (MultiAgentStreamRequest):
```json
{
  "message": "삼성전자 분석해줘",
  "user_id": "user123",
  "conversation_id": null,
  "hitl_config": {
    "preset": "copilot",
    "phases": {
      "data_collection": false,
      "analysis": false,
      "portfolio": true,
      "risk": false,
      "trade": true
    }
  }
}
```

**Changes Required**:
- ❌ Remove `automation_level: int` field
- ✅ Add `hitl_config: HITLConfig` field
- Backend: Update `MultiAgentStreamRequest` Pydantic model
- Frontend: Update streaming request to send `hitl_config` object

---

### 4. GET /api/v1/chat/sessions (List Chat Sessions)

**Operation ID**: `list_chat_sessions_api_v1_chat_sessions_get`

**Current Response Schema** (ChatSessionSummary):
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "삼성전자 투자 분석",
  "last_message": "삼성전자 1000만원 매수 주문이 완료되었습니다.",
  "last_message_at": "2025-10-30T10:30:00Z",
  "automation_level": 2,
  "message_count": 15,
  "created_at": "2025-10-30T09:00:00Z"
}
```

**New Response Schema** (ChatSessionSummary):
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "삼성전자 투자 분석",
  "last_message": "삼성전자 1000만원 매수 주문이 완료되었습니다.",
  "last_message_at": "2025-10-30T10:30:00Z",
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
  "message_count": 15,
  "created_at": "2025-10-30T09:00:00Z"
}
```

**Changes Required**:
- ❌ Remove `automation_level: int` field
- ✅ Add `hitl_config: HITLConfig` field
- Backend: Update `ChatSessionSummary` Pydantic model
- Frontend: Update chat session list to display preset name (pilot/copilot/advisor/custom)

---

### 5. GET /api/v1/settings/automation-level (Get Automation Settings)

**Operation ID**: `get_automation_level_api_v1_settings_automation_level_get`

**Current Response Schema** (AutomationLevelResponse):
```json
{
  "level": 2,
  "level_name": "Copilot",
  "description": "AI가 제안하고, 중요한 결정은 사용자가 승인합니다.",
  "interrupt_points": ["portfolio", "trade"]
}
```

**New Response Schema** (AutomationLevelResponse):
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

**Changes Required**:
- ❌ Remove `level: int` and `level_name: str` fields
- ✅ Add `hitl_config: HITLConfig` and `preset_name: str` fields
- Backend: Update `AutomationLevelResponse` Pydantic model
- Frontend: Update My Page to read `hitl_config` object

**Note**: `interrupt_points` remains for backward compatibility and UI display convenience.

---

### 6. PUT /api/v1/settings/automation-level (Update Automation Settings)

**Operation ID**: `update_automation_level_api_v1_settings_automation_level_put`

**Current Request Schema** (AutomationLevelUpdateRequest):
```json
{
  "level": 3,
  "confirm": true
}
```

**New Request Schema** (AutomationLevelUpdateRequest):
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

**Alternative: Custom Mode Example**:
```json
{
  "hitl_config": {
    "preset": "custom",
    "phases": {
      "data_collection": false,
      "analysis": true,
      "portfolio": false,
      "risk": true,
      "trade": true
    }
  },
  "confirm": true
}
```

**Changes Required**:
- ❌ Remove `level: int` field
- ✅ Add `hitl_config: HITLConfig` field
- Backend: Update `AutomationLevelUpdateRequest` Pydantic model
- Frontend: Update My Page to send `hitl_config` object

---

## Schema Definitions

### New: HITLConfig (Backend)

**File**: `src/schemas/hitl_config.py`

```python
from pydantic import BaseModel
from typing import Literal, Union

class HITLPhases(BaseModel):
    """
    Phase별 HITL 개입 여부

    5단계 워크플로우:
    1. data_collection: 데이터 수집 (현재 HITL 없음)
    2. analysis: 데이터 분석 (Advisor만 HITL)
    3. portfolio: 포트폴리오 구성 (Copilot, Advisor만 HITL)
    4. risk: 리스크 분석 (현재 HITL 없음)
    5. trade: 매매 실행 (모든 레벨에서 HITL, Pilot은 조건부)
    """
    data_collection: bool = False
    analysis: bool = False
    portfolio: bool = False
    risk: bool = False
    trade: Union[bool, Literal["conditional"]] = True  # "conditional" = Pilot 모드의 저위험 자동 매매

class HITLConfig(BaseModel):
    """
    자동화 레벨 설정

    preset: 사전 정의된 모드 또는 custom
    phases: 각 단계별 HITL 개입 여부
    """
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
        trade="conditional"  # 저위험만 자동 실행
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

### New: HITLConfig (Frontend TypeScript)

**File**: `src/types/hitl.ts`

```typescript
export type HITLPreset = "pilot" | "copilot" | "advisor" | "custom";

export interface HITLPhases {
  data_collection: boolean;
  analysis: boolean;
  portfolio: boolean;
  risk: boolean;
  trade: boolean | "conditional";
}

export interface HITLConfig {
  preset: HITLPreset;
  phases: HITLPhases;
}

// Preset definitions
export const PRESET_PILOT: HITLConfig = {
  preset: "pilot",
  phases: {
    data_collection: false,
    analysis: false,
    portfolio: false,
    risk: false,
    trade: "conditional", // 저위험만 자동 실행
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
```

---

## Migration Strategy

### Backend Changes

#### Phase 1: Create New Schemas (Non-Breaking)
1. ✅ Create `src/schemas/hitl_config.py`
2. ✅ Create `src/schemas/workflow.py` with Phase → Agent mapping

#### Phase 2: Update Existing Schemas (Breaking)
1. Update `ChatRequest` to use `hitl_config` instead of `automation_level`
2. Update `ApprovalRequest` to remove `automation_level`
3. Update `MultiAgentStreamRequest` to use `hitl_config`
4. Update `ChatSessionSummary` to use `hitl_config`
5. Update `AutomationLevelResponse` to use `hitl_config`
6. Update `AutomationLevelUpdateRequest` to use `hitl_config`
7. Update `AutomationSettings` to use `hitl_config`

#### Phase 3: Update Agent Logic
1. Update `build_supervisor()` in `graph_master.py` to accept `hitl_config`
2. Update `approval_trade_node()` in `trading/nodes.py` to check `hitl_config.phases.trade`
3. Add conditional execution logic for Pilot mode (risk-based auto-approval)
4. Add HITL to Strategy Agent (for Advisor mode)
5. Add HITL to Portfolio Agent (for Copilot/Advisor modes)

#### Phase 4: Update API Endpoints
1. Update `/api/v1/chat/` to accept `hitl_config`
2. Update `/api/v1/chat/approve` to remove `automation_level`
3. Update `/api/v1/chat/multi-stream` to accept `hitl_config`
4. Update `/api/v1/chat/sessions` to return `hitl_config`
5. Update `/api/v1/settings/automation-level` GET/PUT to use `hitl_config`

### Frontend Changes

#### Phase 1: Create New Types (Non-Breaking)
1. ✅ Create `src/types/hitl.ts` with TypeScript definitions
2. ✅ Create preset constants (PRESET_PILOT, PRESET_COPILOT, PRESET_ADVISOR)

#### Phase 2: Update Store (Breaking)
1. Update `userStore.ts`:
   - Replace `automationLevel: number` with `hitlConfig: HITLConfig`
   - Update `setAutomationLevel()` to `setHITLConfig()`
   - Add preset helper functions

#### Phase 3: Update Components
1. Update `AutomationLevelSelector.tsx`:
   - Read `hitlConfig` from store
   - Send `hitl_config` object to backend
   - Display custom mode if `preset === "custom"`

2. Update `ChatInput.tsx`:
   - Send `hitl_config` in chat requests

3. Update `HITLPanel.tsx`:
   - Remove `automation_level` from approval requests

4. Update Chat session list components:
   - Display preset name from `hitl_config.preset`

#### Phase 4: Add Custom Mode UI (Future)
1. Create `CustomHITLSettings.tsx` component
2. Add phase-by-phase toggle UI
3. Update My Page to show custom settings panel

---

## Testing Checklist

### Backend
- [ ] Unit tests for `HITLConfig` and `HITLPhases` Pydantic models
- [ ] Unit tests for preset definitions (PRESET_PILOT, PRESET_COPILOT, PRESET_ADVISOR)
- [ ] Integration tests for `/api/v1/chat/` with `hitl_config`
- [ ] Integration tests for `/api/v1/settings/automation-level` GET/PUT
- [ ] LangGraph tests for conditional execution in Pilot mode
- [ ] LangGraph tests for HITL interrupts in each phase

### Frontend
- [ ] Unit tests for `hitl.ts` type definitions
- [ ] Unit tests for `userStore.ts` with `hitlConfig`
- [ ] Component tests for `AutomationLevelSelector.tsx`
- [ ] E2E test: Change automation preset from Copilot to Pilot
- [ ] E2E test: Pilot mode low-risk auto-trading
- [ ] E2E test: Advisor mode strategy approval

---

## Backward Compatibility

**NOT backward compatible** - This is a breaking change.

### Migration Path for Existing Data:

1. **Database Migration** (if automation_level is stored in DB):
   ```sql
   -- Convert automation_level to hitl_config
   UPDATE chat_sessions
   SET hitl_config = CASE automation_level
       WHEN 1 THEN '{"preset": "pilot", "phases": {"data_collection": false, "analysis": false, "portfolio": false, "risk": false, "trade": "conditional"}}'
       WHEN 2 THEN '{"preset": "copilot", "phases": {"data_collection": false, "analysis": false, "portfolio": true, "risk": false, "trade": true}}'
       WHEN 3 THEN '{"preset": "advisor", "phases": {"data_collection": false, "analysis": true, "portfolio": true, "risk": false, "trade": true}}'
   END;

   -- Drop old column
   ALTER TABLE chat_sessions DROP COLUMN automation_level;
   ```

2. **Frontend LocalStorage Migration**:
   ```typescript
   // userStore.ts initialization
   const migrateAutomationLevel = (oldLevel: number): HITLConfig => {
     switch (oldLevel) {
       case 1: return PRESET_PILOT;
       case 2: return PRESET_COPILOT;
       case 3: return PRESET_ADVISOR;
       default: return PRESET_COPILOT;
     }
   };

   // In store initialization
   if (stored.automationLevel && !stored.hitlConfig) {
     stored.hitlConfig = migrateAutomationLevel(stored.automationLevel);
     delete stored.automationLevel;
   }
   ```

---

## Rollout Plan

### Stage 1: Development
- Backend: Implement new schemas and update endpoints
- Frontend: Implement new types and update store
- Write comprehensive tests

### Stage 2: Integration Testing
- E2E testing with frontend + backend
- Performance testing (ensure no regression)
- Fix bugs found during integration

### Stage 3: Documentation
- Update API documentation (OpenAPI spec)
- Update developer guides
- Create migration guide for existing integrations

### Stage 4: Deployment
- Deploy backend changes
- Deploy frontend changes
- Monitor for errors
- Run database migration (if applicable)

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking existing API clients | High | Clear communication, migration guide, version bump |
| Data loss during migration | High | Comprehensive migration script with rollback plan |
| Performance regression | Medium | Load testing before deployment |
| Frontend localStorage corruption | Low | Graceful fallback to default preset |
| LangGraph checkpoint incompatibility | Medium | Checkpoint schema versioning |

---

## Design Decisions

### Decision 1: API Versioning Strategy ✅
**Question**: Should we version the API (e.g., /api/v2/chat)?

**Decision**: **Option A** - Keep `/api/v1/` and treat this as an in-version breaking change

**Rationale**:
- This is a pre-production system (캡스톤 프로젝트)
- No external clients to worry about
- Simpler implementation
- Faster development velocity

---

### Decision 2: LangGraph Checkpoint Migration Strategy ✅
**Question**: How do we handle LangGraph checkpoints with old automation_level?

**Decision**: **Option C** - Delete all old checkpoints and start fresh

**Rationale**:
- Phase 1-2 is for demonstration purposes
- No production data to preserve
- Simplest implementation
- Clean slate for new schema

**Implementation**:
```python
# Clear all checkpoints before deploying new schema
from langgraph.checkpoint.postgres import PostgresSaver

checkpointer = PostgresSaver(...)
checkpointer.clear_all()  # ⚠️ This will delete all conversation history
```

---

### Decision 3: Dashboard API Exclusion ✅
**Question**: Should DashboardPayload.automation_settings also change?

**Decision**: **NO** - Exclude Dashboard API from migration scope

**Rationale**:
- Dashboard page does not exist in frontend (orphaned API)
- `/api/v1/dashboard/` endpoint is not used by any component
- No impact on user-facing features
- Can be removed or left as-is in backend

**Action**: Mark Dashboard API as **out of scope** for this migration

---

## References

- **PRD**: `docs/ProductRequirements.md` - US-4.1 (Automation Level Settings)
- **Integration Guide**: `docs/AutomationLevelIntegration.md`
- **User Flows**: `docs/Userflow.md` - Flow 5 (Automation Level Change Effects)
- **Backend PRD**: `references/BackendPRD.md` - Section 3.2 (HITL Intervention Matrix)
- **OpenAPI Spec**: `docs/backend/openapi.json`
