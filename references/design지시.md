Only code in HTML/Tailwind in a single code block.  
Any CSS styles should be in the style attribute.  
Start with a response, then code and finish with a response.  
Don't mention about tokens, Tailwind or HTML.  
Always include the html, head and body tags.  
Use lucide icons for javascript, 1.5 strokewidth.  
Unless style is specified by user, design in the style of Linear, Stripe, Vercel, Tailwind UI (IMPORTANT: don't mention names).  
Checkboxes, sliders, dropdowns, toggles should be custom (don't add, only include if part of the UI).  
Be extremely accurate with fonts. For font weight, use one level thinner: for example, Bold should be Semibold. Titles above 20px should use tracking-tight.  
Make it responsive.  
Avoid setting tailwind config or css classes, use tailwind directly in html tags.  
If there are charts, use chart.js for charts (avoid bug: if your canvas is on the same level as other nodes: h2 p canvas div = infinite grows. h2 p div>canvas div = as intended.).  
Add subtle dividers and outlines where appropriate.  
Don't put tailwind classes in the html tag, put them in the body tags.  
If no images are specified, use these Unsplash images like faces, 3d, render, etc.  
Be creative with fonts, layouts, be extremely detailed and make it functional.  
If design, code or html is provided, IMPORTANT: respect the original design, fonts, colors, style as much as possible.  
Don't use javascript for animations, use tailwind instead.  
Add hover color and outline interactions.  
For tech, cool, futuristic, favor dark mode unless specified otherwise.  
For modern, traditional, professional, business, favor light mode unless specified otherwise.  
Use 1.5 strokewidth for lucide icons and avoid gradient containers for icons.  
Use subtle contrast.  
For logos, use letters only with tight tracking.  
Avoid a bottom right floating DOWNLOAD button.


## 1. 글로벌 UI 및 핵심 레이아웃

- **핵심 원칙:** 챗(Chat) 기능이 서비스의 가장 핵심입니다.
    
- **지속적인 챗 프롬프트:** 사용자가 어느 페이지(탭)를 탐색하든, **챗 프롬프트 입력창이 항상 화면 중앙 하단에 떠 있어야 합니다** (Perplexity UI 참고).
    
- **기본 화면:** 사용자가 서비스를 처음 열면, 빈 채팅창이 기본으로 나옵니다.
    
- **탐색 (LNB):**
    
    - 화면 좌측 상단에 '펼치기/닫기' 토글 버튼이 존재합니다.
        
    - 이 버튼을 누르면 **왼쪽 사이드바 (LNB)**가 나타납니다.
        

## 2. 메인 챗 경험 (Chat View)

- **대화 형식:** 기본적으로 ChatGPT와 같은 대화형 UI를 따릅니다.
    
- **UI 구분 (Gemini 참고):**
    
    - **사용자 질문:** 일반적인 '말풍선' 형태로 표시됩니다.
        
    - **LLM 답변:** 말풍선으로 구분되는 것이 아니라, **페이지 너비 전체를 활용**하여 답변 내용을 표시합니다. (Gemini UI 참고)
        
- **답변 형식:**
    
    - LLM의 모든 답변은 **마크다운(Markdown)을 완벽하게 지원**해야 합니다 (테이블, 리스트, 코드 블록 등).
        
    - **Thinking 표시:** LLM이 답변을 생성하는 동안 "Thinking..."과 같은 상태가 자동으로 표시되어야 하며, 이 "Thinking"의 상세 내용은 사용자가 **토글(접었다 폈다) 가능**해야 합니다.
        
- **Artifacts (콘텐츠 저장):**
    
    - LLM이 반환하는 모든 답변(특히 보고서 형태)에는 **"저장하기" (Save as Artifact) 버튼**이 있어야 합니다. (Claude Artifacts 참고)
        
    - 사용자가 이 버튼을 누르면 해당 결과(답변)가 'Artifact'로 저장됩니다.
        

## 3. 인-챗(In-Chat) 시각화: HITL 및 에이전트 활동

채팅이 진행되는 동안 발생하는 두 가지 핵심 시각화 요소가 있습니다.

### 3.1. HITL (Human-in-the-Loop) 과정 (필수 표시)

- **표시 정책:**
 HITL 개입(예: 리스크 경고, 최종 매매 승인)이 필요한 경우, 이 컴포넌트는 등장할 경우에 뷰 닫기 등으로 닫을 수 없으며 무조건 나타나야 합니다.
    
- **구현 형태:** 옆에 화면 반을 차지하여 펼쳐지는 모양 (클로드의 채팅창 속 artifact가 옆에 떠있는 모양 참조)

### 3.2. LangGraph 에이전트 활동 (선택적 토글 뷰)

- **기능:** LangGraph가 현재 어떤 노드를 실행 중인지 실시간으로 시각화하여 보여줍니다.
    
- **표시 정책:** 이 뷰는 사용자가 **'뷰 토글' 버튼**을 이용해 켜거나 닫을 수 있어야 합니다. (예: 채팅창 한쪽에 작은 토글 버튼)
    
- **실시간 추론:** 에이전트가 실시간으로 어떤 추론을 하고 있는지(예: `astream_events` 스트림)를 보여주는 별도의 뷰(창)를 마련합니다. (이 역시 위 토글 뷰에 포함될 수 있습니다.)
    
- **구현 사양 (요청사항 명시):**
    
    1. **[백엔드]** 그래프를 `.invoke()` 대신 `.astream_events()`로 실행합니다.
        
    2. **[백엔드]** `astream_events` 스트림을 감시합니다.
        
    3. **[백엔드]** `on_chain_start` 이벤트 발생 시 `event['name']` (예: "planner")을 확인합니다.
        
    4. **[백엔드]** "planner" 같은 노드 이름을 "📋 계획 수립 중..."과 같이 한글 메시지로 번역합니다.
        
    5. **[백엔드]** **SSE(Server-Sent Events)**를 사용해 이 한글 메시지를 프론트엔드로 즉시 Push 합니다.
        
    6. **[프론트엔드]** **`EventSource`**로 메시지를 받아 특정 `<span>` 태그 등의 텍스트를 실시간으로 업데이트합니다.
        

## 4. 왼쪽 사이드바 (LNB) 및 페이지 구성

LNB(왼쪽 사이드바)는 다음과 같은 탭(페이지) 목록을 포함합니다. 또한, LNB 영역 자체에는 **지난 채팅 기록들(Chat History)이 길게 나열**되어야 합니다 (Claude/Gemini 사이드바 참고).

1. **챗 (Chat) 탭**
    
2. **아티팩트 (Artifacts) 탭**
    
3. **포트폴리오 (Portfolio) 탭**
    
4. **마이페이지 (My Page) 탭**
    
5. **(P1) 디스커버 (Discover) 탭**
    

---

## 5. 각 페이지별 상세 요구사항

### 5.1. 챗 (Chat) 페이지

- LNB의 '챗' 탭을 선택하면 이 페이지로 이동합니다.
    
- 이 페이지는 LNB에 축약되어 보이는 '지난 채팅 기록들'의 **전체 목록을 보여주는 페이지**입니다 (Claude의 'Your chat history' 화면 참고).
    

### 5.2. 아티팩트 (Artifacts) 페이지

- **뷰 형태:** 저장된 Artifacts(보고서, 분석 결과 등)가 **카드 뷰(Card View)** 형식으로 나열됩니다.
    
- **카드 표시 정보:** 각 카드에는 Artifact의 '제목'과 '간단한 날짜'가 작게 표시됩니다.
    
- **상세 뷰:**
    
    - 카드를 클릭하면, 해당 Artifact가 **화면 전체를 채우는 상세 뷰**로 열립니다.
        
    - 상세 뷰에는 상세 날짜와 저장된 콘텐츠(마크다운, 그래프 등)가 표시됩니다.
        
    - **중요:** 이 상세 뷰 하단에도 **글로벌 챗 프롬프트가 동일하게 존재**해야 합니다.
        
- **컨텍스트 연계 챗:**
    
    - 사용자가 Artifact 상세 뷰에서 챗을 시작하면, **현재 보고 있는 Artifact의 내용이 자동으로 프롬프트 컨텍스트로 포함**되어 새 챗을 시작합니다.
        
    - 이를 위해 모든 Artifact(그래프 포함)는 **텍스트화(Text-serializable)**가 가능해야 합니다.
        
- **콘텐츠 종류:** 기업 분석 리포트, Bull/Bear 토론(두 가지 의견을 마크다운 UI로 명확히 비교), 차트/그래프 등. (모든 종류의 콘텐츠는 동일한 상세 뷰 레이아웃을 재사용합니다.)
    
- **저장 방식 (시연용):** 백엔드 DB가 아닌, **프론트엔드 캐시(Cache)**를 사용해 저장합니다. (시연자가 시연할 때마다 생성된 것만 저장되도록)
    

### 5.3. 포트폴리오 (Portfolio) 페이지

- **원칙:** '대시보드'와 '내 포트폴리오'를 **따로 두지 않고 하나의 페이지로 통합**합니다.
    
- **UI 참고:** **PilePeak.ai**의 대시보드 창 UI를 따릅니다.
- 참고로 pilepeak.ai의 대시보드 창 UI에서 포트폴리오 구성을 나타내는 UI의 경우 1. 트리맵, 2. 원그래프, 3. 누적막대그래프 셋 중 하나로 선택할 수 있게 합니다. 기본적으로는 트리맵이 기본적입니다.
    
- **표시 정보 (시연용 핵심):**
    
    - 총 보유 자산 (Total Assets)
        
    - 보유 중인 국내 주식 목록 (Holdings)
        
    - 총 수익 및 수익률 (Total Profit / P&L %)
        
    - 월간 성장률 (Avg. monthly growing)
        
    - (환전 등 복잡한 기능은 제외합니다.)
        

### 5.4. 마이페이지 (My Page) / 설정

- **사용자 정보:** 사용자 이름, 나이
    
- **계정 연동:** 현재 연결된 계정 확인 (예: "한국투자증권 연결됨" - 텍스트만 표시)
    
- **자동화 레벨 설정 (핵심):**
    
    - 사용자가 자신의 자동화 레벨을 선택/변경할 수 있는 섹션.
        
    - 옵션: [파일럿 모드], [코파일럿 모드], [어드바이저 모드]
		(나중에는 모드 설정 뿐 아니라 세부 설정 편집도 가능하도록 상세 설정 버튼(아직 작동 안함)도 만들어줍니다.)
        
- **투자 성향:** 사용자의 투자 성향 표시 (예: "공격투자형")
    
- **온보딩 체험:**
    
    - "온보딩 체험하기" 버튼이 이 페이지 하단에 위치합니다.
        

### 5.5. 디스커버 (Discover) 페이지 (낮은 우선순위)

- **UI 참고:** **Perplexity의 Finance 탭** UI를 모방합니다.
    
- **레이아웃:**
    
    - **메인 (좌측):** 금융/투자 관련 기사들이 위에서 아래로 피드 형식으로 나열됩니다.
        
    - **사이드 (우측):** 대표적인 시장 지수, 인기 종목 현황 등이 간단한 그래프와 함께 표시됩니다.
        

### 5.6. 온보딩 (Onboarding) 프로세스

- **목적:** 실제 서비스 가입 시 단 1회 진행하는 것이 아닌, 서비스의 온보딩 과정을 '보여주는' **체험형 데모**입니다.
    
- **진입점:** '마이페이지'에 있는 **"온보딩 체험하기" 버튼**을 눌러 시작합니다.
    
- **내용:** "아, 이런 식으로 투자 성향과 자동화 레벨을 설정하는구나"를 사용자가 이해할 수 있게 하는 플로우입니다.

## 6. 색상 및 톤
### 1. 전체 색상 테마 (Overall Color Theme)

- **파일피크(PilePeak.ai)의 톤을 따름 🎨**
    
- 즉, 서비스 전반적으로 파일피크의 **밝고(Light Mode) 깔끔한** 색상 테마(흰색 배경, 검은색/회색 텍스트, 포인트 컬러)를 기본으로 사용합니다.
    

### 2. 구조 및 레이아웃 (Layout & Structure)

- **껍데기 및 LNB (Shell & LNB):**
    
    - **클로드(Claude)의 _구조_**를 차용합니다.
        
    - (색상은 1번의 라이트 모드를 따르되) 좌측에 사이드바가 있고, 챗 히스토리, Artifacts, 포트폴리오 등의 탭이 있는 구조를 의미합니다.
        
- **챗 인터페이스 (Chat UI):**
    
    - **제미니(Gemini)의 _레이아웃_**을 차용합니다.
        
    - (색상은 1번의 라이트 모드를 따르되) 사용자 질문은 말풍선, AI 답변은 페이지 전체 너비를 활용하는 가독성 높은 레이아웃을 사용합니다.
        
- **포트폴리오 페이지 (Portfolio Page):**
    
    - **파일피크(PilePeak.ai)의 _레이아웃과 톤_**을 그대로 가져옵니다.
        
    - 어차피 전체 테마가 파일피크를 따르므로, 이 페이지는 트리맵, 차트, 데이터 구성 등 파일피크의 대시보드 디자인을 가장 충실하게 구현합니다.