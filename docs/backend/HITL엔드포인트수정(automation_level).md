# HITL 구성 설정 API
---
## 개요
---
- 프론트에서는 실제 HITL 설정을 HITLConfig 형태로 전달하고 받아야 합니다. 기존 automation_level 정수 경로는 하위 호환 alias로 유지됩니다.
- hitl_config에는 preset(pilot/copilot/advisor/custom)과 각 워크플로 단계(phases)에서 인간 개입이 필요한지 여부가 포함됩니다. trade는 true/false/conditional을 허용합니다.
## 엔드포인트
---

| 경로                                            | 메서드 | 설명                                                                                                               |
| --------------------------------------------- | --- | ---------------------------------------------------------------------------------------------------------------- |
| `/api/{version}/settings/hitl-config`         | GET | 현재 사용자의 HITL 설정, 메타데이터(`preset_name`, `description`, `interrupt_points`) 제공 (alias `/settings/automation-level`) |
| `/api/{version}/settings/hitl-config`         | PUT | HITL 설정 저장 (`confirm=true` 필수, alias `/settings/automation-level`)                                               |
| `/api/{version}/settings/hitl-config/presets` | GET | 사용 가능한 프리셋 목록과 설명 제공 (alias `/settings/automation-levels`)                                                       |


### GET /settings/hitl-config 응답 예시
```
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
  "description": "AI가 제안하고, 중요한 결정은 사용자가 승인",
  "interrupt_points": ["portfolio", "trade"]
}
```

### PUT /settings/hitl-config 요청/응답 예시
```
{
  "hitl_config": {
    "preset": "custom",
    "phases": {
      "data_collection": true,
      "analysis": true,
      "portfolio": true,
      "risk": true,
      "trade": "conditional"
    }
  },
  "confirm": true
}
```
Response:
```
{
  "success": true,
  "message": "Custom 모드로 변경되었습니다",
  "new_config": { ... }
}
```

### GET /settings/hitl-config/presets
- 클라이언트는 프리셋을 리스트로 받아 사용자에게 이름/설명/기능 등을 보여줄 수 있습니다. PRESET_METADATA를 참고해 UI에 name, features, recommended_for를 노출하세요.

## 하위 호환
- `/settings/automation-level`과 `/settings/automation-levels` 호출도 여전히 같은 응답을 반환합니다. 기존 UI에서 정수 기반 API를 사용하는 경우 새로운 `hitl_config` 구조로 변환해 주면 됩니다.
- `automation_level` 값이 필요할 경우 서버 측에서 `config_to_level(hitl_config)`를 통해 `1`부터 `3`까지 자동 계산되므로 프론트에서는 수동 변환 없이 `hitl_config`를 사용하면 됩니다.
