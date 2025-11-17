# About 페이지 - Economic Viability & Scalability 섹션 구현

> 제안 4: Business Model 섹션 통합 (경제성 + 확장성)

---

## 1. 전체 레이아웃 구조

```
┌──────────────────────────────────────────────────────────────┐
│          Economic Viability & Scalable Business Model         │
│                                                                │
│  ┌─────────────────────────┬─────────────────────────────┐  │
│  │  TAM / SAM / SOM        │   Expected MAU              │  │
│  │  (3개 원 다이어그램)     │   (큰 숫자 강조)             │  │
│  └─────────────────────────┴─────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Scalable Growth Path                                  │  │
│  │                                                         │  │
│  │  Phase 1: B2C (2025)    →    Phase 2: B2B (2026+)     │  │
│  │  ┌─────────────────┐         ┌─────────────────┐      │  │
│  │  │ 개인 투자자      │  ─────→ │ 자산운용사       │      │  │
│  │  │ ₩9,900/월       │         │ Enterprise      │      │  │
│  │  └─────────────────┘         └─────────────────┘      │  │
│  │                                                         │  │
│  │  "Same AI technology, scaled for different markets"    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Cost Optimization & Competitive Pricing               │  │
│  │  (시연 중 설명용 - 토큰 비용 최적화)                     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. 다이어그램 상세 설계

### 2-1. TAM/SAM/SOM 다이어그램

**시각화 방식:** 3개의 동심원 (Concentric Circles)

```
        ┌─────────────────────────────────┐
        │                                 │
        │    ┌─────────────────────┐     │
        │    │                     │     │
        │    │   ┌───────────┐    │     │
        │    │   │   SOM     │    │     │  TAM
        │    │   │  71억 원   │    │     │  2,846억 원
        │    │   └───────────┘    │     │
        │    │       SAM          │     │
        │    │      1,423억 원     │     │
        │    └─────────────────────┘     │
        │                                 │
        └─────────────────────────────────┘

        각 원 위에 레이블:
        - TAM: "1,423만 명" (outer)
        - SAM: "711만 명" (middle)
        - SOM: "35.5만 명" (inner)
```

**구현 방법:**
- SVG 사용 (반응형)
- 각 원에 마우스 호버 시 상세 정보 툴팁
- 색상: 바깥→안쪽으로 진해짐 (light blue → blue → dark blue)

**React 컴포넌트:**
```tsx
<TAMSAMSOMDiagram
  tam={{ value: 284600000000, users: 14230000, label: "TAM" }}
  sam={{ value: 142300000000, users: 7115000, label: "SAM" }}
  som={{ value: 7100000000, users: 355000, label: "SOM" }}
/>
```

### 2-2. Expected MAU 표시

**시각화 방식:** 큰 숫자 + 설명

```
┌─────────────────────────────┐
│      Expected MAU            │
│                              │
│        250,000               │  ← 큰 폰트 (48px+)
│                              │
│   (약 25만 명)                │  ← 작은 폰트
│                              │
│   * 연간 활성 사용자 대비     │
│     70% 월간 활성화 가정      │
└─────────────────────────────┘
```

**React 컴포넌트:**
```tsx
<MAUDisplay
  value={250000}
  description="연간 활성 사용자 대비 70% 월간 활성화 가정"
/>
```

### 2-3. Scalable Growth Path (Phase 다이어그램)

**시각화 방식:** 화살표로 연결된 2개 카드

```
┌──────────────────┐              ┌──────────────────┐
│  Phase 1: B2C    │              │  Phase 2: B2B    │
│                  │   ────────→  │                  │
│  🧑‍💼 개인 투자자   │              │  🏢 자산운용사     │
│                  │              │     증권사        │
│  ₩9,900/월       │              │                  │
│                  │              │  맞춤형 가격       │
│  2025 Q1-Q2      │              │  2025 Q3-Q4      │
└──────────────────┘              └──────────────────┘

         "Same AI technology, scaled for different markets"
```

**카드 내용:**

**Phase 1 (B2C):**
- 타겟: 개인 투자자 (20-40대)
- 가격: ₩9,900/월
- 기능: 프리미엄 AI 분석, 실시간 알림
- 출시: 2025 Q1-Q2

**Phase 2 (B2B):**
- 타겟: 자산운용사, 증권사
- 가격: 맞춤형 (Enterprise)
- 기능: API 연동, 대량 포트폴리오 관리
- 출시: 2025 Q3-Q4

**React 컴포넌트:**
```tsx
<PhaseRoadmap
  phases={[
    {
      id: 1,
      title: "Phase 1: B2C",
      target: "개인 투자자",
      pricing: "₩9,900/월",
      timeline: "2025 Q1-Q2",
      icon: "🧑‍💼"
    },
    {
      id: 2,
      title: "Phase 2: B2B",
      target: "자산운용사, 증권사",
      pricing: "맞춤형 가격",
      timeline: "2025 Q3-Q4",
      icon: "🏢"
    }
  ]}
/>
```

---

## 3. "Why We Can Scale" 개선 (쉬운 언어)

**기존 (복잡함):**
- 🏗️ Modular Architecture
- 🔒 Enterprise-Ready Security
- 🎨 White-Label Solution

**개선 (쉬운 언어):**

```markdown
### 왜 확장 가능한가?

HAMA는 개인 투자자 1명이 쓰든, 자산운용사가 1000명 고객을 관리하든 **같은 AI 기술**로 작동합니다.

✅ **검증된 AI 기술**
   - 5개 전문 AI 에이전트가 협업하는 시스템
   - 개인도, 기관도 동일한 분석 품질

✅ **유연한 구조**
   - 개인: 1개 포트폴리오 관리
   - 기관: 수백 개 포트폴리오 동시 관리 가능

✅ **비용 효율적**
   - 프롬프트 캐싱으로 AI 비용 최소화
   - 규모가 커질수록 단가 하락
```

---

## 4. i18n 구조 (영어/한국어)

### 번역 키 구조

```json
// locales/ko/translation.json
{
  "about": {
    "economic": {
      "title": "경제성 및 확장 가능한 비즈니스 모델",
      "tam": {
        "label": "TAM (전체 시장)",
        "value": "2,846억 원",
        "users": "1,423만 명"
      },
      "sam": {
        "label": "SAM (유효 시장)",
        "value": "1,423억 원",
        "users": "711만 명"
      },
      "som": {
        "label": "SOM (초기 목표 시장)",
        "value": "71억 원",
        "users": "35.5만 명"
      },
      "mau": {
        "title": "예상 MAU",
        "value": "250,000",
        "description": "연간 활성 사용자 대비 70% 월간 활성화 가정"
      },
      "scalability": {
        "title": "왜 확장 가능한가?",
        "reason1": {
          "title": "검증된 AI 기술",
          "description": "5개 전문 AI 에이전트가 협업하는 시스템"
        },
        "reason2": {
          "title": "유연한 구조",
          "description": "개인부터 기관까지 동시 관리 가능"
        },
        "reason3": {
          "title": "비용 효율적",
          "description": "프롬프트 캐싱으로 AI 비용 최소화"
        }
      },
      "phases": {
        "tagline": "Same AI technology, scaled for different markets",
        "phase1": {
          "title": "Phase 1: B2C",
          "target": "개인 투자자 (20-40대)",
          "pricing": "₩9,900/월",
          "timeline": "2025 Q1-Q2"
        },
        "phase2": {
          "title": "Phase 2: B2B",
          "target": "자산운용사, 증권사",
          "pricing": "맞춤형 가격",
          "timeline": "2025 Q3-Q4"
        }
      }
    }
  }
}
```

```json
// locales/en/translation.json
{
  "about": {
    "economic": {
      "title": "Economic Viability & Scalable Business Model",
      "tam": {
        "label": "TAM (Total Addressable Market)",
        "value": "₩284.6B",
        "users": "14.23M"
      },
      "sam": {
        "label": "SAM (Serviceable Available Market)",
        "value": "₩142.3B",
        "users": "7.12M"
      },
      "som": {
        "label": "SOM (Serviceable Obtainable Market)",
        "value": "₩7.1B",
        "users": "355K"
      },
      "mau": {
        "title": "Expected MAU",
        "value": "250,000",
        "description": "70% monthly activation of annual active users"
      },
      "scalability": {
        "title": "Why We Can Scale",
        "reason1": {
          "title": "Proven AI Technology",
          "description": "5 specialized AI agents working together"
        },
        "reason2": {
          "title": "Flexible Architecture",
          "description": "From individual to institutional management"
        },
        "reason3": {
          "title": "Cost Efficient",
          "description": "AI cost minimization with prompt caching"
        }
      },
      "phases": {
        "tagline": "Same AI technology, scaled for different markets",
        "phase1": {
          "title": "Phase 1: B2C",
          "target": "Individual Investors (Age 20-40)",
          "pricing": "₩9,900/month",
          "timeline": "2025 Q1-Q2"
        },
        "phase2": {
          "title": "Phase 2: B2B",
          "target": "Asset Managers, Securities Firms",
          "pricing": "Custom Pricing",
          "timeline": "2025 Q3-Q4"
        }
      }
    }
  }
}
```

---

## 5. React 컴포넌트 구조

```
src/components/about/
├── EconomicViabilitySection.tsx    (메인 섹션)
├── TAMSAMSOMDiagram.tsx            (3원 다이어그램)
├── MAUDisplay.tsx                   (MAU 숫자 표시)
├── ScalabilityReasons.tsx           (확장 가능 이유 3개)
├── PhaseRoadmap.tsx                 (Phase 1/2 카드)
└── CostOptimization.tsx             (비용 최적화 설명)
```

### 메인 컴포넌트 예시

```tsx
// EconomicViabilitySection.tsx
import { useTranslation } from 'react-i18next';
import TAMSAMSOMDiagram from './TAMSAMSOMDiagram';
import MAUDisplay from './MAUDisplay';
import ScalabilityReasons from './ScalabilityReasons';
import PhaseRoadmap from './PhaseRoadmap';

export default function EconomicViabilitySection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">
          {t('about.economic.title')}
        </h2>

        {/* TAM/SAM/SOM + MAU */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <TAMSAMSOMDiagram />
          <MAUDisplay />
        </div>

        {/* Scalability Reasons */}
        <ScalabilityReasons />

        {/* Phase Roadmap */}
        <PhaseRoadmap />
      </div>
    </section>
  );
}
```

---

## 6. 수정 용이성

### 데이터 중앙 관리

모든 숫자와 텍스트를 **별도 설정 파일**로 분리:

```tsx
// src/config/economicData.ts
export const economicData = {
  tam: {
    value: 284600000000,  // ₩284.6B
    users: 14230000,      // 14.23M
  },
  sam: {
    value: 142300000000,  // ₩142.3B
    users: 7115000,       // 7.12M
  },
  som: {
    value: 7100000000,    // ₩7.1B
    users: 355000,        // 355K
  },
  mau: 250000,            // 250K
  pricing: {
    b2c: 9900,            // ₩9,900/month
    b2b: "custom",
  },
  timeline: {
    phase1: "2025 Q1-Q2",
    phase2: "2025 Q3-Q4",
  }
};
```

**숫자 수정 시:**
- `economicData.ts` 파일 하나만 수정
- 모든 컴포넌트에 자동 반영

**번역 수정 시:**
- `locales/ko/translation.json` 또는 `locales/en/translation.json` 수정
- 즉시 반영

---

## 7. 시연 중 설명 전략

### 다이어그램이 로딩되는 동안 (약 3-5초)

**시연자 멘트:**
> "HAMA는 개인 투자자를 위한 AI 도구로 시작하지만, 금융 기관까지 확장 가능한 플랫폼으로 설계되었습니다.
>
> **TAM**은 국내 전체 주식 투자자 1,423만 명, 약 2,846억 원 규모의 시장이고,
>
> 저희가 초기에 목표로 하는 **SOM**은 20-40대 디지털 투자자 약 35만 명, 71억 원 규모입니다.
>
> 이를 통해 예상 **월간 활성 사용자는 25만 명** 수준입니다."

### Cost Optimization 부분 (토글 또는 별도 대시보드)

**질문 받을 때만 보여주기:**
> "AI 비용 최적화는 프롬프트 캐싱, 모델 선택, 배치 처리 등을 통해 달성할 수 있습니다.
>
> 자세한 비용 구조는 [별도 대시보드 열기]에서 확인하실 수 있습니다."

---

## 8. 최종 체크리스트

- [ ] TAM/SAM/SOM 다이어그램 구현 (SVG)
- [ ] MAU 숫자 큰 폰트로 표시
- [ ] Phase 1/2 카드 디자인
- [ ] 확장 가능 이유 3가지 (쉬운 언어)
- [ ] i18n 번역 키 추가 (ko/en)
- [ ] `economicData.ts` 설정 파일 생성
- [ ] 반응형 레이아웃 (mobile/tablet/desktop)
- [ ] 호버 애니메이션 (Phase 카드)
- [ ] 로딩 상태 처리

---

이제 구체적으로 구현할 준비가 되었습니다! 추가 질문이나 수정 사항 있으면 말씀해주세요.
