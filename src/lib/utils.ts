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
 * Format a date as a localized relative time string.
 * Uses numeric expressions only (e.g., "2 days ago" / "2일 전").
 * Falls back to "just now" / "방금 전" for very recent times.
 */
export function formatRelativeTime(
  value: Date | string | number,
  locale: string = 'en'
): string {
  const date =
    value instanceof Date
      ? value
      : typeof value === 'string'
      ? new Date(value)
      : new Date(value);

  const now = Date.now();
  const diffSeconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));

  const isKo = locale.startsWith('ko');
  if (diffSeconds < 10) {
    return isKo ? '방금 전' : 'just now';
  }

  const MINUTE = 60;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY; // approximation for demo purposes
  const YEAR = 365 * DAY; // approximation

  const rtf = new Intl.RelativeTimeFormat(isKo ? 'ko' : 'en', {
    numeric: 'always',
  });

  if (diffSeconds < MINUTE) {
    const secs = Math.max(1, diffSeconds);
    return rtf.format(-secs, 'second');
  }
  if (diffSeconds < HOUR) {
    const mins = Math.max(1, Math.floor(diffSeconds / MINUTE));
    return rtf.format(-mins, 'minute');
  }
  if (diffSeconds < DAY) {
    const hours = Math.max(1, Math.floor(diffSeconds / HOUR));
    return rtf.format(-hours, 'hour');
  }
  if (diffSeconds < WEEK) {
    const days = Math.max(1, Math.floor(diffSeconds / DAY));
    return rtf.format(-days, 'day');
  }
  if (diffSeconds < MONTH) {
    const weeks = Math.max(1, Math.floor(diffSeconds / WEEK));
    return rtf.format(-weeks, 'week');
  }
  if (diffSeconds < YEAR) {
    const months = Math.max(1, Math.floor(diffSeconds / MONTH));
    return rtf.format(-months, 'month');
  }
  const years = Math.max(1, Math.floor(diffSeconds / YEAR));
  return rtf.format(-years, 'year');
}

/**
 * Format as relative time until a threshold, then switch to absolute date.
 * thresholdDays: after this many days, show date instead of relative.
 */
export function formatRelativeOrDate(
  value: Date | string | number,
  locale: string = 'en',
  thresholdDays = 30
): string {
  const date =
    value instanceof Date
      ? value
      : typeof value === 'string'
      ? new Date(value)
      : new Date(value);

  const diffMs = Date.now() - date.getTime();
  const diffDays = diffMs / (24 * 60 * 60 * 1000);

  if (diffDays >= thresholdDays) {
    return formatAbsoluteDate(value, locale);
  }
  return formatRelativeTime(value, locale);
}

/**
 * Format an absolute date in a locale-aware way.
 * en: e.g., "Jan 5, 2025"; ko: e.g., "2025. 1. 5." (system default style)
 */
export function formatAbsoluteDate(
  value: Date | string | number,
  locale: string = 'en'
): string {
  const date =
    value instanceof Date
      ? value
      : typeof value === 'string'
      ? new Date(value)
      : new Date(value);

  const isKo = locale.startsWith('ko');
  const fmt = new Intl.DateTimeFormat(isKo ? 'ko' : locale || 'en',
    isKo
      ? { year: 'numeric', month: 'numeric', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' }
  );
  return fmt.format(date);
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
