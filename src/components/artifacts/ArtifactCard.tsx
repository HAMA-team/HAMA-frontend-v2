"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useArtifactStore } from '@/store/artifactStore';
import { ArtifactListItem } from '@/lib/api/artifacts';
import { formatRelativeOrDate, formatAbsoluteDate } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useDialogStore } from '@/store/dialogStore';

interface ArtifactCardProps {
  artifact: ArtifactListItem;
}

/**
 * ArtifactCard Component
 *
 * Displays artifact preview in grid view
 * Design reference: Mockup - 아티팩트 목록 그리드 뷰.png
 */
export default function ArtifactCard({ artifact }: ArtifactCardProps) {
  const { deleteArtifact } = useArtifactStore();
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const { openConfirm } = useDialogStore();

  useEffect(() => {
    if (!menuOpen) return;
    const onGlobalClick = () => setMenuOpen(false);
    window.addEventListener('click', onGlobalClick);
    return () => window.removeEventListener('click', onGlobalClick);
  }, [menuOpen]);

  // 다른 카드에서 컨텍스트 메뉴를 열면, 현재 열린 메뉴는 닫히도록 글로벌 이벤트 처리
  useEffect(() => {
    const onAnyContextOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id?: string } | undefined;
      if (detail?.id !== artifact.artifact_id) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('artifact-contextmenu-open', onAnyContextOpen as EventListener);
    return () => window.removeEventListener('artifact-contextmenu-open', onAnyContextOpen as EventListener);
  }, [artifact.artifact_id]);

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    // 다른 카드의 메뉴를 닫도록 브로드캐스트
    window.dispatchEvent(new CustomEvent('artifact-contextmenu-open', { detail: { id: artifact.artifact_id } }));
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    openConfirm({
      title: t('common.delete'),
      message: t('artifacts.deleteConfirm'),
      onConfirm: async () => {
        try {
          await deleteArtifact(artifact.artifact_id);
        } catch (error) {
          console.error('Failed to delete artifact:', error);
        }
      },
    });
    setMenuOpen(false);
  };

  // Get icon based on artifact type
  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      analysis: '📊',
      portfolio: '💼',
      strategy: '🎯',
      research: '🔍',
      risk_report: '⚠️',
    };
    return icons[type] || '📄';
  };

  return (
    <Link href={`/artifacts/${artifact.artifact_id}`}>
      <div
        onContextMenu={handleContextMenu}
        className="group p-6 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer relative h-full flex flex-col min-h-[240px]"
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
          {getIcon(artifact.artifact_type)}
        </div>

        {/* Title + Summary (flex-1 to push date to bottom) */}
        <div className="flex-1">
          <h3
            className="text-lg font-semibold mb-2 line-clamp-2 group-hover:underline"
            style={{ color: 'var(--text-primary)' }}
          >
            {artifact.title}
          </h3>

          {/* Preview */}
          {artifact.preview && (
            <p
              className="text-sm mb-4 line-clamp-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {artifact.preview}
            </p>
          )}
        </div>

        {/* Date (sticks to bottom via flex) */}
        <p
          className="text-xs mt-auto"
          style={{ color: 'var(--text-muted)' }}
          title={formatAbsoluteDate(artifact.created_at, i18n?.language || 'en')}
        >
          {formatRelativeOrDate(artifact.created_at, i18n?.language || 'en', 30)}
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
