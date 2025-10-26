import apiClient from "@/lib/api";

export interface SendChatPayload {
  message: string;
  conversation_id?: string | null;
  automation_level?: 1 | 2 | 3;
}

export interface ChatAPIResponse {
  message: string;
  conversation_id: string;
  requires_approval?: boolean;
  approval_request?: any | null;
  metadata?: any | null;
}

export async function sendChat(payload: SendChatPayload) {
  const { data } = await apiClient.post<ChatAPIResponse>("/api/v1/chat/", payload);
  return data;
}

export interface ApproveActionPayload {
  thread_id: string; // conversation_id와 동일 의미
  decision: "approved" | "rejected" | "modified";
  automation_level?: 1 | 2 | 3;
  modifications?: Record<string, any> | null;
  user_notes?: string | null;
}

export interface ApprovalResponse {
  message: string;
  conversation_id: string;
}

export async function approveAction(payload: ApproveActionPayload) {
  const { data } = await apiClient.post<ApprovalResponse>("/api/v1/chat/approve", payload);
  return data;
}

export async function getChatSessions(limit = 50) {
  const { data } = await apiClient.get("/api/v1/chat/sessions", { params: { limit } });
  return data;
}

export async function getChatHistory(conversationId: string, limit = 100) {
  const { data } = await apiClient.get(`/api/v1/chat/history/${conversationId}`, { params: { limit } });
  return data;
}

export async function deleteChatHistory(conversationId: string) {
  const { data } = await apiClient.delete(`/api/v1/chat/history/${conversationId}`);
  return data;
}

// (Optional) Rename endpoint 제공 시 사용 예
// export async function renameChatSession(conversationId: string, title: string) {
//   const { data } = await apiClient.patch(`/api/v1/chat/sessions/${conversationId}`, { title });
//   return data;
// }
