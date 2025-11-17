import { create } from 'zustand';
import {
  fetchArtifactsList,
  fetchArtifactDetail,
  createArtifact as createArtifactAPI,
  updateArtifact as updateArtifactAPI,
  deleteArtifact as deleteArtifactAPI,
  ArtifactListItem,
  ArtifactDetail,
  ArtifactType,
} from '@/lib/api/artifacts';

/**
 * Artifact Store (Backend API 기반)
 *
 * Phase 3: Backend API 연동 완료
 * - LocalStorage 제거
 * - 모든 데이터는 Backend DB에서 가져옴
 */

interface ArtifactStore {
  // State
  artifacts: ArtifactListItem[];
  currentArtifact: ArtifactDetail | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadArtifacts: () => Promise<void>;
  loadArtifact: (id: string) => Promise<void>;
  createArtifact: (params: {
    title: string;
    content: string;
    artifact_type: ArtifactType;
    metadata?: Record<string, any>;
  }) => Promise<ArtifactDetail>;
  updateArtifact: (
    id: string,
    updates: {
      title?: string;
      content?: string;
      metadata?: Record<string, any>;
    }
  ) => Promise<void>;
  deleteArtifact: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useArtifactStore = create<ArtifactStore>((set, get) => ({
  // Initial state
  artifacts: [],
  currentArtifact: null,
  isLoading: false,
  error: null,

  /**
   * Load artifacts list from API
   */
  loadArtifacts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchArtifactsList();
      set({ artifacts: response.items, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load artifacts',
        isLoading: false,
      });
    }
  },

  /**
   * Load single artifact detail from API
   */
  loadArtifact: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const artifact = await fetchArtifactDetail(id);
      set({ currentArtifact: artifact, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load artifact',
        isLoading: false,
        currentArtifact: null,
      });
    }
  },

  /**
   * Create new artifact via API
   */
  createArtifact: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const newArtifact = await createArtifactAPI(params);

      // Update list (prepend new item)
      set((state) => ({
        artifacts: [
          {
            artifact_id: newArtifact.artifact_id,
            title: newArtifact.title,
            artifact_type: newArtifact.artifact_type,
            preview: newArtifact.preview,
            created_at: newArtifact.created_at,
          },
          ...state.artifacts,
        ],
        isLoading: false,
      }));

      return newArtifact;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create artifact',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Update artifact via API
   */
  updateArtifact: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateArtifactAPI(id, updates);

      // Update in list
      set((state) => ({
        artifacts: state.artifacts.map((item) =>
          item.artifact_id === id
            ? {
                ...item,
                title: updated.title,
                preview: updated.preview,
              }
            : item
        ),
        currentArtifact:
          state.currentArtifact?.artifact_id === id ? updated : state.currentArtifact,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update artifact',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Delete artifact via API (soft delete)
   */
  deleteArtifact: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteArtifactAPI(id);

      // Remove from list
      set((state) => ({
        artifacts: state.artifacts.filter((item) => item.artifact_id !== id),
        currentArtifact:
          state.currentArtifact?.artifact_id === id ? null : state.currentArtifact,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete artifact',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },
}));
