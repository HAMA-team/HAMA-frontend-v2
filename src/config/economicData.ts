/**
 * Economic Viability Data
 *
 * TAM/SAM/SOM, MAU, Pricing, Timeline 등 경제성 관련 데이터
 * 숫자 수정 시 이 파일만 수정하면 모든 컴포넌트에 반영됨
 */

export const economicData = {
  // TAM (Total Addressable Market)
  tam: {
    value: 284600000000, // ₩284.6B
    users: 14230000, // 14.23M
  },

  // SAM (Serviceable Available Market)
  sam: {
    value: 142300000000, // ₩142.3B
    users: 7115000, // 7.12M (50% of TAM)
  },

  // SOM (Serviceable Obtainable Market)
  som: {
    value: 7100000000, // ₩7.1B
    users: 355000, // 355K (5% of SAM)
  },

  // Expected MAU (Monthly Active Users)
  mau: {
    value: 250000, // 250K
    annualUsers: 355000, // 355K
    activationRate: 0.7, // 70%
  },

  // Pricing
  pricing: {
    b2c: 9900, // ₩9,900/month
    b2b: "custom", // Custom pricing
    arpu: 20000, // ₩20,000/year (Average Revenue Per User)
  },

  // Timeline
  timeline: {
    phase1: {
      start: "2025 Q1",
      end: "2025 Q2",
    },
    phase2: {
      start: "2025 Q3",
      end: "2025 Q4",
    },
  },
} as const;

/**
 * Format number to currency with i18n support
 * Korean: 억 원 (100 million)
 * English: B (billion)
 */
export function formatKRW(value: number, t: (key: string) => string): string {
  const unit = t("about.economic.units.billion");

  if (unit === 'B') {
    // English: Billion (1,000,000,000)
    const billions = (value / 1000000000).toFixed(1);
    return `₩${billions}B`;
  } else {
    // Korean: 억 (100,000,000)
    const eok = Math.round(value / 100000000);
    return `${eok.toLocaleString()}억 원`;
  }
}

/**
 * Format number to short notation with i18n support
 * Korean: 만 (10,000)
 * English: M (million), K (thousand)
 */
export function formatShort(value: number, t: (key: string) => string): string {
  const unit = t("about.economic.units.billion");

  if (unit === 'B') {
    // English: M for million, K for thousand
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString();
  } else {
    // Korean: 만 (10,000 unit)
    if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}만`;
    }
    return value.toLocaleString();
  }
}
