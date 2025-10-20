**Version:** 1.0

**Last Updated:** 2025-10-20

**Parent Document:** PRD v3.0

---

## 1. System Architecture

### 1.1 Frontend Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Global Shell + LNB
│   ├── page.tsx           # Chat Page (default)
│   ├── portfolio/         # Portfolio Page
│   ├── artifacts/         # Artifacts Page
│   └── settings/          # My Page
│
├── components/
│   ├── chat/
│   │   ├── ChatMessage.tsx
│   │   ├── ThinkingSection.tsx
│   │   ├── ChatInput.tsx
│   │   └── EmptyState.tsx
│   │
│   ├── hitl/
│   │   └── ApprovalPanel.tsx
│   │
│   ├── portfolio/
│   │   ├── PortfolioChart.tsx
│   │   ├── TreemapChart.tsx
│   │   ├── PieChart.tsx
│   │   └── BarChart.tsx
│   │
│   └── layout/
│       ├── Shell.tsx
│       ├── LNB.tsx
│       └── PersistentChatInput.tsx
│
├── lib/
│   ├── api/               # API clients
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript types
│
└── i18n/                  # Translations
    ├── ko.json
    └── en.json

```

---

## 2. Component Specifications

### 2.1 ChatMessage Component

**Related PR:** US-1.1 (기본 대화)

### Props Interface

```tsx
interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;           // Markdown string
  thinking?: ThinkingStep[]; // AI 사고 과정
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  onSaveArtifact?: () => void;
}

interface ThinkingStep {
  agent: 'planner' | 'researcher' | 'strategy';
  description: string;
  timestamp: string;
}

```

### Rendering Rules

1. **User Message:**
    - Gemini 스타일 말풍선
    - 우측 정렬, 최대 너비 70%
    - 배경: `bg-blue-100 dark:bg-blue-900`
2. **AI Message:**
    - 전체 너비 활용
    - Markdown 렌더링 (react-markdown)
    - 코드 블록은 syntax highlighting (react-syntax-highlighter)
3. **Thinking Section:**
    - 기본 접힘 (Collapse)
    - 클릭 시 펼쳐짐
    - 각 Step은 아이콘 + 설명 + 시간

### Error States

```tsx
// 메시지 전송 실패 시
<div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
  <div className="flex items-center gap-2">
    <AlertTriangle size={16} className="text-red-500" />
    <span>전송 실패</span>
  </div>
  <div className="flex gap-2 mt-2">
    <Button onClick={handleRetry}>재전송</Button>
    <Button variant="ghost" onClick={handleDelete}>삭제</Button>
  </div>
</div>

```

---

### 2.2 ApprovalPanel Component

**Related PR:** US-2.1 (매매 승인 필수)

### Props Interface

```tsx
interface ApprovalPanelProps {
  isOpen: boolean;
  onClose?: () => void;  // 사용자가 결정 전까지 호출 불가
  approvalRequest: {
    action: 'buy' | 'sell';
    stock_code: string;
    stock_name: string;
    quantity: number;
    price: number;
    total_amount: number;
    current_weight: number;
    expected_weight: number;
    risk_warning?: string;
    alternatives?: Alternative[];
  };
  onApprove: (adjustments?: Adjustments) => Promise<void>;
  onReject: (reason?: string) => Promise<void>;
}

interface Alternative {
  suggestion: string;
  adjusted_quantity: number;
  adjusted_amount: number;
}

interface Adjustments {
  quantity?: number;
  price?: number;
}

```

### Layout

- Claude Artifacts 스타일 우측 패널
- 너비: 50vw (최소 600px)
- 오버레이: 좌측 50% 어둡게 처리
- Z-index: 50

### Interaction Rules

1. **패널 열림:**
    - Backend `requires_approval: true` 수신 시
    - 애니메이션: 우측에서 슬라이드 인
2. **닫힘 방지:**
    - 오버레이 클릭: 무시
    - ESC 키: 무시
    - 우측 상단 X 버튼: 비활성화
3. **승인/거부 후:**
    - API 호출 완료 후 패널 자동 닫힘
    - 토스트 메시지: "매수 주문이 실행되었습니다"
    - Chat 화면으로 자동 스크롤

### Loading States

```tsx
// 승인 버튼 클릭 시
<Button
  disabled={isApproving}
  className="w-full"
>
  {isApproving ? (
    <>
      <Loader2 className="animate-spin mr-2" size={16} />
      승인 처리 중...
    </>
  ) : (
    '승인'
  )}
</Button>

```

---

### 2.3 PortfolioChart Component

**Related PR:** US-3.1 (포트폴리오 즉시 시각화)

### Props Interface

```tsx
interface PortfolioChartProps {
  data: PortfolioData;
  chartType: 'treemap' | 'pie' | 'bar';
  onChartTypeChange: (type: ChartType) => void;
  onStockClick?: (stockCode: string) => void;
}

interface PortfolioData {
  stocks: Stock[];
  total_value: number;
  total_return: number;
  total_return_percent: number;
}

interface Stock {
  stock_code: string;
  stock_name: string;
  quantity: number;
  current_price: number;
  purchase_price: number;
  weight: number;           // 비중 (0~1)
  return_percent: number;
  sector: string;
}

```

### Chart Library Selection

- **추천:** Recharts (React 친화적, Tree Map 지원)
- **대안:** Chart.js (더 많은 커스터마이징)

### Chart Types Implementation

**1. Treemap (기본)**

```tsx
import { Treemap } from 'recharts';

<Treemap
  data={treemapData}
  dataKey="weight"
  stroke="#fff"
  fill="#8884d8"
  content={<CustomizedContent />}
/>

```

**2. Pie Chart**

```tsx
import { PieChart, Pie, Cell } from 'recharts';

<PieChart>
  <Pie
    data={pieData}
    cx="50%"
    cy="50%"
    labelLine={false}
    label={renderCustomizedLabel}
    outerRadius={80}
    fill="#8884d8"
    dataKey="weight"
  >
    {pieData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
</PieChart>

```

**3. Bar Chart (수익률 순위)**

```tsx
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

<BarChart data={sortedByReturn}>
  <XAxis dataKey="stock_name" />
  <YAxis />
  <Bar dataKey="return_percent" fill="#8884d8" />
</BarChart>

```

### Color Scheme

```tsx
// PilePeak.ai 참조 색상
const CHART_COLORS = {
  positive: '#10B981',  // Green
  negative: '#EF4444',  // Red
  neutral: '#6B7280',   // Gray
  accent: '#3B82F6',    // Blue
};

// 섹터별 색상 (예시)
const SECTOR_COLORS: Record<string, string> = {
  '반도체': '#8B5CF6',
  '배터리': '#F59E0B',
  '금융': '#3B82F6',
  '제약': '#10B981',
  '기타': '#6B7280',
};

```

---

## 3. API Integration

### 3.1 Chat API

**Endpoint:** `POST /api/v1/chat`

### Request

```tsx
interface ChatRequest {
  message: string;
  thread_id: string;
  automation_level: 1 | 2 | 3;  // 어드바이저, 코파일럿, 파일럿
  config?: {
    language?: 'ko' | 'en';
    max_tokens?: number;
  };
}

```

### Response (일반)

```tsx
interface ChatResponse {
  message: string;          // AI 답변 (Markdown)
  thinking?: ThinkingStep[];
  requires_approval: false;
  thread_id: string;
  timestamp: string;
}

```

### Response (HITL 필요)

```tsx
interface ChatResponseWithApproval extends ChatResponse {
  requires_approval: true;
  approval_request: ApprovalRequest;
}

```

### Error Handling

```tsx
try {
  const response = await fetch('/api/v1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chatRequest),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();

  // HITL 체크
  if (data.requires_approval) {
    openApprovalPanel(data.approval_request);
  }

  return data;
} catch (error) {
  console.error('Chat API Error:', error);
  // 사용자에게 에러 메시지 표시
  toast.error('메시지 전송에 실패했습니다. 다시 시도해주세요.');
  return null;
}

```

---

### 3.2 SSE (Server-Sent Events) for Real-time Thinking

**Endpoint:** `GET /api/v1/chat/stream`

### Implementation

```tsx
const eventSource = new EventSource(`/api/v1/chat/stream?thread_id=${threadId}`);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'thinking') {
    // Thinking 섹션 업데이트
    updateThinking(data.step);
  } else if (data.type === 'message') {
    // 최종 답변
    updateMessage(data.content);
  }
};

eventSource.onerror = (error) => {
  console.error('SSE Error:', error);
  eventSource.close();

  // 폴링 모드로 전환 (Fallback)
  startPolling(threadId);
};

```

### Retry Logic

```tsx
function createSSEConnection(threadId: string, retryCount = 0) {
  const maxRetries = 3;
  const backoffMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s

  const eventSource = new EventSource(`/api/v1/chat/stream?thread_id=${threadId}`);

  eventSource.onerror = () => {
    eventSource.close();

    if (retryCount < maxRetries) {
      setTimeout(() => {
        createSSEConnection(threadId, retryCount + 1);
      }, backoffMs);
    } else {
      // 폴링 모드로 전환
      startPolling(threadId);
      toast.warning('실시간 업데이트를 사용할 수 없습니다. 5초마다 새로고침됩니다.');
    }
  };

  return eventSource;
}

```

---

## 4. State Management

### 4.1 Global State (Zustand)

```tsx
// stores/chatStore.ts
import create from 'zustand';

interface ChatStore {
  messages: Message[];
  currentThreadId: string;
  isLoading: boolean;
  approvalPanel: {
    isOpen: boolean;
    data: ApprovalRequest | null;
  };

  // Actions
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  openApprovalPanel: (data: ApprovalRequest) => void;
  closeApprovalPanel: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  currentThreadId: '',
  isLoading: false,
  approvalPanel: {
    isOpen: false,
    data: null,
  },

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  setLoading: (loading) => set({ isLoading: loading }),

  openApprovalPanel: (data) => set({
    approvalPanel: { isOpen: true, data },
  }),

  closeApprovalPanel: () => set({
    approvalPanel: { isOpen: false, data: null },
  }),
}));

```

---

## 5. Performance Optimization

### 5.1 Message List Virtualization

**Problem:** Chat 메시지가 많아지면 렌더링 성능 저하

**Solution:** react-window로 가상 스크롤링

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={messages.length}
  itemSize={100}  // 평균 메시지 높이
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ChatMessage message={messages[index]} />
    </div>
  )}
</FixedSizeList>

```

---

### 5.2 Markdown Rendering Optimization

**Problem:** 긴 Markdown 렌더링 시 지연

**Solution:** React.memo + Code Highlighting Lazy Load

```tsx
import dynamic from 'next/dynamic';

const CodeBlock = dynamic(() => import('./CodeBlock'), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});

const ChatMessage = React.memo(({ content }) => {
  return (
    <ReactMarkdown
      components={{
        code: CodeBlock,
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

```

---

## 6. Error Handling Strategy

### 6.1 Global Error Boundary

```tsx
// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary Caught:', error, errorInfo);
    // 에러 로깅 서비스에 전송 (예: Sentry)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">문제가 발생했습니다</h1>
            <p className="text-gray-600 mb-4">페이지를 새로고침해주세요.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

```

---

### 6.2 API Error Handling

```tsx
// lib/api/errorHandler.ts
export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

export async function handleAPIError(response: Response): Promise<never> {
  const data = await response.json().catch(() => ({}));

  const errorMessage = data.message || '알 수 없는 오류가 발생했습니다';
  const errorCode = data.code;

  throw new APIError(response.status, errorMessage, errorCode);
}

// 사용 예시
try {
  const response = await fetch('/api/v1/chat', options);

  if (!response.ok) {
    await handleAPIError(response);
  }

  return await response.json();
} catch (error) {
  if (error instanceof APIError) {
    // 상태 코드별 처리
    switch (error.status) {
      case 401:
        toast.error('로그인이 필요합니다');
        // 로그인 페이지로 리다이렉트
        break;
      case 429:
        toast.error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요');
        break;
      case 500:
        toast.error('서버 오류가 발생했습니다');
        break;
      default:
        toast.error(error.message);
    }
  }
}

```

---

## 7. Testing Strategy

### 7.1 Unit Tests

```tsx
// __tests__/components/ChatMessage.test.tsx
import { render, screen } from '@testing-library/react';
import ChatMessage from '@/components/chat/ChatMessage';

describe('ChatMessage', () => {
  it('renders user message with correct styling', () => {
    render(
      <ChatMessage
        role="user"
        content="Hello AI"
        timestamp="2025-10-20T10:00:00Z"
      />
    );

    expect(screen.getByText('Hello AI')).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveClass('bg-blue-100');
  });

  it('renders Markdown in AI message', () => {
    render(
      <ChatMessage
        role="assistant"
        content="# Heading\\n\\n- Item 1\\n- Item 2"
        timestamp="2025-10-20T10:00:00Z"
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});

```

---

### 7.2 Integration Tests

```tsx
// __tests__/integration/chat-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPage from '@/app/page';

describe('Chat Flow', () => {
  it('sends message and receives AI response', async () => {
    render(<ChatPage />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요');
    await userEvent.type(input, '삼성전자 분석해줘{enter}');

    // 로딩 스피너 표시
    expect(screen.getByLabelText('로딩 중')).toBeInTheDocument();

    // AI 답변 대기
    await waitFor(() => {
      expect(screen.getByText(/삼성전자 분석 결과/)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('opens HITL approval panel when required', async () => {
    render(<ChatPage />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요');
    await userEvent.type(input, '삼성전자 1000만원 매수해줘{enter}');

    // HITL 패널 대기
    await waitFor(() => {
      expect(screen.getByText('⚠️ 승인 필요')).toBeInTheDocument();
    });

    // 승인 버튼 확인
    expect(screen.getByRole('button', { name: '승인' })).toBeInTheDocument();
  });
});

```

---

## 8. Accessibility Implementation

### 8.1 Keyboard Navigation

```tsx
// components/chat/ChatInput.tsx
const ChatInput = () => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter: 전송
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Shift+Enter: 줄바꿈 (기본 동작 유지)

    // Escape: 입력 취소
    if (e.key === 'Escape') {
      setMessage('');
    }
  };

  return (
    <textarea
      onKeyDown={handleKeyDown}
      aria-label="메시지 입력"
      placeholder="메시지를 입력하세요"
    />
  );
};

```

---

### 8.2 ARIA Attributes

```tsx
// components/hitl/ApprovalPanel.tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="approval-title"
  aria-describedby="approval-description"
>
  <h2 id="approval-title">⚠️ 승인 필요</h2>
  <div id="approval-description">
    다음 주문을 검토하고 승인 또는 거부해주세요.
  </div>

  {/* ... 주문 내역 ... */}

  <div role="group" aria-label="승인 액션">
    <button
      onClick={handleApprove}
      aria-label="매수 주문 승인"
      className="..."
    >
      승인
    </button>
    <button
      onClick={handleReject}
      aria-label="매수 주문 거부"
      className="..."
    >
      거부
    </button>
  </div>
</div>

```

---

## 9. Development Workflow

### Phase 1 개발 순서

```
Week 1:
- [ ] 프로젝트 초기 설정 (Next.js, Tailwind, i18n)
- [ ] Shell + LNB 구현
- [ ] Chat Input 구현

Week 2:
- [ ] ChatMessage 컴포넌트 (Markdown, Thinking)
- [ ] Chat API 연동
- [ ] SSE 실시간 업데이트

Week 3:
- [ ] HITL ApprovalPanel 구현
- [ ] Approval API 연동
- [ ] Portfolio 기본 정보 표시

Week 4:
- [ ] Portfolio 차트 시각화 (Treemap, Pie, Bar)
- [ ] Save as Artifact 기능
- [ ] 통합 테스트

```

---

## 10. Deployment

### 10.1 Build Configuration

```jsx
// next.config.js
module.exports = {
  reactStrictMode: true,
  i18n: {
    locales: ['ko', 'en'],
    defaultLocale: 'ko',
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

```

---

### 10.2 Environment Variables

```bash
# .env.local (개발)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# .env.production (배포)
NEXT_PUBLIC_API_URL=https://api.hama.ai/v1

```

---

**문서 끝**