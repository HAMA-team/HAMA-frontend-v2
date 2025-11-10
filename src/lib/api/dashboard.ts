import apiClient from "@/lib/api";

export async function fetchDashboard() {
  const { data } = await apiClient.get("/api/v1/dashboard/");
  return data;
}

