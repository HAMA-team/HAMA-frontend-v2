"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Artifact, useArtifactStore } from '@/store/artifactStore';
import { formatDate } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useDialogStore } from '@/store/dialogStore';

interface ArtifactCardProps {
  artifact: Artifact;
}

/**
 * ArtifactCard Component
 *
 * Displays artifact preview in grid view
 * Design reference: Mockup - 아티팩트 목록 그리드 뷰.png
 */
export default function ArtifactCard({ artifact }: ArtifactCardProps) {
  const { deleteArtifact } = useArtifactStore();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const { openConfirm } = useDialogStore();

  useEffect(() => {
    if (!menuOpen) return;
    const onGlobalClick = () => setMenuOpen(false);
    window.addEventListener('click', onGlobalClick);
    return () => window.removeEventListener('click', onGlobalClick);
  }, [menuOpen]);

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    openConfirm({
      title: t('common.delete'),
      message: t('artifacts.deleteConfirm'),
      onConfirm: () => {
        deleteArtifact(artifact.id);
      },
    });
    setMenuOpen(false);
  };

  return (
    <Link href={`/artifacts/${artifact.id}`}>
      <div
        onContextMenu={handleContextMenu}
        className="group p-6 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer relative"
        style={{
          backgroundColor: 'var(--container-background)',
          borderColor: 'var(--border-default)',
        }}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4"
          style={{ backgroundColor: 'var(--primary-50)' }}
        >
          {artifact.icon}
        </div>

        {/* Title */}
        <h3
          className="text-lg font-semibold mb-2 line-clamp-2 group-hover:underline"
          style={{ color: 'var(--text-primary)' }}
        >
          {artifact.title}
        </h3>

        {/* Summary */}
        <p
          className="text-sm mb-4 line-clamp-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {artifact.summary}
        </p>

        {/* Date */}
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {formatDate(artifact.createdAt)}
        </p>

        {/* Context Menu */}
        {menuOpen && (
          <div
            className="fixed min-w-[140px] rounded-md shadow-lg border py-1 z-modal"
            style={{
              left: `${menuPos.x}px`,
              top: `${menuPos.y}px`,
              backgroundColor: 'var(--container-background)',
              borderColor: 'var(--border-default)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleDelete}
              className="w-full text-left px-3 py-2 text-sm hover:opacity-80"
              style={{ color: 'var(--text-error)' }}
            >
              {t('common.delete')}
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
