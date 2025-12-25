/**
 * Resolves marketplace input to full URL.
 * Supports: owner/repo shorthand, full GitHub URLs, direct manifest URLs
 */
export function resolveMarketplaceUrl(input: string): string {
  const trimmed = input.trim();

  // Already a full URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Local file path
  if (trimmed.startsWith('file://')) {
    return trimmed;
  }

  // owner/repo shorthand -> GitHub releases URL
  const shorthandMatch = trimmed.match(/^([^/]+)\/([^/]+)$/);
  if (shorthandMatch) {
    const [, owner, repo] = shorthandMatch;
    return `https://github.com/${owner}/${repo}/releases/latest`;
  }

  throw new Error(`Invalid marketplace URL: "${input}". Use owner/repo or full URL.`);
}

/**
 * Validates marketplace URL format
 */
export function isValidMarketplaceUrl(input: string): boolean {
  try {
    resolveMarketplaceUrl(input);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate stable ID from URL
 */
export function deriveMarketplaceId(url: string): string {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) {
    return `${match[1]}-${match[2]}`.toLowerCase();
  }
  // Fallback: simple hash for non-GitHub URLs
  const hash = url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `custom-${hash}`;
}

/**
 * Derive display name from URL
 */
export function deriveMarketplaceName(url: string): string {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) {
    return `${match[1]}/${match[2]}`;
  }
  // For manifest URLs, extract filename
  if (url.endsWith('.json')) {
    const filename = url.split('/').pop()?.replace('.json', '');
    return filename || 'Custom';
  }
  return 'Custom';
}
