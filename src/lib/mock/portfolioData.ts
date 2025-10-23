import { Portfolio } from "@/lib/types/portfolio";

/**
 * 테스트용 포트폴리오 데이터
 *
 * Phase 1에서 사용할 Mock 데이터
 * API 연동 전까지 사용
 */
export const mockPortfolio: Portfolio = {
  summary: {
    totalValue: 52800000, // 5,280만원
    totalReturn: 3060000, // +306만원
    totalReturnRate: 6.15, // +6.15%
    stockCount: 6,
    cash: 5000000, // 500만원
  },
  stocks: [
    {
      code: "005930",
      name: "삼성전자",
      quantity: 150,
      averagePrice: 68000,
      currentPrice: 72000,
      value: 10800000, // 1,080만원 (150 * 72,000)
      return: 600000, // +60만원
      returnRate: 5.88, // +5.88%
      weight: 20.45, // 20.45% (10,800,000 / 52,800,000)
      sector: "반도체",
    },
    {
      code: "000660",
      name: "SK하이닉스",
      quantity: 80,
      averagePrice: 118000,
      currentPrice: 125000,
      value: 10000000, // 1,000만원 (80 * 125,000)
      return: 560000, // +56만원
      returnRate: 5.93, // +5.93%
      weight: 18.94, // 18.94% (10,000,000 / 52,800,000)
      sector: "반도체",
    },
    {
      code: "373220",
      name: "LG에너지솔루션",
      quantity: 25,
      averagePrice: 450000,
      currentPrice: 480000,
      value: 12000000, // 1,200만원 (25 * 480,000)
      return: 750000, // +75만원
      returnRate: 6.67, // +6.67%
      weight: 22.73, // 22.73% (12,000,000 / 52,800,000)
      sector: "배터리",
    },
    {
      code: "035420",
      name: "NAVER",
      quantity: 30,
      averagePrice: 195000,
      currentPrice: 210000,
      value: 6300000, // 630만원 (30 * 210,000)
      return: 450000, // +45만원
      returnRate: 7.69, // +7.69%
      weight: 11.93, // 11.93% (6,300,000 / 52,800,000)
      sector: "IT",
    },
    {
      code: "035720",
      name: "카카오",
      quantity: 100,
      averagePrice: 48000,
      currentPrice: 52000,
      value: 5200000, // 520만원 (100 * 52,000)
      return: 400000, // +40만원
      returnRate: 8.33, // +8.33%
      weight: 9.85, // 9.85% (5,200,000 / 52,800,000)
      sector: "IT",
    },
    {
      code: "207940",
      name: "삼성바이오로직스",
      quantity: 10,
      averagePrice: 820000,
      currentPrice: 850000,
      value: 8500000, // 850만원 (10 * 850,000)
      return: 300000, // +30만원
      returnRate: 3.66, // +3.66%
      weight: 16.10, // 16.10% (8,500,000 / 52,800,000)
      sector: "바이오",
    },
  ],
};

/**
 * 차트 색상 및 수익률 색상은 useChartColors 훅으로 이동
 * @see src/lib/hooks/useChartColors.ts
 *
 * 모든 색상은 CSS 변수로 관리되며, 다크 모드에 따라 자동으로 변경됩니다.
 */
