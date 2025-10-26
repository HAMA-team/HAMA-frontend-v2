import apiClient from "@/lib/api";

export async function searchStocks(query: string, limit = 10) {
  const { data } = await apiClient.get("/api/v1/stocks/search", { params: { q: query, limit } });
  return data;
}

export async function getStockInfo(stockCode: string) {
  const { data } = await apiClient.get(`/api/v1/stocks/${stockCode}`);
  return data;
}

export async function getPriceHistory(stockCode: string, range?: string) {
  const { data } = await apiClient.get(`/api/v1/stocks/${stockCode}/price-history`, { params: { range } });
  return data;
}

export async function getStockAnalysis(stockCode: string) {
  const { data } = await apiClient.get(`/api/v1/stocks/${stockCode}/analysis`);
  return data;
}

