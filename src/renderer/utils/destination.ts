export const buildDestinationPath = (base: string, projectName: string) => {
  const trimmedBase = base.trim();
  if (!trimmedBase) return '';
  const normalizedBase = trimmedBase === '/' ? '/' : trimmedBase.replace(/[\\/]+$/, '');
  const separator = trimmedBase.includes('\\') && !trimmedBase.includes('/') ? '\\' : '/';
  const trimmedName = projectName.trim();
  if (!trimmedName) return normalizedBase;
  if (normalizedBase === '/') {
    return `/${trimmedName}`;
  }
  return `${normalizedBase}${separator}${trimmedName}`;
};
