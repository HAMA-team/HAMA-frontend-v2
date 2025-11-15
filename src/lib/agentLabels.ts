/**
 * Agent 활동을 사용자 친화적인 메시지로 변환하는 헬퍼 함수
 *
 * 백엔드에서 오는 기술적인 agent/node 정보를
 * "분석 계획을 수립하고 있습니다" 같은 자연스러운 메시지로 변환
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

// Node별 세부 레이블 매핑
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

  // Research nodes
  query_intent_classifier: {
    ko: "질문 의도를 파악하고 있습니다",
    en: "Understanding your question",
  },
  planner: {
    ko: "분석 계획을 수립하고 있습니다",
    en: "Planning the analysis",
  },
  task_router: {
    ko: "적절한 분석 방법을 선택하고 있습니다",
    en: "Selecting analysis approach",
  },
  _route_task: {
    ko: "분석 작업을 분배하고 있습니다",
    en: "Distributing analysis tasks",
  },
  data_worker: {
    ko: "데이터를 수집하고 있습니다",
    en: "Collecting data",
  },
  bull_worker: {
    ko: "긍정적 시나리오를 분석 중입니다",
    en: "Analyzing bullish scenario",
  },
  bear_worker: {
    ko: "부정적 시나리오를 분석 중입니다",
    en: "Analyzing bearish scenario",
  },
  macro_worker: {
    ko: "거시 경제를 분석 중입니다",
    en: "Analyzing macroeconomic factors",
  },
  insight_worker: {
    ko: "종합 인사이트를 도출하고 있습니다",
    en: "Generating insights",
  },
  synthesis: {
    ko: "분석 결과를 종합하고 있습니다",
    en: "Synthesizing analysis",
  },

  // Strategy nodes
  analyze_market: {
    ko: "시장 상황을 분석하고 있습니다",
    en: "Analyzing market conditions",
  },
  generate_strategy: {
    ko: "투자 전략을 생성하고 있습니다",
    en: "Generating investment strategy",
  },

  // Portfolio nodes
  optimize: {
    ko: "포트폴리오를 최적화하고 있습니다",
    en: "Optimizing portfolio allocation",
  },
  rebalance: {
    ko: "리밸런싱 방안을 계산하고 있습니다",
    en: "Calculating rebalancing plan",
  },

  // Risk nodes
  assess_risk: {
    ko: "리스크를 평가하고 있습니다",
    en: "Assessing risks",
  },
  calculate_metrics: {
    ko: "리스크 지표를 계산하고 있습니다",
    en: "Calculating risk metrics",
  },

  // Trading nodes
  validate_order: {
    ko: "주문을 검증하고 있습니다",
    en: "Validating orders",
  },
  execute: {
    ko: "주문을 실행하고 있습니다",
    en: "Executing orders",
  },

  // LLM nodes
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
