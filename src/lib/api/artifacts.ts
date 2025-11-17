import apiClient from "@/lib/api";

/**
 * Artifact API Client
 *
 * Based on openapi.json schema
 * Endpoints:
 * - POST   /api/v1/artifacts/          # Create
 * - GET    /api/v1/artifacts/          # List
 * - GET    /api/v1/artifacts/{id}      # Get
 * - PUT    /api/v1/artifacts/{id}      # Update
 * - DELETE /api/v1/artifacts/{id}      # Delete (soft)
 */

// ==================== Types ====================

export type ArtifactType = 'analysis' | 'portfolio' | 'strategy' | 'research' | 'risk_report';

/**
 * Artifact 목록 아이템 (요약 정보)
 */
export interface ArtifactListItem {
  artifact_id: string; // UUID
  title: string;
  artifact_type: ArtifactType;
  preview: string | null; // 첫 200자 미리보기
  created_at: string; // ISO datetime
}

/**
 * Artifact 목록 응답
 */
export interface ArtifactListResponse {
  items: ArtifactListItem[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Artifact 상세 정보
 */
export interface ArtifactDetail {
  artifact_id: string; // UUID
  user_id: string; // UUID
  title: string;
  content: string; // Markdown
  artifact_type: ArtifactType;
  metadata: Record<string, any>;
  preview: string | null;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

/**
 * Artifact 생성 요청
 */
export interface CreateArtifactRequest {
  title: string;
  content: string; // Markdown
  artifact_type: ArtifactType;
  metadata?: Record<string, any>;
}

/**
 * Artifact 수정 요청
 */
export interface UpdateArtifactRequest {
  title?: string;
  content?: string;
  metadata?: Record<string, any>;
}

// ==================== API Functions ====================

/**
 * Artifact 목록 조회
 *
 * @param artifact_type - 필터링할 타입 (선택)
 * @param limit - 페이지 크기 (기본 20, 최대 100)
 * @param offset - 오프셋 (기본 0)
 */
export async function fetchArtifactsList(params?: {
  artifact_type?: ArtifactType;
  limit?: number;
  offset?: number;
}): Promise<ArtifactListResponse> {
  const { data } = await apiClient.get<ArtifactListResponse>("/api/v1/artifacts/", {
    params: {
      artifact_type: params?.artifact_type,
      limit: params?.limit ?? 20,
      offset: params?.offset ?? 0,
    },
  });
  return data;
}

/**
 * Artifact 상세 조회
 *
 * @param artifact_id - Artifact UUID
 */
export async function fetchArtifactDetail(artifact_id: string): Promise<ArtifactDetail> {
  const { data } = await apiClient.get<ArtifactDetail>(`/api/v1/artifacts/${artifact_id}`);
  return data;
}

/**
 * Artifact 생성
 *
 * @param request - 생성 요청 데이터
 */
export async function createArtifact(request: CreateArtifactRequest): Promise<ArtifactDetail> {
  const { data } = await apiClient.post<ArtifactDetail>("/api/v1/artifacts/", request);
  return data;
}

/**
 * Artifact 수정
 *
 * @param artifact_id - Artifact UUID
 * @param request - 수정 요청 데이터
 */
export async function updateArtifact(
  artifact_id: string,
  request: UpdateArtifactRequest
): Promise<ArtifactDetail> {
  const { data } = await apiClient.put<ArtifactDetail>(
    `/api/v1/artifacts/${artifact_id}`,
    request
  );
  return data;
}

/**
 * Artifact 삭제 (소프트 삭제)
 *
 * @param artifact_id - Artifact UUID
 */
export async function deleteArtifact(artifact_id: string): Promise<void> {
  await apiClient.delete(`/api/v1/artifacts/${artifact_id}`);
}
