/**
 * Approvals API Client
 *
 * HITL 승인/거부 관련 API 호출
 *
 * @see docs/qa/Settings_Approvals_API_Complete_Design.md - Section 3
 */

import apiClient from '@/lib/api';
import type { ApprovalRequest, ApprovalResponse } from '@/types/hitl';

export interface ApprovalListResponse {
  approvals?: Array<{
    id: string;
    created_at?: string;
    status?: string;
  }>;
}

/**
 * GET /api/v1/approvals/
 *
 * HITL 승인 내역 조회
 *
 * @returns List of approval history
 */
export async function fetchApprovalsList() {
  const { data } = await apiClient.get<ApprovalListResponse>('/api/v1/approvals/');
  return data;
}

/**
 * POST /api/v1/chat/approve
 *
 * HITL 승인/거부 처리
 *
 * @param request - ApprovalRequest with thread_id and decision
 * @returns ApprovalResponse with success status and result
 */
export async function approveAction(
  request: ApprovalRequest
): Promise<ApprovalResponse> {
  const { data } = await apiClient.post<ApprovalResponse>(
    '/api/v1/chat/approve',
    request
  );
  return data;
}

