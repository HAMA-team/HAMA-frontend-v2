/**
 * Agent 활동을 사용자 친화적인 메시지로 변환하는 헬퍼 함수
 *
 * 백엔드에서 오는 기술적인 agent/node 정보를
 * "분석 계획을 수립하고 있습니다" 같은 자연스러운 메시지로 변환
 *
 * @source 노드 매핑은 백엔드 실제 코드 기반으로 작성됨:
 *   - ../HAMA-backend/src/subgraphs/research_subgraph/graph.py (Research)
 *   - ../HAMA-backend/src/agents/strategy/graph.py (Strategy)
 *   - ../HAMA-backend/src/agents/portfolio/graph.py (Portfolio)
 *   - ../HAMA-backend/src/agents/risk/graph.py (Risk)
 *   - ../HAMA-backend/src/subgraphs/graph_master.py (Master/Trading)
 *
 * @version 2025-11-16 백엔드 코드 직접 확인 및 검증 완료
 */

export interface AgentLabel {
  ko: string;
  en: string;
}

// Agent별 레이블 매핑
const AGENT_LABELS: Record<string, AgentLabel> = {
  // Master/Routing
  master: {
    ko: "요청을 분석하고 있습니다",
    en: "Analyzing your request",
  },
  planner: {
    ko: "작업 계획을 수립하고 있습니다",
    en: "Planning the workflow",
  },

  // Research Agent
  research: {
    ko: "종목 분석을 시작합니다",
    en: "Starting stock analysis",
  },
  research_agent: {
    ko: "종목 분석을 진행 중입니다",
    en: "Analyzing the stock",
  },

  // Strategy Agent
  strategy: {
    ko: "투자 전략을 수립하고 있습니다",
    en: "Developing investment strategy",
  },
  strategy_agent: {
    ko: "투자 전략을 분석 중입니다",
    en: "Analyzing investment strategy",
  },

  // Portfolio Agent
  portfolio: {
    ko: "포트폴리오를 구성하고 있습니다",
    en: "Building portfolio",
  },
  portfolio_agent: {
    ko: "포트폴리오를 최적화 중입니다",
    en: "Optimizing portfolio",
  },

  // Risk Agent
  risk: {
    ko: "리스크를 분석하고 있습니다",
    en: "Analyzing risks",
  },
  risk_agent: {
    ko: "리스크를 평가 중입니다",
    en: "Evaluating risks",
  },

  // Trading Agent
  trading: {
    ko: "매매 주문을 준비하고 있습니다",
    en: "Preparing trade orders",
  },
  trading_agent: {
    ko: "매매 주문을 검토 중입니다",
    en: "Reviewing trade orders",
  },
};

// Node별 세부 레이블 매핑 (백엔드 실제 코드 기반)
const NODE_LABELS: Record<string, AgentLabel> = {
  // Common nodes
  start: {
    ko: "작업을 시작합니다",
    en: "Starting",
  },
  complete: {
    ko: "작업을 완료했습니다",
    en: "Completed",
  },

  // ========== Research Subgraph Nodes (src/subgraphs/research_subgraph/graph.py) ==========
  planner: {
    ko: "분석 계획을 수립하고 있습니다",
    en: "Planning the analysis",
  },
  data_worker: {
    ko: "기업 데이터를 수집하고 있습니다",
    en: "Collecting company data",
  },
  technical_analyst: {
    ko: "기술적 분석을 수행하고 있습니다",
    en: "Performing technical analysis",
  },
  trading_flow_analyst: {
    ko: "거래 동향을 분석하고 있습니다",
    en: "Analyzing trading flows",
  },
  macro_worker: {
    ko: "거시 경제를 분석하고 있습니다",
    en: "Analyzing macroeconomic factors",
  },
  bull_worker: {
    ko: "강세 시나리오를 분석하고 있습니다",
    en: "Analyzing bullish scenario",
  },
  bear_worker: {
    ko: "약세 시나리오를 분석하고 있습니다",
    en: "Analyzing bearish scenario",
  },
  synthesis: {
    ko: "분석 결과를 종합하고 있습니다",
    en: "Synthesizing analysis results",
  },

  // ========== Strategy Agent Nodes (src/agents/strategy/graph.py) ==========
  query_intent_classifier: {
    ko: "질문 의도를 파악하고 있습니다",
    en: "Understanding your question",
  },
  task_router: {
    ko: "적절한 분석 방법을 선택하고 있습니다",
    en: "Selecting analysis approach",
  },
  market_analysis: {
    ko: "시장 상황을 분석하고 있습니다",
    en: "Analyzing market conditions",
  },
  sector_rotation: {
    ko: "섹터 순환을 분석하고 있습니다",
    en: "Analyzing sector rotation",
  },
  asset_allocation: {
    ko: "자산 배분을 계획하고 있습니다",
    en: "Planning asset allocation",
  },
  buy_specialist: {
    ko: "매수 전략을 수립하고 있습니다",
    en: "Developing buy strategy",
  },
  sell_specialist: {
    ko: "매도 전략을 수립하고 있습니다",
    en: "Developing sell strategy",
  },
  risk_reward_specialist: {
    ko: "위험-수익 비율을 분석하고 있습니다",
    en: "Analyzing risk-reward ratio",
  },
  blueprint_creation: {
    ko: "투자 청사진을 작성하고 있습니다",
    en: "Creating investment blueprint",
  },

  // ========== Portfolio Agent Nodes (src/agents/portfolio/graph.py) ==========
  analyze_query: {
    ko: "요청을 분석하고 있습니다",
    en: "Analyzing request",
  },
  collect_portfolio: {
    ko: "포트폴리오 데이터를 수집하고 있습니다",
    en: "Collecting portfolio data",
  },
  market_condition: {
    ko: "시장 상황을 확인하고 있습니다",
    en: "Checking market conditions",
  },
  optimize_allocation: {
    ko: "포트폴리오를 최적화하고 있습니다",
    en: "Optimizing portfolio allocation",
  },
  validate_constraints: {
    ko: "제약 조건을 검증하고 있습니다",
    en: "Validating constraints",
  },
  rebalance_plan: {
    ko: "리밸런싱 계획을 수립하고 있습니다",
    en: "Planning rebalancing",
  },
  summary: {
    ko: "결과를 요약하고 있습니다",
    en: "Summarizing results",
  },
  approval_rebalance: {
    ko: "리밸런싱 승인을 요청합니다",
    en: "Requesting rebalancing approval",
  },
  execute_rebalance: {
    ko: "리밸런싱을 실행하고 있습니다",
    en: "Executing rebalancing",
  },

  // ========== Risk Agent Nodes (src/agents/risk/graph.py) ==========
  collect_data: {
    ko: "리스크 데이터를 수집하고 있습니다",
    en: "Collecting risk data",
  },
  concentration_check: {
    ko: "집중도 리스크를 검토하고 있습니다",
    en: "Checking concentration risk",
  },
  market_risk: {
    ko: "시장 리스크를 분석하고 있습니다",
    en: "Analyzing market risk",
  },
  final_assessment: {
    ko: "최종 리스크 평가를 수행하고 있습니다",
    en: "Performing final risk assessment",
  },

  // ========== Trading Nodes (src/subgraphs/graph_master.py) ==========
  prepare_trade: {
    ko: "매매 주문을 준비하고 있습니다",
    en: "Preparing trade order",
  },
  execute_trade: {
    ko: "매매 주문을 실행하고 있습니다",
    en: "Executing trade order",
  },

  // ========== LLM/System Nodes ==========
  llm_start: {
    ko: "AI 분석을 시작합니다",
    en: "Starting AI analysis",
  },
  llm_end: {
    ko: "AI 분석을 완료했습니다",
    en: "AI analysis completed",
  },
};

/**
 * Agent와 Node 정보를 사용자 친화적인 메시지로 변환
 *
 * @param agent - Agent 이름 (예: "research", "portfolio")
 * @param node - Node 이름 (예: "planner", "data_worker")
 * @param lang - 언어 ("ko" 또는 "en")
 * @returns 사용자 친화적인 메시지
 */
export function getAgentActivityLabel(
  agent: string | undefined,
  node: string | undefined,
  lang: "ko" | "en" = "ko"
): string {
  // Node가 있으면 우선 적용 (더 구체적)
  if (node) {
    const nodeLabel = NODE_LABELS[node];
    if (nodeLabel) {
      return nodeLabel[lang];
    }

    // Node에 agent 이름이 포함되어 있으면 제거
    // 예: "research: planner running" → "planner"
    const cleanNode = node.replace(/^(research|strategy|portfolio|risk|trading)[_:]?\s*/i, "");
    const cleanNodeLabel = NODE_LABELS[cleanNode];
    if (cleanNodeLabel) {
      return cleanNodeLabel[lang];
    }
  }

  // Agent 레이블 적용
  if (agent) {
    const agentLabel = AGENT_LABELS[agent];
    if (agentLabel) {
      return agentLabel[lang];
    }

    // Agent 이름 정리 (research_agent → research)
    const cleanAgent = agent.replace(/_agent$/i, "");
    const cleanAgentLabel = AGENT_LABELS[cleanAgent];
    if (cleanAgentLabel) {
      return cleanAgentLabel[lang];
    }
  }

  // 매핑이 없으면 기본 메시지
  if (node && agent) {
    return lang === "ko"
      ? `${agent} 작업을 진행 중입니다`
      : `Processing ${agent} task`;
  }
  if (node) {
    return lang === "ko"
      ? `${node} 작업을 진행 중입니다`
      : `Processing ${node}`;
  }
  if (agent) {
    return lang === "ko"
      ? `${agent}을(를) 실행 중입니다`
      : `Running ${agent}`;
  }

  return lang === "ko" ? "작업을 진행 중입니다" : "Processing";
}

/**
 * 원본 메시지에서 agent/node 정보를 추출하는 헬퍼
 *
 * @param message - 원본 메시지 (예: "research: planner running")
 * @returns { agent, node } 객체
 */
export function parseAgentMessage(message: string): { agent?: string; node?: string } {
  // "research: planner running" 형식
  const match = message.match(/^(\w+):\s*(\w+)/);
  if (match) {
    return {
      agent: match[1],
      node: match[2],
    };
  }

  // "Routing: research, strategy" 형식
  const routingMatch = message.match(/^Routing:\s*(.+)/i);
  if (routingMatch) {
    return {
      agent: "master",
      node: "routing",
    };
  }

  return {};
}
