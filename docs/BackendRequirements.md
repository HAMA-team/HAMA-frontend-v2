# HAMA Frontend - Backend 요구사항 문서

**Version:** 1.0
**Last Updated:** 2025-10-20
**작성 근거:** Frontend PRD v2.0
**목적:** 프론트엔드 구현을 위해 백엔드에서 추가/변경이 필요한 API 및 기능 정리

---

## 📋 요약

Frontend PRD v2.0을 구현하기 위해 백엔드에서 다음 사항들이 필요합니다:

### 신규 API 필요
1. ✅ **초개인화된 투자 성향 프로필 API** (FR-12)
2. ✅ **자동화 레벨 설정 API** (FR-8.2)
3. ⚠️ **실시간 스트리밍 API 개선** (FR-2.2)
4. ⚠️ **다국어 지원을 위한 응답 구조** (FR-11)

### 기존 API 수정 필요
1. ⚠️ **Chat API 응답 형식 확장** (Thinking 데이터 포함)
2. ⚠️ **HITL Approval API 응답 구조 개선** (상세 정보 포함)
3. ⚠️ **Portfolio API 응답 보강** (차트 시각화를 위한 데이터)

### 데이터 구조 추가
1. ⚠️ **Artifact 저장 지원** (Phase 3에서 Backend 연동 시)
2. ⚠️ **Chat Session 관리** (최근 채팅 목록)

---

## 1. 신규 API 요구사항

### 1.1 초개인화된 투자 성향 프로필 API

**관련 FR:** FR-12 (Phase 3)

**요구사항:**
사용자의 행동 데이터와 포트폴리오를 기반으로 LLM이 생성한 상세한 투자 성향 프로필을 제공해야 합니다.

**Endpoint:**
```
GET /api/v1/user/investment-profile
```

**Request:**
- Headers: `Authorization: Bearer {token}`

**Response:**
```json
{
  "user_id": "string",
  "basic_profile": {
    "risk_tolerance": "aggressive|moderate|conservative",
    "investment_style": "growth|value|dividend|balanced",
    "time_horizon": "short|medium|long"
  },
  "detailed_profile": {
    "description": "이 사용자는 하루 평균 3번 매매를 하며, 단타 성향이 강합니다. 최근 2주간 기술주에 집중 투자하는 패턴을 보입니다.",
    "trading_frequency": {
      "daily_avg": 3,
      "weekly_avg": 15,
      "pattern": "day_trading"
    },
    "sector_preferences": [
      {
        "sector": "technology",
        "weight": 0.65
      },
      {
        "sector": "finance",
        "weight": 0.25
      }
    ],
    "behavioral_insights": [
      "손실 회피 성향이 강함 - 손실 시 빠르게 매도",
      "뉴스에 민감 - 주요 뉴스 후 24시간 내 거래 빈도 2배 증가",
      "포트폴리오 집중도 높음 - 상위 3종목이 전체의 70% 차지"
    ]
  },
  "last_updated": "2025-10-20T12:34:56Z"
}
```

**Why:**
- 기존 4단계 분류(안정형, 공격투자형 등)보다 상세한 프로필 필요
- AI가 사용자를 어떻게 이해하고 있는지 투명하게 보여주기 위함
- LLM이 주기적으로 업데이트하는 서술형 프로필

**구현 참고사항:**
- 사용자의 최근 30일 거래 데이터 분석
- LLM을 활용하여 자연어 설명 생성
- 주기적 업데이트 (주 1회)

---

### 1.2 자동화 레벨 설정 API

**관련 FR:** FR-8.2 (Phase 2)

**요구사항:**
사용자가 선택한 자동화 레벨을 저장하고 조회할 수 있어야 합니다.

**Endpoint (설정):**
```
POST /api/v1/user/automation-level
```

**Request:**
```json
{
  "automation_level": 1 | 2 | 3
}
```
- `1`: 파일럿 모드
- `2`: 코파일럿 모드 (기본값)
- `3`: 어드바이저 모드

**Response:**
```json
{
  "success": true,
  "automation_level": 2,
  "updated_at": "2025-10-20T12:34:56Z"
}
```

**Endpoint (조회):**
```
GET /api/v1/user/automation-level
```

**Response:**
```json
{
  "automation_level": 2,
  "updated_at": "2025-10-20T12:34:56Z"
}
```

**Why:**
- 사용자가 My Page에서 자동화 레벨을 변경할 수 있어야 함
- 변경 즉시 Backend에 반영되어야 함
- Chat API 호출 시 이 레벨이 자동으로 적용되어야 함

---

### 1.3 실시간 스트리밍 API (SSE)

**관련 FR:** FR-2.2 (Phase 1)

**요구사항:**
LangGraph 에이전트의 실시간 활동(Thinking 과정)을 스트리밍으로 제공해야 합니다.

**Endpoint:**
```
GET /api/v1/chat/stream/{conversation_id}
```

**Response (SSE):**
```
event: agent_activity
data: {"node": "planner", "status": "running", "message": "계획 수립 중..."}

event: agent_activity
data: {"node": "researcher", "status": "running", "message": "데이터 수집 중..."}

event: agent_activity
data: {"node": "researcher", "status": "completed", "message": "데이터 수집 완료"}

event: agent_activity
data: {"node": "strategy", "status": "running", "message": "전략 분석 중..."}

event: message
data: {"message": "삼성전자 분석 결과입니다...", "completed": true}
```

**Why:**
- Frontend에서 AI의 작동 과정을 실시간으로 보여줘야 함 (FR-2.2)
- HITL 시스템의 신뢰성 입증을 위해 중요
- Claude처럼 Chat 내에 시간 순서대로 표시

**구현 참고사항:**
- LangGraph의 `astream_events()` 활용
- 노드 이름 번역 필요:
  - `planner` → "계획 수립 중..."
  - `researcher` → "데이터 수집 중..."
  - `strategy` → "전략 분석 중..."
- 연결 끊김 대비: Frontend에서 폴링으로 폴백

**대안 (폴링 지원):**
```
GET /api/v1/chat/status/{conversation_id}
```

**Response:**
```json
{
  "current_node": "researcher",
  "status": "running",
  "message": "데이터 수집 중...",
  "progress": 45
}
```

---

## 2. 기존 API 수정 요구사항

### 2.1 Chat API 응답 형식 확장

**관련 FR:** FR-2 (Phase 1)

**현재 API:** `POST /api/v1/chat/`

**현재 응답 형식:**
```json
{
  "message": "string",
  "conversation_id": "string",
  "requires_approval": false,
  "approval_request": {},
  "metadata": {}
}
```

**요청 사항:**
`metadata`에 `thinking` 데이터 포함 필요

**수정된 응답 형식:**
```json
{
  "message": "삼성전자 분석 결과입니다...",
  "conversation_id": "abc123",
  "requires_approval": false,
  "approval_request": null,
  "metadata": {
    "thinking": {
      "summary": "계획 수립 → 데이터 수집 → 전략 분석 완료",
      "steps": [
        {
          "node": "planner",
          "message": "계획 수립 중...",
          "timestamp": "2025-10-20T12:34:56Z"
        },
        {
          "node": "researcher",
          "message": "데이터 수집 중...",
          "timestamp": "2025-10-20T12:35:12Z"
        },
        {
          "node": "strategy",
          "message": "전략 분석 중...",
          "timestamp": "2025-10-20T12:35:45Z"
        }
      ]
    }
  }
}
```

**Why:**
- Frontend에서 Thinking 섹션을 표시하기 위해 필요 (FR-2.2)
- 실시간 스트리밍이 실패했을 때 최종 응답에 포함된 데이터로 폴백

---

### 2.2 HITL Approval API 응답 구조 개선

**관련 FR:** FR-3 (Phase 1)

**현재 API:** Chat API 응답에 포함되는 `approval_request`

**요청 사항:**
`approval_request` 객체에 상세 정보 포함 필요

**현재 구조:**
```json
{
  "requires_approval": true,
  "approval_request": {
    "additionalProp1": {}
  }
}
```

**요청 구조:**
```json
{
  "requires_approval": true,
  "approval_request": {
    "action": "buy",
    "stock_code": "005930",
    "stock_name": "삼성전자",
    "quantity": 10,
    "price": 75000,
    "total_amount": 750000,
    "current_portfolio_weight": 0.25,
    "expected_portfolio_weight": 0.43,
    "risk_warning": "예상 비중이 43%로 과도하게 높습니다. 분산 투자를 권장합니다.",
    "alternatives": [
      {
        "description": "금액을 500만원으로 조정",
        "expected_weight": 0.35
      },
      {
        "description": "SK하이닉스와 분산 투자",
        "stock_code": "000660",
        "quantity": 5
      }
    ]
  }
}
```

**Why:**
- Frontend에서 HITL 패널에 상세 정보를 표시해야 함
- 리스크 경고 및 권장 대안 제공 필요
- 사용자가 의사결정할 충분한 정보 제공

---

### 2.3 Portfolio API 응답 보강

**관련 FR:** FR-4, FR-7 (Phase 1, Phase 2)

**현재 API:** `GET /api/v1/portfolio/{portfolio_id}`

**요청 사항:**
차트 시각화를 위한 데이터 구조 추가 필요

**현재 응답 (추정):**
```json
{
  "portfolio_id": "string",
  "total_assets": 50000000,
  "total_profit": 5000000,
  "profit_rate": 0.11,
  "holdings": [
    {
      "stock_code": "005930",
      "stock_name": "삼성전자",
      "quantity": 100,
      "avg_price": 70000,
      "current_price": 75000
    }
  ]
}
```

**요청 응답:**
```json
{
  "portfolio_id": "string",
  "total_assets": 50000000,
  "total_profit": 5000000,
  "profit_rate": 0.11,
  "monthly_growth_rate": 0.03,
  "holdings": [
    {
      "stock_code": "005930",
      "stock_name": "삼성전자",
      "quantity": 100,
      "avg_price": 70000,
      "current_price": 75000,
      "current_value": 7500000,
      "weight": 0.15,
      "profit": 500000,
      "profit_rate": 0.071
    },
    {
      "stock_code": "000660",
      "stock_name": "SK하이닉스",
      "quantity": 50,
      "avg_price": 130000,
      "current_price": 140000,
      "current_value": 7000000,
      "weight": 0.14,
      "profit": 500000,
      "profit_rate": 0.077
    }
  ],
  "chart_data": {
    "treemap": [
      {
        "name": "삼성전자",
        "value": 7500000,
        "weight": 0.15,
        "color": "#1E40AF"
      },
      {
        "name": "SK하이닉스",
        "value": 7000000,
        "weight": 0.14,
        "color": "#DC2626"
      }
    ],
    "sectors": [
      {
        "sector": "반도체",
        "value": 14500000,
        "weight": 0.29
      },
      {
        "sector": "금융",
        "value": 5000000,
        "weight": 0.10
      }
    ]
  }
}
```

**Why:**
- Frontend에서 트리맵, 원그래프, 막대그래프를 렌더링하기 위해 필요 (FR-7)
- `weight` (비중), `current_value` (현재 가치) 필수
- 섹터별 분류 데이터도 제공하면 더 좋음

**예외 처리 요청:**
- 일부 종목의 `current_price`가 null일 경우:
  - Frontend에서 "가격 정보 없음"으로 표시하므로 null 허용
  - 하지만 가능한 한 모든 종목의 가격 제공 권장

---

## 3. 데이터 구조 추가

### 3.1 Artifact 저장 지원 (Phase 3)

**관련 FR:** FR-9 (Phase 3)

**요구사항:**
Phase 1에서는 Frontend LocalStorage 사용, Phase 3에서 Backend DB 연동 고려

**필요 API (Phase 3):**

**저장:**
```
POST /api/v1/artifacts
```

**Request:**
```json
{
  "title": "삼성전자 분석 리포트",
  "content": "# 삼성전자 분석\n\n...",
  "content_type": "report|chart|bull_bear_analysis",
  "conversation_id": "abc123",
  "message_id": "msg_456"
}
```

**Response:**
```json
{
  "artifact_id": "artifact_789",
  "created_at": "2025-10-20T12:34:56Z"
}
```

**목록 조회:**
```
GET /api/v1/artifacts
```

**Response:**
```json
{
  "artifacts": [
    {
      "artifact_id": "artifact_789",
      "title": "삼성전자 분석 리포트",
      "content_type": "report",
      "created_at": "2025-10-20T12:34:56Z",
      "thumbnail_url": null
    }
  ]
}
```

**상세 조회:**
```
GET /api/v1/artifacts/{artifact_id}
```

**Response:**
```json
{
  "artifact_id": "artifact_789",
  "title": "삼성전자 분석 리포트",
  "content": "# 삼성전자 분석\n\n...",
  "content_type": "report",
  "conversation_id": "abc123",
  "created_at": "2025-10-20T12:34:56Z"
}
```

**삭제:**
```
DELETE /api/v1/artifacts/{artifact_id}
```

**Why:**
- Phase 1에서는 LocalStorage로 충분하지만, Phase 3에서 영구 저장 필요
- 사용자가 저장한 분석 결과를 다른 기기에서도 확인할 수 있어야 함

---

### 3.2 Chat Session 관리

**관련 FR:** FR-1.2 (Phase 1)

**요구사항:**
최근 채팅 목록을 조회할 수 있어야 합니다.

**필요 API:**

**최근 채팅 목록 조회:**
```
GET /api/v1/chat/sessions
```

**Query Parameters:**
- `limit` (integer, default: 10): 최대 개수

**Response:**
```json
{
  "sessions": [
    {
      "conversation_id": "conv_123",
      "title": "삼성전자 분석",
      "last_message": "매수 제안을 승인했습니다",
      "last_updated": "2025-10-20T12:34:56Z",
      "has_pending_approval": false
    },
    {
      "conversation_id": "conv_456",
      "title": "포트폴리오 리밸런싱",
      "last_message": "승인 대기 중입니다",
      "last_updated": "2025-10-19T15:20:10Z",
      "has_pending_approval": true
    }
  ]
}
```

**Why:**
- Frontend LNB에 최근 채팅 목록 표시 필요 (FR-1.2)
- HITL 승인 대기 중인 채팅은 뱃지로 표시해야 함
- 최대 10개 표시

---

## 4. 다국어 지원 관련

**관련 FR:** FR-6, FR-11 (Phase 1 구조, Phase 3 번역)

**요구사항:**
Frontend에서 언어를 선택하면 Backend도 해당 언어로 응답해야 합니다.

**구현 방식 (제안):**

**Option 1: Request Header 활용**
```
POST /api/v1/chat
Headers:
  Accept-Language: ko-KR
  (또는 en-US)
```

**Option 2: Request Body에 포함**
```json
{
  "message": "삼성전자 분석해줘",
  "conversation_id": "abc123",
  "automation_level": 2,
  "language": "ko"
}
```

**Response:**
```json
{
  "message": "삼성전자 분석 결과입니다...",
  "conversation_id": "abc123",
  "language": "ko"
}
```

**Why:**
- Frontend에서 영어/한국어를 선택할 수 있어야 함 (FR-11)
- AI 답변도 선택된 언어로 반환되어야 함
- 시스템 메시지, 오류 메시지도 다국어 지원

**Backend 구현 참고:**
- LLM 프롬프트에 언어 명시: "Respond in Korean" / "Respond in English"
- 시스템 메시지도 i18n 처리 필요

---

## 5. 기타 권장 사항

### 5.1 오류 메시지 상세화

**현재:** 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "message"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**권장:**
```json
{
  "detail": [
    {
      "loc": ["body", "message"],
      "msg": "메시지는 필수입니다",
      "type": "value_error.missing"
    }
  ]
}
```

**Why:**
- Frontend에서 오류 메시지를 그대로 사용자에게 표시하기 위함
- 사용자 친화적인 한국어 메시지 제공

---

### 5.2 Rate Limiting 정보 제공

**권장 Response Header:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-10-20T13:00:00Z
```

**Why:**
- Frontend에서 Rate Limit 도달 시 적절히 대응 가능
- 429 Too Many Requests 발생 전에 경고 표시

---

### 5.3 CORS 설정

**요청 사항:**
Development 환경에서 `localhost:3000` (Next.js) 허용 필요

**Production:**
- 실제 도메인만 허용

---

## 6. 우선순위 요약

### Phase 1 (시연 필수)
- ⭐ **최우선:** 실시간 스트리밍 API (FR-2.2)
- ⭐ **최우선:** HITL Approval 응답 구조 개선 (FR-3)
- ⭐ **필수:** Chat API Thinking 데이터 포함 (FR-2)
- ⭐ **필수:** Portfolio API 차트 데이터 보강 (FR-4, FR-7)
- ⭐ **필수:** Chat Session 관리 API (FR-1.2)

### Phase 2 (MVP 완성)
- ⚠️ **중요:** 자동화 레벨 설정 API (FR-8.2)
- ⚠️ **중요:** Portfolio 시각화 데이터 완성 (FR-7)

### Phase 3 (콘텐츠 관리)
- 📌 **권장:** Artifact 저장 API (FR-9)
- 📌 **권장:** 초개인화 투자 성향 API (FR-12)
- 📌 **권장:** 다국어 지원 (FR-11)

---

## 7. API 변경 체크리스트

백엔드 개발팀에서 확인 부탁드립니다:

- [ ] **Chat API 응답에 `metadata.thinking` 추가**
- [ ] **HITL Approval `approval_request` 구조 상세화**
- [ ] **Portfolio API `chart_data` 및 `weight` 필드 추가**
- [ ] **실시간 스트리밍 API (SSE) 구현** (`/api/v1/chat/stream/{conversation_id}`)
- [ ] **Chat Session 목록 API 추가** (`/api/v1/chat/sessions`)
- [ ] **자동화 레벨 설정/조회 API 추가** (`/api/v1/user/automation-level`)
- [ ] **초개인화 투자 성향 API 추가** (`/api/v1/user/investment-profile`) - Phase 3
- [ ] **Artifact 관련 API 추가** (`/api/v1/artifacts`) - Phase 3
- [ ] **다국어 지원 (Accept-Language 헤더 처리)** - Phase 3
- [ ] **오류 메시지 한국어화**
- [ ] **CORS 설정 (localhost:3000 허용)**

---

## 8. 질문 및 협의 필요 사항

다음 사항들은 백엔드팀과 협의가 필요합니다:

1. **실시간 스트리밍 방식:**
   - SSE vs WebSocket 중 어느 것을 선호하시나요?
   - LangGraph `astream_events()` 연동이 가능한가요?

2. **Artifact 저장 시점:**
   - Phase 3까지 Backend DB 연동을 기다릴지, 아니면 Phase 1부터 구현할지?

3. **다국어 지원 방식:**
   - Accept-Language 헤더 vs Request Body의 language 필드 중 선호하는 방식은?

4. **초개인화 투자 성향 업데이트 주기:**
   - 주 1회 자동 업데이트인가요, 아니면 사용자 요청 시 업데이트인가요?

5. **Portfolio 차트 데이터:**
   - `chart_data` 구조가 위 제안과 다르게 구현되어야 하는 부분이 있나요?

---

## 9. 참고 문서

- **Frontend PRD v2.0:** `docs/ProductRequirements.md`
- **기존 Backend PRD:** `references/BackendPRD.md`
- **기존 Backend API 명세:** `references/backendAPI.md`
- **Technical Specification:** `docs/TechnicalSpecification.md`

---

**문서 작성자:** Claude (Frontend PRD 기반)
**검토 요청:** 백엔드 개발팀

**다음 단계:**
1. 본 문서를 백엔드 개발팀과 공유
2. 협의 필요 사항 논의
3. API 구현 일정 조율
4. Frontend 개발과 병행하여 API 테스트

---

**문서 끝**
