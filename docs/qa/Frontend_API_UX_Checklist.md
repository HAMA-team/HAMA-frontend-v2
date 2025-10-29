# 프론트엔드 API UX 검증 시트 (Notion 복붙용)

- 테스트 대상 브랜치/배포: 입력하세요 (예: develop Preview / 로컬 dev)
- Base URL: 입력하세요 (예: http://localhost:8000 또는 ngrok 주소)
- Tester/Date: 입력하세요

## 레전드
- 사용현황: In-Use(UI에서 사용) / Healthcheck-Only(점검용) / Not-Used(미사용) / Planned(추가 예정)
- 결과: Pass / Fail / Blocked(CORS·인증·크레딧 등 외부 이슈) / Skip

## 공통 준비
- [.env.local] `NEXT_PUBLIC_API_BASE_URL` 확인 → dev 서버 재시작 필요
- 프리뷰에서 Preview Env에 백엔드 주소 설정(ngrok는 주소 변동 주의)
- DevTools Network: Disable cache ON, Preserve log ON

---

## A. API 매트릭스(요약)

| Group | Endpoint | Method | Screen/Trigger | 사용현황 | 결과 | 메모 |
|---|---|---|---|---|---|---|
| chat | /api/v1/chat/ | POST | 홈 채팅(스트리밍 실패시 폴백) | In-Use |  |  |
| chat | /api/v1/chat/multi-stream | POST | 홈 채팅 전송 시 SSE | In-Use |  |  |
| chat | /api/v1/chat/sessions | GET | LNB 최근 채팅 목록 | In-Use |  |  |
| chat | /api/v1/chat/history/{id} | GET | LNB 항목 클릭 시 복원 | In-Use |  |  |
| chat | /api/v1/chat/history/{id} | DELETE | LNB 케밥 메뉴 → Delete | In-Use |  |  |
| chat | /api/v1/chat/approve | POST | HITL 승인/거부 | In-Use |  |  |
| dashboard | /api/v1/dashboard/ | GET | (홈 요약 위젯 예정) | Not-Used |  |  |
| portfolio | /api/v1/portfolio/ | GET | 포트폴리오 페이지 | In-Use |  |  |
| portfolio | /api/v1/portfolio/chart-data | GET | (APICheckPanel) | Healthcheck-Only |  |  |
| portfolio | /api/v1/portfolio/{id} | GET | (상세 예정) | Planned |  |  |
| portfolio | /api/v1/portfolio/{id}/performance | GET | (상세/차트 예정) | Planned |  |  |
| portfolio | /api/v1/portfolio/{id}/rebalance | POST | (재밸런싱 UX 예정) | Planned |  |  |
| stocks | /api/v1/stocks/search | GET | (검색 UX 예정) | Not-Used |  |  |
| stocks | /api/v1/stocks/{code} | GET | (종목 상세 예정) | Not-Used |  |  |
| stocks | /api/v1/stocks/{code}/price-history | GET | (차트 예정) | Not-Used |  |  |
| stocks | /api/v1/stocks/{code}/analysis | GET | (분석 예정) | Not-Used |  |  |
| settings | /api/v1/settings/automation-level | GET | (APICheckPanel) | Healthcheck-Only |  |  |
| settings | /api/v1/settings/automation-level | PUT | (마이페이지 반영 예정) | Planned |  |  |
| settings | /api/v1/settings/automation-levels | GET | (APICheckPanel) | Healthcheck-Only |  |  |
| artifacts | /api/v1/artifacts/ | POST | (서버 저장 예정) | Not-Used |  |  |
| artifacts | /api/v1/artifacts/{id} | GET | (서버 상세 예정) | Not-Used |  |  |
| approvals | /api/v1/approvals/ | GET | (히스토리 화면 예정) | Healthcheck-Only |  |  |
| approvals | /api/v1/approvals/{request_id} | GET | (상세 예정) | Not-Used |  |  |

> 사용현황은 현재 코드 기준 자동 분류입니다. 변경되면 이 표 먼저 업데이트하세요.

---

## B. 엔드포인트별 상세 체크(작성용 템플릿을 복붙하여 사용)

### [chat] POST /api/v1/chat/multi-stream
- Screen/Trigger: 홈 → 채팅 입력 → Enter
- 기대(UI)
  - 전송 직후 어시스턴트 로딩/스켈레톤 표시 → 스트림 이벤트에 따라 내용 점진적 표시 → 완료 시 상태 sent
- 기대(Network)
  - 200, `Content-Type: text/event-stream`
- 실제(UI): 입력하세요
- 실제(Network): 입력하세요 (상태/헤더/중요 이벤트)
- 사용현황: In-Use
- 결과: 입력하세요 (Pass/Fail/Blocked/Skip)
- 메모: (예: ngrok일 때 경고 우회 헤더 필요 등)
- 스크린샷/링크: 입력하세요

### [chat] POST /api/v1/chat/
- Screen/Trigger: 스트리밍 실패 시 폴백 호출
- 기대(UI): 최종 응답 1회로 메시지 대체, 세션 ID 저장
- 기대(Network): 200 JSON(메시지/대화 ID)
- 실제(UI): 입력하세요
- 실제(Network): 입력하세요
- 사용현황: In-Use
- 결과: 입력하세요
- 메모: (예: LLM 크레딧 부족 시 400 발생)

### [chat] GET /api/v1/chat/sessions
- Screen/Trigger: LNB 진입/리프레시
- 기대(UI): 최근 세션 목록 시간순 정렬, 더보기 페이징
- 기대(Network): 200 Array
- 실제(UI/Network): 입력하세요
- 사용현황: In-Use
- 결과/메모: 입력하세요

### [chat] GET /api/v1/chat/history/{conversation_id}
- Screen/Trigger: LNB 항목 클릭
- 기대(UI): 메시지 복원, 컨텍스트 블록 분리 렌더
- 기대(Network): 200 JSON(메시지 배열)
- 실제(UI/Network): 입력하세요
- 사용현황: In-Use
- 결과/메모: 입력하세요

### [chat] DELETE /api/v1/chat/history/{conversation_id}
- Screen/Trigger: LNB 케밥 → Delete
- 기대(UI): 삭제 후 목록 갱신, 토스트
- 기대(Network): 200/204
- 실제(UI/Network): 입력하세요
- 사용현황: In-Use
- 결과/메모: 입력하세요

### [chat] POST /api/v1/chat/approve
- Screen/Trigger: HITL 승인/거부
- 기대(UI): 승인 패널 닫힘, 상태 토스트/알럿
- 기대(Network): 200
- 실제(UI/Network): 입력하세요
- 사용현황: In-Use
- 결과/메모: 입력하세요

### [portfolio] GET /api/v1/portfolio/
- Screen/Trigger: /portfolio 진입
- 기대(UI): 요약 카드(총액/수익/현금), 차트 데이터 렌더
- 기대(Network): 200 JSON `{ summary, holdings[] }`
- 실제(UI/Network): 입력하세요 (필드 누락/이름 변형 시 메모)
- 사용현황: In-Use
- 결과/메모: 입력하세요

### [portfolio] GET /api/v1/portfolio/chart-data
- Screen/Trigger: APICheckPanel에서만 호출
- 기대(Network): 200 JSON(트리맵/파이 등)
- 실제(Network): 입력하세요
- 사용현황: Healthcheck-Only
- 결과/메모: 입력하세요

### [dashboard] GET /api/v1/dashboard/
- Screen/Trigger: (홈 요약 위젯 도입 시)
- 기대(UI/Network): 총자산/최근 활동 요약 노출
- 실제: 입력하세요
- 사용현황: Not-Used
- 결과/메모: 입력하세요

### [stocks] 검색/상세/차트/분석 (4종)
- Screen/Trigger: (검색/상세/차트 UX 도입 시)
- 기대: 코드/이름 검색, 상세 정보/차트/분석
- 사용현황: Not-Used
- 결과/메모: 입력하세요

### [settings] GET/PUT 자동화 레벨
- Screen/Trigger: 마이페이지 자동화 레벨 UI
- 기대: 현재 레벨 조회/변경 반영
- 실제: 입력하세요
- 사용현황: GET/levels=Healthcheck-Only, PUT=Planned
- 결과/메모: 입력하세요

### [artifacts] POST / GET 상세
- Screen/Trigger: 서버 저장/상세 UX 도입 시
- 기대: 서버 아티팩트 생성/조회
- 사용현황: Not-Used (현재 로컬 스토어)
- 결과/메모: 입력하세요

### [approvals] GET 목록/상세
- Screen/Trigger: 승인 이력 화면 도입 시
- 기대: 승인 이력/상세 조회
- 사용현황: 목록=Healthcheck-Only, 상세=Not-Used
- 결과/메모: 입력하세요

---

## C. 공통 트러블슈팅
- CORS(프리뷰): 백엔드 허용 Origin에 브랜치 프리뷰 도메인 추가, `allow_headers=["*"]`(ngrok 헤더 포함)
- ngrok 경고 HTML: 프런트는 `ngrok-skip-browser-warning: true` 자동 첨부(백엔드 프리플라이트 허용 필요)
- SSE: 200 + `text/event-stream` + `Cache-Control: no-cache` 확인, 실패 시 REST 폴백 동작
- 스키마: 포트폴리오 `summary.total_value/profit/profit_rate/cash`, `holdings[]` 제공 권장(키 변형 시 메모)
