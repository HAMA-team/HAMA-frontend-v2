import apiClient from "@/lib/api";

// Minimal types for health checks
export interface ArtifactListResponse {
  artifacts?: Array<{
    id: string;
    title?: string;
    created_at?: string;
  }>;
}

export interface CreateArtifactPayload {
  title: string;
  content: string;
  artifact_type?: string;
  metadata?: Record<string, any>;
}

export interface CreateArtifactResponse {
  artifact_id?: string;
  id?: string;
  title?: string;
}

export async function fetchArtifactsList() {
  const { data } = await apiClient.get<ArtifactListResponse>("/api/v1/artifacts/");
  return data;
}

export async function createArtifact(payload: CreateArtifactPayload) {
  const body = { artifact_type: "analysis", ...payload };
  const { data } = await apiClient.post<CreateArtifactResponse>("/api/v1/artifacts/", body);
  return data;
}
