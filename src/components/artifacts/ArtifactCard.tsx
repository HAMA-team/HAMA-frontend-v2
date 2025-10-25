import Link from 'next/link';
import { Artifact } from '@/store/artifactStore';
import { formatDate } from '@/lib/utils';

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
  return (
    <Link href={`/artifacts/${artifact.id}`}>
      <div
        className="group p-6 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer"
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
      </div>
    </Link>
  );
}
