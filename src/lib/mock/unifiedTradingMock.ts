/**
 * Mock data for Unified Trading Approval Panel (Demo Mode)
 * All content in English for demo purposes
 * Simplified to match backend API structure
 */

export const MOCK_UNIFIED_TRADING_LOW_RISK = {
  // Trade Info
  stock_name: "Samsung Electronics",
  stock_code: "005930",
  action: "BUY" as const,
  quantity: 10,
  price: 70000,
  total_amount: 700000,

  // Portfolio Impact
  current_weight: 25.0,
  expected_weight: 30.5,
  quantity_after_trade: 110,

  // No risk info (low risk trade)
};

export const MOCK_UNIFIED_TRADING_MEDIUM_RISK = {
  // Trade Info
  stock_name: "SK Hynix",
  stock_code: "000660",
  action: "BUY" as const,
  quantity: 50,
  price: 125000,
  total_amount: 6250000,

  // Portfolio Impact
  current_weight: 15.0,
  expected_weight: 28.0,
  quantity_after_trade: 200,

  // Risk Info
  risk_level: "medium" as const,
  risk_warnings: [
    "Technology sector concentration will reach 42%, increasing sector risk",
    "Consider reducing position size to maintain portfolio balance",
  ],
};

export const MOCK_UNIFIED_TRADING_HIGH_RISK = {
  // Trade Info
  stock_name: "NAVER Corporation",
  stock_code: "035420",
  action: "BUY" as const,
  quantity: 100,
  price: 220000,
  total_amount: 22000000,

  // Portfolio Impact
  current_weight: 20.0,
  expected_weight: 42.0,
  quantity_after_trade: 370,

  // Risk Info
  risk_level: "high" as const,
  risk_warnings: [
    "This trade will increase single stock weight to 42%, significantly above the recommended 30% threshold for individual positions.",
    "Technology sector allocation will reach 65% of total portfolio, creating concentrated sector risk.",
    "Cash ratio will drop to 5%, creating liquidity risk for emergency needs.",
  ],
};

export const MOCK_UNIFIED_TRADING_SELL_HIGH_RISK = {
  // Trade Info
  stock_name: "Kakao Corporation",
  stock_code: "035720",
  action: "SELL" as const,
  quantity: 200,
  price: 48000,
  total_amount: 9600000,

  // Portfolio Impact
  current_weight: 25.0,
  expected_weight: 8.5,
  quantity_after_trade: 50,

  // Risk Info
  risk_level: "medium" as const,
  risk_warnings: [
    "Selling this position will significantly reduce your technology sector exposure from 45% to 28%.",
    "Consider reallocating proceeds into other growth sectors to maintain portfolio growth potential.",
  ],
};
