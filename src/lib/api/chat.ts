/**
 * Chat API Client
 *
 * 채팅 및 대화 세션 관련 API 호출
 *
 * @see docs/qa/Settings_Approvals_API_Complete_Design.md - Section 1, 3
 */

import apiClient from '@/lib/api';
import type { HITLConfig } from '@/types/hitl';

export interface SendChatPayload {
  message: string;
  conversation_id?: string | null;
  hitl_config: HITLConfig; // automation_level → hitl_config 변경
}

export interface ChatAPIResponse {
  message: string;
  conversation_id: string;
  requires_approval?: boolean;
  approval_request?: any | null;
  metadata?: any | null;
}

export async function sendChat(payload: SendChatPayload) {
  const { data } = await apiClient.post<ChatAPIResponse>('/api/v1/chat/', payload);
  return data;
}

export async function getChatSessions(limit = 50) {
  const { data } = await apiClient.get("/api/v1/chat/sessions", { params: { limit } });
  return data;
}

export async function getChatHistory(conversationId: string, limit = 100) {
  const { data } = await apiClient.get(`/api/v1/chat/sessions/${conversationId}`);
  return data;
}

export async function deleteChatHistory(conversationId: string) {
  const { data } = await apiClient.delete(`/api/v1/chat/sessions/${conversationId}`);
  return data;
}

// (Optional) Rename endpoint 제공 시 사용 예
// export async function renameChatSession(conversationId: string, title: string) {
//   const { data } = await apiClient.patch(`/api/v1/chat/sessions/${conversationId}`, { title });
//   return data;
// }
