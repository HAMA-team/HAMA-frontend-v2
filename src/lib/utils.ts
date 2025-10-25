import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Extract title from markdown content
 *
 * Strategy:
 * 1. Find first header (# to ######) - prefer fewer #'s
 * 2. If no headers, use first non-empty line
 * 3. Fallback to "Untitled Artifact"
 *
 * @param markdown - Markdown content
 * @returns Extracted title (max 100 chars)
 */
export function extractTitleFromMarkdown(markdown: string): string {
  const lines = markdown.trim().split('\n');

  // 1. Find first header (from # to ######)
  for (let level = 1; level <= 6; level++) {
    const headerRegex = new RegExp(`^#{${level}}\\s+(.+)$`, 'm');
    const match = markdown.match(headerRegex);
    if (match) {
      return match[1].trim().slice(0, 100);
    }
  }

  // 2. Use first non-empty line (skip code blocks)
  for (const line of lines) {
    const cleaned = line.trim();
    if (cleaned && !cleaned.startsWith('```') && !cleaned.startsWith('---')) {
      // Remove markdown formatting
      const title = cleaned
        .replace(/^[*_~`]+|[*_~`]+$/g, '') // Remove inline formatting
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Extract link text
        .trim();
      return title.slice(0, 100);
    }
  }

  // 3. Fallback
  return 'Untitled Artifact';
}

/**
 * Generate a short summary from markdown content
 *
 * @param markdown - Markdown content
 * @param maxLength - Maximum length (default: 150)
 * @returns Summary text
 */
export function generateSummary(markdown: string, maxLength = 150): string {
  const lines = markdown.trim().split('\n');

  // Skip headers and find first paragraph
  for (const line of lines) {
    const cleaned = line.trim();
    if (
      cleaned &&
      !cleaned.startsWith('#') &&
      !cleaned.startsWith('```') &&
      !cleaned.startsWith('---') &&
      cleaned.length > 20 // At least 20 chars for meaningful summary
    ) {
      const summary = cleaned
        .replace(/^[*_~`]+|[*_~`]+$/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();
      return summary.length > maxLength
        ? summary.slice(0, maxLength) + '...'
        : summary;
    }
  }

  // Fallback: use first 150 chars
  const text = markdown.replace(/[#*_~`\[\]()]/g, '').trim();
  return text.length > maxLength
    ? text.slice(0, maxLength) + '...'
    : text || 'No description available';
}
