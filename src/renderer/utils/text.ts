export const truncate = (text: string, max = 32) => (text.length > max ? `${text.slice(0, max)}…` : text);

export const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/** Compare two semver-like version strings for equality */
export const isSameVersion = (remote?: string, installed?: string): boolean => {
  if (!remote || !installed) return false;
  const toParts = (v: string) => v.split('.').map((n) => parseInt(n, 10));
  const [a1, a2 = 0, a3 = 0] = toParts(remote);
  const [b1, b2 = 0, b3 = 0] = toParts(installed);
  return a1 === b1 && a2 === b2 && a3 === b3;
};
