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
  content?: string; // 실시간 사고 내용 (agent_thinking 이벤트)
  node?: string; // 현재 실행 중인 노드명
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
 * Agent 타입 (HITL용)
 */
export type HITLAgentType = "research" | "strategy" | "portfolio" | "risk" | "trading";

/**
 * HITL 승인 요청 베이스
 */
export interface BaseApprovalRequest {
  type: HITLAgentType;
  agent: string;
}

/**
 * 1. Research Agent 승인 요청
 */
export interface ResearchApprovalRequest extends BaseApprovalRequest {
  type: "research";
  agent: "Research";
  stock_code?: string;
  stock_name?: string;
  query: string;
  routing_reason: string;
  query_complexity: "simple" | "moderate" | "expert";
  depth_level: "brief" | "detailed" | "comprehensive";
  expected_workers?: string[];
}

/**
 * 2. Strategy Agent 승인 요청
 */
export interface StrategyApprovalRequest extends BaseApprovalRequest {
  type: "strategy";
  agent: "Strategy";
  strategy_type: "MOMENTUM" | "VALUE" | "GROWTH" | "DEFENSIVE";
  market_outlook: {
    cycle: "expansion" | "peak" | "contraction" | "trough";
    sentiment: "bullish" | "neutral" | "bearish";
  };
  sector_strategy: {
    overweight: string[];
    underweight: string[];
  };
  target_allocation: {
    stocks: number;
    cash: number;
  };
  expected_return: number;
  expected_risk: "low" | "medium" | "high";
}

/**
 * 3. Portfolio Agent 승인 요청
 */
export interface PortfolioApprovalRequest extends BaseApprovalRequest {
  type: "portfolio";
  agent: "Portfolio";
  rebalancing_needed: boolean;
  current_holdings: Array<{
    stock_code: string;
    stock_name: string;
    quantity: number;
    current_weight: number;
  }>;
  proposed_allocation: Array<{
    stock_code: string;
    stock_name: string;
    target_weight: number;
    action: "BUY" | "SELL" | "HOLD";
    quantity_change: number;
  }>;
  trades_required: Array<{
    stock_code: string;
    order_type: "buy" | "sell";
    quantity: number;
    estimated_amount: number;
  }>;
  portfolio_metrics: {
    expected_return: number;
    expected_risk: number;
    diversification_score: number;
  };
}

/**
 * 4. Risk Agent 승인 요청
 */
export interface RiskApprovalRequest extends BaseApprovalRequest {
  type: "risk";
  agent: "Risk";
  risk_level: "low" | "medium" | "high";
  risk_factors: Array<{
    category: string;
    severity: "warning" | "critical";
    description: string;
    mitigation: string;
  }>;
  portfolio_metrics: {
    concentration: number;
    volatility: number;
    max_drawdown: number;
  };
  recommended_actions?: string[];
}

/**
 * 5. Trading Agent 승인 요청 (기존)
 */
export interface TradingApprovalRequest extends BaseApprovalRequest {
  type: "trading";
  agent: "Trading";
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
 * 통합 승인 요청 타입
 */
export type ApprovalRequest =
  | ResearchApprovalRequest
  | StrategyApprovalRequest
  | PortfolioApprovalRequest
  | RiskApprovalRequest
  | TradingApprovalRequest;

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
