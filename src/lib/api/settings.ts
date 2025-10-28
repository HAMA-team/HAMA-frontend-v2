import apiClient from "@/lib/api";

export interface AutomationLevelResponse {
  automation_level: number;
}

export interface AutomationLevelsResponse {
  levels: Array<{ id: number; name: string }>;
}

export async function fetchAutomationLevel() {
  const { data } = await apiClient.get<AutomationLevelResponse>(
    "/api/v1/settings/automation-level"
  );
  return data;
}

export async function fetchAutomationLevels() {
  const { data } = await apiClient.get<AutomationLevelsResponse>(
    "/api/v1/settings/automation-levels"
  );
  return data;
}

export async function updateAutomationLevel(level: number) {
  const { data } = await apiClient.put<AutomationLevelResponse>(
    "/api/v1/settings/automation-level",
    { automation_level: level }
  );
  return data;
}

