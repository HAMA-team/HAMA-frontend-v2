# HAMA Frontend - Technical Specification

**Version:** 1.0
**Last Updated:** 2025-10-20
**Purpose:** 개발팀을 위한 기술 구현 상세 명세

---

## 📌 문서 목적

이 문서는 **Product Requirements Document (PRD)**에서 분리된 기술 구현 세부사항을 다룹니다.
- PRD는 "무엇을, 왜" 만드는지 정의
- 본 문서는 "어떻게" 구현하는지 정의

---

## 1. Component Structure

### 1.1 주요 컴포넌트
```
src/
├── components/
│   ├── Layout/
│   │   ├── Shell.tsx
│   │   ├── LNB.tsx
│   │   └── ChatInput.tsx (fixed bottom)
│   ├── Chat/
│   │   ├── ChatView.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── AIResponse.tsx
│   │   ├── ThinkingToggle.tsx
│   │   └── SaveArtifactButton.tsx
│   ├── HITL/
│   │   ├── HITLPanel.tsx
│   │   └── ApprovalActions.tsx
│   ├── Artifacts/
│   │   ├── ArtifactsList.tsx
│   │   ├── ArtifactCard.tsx
│   │   └── ArtifactDetail.tsx
│   ├── Portfolio/
│   │   ├── PortfolioView.tsx
│   │   ├── Treemap.tsx
│   │   ├── PieChart.tsx
│   │   └── StackedBar.tsx
│   ├── MyPage/
│   │   ├── MyPageView.tsx
│   │   └── AutomationLevelSelector.tsx
│   ├── Onboarding/
│   │   ├── OnboardingFlow.tsx
│   │   └── QuestionStep.tsx
│   └── Discover/
│       ├── DiscoverView.tsx
│       ├── NewsFeed.tsx
│       └── MarketSidebar.tsx
├── pages/
│   ├── index.tsx (Chat)
│   ├── artifacts.tsx
│   ├── portfolio.tsx
│   ├── mypage.tsx
│   ├── discover.tsx
│   └── onboarding.tsx
└── lib/
    ├── api.ts (API client)
    └── utils.ts
```

---

## 2. State Management & Data Flow

### 2.1 전역 상태 관리

#### Context API 또는 Zustand 사용

```typescript
// Global State Structure
interface GlobalState {
  // User
  user: User | null;
  automationLevel: 1 | 2 | 3;

  // Chat
  currentConversationId: string | null;
  chatSessions: ChatSession[];

  // UI State
  lnbCollapsed: boolean;
  hitlPanelOpen: boolean;
  agentActivityVisible: boolean;

  // Artifacts
  artifacts: Artifact[];

  // Portfolio
  portfolio: PortfolioData | null;
}
```

### 2.2 Chat 상태 관리

#### 메시지 상태

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'failed' | 'streaming';
  metadata?: {
    thinking?: string;
    requiresApproval?: boolean;
    approvalRequest?: ApprovalRequest;
  };
}
```

**상태 전이**:
```
[user input] → sending → sent
                      ↘ failed (재전송 가능)

[AI response] → streaming → sent
```

### 2.3 HITL 상태 관리

```typescript
interface HITLState {
  isOpen: boolean;
  approvalRequest: ApprovalRequest | null;
  conversationId: string | null;
  status: 'pending' | 'approving' | 'rejecting' | 'error';
}
```

**HITL 플로우**:
```
1. Chat API 응답에서 requires_approval: true 감지
2. HITLState.isOpen = true
3. HITL 패널 화면 우측 50%에 표시
4. 사용자 승인/거부 액션
5. /api/v1/chat/approve 호출
6. 성공 시: HITLState 초기화 + 패널 닫기
7. 실패 시: 오류 메시지 + 상태 유지
```

### 2.4 로컬 스토리지 사용

#### Artifacts 저장

```typescript
// LocalStorage Key: 'hama_artifacts'
interface ArtifactsStorage {
  version: string; // "1.0"
  artifacts: Artifact[];
  lastUpdated: Date;
}

// Quota 관리
- 최대 저장 용량: 5MB
- 용량 초과 시: 가장 오래된 Artifact 자동 삭제
- 사용자에게 경고 메시지 표시
```

#### LNB 토글 상태 저장

```typescript
// LocalStorage Key: 'hama_lnb_collapsed'
- 값: boolean
- 페이지 로드 시 복원
```

### 2.5 데이터 동기화 정책

#### Chat Sessions 동기화

```typescript
// 페이지 로드 시
1. GET /api/v1/chat/sessions 호출
2. 최근 50개 세션 가져오기
3. LNB에 표시 (최근 10개만)
4. 캐시: SessionStorage에 저장 (세션 동안 유지)
```

#### Portfolio 데이터 동기화

```typescript
// 페이지 진입 시
1. GET /api/v1/portfolio/{id} 호출
2. 성공 시: 데이터 표시 + LocalStorage에 캐시
3. 실패 시: LocalStorage 캐시 데이터 사용 + "오래된 데이터" 표시
4. 새로고침 버튼: 강제로 API 재호출
```

---

## 3. Real-time Features & Reconnection Logic

### 3.1 SSE (Server-Sent Events) 연결

#### LangGraph Activity View 실시간 업데이트

```typescript
// 연결 설정
const eventSource = new EventSource('/api/v1/chat/stream/{conversation_id}');

// 이벤트 핸들러
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // UI 업데이트: "📋 계획 수립 중..."
};

eventSource.onerror = () => {
  // 재연결 로직 실행
};
```

#### 재연결 로직

```typescript
// 지수 백오프 재연결
let retryCount = 0;
const MAX_RETRIES = Infinity; // 무한 재시도
const BASE_DELAY = 1000; // 1초
const MAX_DELAY = 30000; // 최대 30초

function reconnect() {
  const delay = Math.min(BASE_DELAY * Math.pow(2, retryCount), MAX_DELAY);

  setTimeout(() => {
    console.log(`Reconnecting... (attempt ${retryCount + 1})`);
    connectSSE();
    retryCount++;
  }, delay);
}

// 연결 성공 시 retryCount 초기화
eventSource.onopen = () => {
  retryCount = 0;
  showToast("연결이 복구되었습니다", "success");
};
```

### 3.2 WebSocket 대체 방안 (Optional)

#### WebSocket 연결

```typescript
const ws = new WebSocket('ws://localhost:8000/ws/chat/{conversation_id}');

ws.onopen = () => {
  console.log("WebSocket connected");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // 실시간 메시지 처리
};

ws.onerror = () => {
  // 재연결
};

ws.onclose = () => {
  // 재연결
};
```

### 3.3 폴링 폴백 (Fallback)

```typescript
// SSE/WebSocket 연결 실패 시
// 5초마다 HTTP 폴링

let pollingInterval: NodeJS.Timeout;

function startPolling() {
  pollingInterval = setInterval(async () => {
    const response = await fetch(`/api/v1/chat/status/${conversationId}`);
    const data = await response.json();
    // UI 업데이트
  }, 5000);
}

function stopPolling() {
  clearInterval(pollingInterval);
}
```

### 3.4 연결 상태 UI

```typescript
// LangGraph Activity View 상태 표시
interface ConnectionStatus {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  message: string;
}

// UI 표시
- connected: 초록색 점 + "실시간 연결됨"
- connecting: 노란색 점 + "연결 중..."
- disconnected: 회색 점 + "연결 끊김 (재연결 시도 중)"
- error: 빨간색 점 + "연결 실패 (폴링 모드)"
```

---

## 4. Error Handling & Exception Specifications

### 4.1 API Error Handling

#### HTTP Status Code 처리

| Status Code | 의미 | Frontend 동작 |
|-------------|------|--------------|
| **200** | 성공 | 정상 처리 |
| **400** | Bad Request | 입력값 검증 오류 메시지 표시 |
| **401** | Unauthorized | 로그인 페이지로 리다이렉트 (Phase 2) |
| **403** | Forbidden | "권한이 없습니다" 토스트 표시 |
| **404** | Not Found | "요청한 리소스를 찾을 수 없습니다" 표시 |
| **422** | Validation Error | 상세 검증 오류 메시지 표시 |
| **429** | Too Many Requests | "잠시 후 다시 시도해주세요" + 재시도 버튼 |
| **500** | Internal Server Error | "일시적인 오류가 발생했습니다" + 재시도 버튼 |
| **503** | Service Unavailable | "서비스 점검 중입니다" 전체 화면 표시 |

#### 422 Validation Error 세부 처리

```typescript
// Response 예시
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

**Frontend 처리**:
- `loc` 필드로 어느 입력값이 문제인지 파악
- 해당 입력 필드에 붉은색 테두리 + 하단에 오류 메시지 표시
- 첫 번째 오류 필드로 포커스 이동

#### 네트워크 오류 처리

| 오류 유형 | 감지 방법 | Frontend 동작 |
|----------|---------|--------------|
| **Timeout** | Request timeout (30초) | "응답 시간 초과" + 재시도 버튼 |
| **Network Failure** | `fetch` reject | "네트워크 연결을 확인해주세요" |
| **CORS Error** | Browser console error | 개발 환경에서만 경고 표시 |

### 4.2 Chat API 특수 오류 처리

#### 시나리오 1: Chat 메시지 전송 실패

```typescript
// 실패 시 동작
1. 메시지를 전송 중(pending) 상태로 UI에 표시
2. API 실패 시 메시지 상태를 "전송 실패"로 변경
3. 메시지 옆에 ⚠️ 아이콘 + "재전송" 버튼 표시
4. 재전송 버튼 클릭 시 동일한 메시지 재전송
```

**사용자 경험**:
- 전송 실패한 메시지는 회색으로 표시
- "재전송" 또는 "삭제" 옵션 제공

#### 시나리오 2: HITL 승인/거부 API 실패

```typescript
// 실패 시 동작
1. HITL 패널에 오류 메시지 표시
2. "승인/거부" 버튼 다시 활성화
3. 오류 원인 표시 (예: "승인 처리 중 오류 발생")
4. "다시 시도" 버튼 제공
```

**중요**: HITL 패널은 닫히지 않음 (사용자가 반드시 결정을 내려야 함)

### 4.3 Portfolio API 오류 처리

#### 포트폴리오 데이터 로드 실패

```typescript
// 실패 시 UI
- 차트 영역에 "포트폴리오 데이터를 불러올 수 없습니다" 메시지
- "새로고침" 버튼 제공
- 이전에 캐시된 데이터가 있다면 표시 + "오래된 데이터" 표시
```

#### 부분 데이터 누락 처리

```typescript
// 예: 일부 종목의 current_price가 null
- 해당 종목을 "가격 정보 없음"으로 표시
- 전체 차트는 정상 렌더링
- 사용자에게 "일부 데이터가 업데이트되지 않았습니다" 경고
```

### 4.4 Artifact 저장 실패 처리

```typescript
// LocalStorage 저장 실패 시 (quota 초과)
1. "저장 공간이 부족합니다" 토스트 메시지
2. "오래된 Artifacts 삭제" 버튼 제공
3. 저장 재시도 옵션 제공
```

### 4.5 실시간 스트리밍 오류 처리

#### SSE/WebSocket 연결 실패

```typescript
// 연결 실패 시 동작
1. 최초 연결 실패: 3회 재시도 (지수 백오프: 1s, 2s, 4s)
2. 3회 실패 후: "실시간 업데이트를 사용할 수 없습니다" 경고
3. LangGraph Activity View를 일반 폴링 모드로 전환
```

#### 연결 중단 처리

```typescript
// 연결 중단 감지 시
1. "연결이 끊어졌습니다" 상태 표시
2. 자동 재연결 시도 (무한 재시도, 백오프: 최대 30초)
3. 재연결 성공 시: "연결이 복구되었습니다" 토스트
```

---

## 5. Edge Cases & Special Scenarios

### 5.1 동시 HITL 요청

**시나리오**: 사용자가 여러 매매 요청을 동시에 보냄

```typescript
처리 방법:
1. 첫 번째 HITL 패널만 표시
2. 나머지 HITL 요청은 대기열(Queue)에 저장
3. 첫 번째 승인/거부 후, 다음 HITL 요청 자동 표시
4. 대기 중인 HITL 개수를 패널 상단에 표시
   예: "승인 대기 (1/3)"
```

### 5.2 HITL 승인 중 네트워크 끊김

**시나리오**: 승인 버튼 클릭 후 응답 전에 네트워크 끊김

```typescript
처리 방법:
1. 로딩 상태 유지 (최대 30초)
2. 30초 후 타임아웃: "응답 시간 초과" 오류
3. "재시도" 버튼 제공
4. HITL 패널은 닫히지 않음
```

### 5.3 Chat 입력 중 페이지 이탈

**시나리오**: 사용자가 긴 메시지를 입력하다가 실수로 페이지 이동

```typescript
처리 방법:
1. 입력 내용이 있을 경우:
   - "입력한 내용이 저장되지 않을 수 있습니다. 페이지를 나가시겠습니까?" 확인 창
2. SessionStorage에 임시 저장 (5분간 유지)
3. 페이지 재진입 시: "이전에 입력한 내용을 복원하시겠습니까?" 확인 창
```

### 5.4 Artifact 저장 중 중복 클릭

**시나리오**: "Save as Artifact" 버튼을 여러 번 빠르게 클릭

```typescript
처리 방법:
1. 버튼 즉시 비활성화
2. 로딩 스피너 표시
3. 저장 완료 후 1초 뒤 버튼 재활성화
```

### 5.5 Portfolio 데이터 부분 누락

**시나리오**: API 응답에서 일부 종목의 `current_price`가 null

```typescript
처리 방법:
1. 해당 종목 차트에서 제외 (트리맵/파이차트)
2. 테이블에는 표시하되 "가격 정보 없음" 표시
3. 페이지 상단에 경고 메시지:
   "일부 종목의 가격 정보를 불러올 수 없습니다 (3/10 종목)"
```

### 5.6 LocalStorage Quota 초과

**시나리오**: Artifacts가 너무 많아 LocalStorage 용량 초과

```typescript
처리 방법:
1. 저장 시도 시 DOMException 발생 감지
2. "저장 공간이 부족합니다" 경고
3. Artifacts 목록 페이지로 이동 제안
4. "오래된 Artifacts 삭제" 버튼 제공
5. 자동 삭제 정책: 30일 이상 된 Artifact 자동 제거 (옵션)
```

### 5.7 브라우저 뒤로가기/앞으로가기

**시나리오**: HITL 패널이 열린 상태에서 뒤로가기

```typescript
처리 방법:
1. HITL 패널이 열려있으면:
   - "승인이 필요한 작업이 있습니다. 페이지를 나가시겠습니까?" 경고
2. 사용자 확인 시:
   - HITL 요청을 자동으로 "거부" 처리
   - 페이지 이동
```

---

## 6. Performance Optimization

### 6.1 Chat 메시지 렌더링 최적화

```typescript
// 메시지 많을 때 성능 이슈 방지
- 가상 스크롤링 (react-window) 사용
- 최초 로드: 최근 50개 메시지만
- 스크롤 위로: 이전 메시지 lazy load
- 이미지/차트: Lazy loading
```

### 6.2 Markdown 렌더링 최적화

```typescript
// react-markdown 최적화
- Memoization: 동일한 마크다운 재렌더링 방지
- Code highlighting: 필요할 때만 로드
- 큰 테이블: 페이지네이션 또는 가상 스크롤
```

### 6.3 Portfolio 차트 최적화

```typescript
// Chart.js 성능 최적화
- 데이터 포인트 제한: 최대 100개
- 애니메이션: 초기 로드 시에만
- Resize: Debounce 적용 (300ms)
```

---

## 7. Input Validation Rules

### 7.1 Chat Input 검증

| 규칙 | 값 | 검증 실패 시 동작 |
|------|---|------------------|
| **최소 길이** | 1자 | 전송 버튼 비활성화 |
| **최대 길이** | 5000자 | 입력 차단 + "최대 5000자까지 입력 가능합니다" 경고 |
| **공백만 입력** | 불가 | 전송 버튼 비활성화 |
| **개행 제한** | 최대 50줄 | 초과 시 "너무 많은 줄바꿈이 포함되어 있습니다" 경고 |

**실시간 검증**:
```typescript
- 입력 중: 글자 수 표시 (4900자 이상일 때만)
- 예: "4952 / 5000"
```

### 7.2 HITL 수정 입력 검증

#### 매수/매도 수량 수정

| 필드 | 규칙 | 검증 실패 시 |
|------|------|-------------|
| **수량** | 양의 정수, 최소 1 | "수량은 1 이상이어야 합니다" |
| **가격** | 양의 숫자, 최대 소수점 2자리 | "유효한 가격을 입력하세요" |

**실시간 검증**:
- 입력 시 즉시 유효성 검사
- 잘못된 입력 시 붉은색 테두리 + 오류 메시지
- "수정" 버튼: 모든 필드가 유효할 때만 활성화

### 7.3 Artifact 이름 검증

| 규칙 | 값 | 검증 실패 시 |
|------|---|------------|
| **최소 길이** | 1자 | "제목을 입력하세요" |
| **최대 길이** | 100자 | "최대 100자까지 입력 가능합니다" |
| **특수문자** | 허용 | - |

---

## 8. Security Considerations

### 8.1 XSS 방지

```typescript
// Markdown 렌더링 시 주의
- react-markdown의 `remarkGfm` 플러그인 사용
- HTML 태그 이스케이프 처리
- 외부 링크: rel="noopener noreferrer" 추가
```

### 8.2 CSRF 방지 (Phase 2)

```typescript
// API 요청 시 CSRF 토큰 포함
headers: {
  'X-CSRF-Token': getCsrfToken()
}
```

### 8.3 LocalStorage 보안

```typescript
// 민감 정보 저장 금지
- ❌ 사용자 비밀번호
- ❌ API 토큰 (SessionStorage 사용)
- ✅ Artifacts (민감하지 않음)
- ✅ UI 설정 (LNB 상태 등)
```

---

## 9. Testing Requirements

### 9.1 Unit Tests

```typescript
// 필수 테스트 커버리지
- API client functions: 100%
- Validation functions: 100%
- State management: 80%+
- UI components: 70%+
```

### 9.2 Integration Tests

```typescript
// 주요 시나리오 테스트
1. Chat 메시지 전송 → AI 응답 → Artifact 저장
2. HITL 플로우: 요청 → 승인 → 결과 확인
3. Portfolio 로드 → 차트 렌더링 → 데이터 표시
```

### 9.3 E2E Tests

```typescript
// Playwright/Cypress 사용
1. 온보딩 플로우 전체 완료
2. Chat 사용 → HITL 승인 → Artifacts 확인
3. 네트워크 오류 시뮬레이션 → 재시도
```

---

**문서 끝**
