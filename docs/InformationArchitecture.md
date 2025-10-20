# HAMA Frontend - Information Architecture (IA)

**Version:** 1.0

**Last Updated:** 2025-10-20

**Related:** PRD v3.0

---

## IA Diagram (ASCII)

```
HAMA Application
│
├─── [온보딩 플로우] (Phase 3)
│    │
│    └─── 투자 성향 분석
│         ├─ Q1: 투자 목적 및 기간
│         ├─ Q2: 투자 스타일 (페르소나 선택)
│         ├─ Q3: 자산 대비 투자 비중
│         └─ Q4: AI 파트너 타입 (자동화 레벨)
│         └─→ 결과: 투자 성향 + 자동화 레벨 추천
│
├─── [메인 플로우]
│    │
│    ├─── Chat 페이지 (/) ⭐ Phase 1
│    │    │
│    │    ├─ [View] Empty State
│    │    │  └─ 4개 제안 카드
│    │    │     ├─ "포트폴리오 현황 보여줘"
│    │    │     ├─ "오늘 시장 분석해줘"
│    │    │     ├─ "삼성전자 추천해줘"
│    │    │     └─ "내 포트폴리오 리스크 분석해줘"
│    │    │
│    │    ├─ [View] 메시지 뷰
│    │    │  ├─ 사용자 메시지 (말풍선)
│    │    │  └─ AI 답변 (전체 너비)
│    │    │     ├─ Markdown 렌더링
│    │    │     ├─ [Toggle] Thinking 섹션
│    │    │     │  └─ 에이전트 단계
│    │    │     │     ├─ Planner (📋)
│    │    │     │     ├─ Researcher (🔍)
│    │    │     │     └─ Strategy (💡)
│    │    │     └─ [Action] "Save as Artifact"
│    │    │
│    │    └─ [Component] Persistent Chat Input (하단 고정)
│    │       ├─ Text Input (최대 5000자)
│    │       ├─ Enter: 전송
│    │       ├─ Shift+Enter: 줄바꿈
│    │       └─ 4900자 이상: 글자 수 표시
│    │
│    ├─── [Panel] HITL 승인 (우측 오버레이) ⭐ Phase 1
│    │    │
│    │    ├─ [Section] 주문 정보
│    │    │  ├─ 종목명, 종목코드
│    │    │  ├─ 수량, 가격
│    │    │  └─ 총 금액
│    │    │
│    │    ├─ [Section] 리스크 경고
│    │    │  ├─ 현재 비중 → 예상 비중
│    │    │  ├─ 경고 문구
│    │    │  └─ [Chart] 예상 포트폴리오 미리보기 (원 그래프)
│    │    │
│    │    ├─ [Section] 권장 대안 (Optional)
│    │    │  └─ 금액 조정 / 분산 투자 제안
│    │    │
│    │    └─ [Action]
│    │       ├─ 승인 버튼 (Primary)
│    │       └─ 거부 버튼 (Secondary)
│    │
│    ├─── Portfolio 페이지 (/portfolio) ⭐ Phase 1-2
│    │    │
│    │    ├─ [Section] 포트폴리오 개요 (Phase 1)
│    │    │  ├─ 총 평가금액
│    │    │  ├─ 총 수익률 (%, 금액)
│    │    │  ├─ 보유 종목 수
│    │    │  └─ 현금 보유액
│    │    │
│    │    ├─ [Section] 차트 시각화 (Phase 1) ⚠️ 우선순위 상향
│    │    │  │
│    │    │  ├─ [Control] 차트 타입 선택
│    │    │  │  ├─ 트리맵 (기본)
│    │    │  │  ├─ 원 그래프
│    │    │  │  └─ 막대 그래프
│    │    │  │
│    │    │  └─ [Chart] 종목별 비중
│    │    │     └─ [Interaction] 클릭 → 종목 상세
│    │    │
│    │    └─ [Component] Persistent Chat Input (하단 고정)
│    │       └─ 포트폴리오 기반 질문 유도
│    │          예: "삼성전자 비중 늘려줘"
│    │
│    ├─── Artifacts 페이지 (/artifacts) Phase 3
│    │    │
│    │    ├─ [View] 목록 그리드
│    │    │  ├─ 저장된 Artifact 카드
│    │    │  │  ├─ 제목 (첫 줄)
│    │    │  │  ├─ 미리보기 (3줄)
│    │    │  │  └─ 저장 일시
│    │    │  │
│    │    │  └─ [Empty State] "저장된 Artifact가 없습니다"
│    │    │
│    │    └─ [View] 상세 뷰 (/artifacts/:id)
│    │       ├─ 전체 Markdown 내용
│    │       ├─ [Action] "채팅 시작" (추가 질문)
│    │       └─ [Component] Persistent Chat Input (우측 고정)
│    │
│    └─── Discover 페이지 (/discover) Phase 4
│         │
│         ├─ [Section] 뉴스 피드 (Perplexity 스타일)
│         │  ├─ 뉴스 기사 요약 카드
│         │  └─ 외부 링크
│         │
│         └─ [Sidebar] 시장 정보
│            ├─ 코스피/코스닥 지수
│            ├─ 인기 종목 차트
│            └─ 환율 정보
│
└─── [설정 플로우]
     │
     └─── My Page (/settings) Phase 2
          │
          ├─ [Section] 자동화 레벨 설정
          │  ├─ [Progress Bar] 현재 레벨 시각화
          │  │  └─ HITL 개입 지점 표시
          │  │     [Advisor] ── [Copilot] ── [Pilot]
          │  │              👤 HITL      Some Auto
          │  │
          │  └─ [Radio] 레벨 선택
          │     ├─ ◉ 어드바이저: 정보만 제공
          │     ├─ ○ 코파일럿: 모든 매매 승인 필요
          │     └─ ○ 파일럿: 일부 자동 실행
          │
          ├─ [Section] 투자 성향 프로필 (Phase 3) ⚠️ 우선순위 상향
          │  ├─ 기존 4단계 분류
          │  │  └─ "공격투자형"
          │  │
          │  └─ LLM 생성 서술형 프로필
          │     ├─ 매매 패턴
          │     ├─ 선호 섹터
          │     ├─ 리스크 성향
          │     └─ 포트폴리오 전략
          │
          ├─ [Section] 언어 설정 (Phase 1 구조)
          │  └─ [Dropdown] 한국어 / English
          │
          └─ [Section] 테마 설정 (Phase 2)
             └─ [Toggle] 라이트 / 다크 모드

```

---

## Global Components (모든 페이지 공통)

```
[Global Shell]
│
├─── [Left Navigation Bar (LNB)]
│    │
│    ├─ [Header]
│    │  ├─ HAMA 로고
│    │  └─ [Toggle] 사이드바 접기/펼치기
│    │
│    ├─ [Navigation Menu]
│    │  ├─ 📝 채팅 (기본 화면)
│    │  ├─ 📊 Portfolio (Phase 2)
│    │  ├─ 🗂️ Artifacts (Phase 3)
│    │  ├─ 👤 My Page (Phase 2)
│    │  └─ 🔍 Discover (Phase 4)
│    │
│    └─ [Recent Chats]
│       ├─ 최근 채팅 목록 (최대 10개)
│       │  ├─ 채팅 제목 (첫 메시지)
│       │  ├─ 마지막 활동 시간
│       │  └─ [Badge] HITL 승인 대기 (있을 경우)
│       │
│       └─ [Active Highlight] 현재 채팅 강조
│
└─── [Persistent Chat Input] (특정 페이지에서만)
     │
     ├─ 적용 페이지:
     │  ├─ ✅ Chat 페이지 (하단)
     │  ├─ ✅ Portfolio 페이지 (하단)
     │  └─ ✅ Artifact 상세 (우측)
     │
     └─ 미적용 페이지:
        ├─ ❌ Artifacts 목록
        └─ ❌ My Page
```