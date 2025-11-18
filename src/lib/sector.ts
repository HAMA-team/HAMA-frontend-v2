export type SectorKey =
  | "semiconductor"
  | "battery"
  | "it"
  | "bio"
  | "chemicals"
  | "foodBeverage"
  | "entertainment"
  | "other";

const SECTOR_SYNONYMS: Record<SectorKey, string[]> = {
  semiconductor: ["반도체", "semiconductor", "semiconductors"],
  battery: ["배터리", "battery", "batteries"],
  it: ["it", "정보기술"],
  bio: ["바이오", "bio", "biotech", "biotechnology"],
  chemicals: ["화학", "chemicals", "chemical"],
  foodBeverage: ["식품", "음료", "식품/음료", "food", "beverage", "food & beverage"],
  entertainment: ["엔터", "엔터테인먼트", "entertainment", "media"],
  other: [],
};

const STOCK_SECTOR_BY_NAME: Record<string, SectorKey> = {
  // Food & Beverage / Consumer
  "삼양식품": "foodBeverage",
  "Samyang Foods": "foodBeverage",
  "CJ": "foodBeverage",
  "CJ제일제당": "foodBeverage",
  "CJ CheilJedang": "foodBeverage",

  // Semiconductors / IT
  "SK하이닉스": "semiconductor",
  "SK hynix": "semiconductor",
  "삼성전자": "semiconductor",
  "Samsung Electronics": "semiconductor",
  "삼성전자우": "semiconductor",

  // Chemicals / Materials
  "LG화학": "chemicals",
  "LG Chem": "chemicals",

  // Entertainment
  "JYP Ent.": "entertainment",
  "JYP Entertainment": "entertainment",
};

export function normalizeSector(rawSector?: string | null, name?: string | null): SectorKey {
  const sector = (rawSector || "").trim();
  const stockName = (name || "").trim();

  // 1) 백엔드에서 온 섹터 문자열을 우선적으로 정규화
  if (sector) {
    const lower = sector.toLowerCase();
    for (const [key, synonyms] of Object.entries(SECTOR_SYNONYMS) as [SectorKey, string[]][]) {
      if (synonyms.some((s) => lower === s.toLowerCase())) {
        return key;
      }
    }
  }

  // 2) 종목명 기반 매핑 (현재 보유 종목 위주)
  if (stockName && STOCK_SECTOR_BY_NAME[stockName]) {
    return STOCK_SECTOR_BY_NAME[stockName];
  }

  // 3) 매칭 실패 시 기타
  return "other";
}

