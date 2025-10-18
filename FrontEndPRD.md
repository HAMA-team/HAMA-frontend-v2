# HAMA Frontend PRD (Product Requirements Document)

**Version:** 1.0  
**Last Updated:** 2025-10-17
**Status:** MVP Development

---

## 📚 Reference Documents

This PRD references the following documents for complete context:

### Required Documents

- **BackendPRD.md** - Backend 기능 요구사항, HITL 플로우, 자동화 레벨 시스템
- **backendAPI.md** - API 엔드포인트 명세 및 Request/Response 스키마
- **초기스크리닝.md** - 온보딩 플로우 및 질문 시나리오
- **design지시.md** - UI/UX 디자인 시스템 및 스타일 가이드

### HTML Prototypes

- **mainChat.html** - 메인 채팅 인터페이스 레퍼런스
- **hitl.html** - HITL 승인 패널 UI 레퍼런스
- **portfolioPage.html** - 포트폴리오 대시보드 레퍼런스
- **mypage.html** - 마이페이지/설정 레퍼런스
- **artifactpage.html** - Artifacts 목록 페이지 레퍼런스
- **artifactSpecific.html** - Artifact 상세 뷰 레퍼런스
- **chatHistory.html** - 채팅 히스토리 레퍼런스
- **discover.html** - Discover 페이지 레퍼런스

---

## 1. Executive Summary

HAMA Frontend는 **Human-in-the-Loop AI 투자 시스템**을 위한 웹 클라이언트로, Chat 중심의 직관적인 UX를 통해 사용자가 AI와 협업하며 투자 의사결정을 수행하도록 설계되었습니다.

### 핵심 설계 원칙
- **Chat First**: 모든 주요 기능이 Chat 인터페이스를 통해 접근 가능
- **Persistent Chat Input**: 모든 페이지에서 Chat 입력창이 하단 중앙에 고정 (Perplexity 스타일)
- **HITL 필수 표시**: 승인이 필요한 경우 반드시 화면에 표시
- **선택적 가시성**: LangGraph 에이전트 활동은 토글 가능한 뷰로 제공

---

## 2. Design System

### 2.1 전체 테마
- **기본 스타일**: PilePeak.ai의 Light Mode
- **색상 팔레트**: 흰색 배경, 검은색/회색 텍스트, 포인트 컬러
- **폰트**: 
  - 제목(>20px): `tracking-tight`
  - 본문: 읽기 편한 line-height
  - Bold → Semibold로 한 단계 얇게

### 2.2 구조 참조
- **Shell & LNB**: Claude 구조 차용 (좌측 사이드바)
- **Chat UI**: Gemini 레이아웃 차용 (사용자 질문: 말풍선, AI 답변: 전체 너비)
- **Portfolio**: PilePeak.ai 레이아웃 및 톤 완전 차용

### 2.3 기술 스택
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React (1.5 strokewidth)
- **상태관리**: React Context / Zustand (TBD)
- **HTTP Client**: Axios / Fetch
- **Markdown**: react-markdown

---

## 3. Core Layout

### 3.1 Global Shell Structure

```
┌─────────────────────────────────────────┐
│  [☰ Toggle]         HAMA         [User] │  ← Header
├──────────┬──────────────────────────────┤
│          │                              │
│   LNB    │      Main Content Area       │
│ (260px)  │                              │
│          │                              │
│  - Chat  │                              │
│  - Arti  │                              │
│  - Port  │                              │
│  - MyPg  │                              │
│  - Disc  │                              │
│          │                              │
│  [최근챗] │                              │
│          │                              │
│  [User]  │                              │
└──────────┴──────────────────────────────┘
│      [Chat Input - Always Visible]      │  ← Fixed Bottom
└─────────────────────────────────────────┘
```

### 3.2 Left Navigation Bar (LNB)

**토글 상태 관리**
- 기본: 펼쳐짐 (260px)
- 접힘: 사이드바 숨김 (0px)
- 토글 버튼: 좌측 상단

**메뉴 구조**
1. **채팅** (기본 화면)
2. **Artifacts** (저장된 콘텐츠)
3. **포트폴리오** (대시보드)
4. **마이페이지** (설정)
5. **디스커버** (뉴스피드)

**최근 채팅 목록**
- 최대 10개 표시
- 제목 + 날짜
- 현재 활성 채팅 하이라이트
- HITL 대기 상태 뱃지 표시

**하단 사용자 정보**
- 이름 + 플랜 정보
- 프로필 이미지 (이니셜)

---

## 4. Chat Interface (Main View)

### 4.1 레이아웃 구조

```
┌─────────────────────────────────────────┐
│                                         │
│  [빈 화면 또는 대화 히스토리]             │
│                                         │
│  User: "삼성전자 분석해줘"                │  ← 말풍선
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ AI 답변 (전체 너비 활용)          │   │  ← Full Width
│  │ - Markdown 렌더링               │   │
│  │ - 코드 블록, 테이블 지원         │   │
│  │ [Save as Artifact 버튼]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Thinking... 토글 가능]                │
│                                         │
└─────────────────────────────────────────┘
```

### 4.2 Thinking 표시
- **표시 방식**: 접었다 펼쳤다 가능한 섹션
- **내용**: AI의 추론 과정 스트리밍
- **위치**: AI 답변 상단 또는 하단
- **상태**: 기본 접힘, 사용자가 펼쳐서 확인 가능

### 4.3 Markdown 지원
- **필수 지원**: 
  - 헤딩 (h1-h6)
  - 리스트 (ul, ol)
  - 테이블
  - 코드 블록
  - 인라인 코드
  - 링크
  - 이미지
  - 볼드/이탤릭

### 4.4 Save as Artifact
- **위치**: 모든 AI 답변 하단
- **동작**: 클릭 시 현재 답변을 Artifact로 저장
- **저장 방식**: Frontend Cache (MVP에서는 로컬스토리지 또는 메모리)
- **네이밍**: 자동 생성 또는 사용자 입력

---

## 5. HITL (Human-in-the-Loop) Interface

### 5.1 표시 정책
- **트리거**: Backend에서 HITL 필요 시 반환
- **표시 방식**: 화면 우측 절반을 차지하는 사이드 패널 (Claude Artifacts 스타일)
- **닫기 불가**: 사용자가 승인/거부 결정을 내릴 때까지 필수 표시

### 5.2 레이아웃

```
┌──────────────────┬──────────────────────┐
│                  │  ⚠️ 승인 필요         │
│                  │                      │
│  Chat Area       │  [주문 내역]          │
│                  │  - 종목: 삼성전자     │
│  (기존 채팅 유지)│  - 금액: 1000만원     │
│                  │  - 수량: 131주        │
│                  │                      │
│                  │  [리스크 경고]        │
│                  │  - 현재 비중: 25%     │
│                  │  - 예상 비중: 43% ⚠️  │
│                  │                      │
│                  │  [권장 대안]          │
│                  │  1. 금액 조정         │
│                  │  2. 분산 투자         │
│                  │                      │
│                  │  [취소] [수정] [승인] │
└──────────────────┴──────────────────────┘
```

### 5.3 사용자 액션
1. **승인 (Approve)**: Backend에 승인 전송
2. **거부 (Reject)**: Backend에 거부 전송
3. **수정 (Modify)**: 수정 사항과 함께 승인 전송

### 5.4 Backend API 연동
- **Endpoint**: `POST /api/v1/chat/approve`
- **Payload**: 
  ```json
  {
    "thread_id": "string",
    "decision": "approved|rejected|modified",
    "modifications": {},
    "automation_level": 2
  }
  ```

---

## 6. LangGraph Agent Activity View (Optional)

### 6.1 토글 방식
- **위치**: Chat 입력창 근처에 작은 토글 버튼
- **기본 상태**: 닫힘
- **펼침 상태**: 화면 우측 또는 하단에 별도 패널

### 6.2 표시 내용
- **현재 실행 중인 노드**: "📋 계획 수립 중...", "🔍 기업 분석 중..."
- **실시간 추론 로그**: `astream_events` 스트림 데이터
- **노드별 진행 상태**: 완료/진행중 표시

### 6.3 구현 사양
- **Backend**: `astream_events()` 사용
- **Frontend**: SSE (Server-Sent Events) 또는 WebSocket으로 실시간 수신
- **노드 이름 번역**: 
  - `planner` → "📋 계획 수립 중..."
  - `researcher` → "🔍 데이터 수집 중..."
  - `strategy` → "💡 전략 분석 중..."

---

## 7. Artifacts View

### 7.1 Artifacts 목록 페이지
- **레이아웃**: 그리드 형태 (카드 스타일)
- **카드 정보**:
  - 제목
  - 생성 날짜
  - 콘텐츠 타입 (리포트, 차트, Bull/Bear 분석 등)
  - 썸네일 또는 아이콘
- **액션**:
  - 클릭 시 상세 뷰로 이동
  - 삭제 버튼

### 7.2 Artifact 상세 뷰
- **헤더**:
  - 뒤로가기 버튼
  - 제목
  - 생성 날짜
  - [채팅 시작] 버튼
- **본문**: 
  - Markdown 렌더링
  - Bull/Bear 분석: 양측 의견을 좌우로 명확히 비교
  - 차트: Chart.js 또는 Recharts로 렌더링
- **Context-Aware Chat**:
  - [채팅 시작] 클릭 시, 현재 Artifact 내용을 컨텍스트로 포함하여 새 채팅 시작
  - 구현: Artifact 내용을 텍스트화하여 첫 메시지로 전송

### 7.3 저장 방식 (MVP)
- **로컬 저장**: Frontend Cache (LocalStorage 또는 IndexedDB)
- **Phase 2**: Backend DB에 저장

---

## 8. Portfolio Page

### 8.1 UI 참조
- **완전히 PilePeak.ai 스타일 차용**
- **레이아웃**: 대시보드 + 포트폴리오 통합

### 8.2 표시 정보
- **총 보유 자산** (Total Assets)
- **보유 종목 목록** (Holdings)
- **총 수익/수익률** (P&L %)
- **월간 성장률** (Avg. Monthly Growth)

### 8.3 포트폴리오 구성 시각화
- **기본**: 트리맵 (Treemap)
- **옵션**: 
  1. 트리맵
  2. 원그래프 (Pie Chart)
  3. 누적막대그래프 (Stacked Bar Chart)
- **선택 UI**: 우측 상단에 토글 버튼

### 8.4 Backend API 연동
- **Endpoint**: `GET /api/v1/portfolio/{portfolio_id}`
- **Response**: 포트폴리오 요약 + 포지션 목록

---

## 9. My Page (Settings)

### 9.1 표시 정보
- **사용자 정보**: 이름, 나이
- **계좌 연동 상태**: "한국투자증권 연결됨" (텍스트만)
- **투자 성향**: "공격투자형" 등

### 9.2 자동화 레벨 설정 (핵심)
- **옵션**:
  1. ✈️ **파일럿 모드** (AI가 거의 모든 것 처리)
  2. 🤝 **코파일럿 모드** (AI 제안, 사용자 승인) ⭐ 기본
  3. 📊 **어드바이저 모드** (AI는 정보만 제공)
- **UI**: 라디오 버튼 또는 카드 선택
- **세부 설정 버튼**: "상세 설정" (작동 안 함, Phase 2)

### 9.3 온보딩 체험
- **버튼**: "온보딩 체험하기"
- **위치**: 페이지 하단
- **동작**: 온보딩 플로우로 이동

---

## 10. Onboarding Flow

### 10.1 목적
- **실제 가입이 아닌 체험형 데모**
- 초기 스크리닝 프로세스를 시뮬레이션

### 10.2 진입점
- My Page의 "온보딩 체험하기" 버튼

### 10.3 플로우
참조: `초기스크리닝.md`

1. **시작 및 동의**
   - "거래 내역 조회에 동의하시나요?"
2. **자동 분석 결과 브리핑**
   - "투자 경험이 확인되었습니다."
3. **4가지 질문**:
   - Q1: 투자 목적 및 기간
   - Q2: 투자 스타일 (3가지 페르소나 중 선택)
   - Q3: 자산 대비 투자 비중
   - Q4: AI 파트너 타입 (자동화 레벨)
4. **최종 결과**
   - "투자 성향: 안정형"
   - 자동화 레벨 추천

### 10.4 구현 방식
- **Mock 데이터**: 사용자 입력에 관계없이 미리 정해진 답변 반환
- **UI**: Chat 창과 유사한 인터페이스
- **Phase 2**: 실제 LLM 대화로 전환

---

## 11. Discover Page (낮은 우선순위)

### 11.1 UI 참조
- **Perplexity의 Finance 탭**

### 11.2 레이아웃
```
┌──────────────────────────────────────────┐
│  [뉴스 피드 - 메인 영역]                  │
│  ┌────────────────────────────────────┐  │
│  │ 📰 금융/투자 관련 기사 1            │  │
│  │ 요약 + 링크                         │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ 📰 기사 2                           │  │
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│  [사이드바 - 시장 정보]                   │
│  - 코스피/코스닥 지수                     │
│  - 인기 종목 차트                         │
│  - 환율 정보                              │
└──────────────────────────────────────────┘
```

---

## 12. API Integration

### 12.1 주요 Endpoints
참조: `backendAPI.md`

| Endpoint | Method | 설명 |
|----------|--------|------|
| `/api/v1/chat` | POST | 채팅 메시지 전송 |
| `/api/v1/chat/approve` | POST | HITL 승인/거부 |
| `/api/v1/portfolio/{id}` | GET | 포트폴리오 조회 |
| `/api/v1/stocks/search` | GET | 종목 검색 |
| `/api/v1/stocks/{code}` | GET | 종목 정보 |
| `/api/v1/stocks/{code}/analysis` | GET | 종목 분석 |

### 12.2 Chat API 통신
- **Request**:
  ```json
  {
    "message": "삼성전자 분석해줘",
    "thread_id": "abc123",
    "automation_level": 2,
    "config": {}
  }
  ```
- **Response**: 
  - 일반 답변 또는 HITL 요청 포함
  - HITL 필요 시 `requires_approval: true` 플래그

### 12.3 실시간 스트리밍 (Optional)
- **`astream_events` 연동**
- **구현**: SSE 또는 WebSocket
- **용도**: LangGraph 에이전트 활동 실시간 표시

---

## 13. Component Structure

### 13.1 주요 컴포넌트
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

## 14. Feature Checklist (MVP)

### Phase 1 - Core Features
- [ ] Shell & LNB 구조
- [ ] Chat 인터페이스
  - [ ] 메시지 입력/전송
  - [ ] AI 답변 렌더링 (Markdown)
  - [ ] Thinking 토글
  - [ ] Save as Artifact
- [ ] HITL 패널
  - [ ] 승인/거부 UI
  - [ ] Backend API 연동
- [ ] Artifacts
  - [ ] 목록 페이지
  - [ ] 상세 뷰
  - [ ] Context-Aware Chat
- [ ] Portfolio 페이지
  - [ ] 트리맵 시각화
  - [ ] 포트폴리오 요약
- [ ] My Page
  - [ ] 자동화 레벨 설정
- [ ] Onboarding Flow
  - [ ] Mock 데이터 기반 체험

### Phase 2 - Enhanced Features
- [ ] LangGraph Activity View (실시간)
- [ ] 실제 Backend 연동 (Auth)
- [ ] Artifacts DB 저장
- [ ] Discover 페이지
- [ ] 포트폴리오 차트 옵션 (원그래프, 막대그래프)

---

## 15. Responsive Design
- **Desktop First**: 기본 해상도 1920x1080
- **Mobile**: Phase 3에서 고려
- **Tablet**: 레이아웃 조정 필요 (LNB 숨김 등)

---

## 16. Accessibility
- **Keyboard Navigation**: Tab 키로 모든 요소 접근 가능
- **Screen Reader**: ARIA 속성 추가
- **Contrast**: WCAG AA 이상 준수

---

## 17. Performance
- **Initial Load**: < 2초
- **Chat Response**: < 3초 (Backend 응답 시간 포함)
- **Markdown Rendering**: 지연 없이 즉시 표시

---

## 18. Out of Scope (MVP)
- ❌ 모바일 앱
- ❌ 다크 모드
- ❌ 실시간 Push 알림
- ❌ 소셜 기능
- ❌ 음성 인터페이스
- ❌ 다국어 지원

---

## 19. Error Handling & Exception Specifications

### 19.1 API Error Handling

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

### 19.2 Chat API 특수 오류 처리

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

### 19.3 Portfolio API 오류 처리

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

### 19.4 Artifact 저장 실패 처리

```typescript
// LocalStorage 저장 실패 시 (quota 초과)
1. "저장 공간이 부족합니다" 토스트 메시지
2. "오래된 Artifacts 삭제" 버튼 제공
3. 저장 재시도 옵션 제공
```

### 19.5 실시간 스트리밍 오류 처리

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

## 20. State Management & Data Flow

### 20.1 전역 상태 관리

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

### 20.2 Chat 상태 관리

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

### 20.3 HITL 상태 관리

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

### 20.4 로컬 스토리지 사용

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

### 20.5 데이터 동기화 정책

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

## 21. UX States Specification

### 21.1 Loading States

#### Chat 메시지 전송 중

```typescript
UI:
- 사용자 메시지: 즉시 화면에 표시 (낙관적 업데이트)
- 메시지 옆에 작은 로딩 스피너 표시
- Chat Input 비활성화 (전송 중복 방지)
```

#### AI 응답 대기 중

```typescript
UI:
- "생각하는 중..." 텍스트 + 애니메이션 (점 3개 깜빡임)
- Thinking 섹션이 있다면 실시간 스트리밍 표시
- 최대 대기 시간: 60초 (이후 timeout 오류)
```

#### Portfolio 로딩 중

```typescript
UI:
- 차트 영역에 스켈레톤 UI 표시
  - 트리맵: 회색 박스들
  - 테이블: 회색 줄들
- "포트폴리오 데이터를 불러오는 중..." 텍스트
```

#### Artifact 저장 중

```typescript
UI:
- "Save as Artifact" 버튼 → 로딩 스피너 + "저장 중..."
- 성공 시: 초록색 체크 아이콘 + "저장 완료" (1초 표시)
- 실패 시: 붉은색 X 아이콘 + 오류 메시지
```

### 21.2 Empty States

#### Chat 초기 화면 (대화 없음)

```typescript
UI:
- 중앙에 HAMA 로고
- "안녕하세요! 무엇을 도와드릴까요?" 텍스트
- 4개의 제안 카드:
  1. 포트폴리오 현황
  2. 시장 분석
  3. 종목 추천
  4. 리스크 분석
```

#### Artifacts 없음

```typescript
UI:
- 중앙에 빈 상자 아이콘
- "아직 저장된 Artifact가 없습니다"
- "Chat에서 AI 답변을 저장하여 Artifact를 만들어보세요" 안내
```

#### 최근 채팅 없음

```typescript
UI:
- LNB의 "최근 채팅" 섹션에 "채팅 기록이 없습니다" 표시
- "새 채팅" 버튼 강조
```

### 21.3 Error States

#### Chat 전송 실패

```typescript
UI:
- 메시지 옆에 ⚠️ 아이콘
- 메시지 배경색: 연한 빨간색
- 하단에 "전송 실패" + "재전송" 버튼
```

#### Portfolio 로드 실패

```typescript
UI:
- 차트 영역에 ⚠️ 아이콘
- "포트폴리오 데이터를 불러올 수 없습니다"
- "새로고침" 버튼 제공
- 이전 캐시 데이터가 있다면:
  - 캐시 데이터 표시
  - "마지막 업데이트: 2시간 전" 표시
```

#### HITL 승인 실패

```typescript
UI:
- HITL 패널 상단에 붉은색 경고 배너
- "승인 처리 중 오류가 발생했습니다: [오류 메시지]"
- "다시 시도" 버튼
- 패널은 닫히지 않음 (사용자가 다시 시도해야 함)
```

### 21.4 Success States

#### HITL 승인 성공

```typescript
UI:
- 초록색 체크 아이콘 + "승인 완료" 메시지 (1초)
- HITL 패널 닫기
- Chat에 "✅ 주문이 승인되었습니다" 시스템 메시지 추가
```

#### Artifact 저장 성공

```typescript
UI:
- 초록색 토스트 메시지: "Artifact가 저장되었습니다"
- 3초 후 자동 사라짐
- "Artifacts 페이지에서 보기" 링크 제공
```

---

## 22. Input Validation Rules

### 22.1 Chat Input 검증

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

### 22.2 HITL 수정 입력 검증

#### 매수/매도 수량 수정

| 필드 | 규칙 | 검증 실패 시 |
|------|------|-------------|
| **수량** | 양의 정수, 최소 1 | "수량은 1 이상이어야 합니다" |
| **가격** | 양의 숫자, 최대 소수점 2자리 | "유효한 가격을 입력하세요" |

**실시간 검증**:
- 입력 시 즉시 유효성 검사
- 잘못된 입력 시 붉은색 테두리 + 오류 메시지
- "수정" 버튼: 모든 필드가 유효할 때만 활성화

### 22.3 Artifact 이름 검증

| 규칙 | 값 | 검증 실패 시 |
|------|---|------------|
| **최소 길이** | 1자 | "제목을 입력하세요" |
| **최대 길이** | 100자 | "최대 100자까지 입력 가능합니다" |
| **특수문자** | 허용 | - |

---

## 23. Real-time Features & Reconnection Logic

### 23.1 SSE (Server-Sent Events) 연결

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

### 23.2 WebSocket 대체 방안 (Optional)

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

### 23.3 폴링 폴백 (Fallback)

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

### 23.4 연결 상태 UI

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

## 24. Edge Cases & Special Scenarios

### 24.1 동시 HITL 요청

**시나리오**: 사용자가 여러 매매 요청을 동시에 보냄

```typescript
처리 방법:
1. 첫 번째 HITL 패널만 표시
2. 나머지 HITL 요청은 대기열(Queue)에 저장
3. 첫 번째 승인/거부 후, 다음 HITL 요청 자동 표시
4. 대기 중인 HITL 개수를 패널 상단에 표시
   예: "승인 대기 (1/3)"
```

### 24.2 HITL 승인 중 네트워크 끊김

**시나리오**: 승인 버튼 클릭 후 응답 전에 네트워크 끊김

```typescript
처리 방법:
1. 로딩 상태 유지 (최대 30초)
2. 30초 후 타임아웃: "응답 시간 초과" 오류
3. "재시도" 버튼 제공
4. HITL 패널은 닫히지 않음
```

### 24.3 Chat 입력 중 페이지 이탈

**시나리오**: 사용자가 긴 메시지를 입력하다가 실수로 페이지 이동

```typescript
처리 방법:
1. 입력 내용이 있을 경우:
   - "입력한 내용이 저장되지 않을 수 있습니다. 페이지를 나가시겠습니까?" 확인 창
2. SessionStorage에 임시 저장 (5분간 유지)
3. 페이지 재진입 시: "이전에 입력한 내용을 복원하시겠습니까?" 확인 창
```

### 24.4 Artifact 저장 중 중복 클릭

**시나리오**: "Save as Artifact" 버튼을 여러 번 빠르게 클릭

```typescript
처리 방법:
1. 버튼 즉시 비활성화
2. 로딩 스피너 표시
3. 저장 완료 후 1초 뒤 버튼 재활성화
```

### 24.5 Portfolio 데이터 부분 누락

**시나리오**: API 응답에서 일부 종목의 `current_price`가 null

```typescript
처리 방법:
1. 해당 종목 차트에서 제외 (트리맵/파이차트)
2. 테이블에는 표시하되 "가격 정보 없음" 표시
3. 페이지 상단에 경고 메시지:
   "일부 종목의 가격 정보를 불러올 수 없습니다 (3/10 종목)"
```

### 24.6 LocalStorage Quota 초과

**시나리오**: Artifacts가 너무 많아 LocalStorage 용량 초과

```typescript
처리 방법:
1. 저장 시도 시 DOMException 발생 감지
2. "저장 공간이 부족합니다" 경고
3. Artifacts 목록 페이지로 이동 제안
4. "오래된 Artifacts 삭제" 버튼 제공
5. 자동 삭제 정책: 30일 이상 된 Artifact 자동 제거 (옵션)
```

### 24.7 브라우저 뒤로가기/앞으로가기

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

## 25. Performance Optimization

### 25.1 Chat 메시지 렌더링 최적화

```typescript
// 메시지 많을 때 성능 이슈 방지
- 가상 스크롤링 (react-window) 사용
- 최초 로드: 최근 50개 메시지만
- 스크롤 위로: 이전 메시지 lazy load
- 이미지/차트: Lazy loading
```

### 25.2 Markdown 렌더링 최적화

```typescript
// react-markdown 최적화
- Memoization: 동일한 마크다운 재렌더링 방지
- Code highlighting: 필요할 때만 로드
- 큰 테이블: 페이지네이션 또는 가상 스크롤
```

### 25.3 Portfolio 차트 최적화

```typescript
// Chart.js 성능 최적화
- 데이터 포인트 제한: 최대 100개
- 애니메이션: 초기 로드 시에만
- Resize: Debounce 적용 (300ms)
```

---

## 26. Accessibility (A11y) Requirements

### 26.1 Keyboard Navigation

| 요소 | 단축키 | 동작 |
|------|--------|-----|
| Chat Input | `Ctrl/Cmd + K` | 포커스 이동 |
| LNB 토글 | `Ctrl/Cmd + B` | 사이드바 열기/닫기 |
| 새 채팅 | `Ctrl/Cmd + N` | 새 채팅 시작 |
| 메시지 전송 | `Enter` | 메시지 전송 |
| 줄바꿈 | `Shift + Enter` | 줄바꿈 |
| HITL 승인 | `Alt + A` | 승인 (HITL 패널 열려있을 때) |
| HITL 거부 | `Alt + R` | 거부 (HITL 패널 열려있을 때) |

### 26.2 Screen Reader 지원

```typescript
// ARIA 속성 추가
- Chat 메시지: role="log" aria-live="polite"
- HITL 패널: role="dialog" aria-modal="true"
- 로딩 스피너: aria-busy="true" aria-label="로딩 중"
- 오류 메시지: role="alert"
```

### 26.3 Color Contrast

- WCAG AA 이상 준수
- 텍스트/배경 명암비: 최소 4.5:1
- 큰 텍스트(18px+): 최소 3:1

---

## 27. Testing Requirements

### 27.1 Unit Tests

```typescript
// 필수 테스트 커버리지
- API client functions: 100%
- Validation functions: 100%
- State management: 80%+
- UI components: 70%+
```

### 27.2 Integration Tests

```typescript
// 주요 시나리오 테스트
1. Chat 메시지 전송 → AI 응답 → Artifact 저장
2. HITL 플로우: 요청 → 승인 → 결과 확인
3. Portfolio 로드 → 차트 렌더링 → 데이터 표시
```

### 27.3 E2E Tests

```typescript
// Playwright/Cypress 사용
1. 온보딩 플로우 전체 완료
2. Chat 사용 → HITL 승인 → Artifacts 확인
3. 네트워크 오류 시뮬레이션 → 재시도
```

---

## 28. Security Considerations

### 28.1 XSS 방지

```typescript
// Markdown 렌더링 시 주의
- react-markdown의 `remarkGfm` 플러그인 사용
- HTML 태그 이스케이프 처리
- 외부 링크: rel="noopener noreferrer" 추가
```

### 28.2 CSRF 방지 (Phase 2)

```typescript
// API 요청 시 CSRF 토큰 포함
headers: {
  'X-CSRF-Token': getCsrfToken()
}
```

### 28.3 LocalStorage 보안

```typescript
// 민감 정보 저장 금지
- ❌ 사용자 비밀번호
- ❌ API 토큰 (SessionStorage 사용)
- ✅ Artifacts (민감하지 않음)
- ✅ UI 설정 (LNB 상태 등)
```

---

## 29. Next Steps

1. ✅ Frontend PRD 검토 및 승인
2. ⏭️ 컴포넌트 설계 상세화
3. ⏭️ API 스펙 확정 (Backend와 협의)
4. ⏭️ 프로토타입 개발 (핵심 Chat + HITL)
5. ⏭️ 디자인 시스템 구축 (Tailwind Config)
6. ⏭️ 에러 핸들링 로직 구현
7. ⏭️ 상태 관리 시스템 구축
8. ⏭️ 실시간 기능 연동 (SSE/WebSocket)

---

**문서 끝**