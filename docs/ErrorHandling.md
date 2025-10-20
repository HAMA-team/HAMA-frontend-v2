# HAMA Frontend - Error Handling Guide

**Version:** 1.0

**Last Updated:** 2025-10-20

**Parent Document:** PRD v3.0

---

## 1. Error Categories

### 1.1 Error Types

| Category | Description | Example |
|----------|-------------|---------|
| **Network** | API 호출 실패, 타임아웃, SSE 연결 끊김 | 500 에러, 네트워크 끊김 |
| **Validation** | 사용자 입력 검증 실패 | 빈 메시지, 음수 수량 |
| **Storage** | LocalStorage/IndexedDB 용량 초과 | Artifact 저장 실패 |
| **Timeout** | 응답 시간 초과 | HITL 승인 30초 초과 |
| **Conflict** | 동시 요청 충돌 | 동시 HITL 요청 |

---

## 2. Error Handling Scenarios

### Scenario 1: 입력 중 페이지 이탈

**Trigger:** 사용자가 Chat Input에 텍스트를 입력 중 페이지를 벗어나려 할 때

**Behavior:**

1. **경고창 표시**
   ```
   제목: 입력한 내용이 저장되지 않을 수 있습니다
   본문: 작성 중인 메시지가 있습니다. 정말 페이지를 나가시겠습니까?
   버튼: [나가기] [취소]
   ```

2. **임시 저장 (SessionStorage)**
   - Key: `draft_message_${timestamp}`
   - Value: 입력 텍스트
   - 유효 기간: 5분

3. **재진입 시 복원**
   - 페이지 로드 시 SessionStorage 확인
   - 5분 이내 임시 저장 데이터가 있으면 토스트 표시:
     ```
     "이전에 입력한 내용을 복원하시겠습니까?"
     [복원] [무시]
     ```
   - [복원] 클릭 시 Chat Input에 텍스트 채우기

**Implementation:**

```tsx
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (message.trim().length > 0) {
      e.preventDefault();
      e.returnValue = '';
      sessionStorage.setItem(
        `draft_message_${Date.now()}`,
        message
      );
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [message]);
```

---

### Scenario 2: 메시지 전송 실패

**Trigger:** `POST /api/v1/chat` 실패 (500, 네트워크 에러 등)

**Behavior:**

1. **메시지 상태 변경**
   - 메시지 우측에 ⚠️ 아이콘 표시
   - 배경색: `bg-red-50 dark:bg-red-900/20`
   - 좌측 빨간색 테두리: `border-l-4 border-red-500`

2. **에러 메시지 표시**
   ```tsx
   <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
     <AlertTriangle size={16} />
     <span className="text-sm">전송 실패</span>
   </div>
   ```

3. **액션 버튼**
   ```tsx
   <div className="flex gap-2 mt-2">
     <Button onClick={handleRetry} variant="destructive" size="sm">
       재전송
     </Button>
     <Button onClick={handleDelete} variant="ghost" size="sm">
       삭제
     </Button>
   </div>
   ```

4. **재전송 로직**
   - 최대 3회 재시도
   - 재시도 간격: 1초, 2초, 4초 (지수 백오프)
   - 3회 실패 후: "재전송" 버튼만 표시 (자동 재시도 중단)

**Error Response Format:**

```json
{
  "error": {
    "code": "CHAT_SEND_FAILED",
    "message": "메시지 전송에 실패했습니다",
    "details": "Network timeout after 30s"
  }
}
```

---

### Scenario 3: LocalStorage Quota 초과

**Trigger:** Artifact 저장 시 `QuotaExceededError` 발생

**Behavior:**

1. **토스트 표시 (5초)**
   ```
   아이콘: ⚠️
   제목: 저장 공간이 부족합니다
   본문: 오래된 Artifacts를 삭제하여 공간을 확보하세요
   액션: [Artifacts 관리하기]
   ```

2. **[Artifacts 관리하기] 클릭 시**
   - `/artifacts` 페이지로 이동
   - URL 쿼리: `?action=cleanup`
   - 페이지 상단에 안내 배너 표시:
     ```
     "저장 공간이 부족합니다. 오래된 Artifacts를 삭제하세요"
     [전체 선택] [삭제]
     ```

3. **Fallback: 자동 정리**
   - 가장 오래된 Artifact 1개 자동 삭제
   - 토스트: "가장 오래된 Artifact 1개가 삭제되었습니다"
   - 저장 재시도

**Implementation:**

```tsx
try {
  localStorage.setItem('artifact_' + id, JSON.stringify(artifact));
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    toast({
      title: '저장 공간이 부족합니다',
      description: '오래된 Artifacts를 삭제하여 공간을 확보하세요',
      action: (
        <Button onClick={() => router.push('/artifacts?action=cleanup')}>
          Artifacts 관리하기
        </Button>
      ),
      duration: 5000,
    });
  }
}
```

---

### Scenario 4: SSE 연결 실패 및 재시도

**Trigger:** LangGraph 에이전트 활동 스트리밍 중 연결 끊김

**Behavior:**

1. **재시도 로직 (지수 백오프)**
   - 1차 시도: 1초 후
   - 2차 시도: 2초 후
   - 3차 시도: 4초 후

2. **3회 실패 후: 폴링 모드 전환**
   - `GET /api/v1/chat/status?session_id=xxx` (5초 간격)
   - 사용자에게 알림: "실시간 연결이 끊겼습니다. 폴링 모드로 전환합니다"

3. **연결 상태 UI 표시**
   - **위치:** Chat Input 우측 상단
   - **크기:** 작은 점 (8px) + 텍스트 (선택 사항)

   | 상태 | 색상 | 아이콘 | 텍스트 |
   |------|------|--------|--------|
   | 연결됨 | 초록색 | 🟢 | "실시간 연결됨" |
   | 연결 중 | 노란색 | 🟡 | "연결 중..." |
   | 연결 끊김 | 회색 | ⚪ | "연결 끊김 (재연결 시도 중)" |
   | 오류 (폴링) | 빨간색 | 🔴 | "연결 실패 (폴링 모드)" |

**Implementation:**

```tsx
const connectSSE = (retries = 0) => {
  const eventSource = new EventSource('/api/v1/chat/stream');

  eventSource.onerror = () => {
    eventSource.close();

    if (retries < 3) {
      const delay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s
      setTimeout(() => connectSSE(retries + 1), delay);
      setConnectionStatus('reconnecting');
    } else {
      // Switch to polling
      setConnectionStatus('polling');
      startPolling();
    }
  };
};
```

---

### Scenario 5: HITL 승인 중 타임아웃

**Trigger:** `POST /api/v1/chat/approve` 응답 30초 초과

**Behavior:**

1. **로딩 상태 유지 (최대 30초)**
   - 승인/거부 버튼 비활성화
   - 스피너 표시

2. **30초 후 타임아웃**
   - 패널 상단에 에러 배너 표시:
     ```
     ⚠️ 응답 시간 초과
     네트워크 연결을 확인하고 다시 시도하세요
     [재시도]
     ```
   - **패널은 닫히지 않음** (사용자가 결정을 내릴 때까지 필수)

3. **[재시도] 클릭 시**
   - 동일한 요청 재전송
   - 로딩 상태 재개

**Why Panel Stays Open:**

- HITL 시스템의 핵심: 매매 승인은 필수
- 네트워크 오류로 인해 승인 없이 진행되면 안 됨
- 사용자가 명시적으로 결정을 내릴 때까지 대기

---

### Scenario 6: 동시 HITL 요청

**Trigger:** AI가 여러 매매를 동시에 제안 (예: "삼성전자 매수, LG전자 매도")

**Behavior:**

1. **첫 번째 HITL만 표시**
   - 첫 번째 매매 제안의 승인 패널 표시

2. **나머지 대기열 저장**
   - 나머지 매매는 메모리에 큐잉

3. **패널 상단에 대기 개수 표시**
   ```tsx
   <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b">
     <span className="text-sm text-blue-600 dark:text-blue-400">
       승인 대기 (1/3)
     </span>
   </div>
   ```

4. **승인/거부 후 다음 HITL 표시**
   - 첫 번째 패널 닫힘
   - 0.5초 후 두 번째 패널 자동 오픈
   - "승인 대기 (2/3)" 업데이트

**Implementation:**

```tsx
const [approvalQueue, setApprovalQueue] = useState<ApprovalRequest[]>([]);
const [currentApproval, setCurrentApproval] = useState<ApprovalRequest | null>(null);

const processNextApproval = () => {
  if (approvalQueue.length > 0) {
    const next = approvalQueue[0];
    setCurrentApproval(next);
    setApprovalQueue(queue => queue.slice(1));
  }
};

const handleApprove = async () => {
  await api.approve(currentApproval.id);
  setCurrentApproval(null);
  setTimeout(processNextApproval, 500);
};
```

---

## 3. Validation Rules

### 3.1 Chat Input Validation

| 규칙 | 조건 | 에러 메시지 | UI |
|------|------|-------------|-----|
| **최소 길이** | 1자 이상 | (없음) | 전송 버튼 비활성화 |
| **공백만 입력** | `message.trim() === ''` | (없음) | 전송 버튼 비활성화 |
| **최대 길이** | 5000자 초과 | "메시지는 5000자 이하로 입력하세요" | 빨간색 테두리 + 하단 에러 |
| **글자 수 표시** | 4900자 이상 | (없음) | 우측 하단에 "4952 / 5000" 표시 |

**Implementation:**

```tsx
<div className="relative">
  <textarea
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    maxLength={5000}
    className={cn(
      'w-full',
      message.length > 5000 && 'border-red-500'
    )}
  />
  {message.length >= 4900 && (
    <div className="absolute bottom-2 right-2 text-xs text-gray-500">
      {message.length} / 5000
    </div>
  )}
  {message.length > 5000 && (
    <p className="text-sm text-red-500 mt-1">
      메시지는 5000자 이하로 입력하세요
    </p>
  )}
</div>
```

---

### 3.2 HITL Approval Validation (수정 모드)

| 필드 | 규칙 | 에러 메시지 | UI |
|------|------|-------------|-----|
| **수량** | 양의 정수, 최소 1 | "수량은 1 이상이어야 합니다" | 빨간색 테두리 + 하단 에러 |
| **가격** | 양의 숫자, 소수점 2자리 | "유효한 가격을 입력하세요" | 빨간색 테두리 + 하단 에러 |

**유효하지 않은 입력 시:**
- Input: 빨간색 테두리 (`border-red-500`)
- 에러 메시지: 하단에 표시 (`text-red-500`)
- 승인 버튼: 비활성화

---

## 4. Toast Notification Standards

### 4.1 Toast Types

| Type | 색상 | 아이콘 | Duration |
|------|------|--------|----------|
| **Success** | 초록색 | ✅ | 3초 |
| **Error** | 빨간색 | ❌ | 5초 |
| **Warning** | 노란색 | ⚠️ | 4초 |
| **Info** | 파란색 | ℹ️ | 3초 |

### 4.2 Toast Examples

```tsx
// Success
toast.success('매수 주문이 실행되었습니다', { duration: 3000 });

// Error
toast.error('메시지 전송에 실패했습니다', { duration: 5000 });

// Warning with action
toast.warning('저장 공간이 부족합니다', {
  duration: 5000,
  action: {
    label: 'Artifacts 관리하기',
    onClick: () => router.push('/artifacts?action=cleanup'),
  },
});

// Info with link
toast.info('Artifacts에 저장되었습니다', {
  duration: 3000,
  action: {
    label: '보기',
    onClick: () => router.push('/artifacts'),
  },
});
```

---

## 5. API Error Response Format

### 5.1 Standard Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 표시될 메시지",
    "details": "개발자용 상세 정보 (선택 사항)"
  }
}
```

### 5.2 Common Error Codes

| Code | HTTP Status | User Message |
|------|-------------|--------------|
| `CHAT_SEND_FAILED` | 500 | "메시지 전송에 실패했습니다" |
| `APPROVAL_TIMEOUT` | 504 | "응답 시간 초과" |
| `INVALID_INPUT` | 400 | "입력 정보가 올바르지 않습니다" |
| `QUOTA_EXCEEDED` | 413 | "저장 공간이 부족합니다" |
| `NETWORK_ERROR` | 0 | "네트워크 연결을 확인하세요" |
| `UNAUTHORIZED` | 401 | "로그인이 필요합니다" |

---

## 6. Performance Limits

| Resource | Limit | Behavior on Exceed |
|----------|-------|-------------------|
| **최근 채팅 목록** | 10개 | 오래된 항목부터 숨김 |
| **차트 데이터 포인트** | 100개 | 샘플링하여 표시 |
| **LocalStorage Artifacts** | 10MB (약 100개) | 자동 정리 제안 |
| **SSE 재시도** | 3회 | 폴링 모드 전환 |
| **API 재시도** | 3회 | 수동 재시도 버튼 표시 |

---

## 7. Logging Policy

### 7.1 Error Logging

**로그 레벨:**
- `ERROR`: API 실패, 예외 발생
- `WARN`: 재시도, 폴링 전환
- `INFO`: 사용자 액션 (승인/거부)

**로그 포맷:**

```typescript
console.error('[HAMA]', {
  level: 'ERROR',
  code: 'CHAT_SEND_FAILED',
  message: 'Failed to send message',
  timestamp: new Date().toISOString(),
  details: error,
});
```

---

## 8. Best Practices

1. **사용자 친화적 메시지**
   - 기술 용어 지양: "500 Error" ❌ → "메시지 전송 실패" ✅
   - 해결 방법 제시: "실패했습니다" ❌ → "네트워크를 확인하고 재시도하세요" ✅

2. **재시도 로직은 자동 + 수동 병행**
   - 자동 재시도: 최대 3회 (지수 백오프)
   - 3회 실패 후: 수동 재시도 버튼 제공

3. **HITL 패널은 절대 강제 닫기 불가**
   - 네트워크 오류, 타임아웃 발생 시에도 패널 유지
   - 사용자가 결정을 내릴 때까지 대기

4. **로딩 상태는 명확하게**
   - 버튼 비활성화 + 스피너
   - 타임아웃 시간 표시 (선택 사항)

---

## 9. Related Documents

- **TechnicalSpecification.md**: API 연동 상세
- **DesignSystem.md**: 에러 UI 색상/스타일
- **ProductRequirements.md**: 사용자 경험 요구사항

---

## 10. Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-20 | 초기 버전 작성 | Claude |
