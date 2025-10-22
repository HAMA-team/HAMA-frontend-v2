/**
 * Chat 관련 TypeScript 타입 정의
 *
 * TechnicalSpecification.md 기준으로 작성
 */

/**
 * 메시지 역할
 */
export type MessageRole = "user" | "assistant";

/**
 * 메시지 상태
 */
export type MessageStatus = "sending" | "sent" | "error";

/**
 * 에이전트 타입
 */
export type AgentType = "planner" | "researcher" | "strategy";

/**
 * Thinking Step 인터페이스
 */
export interface ThinkingStep {
  agent: AgentType;
  description: string;
  timestamp: string;
}

/**
 * 메시지 인터페이스
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  thinking?: ThinkingStep[];
  timestamp: string;
  status?: MessageStatus;
}

/**
 * Chat API 요청 인터페이스
 */
export interface ChatRequest {
  message: string;
  thread_id: string;
  automation_level: 1 | 2 | 3; // 어드바이저, 코파일럿, 파일럿
  config?: {
    language?: "ko" | "en";
    max_tokens?: number;
  };
}

/**
 * Chat API 응답 인터페이스 (일반)
 */
export interface ChatResponse {
  message: string; // AI 답변 (Markdown)
  thinking?: ThinkingStep[];
  requires_approval: boolean;
  thread_id: string;
  timestamp: string;
}

/**
 * HITL 승인 요청 인터페이스
 */
export interface ApprovalRequest {
  action: "buy" | "sell";
  stock_code: string;
  stock_name: string;
  quantity: number;
  price: number;
  total_amount: number;
  current_weight: number;
  expected_weight: number;
  risk_warning?: string;
  alternatives?: Alternative[];
}

/**
 * 대안 제안 인터페이스
 */
export interface Alternative {
  suggestion: string;
  adjusted_quantity: number;
  adjusted_amount: number;
}

/**
 * Chat API 응답 인터페이스 (HITL 필요)
 */
export interface ChatResponseWithApproval extends ChatResponse {
  requires_approval: true;
  approval_request: ApprovalRequest;
}

/**
 * Artifact 인터페이스
 */
export interface Artifact {
  id: string;
  title: string;
  content: string;
  created_at: string;
  thread_id?: string;
}
