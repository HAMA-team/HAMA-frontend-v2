"use client";

import { useParams, useRouter } from 'next/navigation';
import { useArtifactStore } from '@/store/artifactStore';
import { formatDate } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import ChatInput from '@/components/layout/ChatInput';

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
  const params = useParams();
  const router = useRouter();
  const { getArtifact } = useArtifactStore();

  const artifactId = params.id as string;
  const artifact = getArtifact(artifactId);

  // Handle artifact not found
  if (!artifact) {
    return (
      <div className="flex h-full w-full flex-col overflow-x-hidden" style={{ backgroundColor: "var(--main-background)" }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              아티팩트를 찾을 수 없습니다
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              이 아티팩트는 삭제되었거나 존재하지 않습니다
            </p>
            <button
              onClick={() => router.push('/artifacts')}
              className="px-4 py-2 rounded-lg"
              style={{
                backgroundColor: 'var(--primary-500)',
                color: 'white',
              }}
            >
              아티팩트 목록으로 돌아가기
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
    alert('공유 기능은 Phase 3에서 구현될 예정입니다');
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
                아티팩트 목록
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
                    <span>{artifact.content.split(/\s+/).length} 단어</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                    style={{ backgroundColor: 'var(--container-background)' }}
                    title="다운로드"
                  >
                    <Download className="w-5 h-5" strokeWidth={1.5} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                    style={{ backgroundColor: 'var(--container-background)' }}
                    title="공유"
                  >
                    <Share2 className="w-5 h-5" strokeWidth={1.5} style={{ color: 'var(--text-secondary)' }} />
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
        placeholder="이 아티팩트에 대해 질문하기..."
        contextArtifactId={artifact.id}
      />
    </>
  );
}
