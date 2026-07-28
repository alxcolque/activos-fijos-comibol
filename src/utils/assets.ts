export const getAssetUrl = (path?: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  // Remove leading slashes, dot-slashes, or ../public/
  const cleanPath = path
    .replace(/^(\.\.\/)+public\//, '')
    .replace(/^(\.\/)+public\//, '')
    .replace(/^(\.\/)+/, '')
    .replace(/^\//, '');

  const baseUrl = import.meta.env.BASE_URL;
  return baseUrl.endsWith('/') ? `${baseUrl}${cleanPath}` : `${baseUrl}/${cleanPath}`;
};
