import apiClient from "@/lib/api";

export interface ApprovalListResponse {
  approvals?: Array<{
    id: string;
    created_at?: string;
    status?: string;
  }>;
}

export async function fetchApprovalsList() {
  const { data } = await apiClient.get<ApprovalListResponse>("/api/v1/approvals/");
  return data;
}

