import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { extractTitleFromMarkdown, generateSummary } from '@/lib/utils';

/**
 * Artifact Type
 *
 * Represents a saved AI response/analysis
 * Stored in LocalStorage (Phase 1-2)
 * Will migrate to Backend DB in Phase 3
 */
export interface Artifact {
  id: string;
  title: string;
  summary: string;
  content: string; // Markdown content
  icon: string; // Emoji or icon name
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  tags?: string[]; // Optional tags for filtering (Phase 3+)
}

interface ArtifactStore {
  artifacts: Artifact[];
  addArtifact: (content: string, icon?: string) => Artifact;
  getArtifact: (id: string) => Artifact | undefined;
  deleteArtifact: (id: string) => void;
  updateArtifact: (id: string, updates: Partial<Artifact>) => void;
}

/**
 * Artifact Store (Zustand + LocalStorage)
 *
 * Phase 1-2: LocalStorage persistence
 * Phase 3: Migrate to Backend API
 */
export const useArtifactStore = create<ArtifactStore>()(
  persist(
    (set, get) => ({
      artifacts: [],

      /**
       * Add new artifact
       *
       * @param content - Markdown content
       * @param icon - Optional icon (default: 📄)
       * @returns Created artifact
       */
      addArtifact: (content: string, icon = '📄') => {
        const now = new Date().toISOString();
        const newArtifact: Artifact = {
          id: `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: extractTitleFromMarkdown(content),
          summary: generateSummary(content),
          content,
          icon,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          artifacts: [newArtifact, ...state.artifacts], // Newest first
        }));

        return newArtifact;
      },

      /**
       * Get artifact by ID
       */
      getArtifact: (id: string) => {
        return get().artifacts.find((artifact) => artifact.id === id);
      },

      /**
       * Delete artifact
       */
      deleteArtifact: (id: string) => {
        set((state) => ({
          artifacts: state.artifacts.filter((artifact) => artifact.id !== id),
        }));
      },

      /**
       * Update artifact
       */
      updateArtifact: (id: string, updates: Partial<Artifact>) => {
        set((state) => ({
          artifacts: state.artifacts.map((artifact) =>
            artifact.id === id
              ? { ...artifact, ...updates, updatedAt: new Date().toISOString() }
              : artifact
          ),
        }));
      },
    }),
    {
      name: 'hama-artifacts-storage', // LocalStorage key
    }
  )
);
