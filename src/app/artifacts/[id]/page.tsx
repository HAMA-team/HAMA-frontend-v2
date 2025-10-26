"use client";

import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useArtifactStore } from '@/store/artifactStore';
import { formatDate } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Download, Share2, Trash2 } from 'lucide-react';
import { useDialogStore } from '@/store/dialogStore';

// Dynamic import로 ChatInput 불러와 i18n hydration 에러 방지
const ChatInput = dynamic(() => import('@/components/layout/ChatInput'), {
  ssr: false,
  loading: () => null,
});

/**
 * Artifact Detail Page
 *
 * Displays full artifact content with context-aware chat
 * Design reference: Mockup - 아티팩트 본문 뷰.png
 *
 * Features:
 * - Markdown rendering
 * - Action buttons (back, download, share)
 * - Context-Aware ChatInput (Phase 3+)
 */
export default function ArtifactDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { getArtifact } = useArtifactStore();
  const { openConfirm, openAlert } = useDialogStore();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const artifactId = params.id as string;
  const artifact = getArtifact(artifactId);

  // 마운트 전에는 렌더링을 지연시켜 hydration mismatch 방지 (LocalStorage 의존)
  if (!mounted) return null;

  // Handle artifact not found
  if (!artifact) {
    return (
      <div className="flex h-full w-full flex-col overflow-x-hidden" style={{ backgroundColor: "var(--main-background)" }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              {t("artifacts.notFound")}
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              {t("artifacts.notFoundDescription")}
            </p>
            <button
              onClick={() => router.push('/artifacts')}
              className="px-4 py-2 rounded-lg"
              style={{
                backgroundColor: 'var(--primary-500)',
                color: 'white',
              }}
            >
              {t("artifacts.backToList")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    // Create blob and download
    const blob = new Blob([artifact.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    // Phase 3: Implement share functionality
    openAlert({
      title: t('artifacts.share'),
      message: t('artifacts.shareComingSoon'),
    });
  };

  const handleDelete = () => {
    openConfirm({
      title: t('common.delete'),
      message: t('artifacts.deleteConfirm'),
      onConfirm: () => {
        const { deleteArtifact } = useArtifactStore.getState();
        deleteArtifact(artifact.id);
        router.push('/artifacts');
      },
    });
  };

  return (
    <>
      <div
        className="flex h-full w-full flex-col overflow-x-hidden pb-[120px]"
        style={{ backgroundColor: "var(--main-background)" }}
      >
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[800px] mx-auto px-4 py-8 w-full">
            {/* Header */}
            <div className="mb-8">
              {/* Back Button */}
              <button
                onClick={() => router.push('/artifacts')}
                className="flex items-center gap-2 mb-4 text-sm hover:underline"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                {t("artifacts.backToListShort")}
              </button>

              {/* Title and Meta */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1
                    className="text-3xl font-semibold tracking-tight break-words mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {artifact.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
                    <span>{formatDate(artifact.createdAt)}</span>
                    <span>•</span>
                    <span>{artifact.content.split(/\s+/).length} {t("artifacts.wordCount")}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                    style={{ backgroundColor: 'var(--container-background)' }}
                    title={t("artifacts.download")}
                  >
                    <Download className="w-5 h-5" strokeWidth={1.5} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                    style={{ backgroundColor: 'var(--container-background)' }}
                    title={t("artifacts.share")}
                  >
                    <Share2 className="w-5 h-5" strokeWidth={1.5} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                    style={{ backgroundColor: 'var(--container-background)' }}
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-5 h-5" strokeWidth={1.5} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <article
              className="prose prose-sm max-w-none break-words"
              style={{
                fontSize: "15px",
                lineHeight: "24px",
                color: "var(--text-primary)",
              }}
            >
              <ReactMarkdown
                components={{
                  // Headings
                  h1: ({ node, ...props }) => (
                    <h1
                      style={{
                        fontSize: "28px",
                        fontWeight: 700,
                        marginTop: "32px",
                        marginBottom: "16px",
                        letterSpacing: "-0.02em",
                        color: "var(--text-primary)",
                      }}
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: 600,
                        marginTop: "24px",
                        marginBottom: "12px",
                        letterSpacing: "-0.01em",
                        color: "var(--text-primary)",
                      }}
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: 600,
                        marginTop: "20px",
                        marginBottom: "8px",
                        color: "var(--text-primary)",
                      }}
                      {...props}
                    />
                  ),
                  // Paragraph
                  p: ({ node, ...props }) => (
                    <p style={{ marginBottom: "16px", color: "var(--text-primary)" }} {...props} />
                  ),
                  // Lists
                  ul: ({ node, ...props }) => (
                    <ul
                      style={{ marginBottom: "16px", paddingLeft: "24px", color: "var(--text-primary)" }}
                      {...props}
                    />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      style={{ marginBottom: "16px", paddingLeft: "24px", color: "var(--text-primary)" }}
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li style={{ marginBottom: "8px", color: "var(--text-primary)" }} {...props} />
                  ),
                  // Code
                  code: ({ node, inline, ...props }: any) =>
                    inline ? (
                      <code
                        style={{
                          backgroundColor: "var(--lnb-hover-bg)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "14px",
                          fontFamily: "'Monaco', 'Menlo', 'Courier New', monospace",
                          color: "var(--primary-600)",
                        }}
                        {...props}
                      />
                    ) : (
                      <code
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "'Monaco', 'Menlo', 'Courier New', monospace",
                        }}
                        {...props}
                      />
                    ),
                  pre: ({ node, ...props }) => (
                    <pre
                      style={{
                        backgroundColor: "var(--lnb-background)",
                        color: "var(--text-primary)",
                        padding: "16px",
                        borderRadius: "8px",
                        overflowX: "auto",
                        marginBottom: "16px",
                        border: "1px solid var(--border-default)",
                      }}
                      {...props}
                    />
                  ),
                  // Links
                  a: ({ node, ...props }) => (
                    <a
                      style={{
                        color: "var(--text-link)",
                        textDecoration: "underline",
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                  // Blockquote
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      style={{
                        borderLeft: "4px solid var(--primary-500)",
                        paddingLeft: "16px",
                        marginLeft: "0",
                        marginBottom: "16px",
                        color: "var(--text-secondary)",
                        fontStyle: "italic",
                      }}
                      {...props}
                    />
                  ),
                  // Strong/Bold
                  strong: ({ node, ...props }) => (
                    <strong style={{ fontWeight: 600, color: "var(--text-primary)" }} {...props} />
                  ),
                }}
              >
                {artifact.content}
              </ReactMarkdown>
            </article>
          </div>
        </div>
      </div>

      {/* Context-Aware Chat Input */}
      <ChatInput
        placeholder={t("artifacts.chatPlaceholder")}
        contextArtifactId={artifact.id}
      />
    </>
  );
}
