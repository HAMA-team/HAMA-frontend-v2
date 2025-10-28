import apiClient from "@/lib/api";

// Minimal types for health checks
export interface ArtifactListResponse {
  artifacts?: Array<{
    id: string;
    title?: string;
    created_at?: string;
  }>;
}

export async function fetchArtifactsList() {
  const { data } = await apiClient.get<ArtifactListResponse>("/api/v1/artifacts/");
  return data;
}

