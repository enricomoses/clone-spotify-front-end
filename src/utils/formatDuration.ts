/**
 * Format duration in seconds to mm:ss string.
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format duration in milliseconds to mm:ss string.
 */
export function formatDurationMs(ms: number): string {
  return formatDuration(ms / 1000);
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a number with commas (e.g., 1234567 → "1,234,567")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Get a greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 17) return 'Selamat Siang';
  if (hour < 21) return 'Selamat Sore';
  return 'Selamat Malam';
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format date string to relative time words (e.g. "one minute ago", "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins === 1) {
    return '1 minute ago';
  } else if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffHrs === 1) {
    return '1 hour ago';
  } else if (diffHrs < 24) {
    return `${diffHrs} hours ago`;
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
