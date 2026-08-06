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

  if (cleanPath.startsWith('uploads/')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    const serverBase = apiBase.replace(/\/api\/v1\/?$/, '');
    return `${serverBase}/${cleanPath}`;
  }

  const baseUrl = import.meta.env.BASE_URL || '/';
  return baseUrl.endsWith('/') ? `${baseUrl}${cleanPath}` : `${baseUrl}/${cleanPath}`;
};

export const formatDate = (dateStr?: string | Date | null): string => {
  if (!dateStr) return '—';
  const str = typeof dateStr === 'string' ? dateStr : dateStr.toISOString();
  const datePart = str.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return new Date(dateStr).toLocaleDateString('es-BO', { timeZone: 'UTC' });
};

export const formatDateLong = (dateStr?: string | Date | null): string => {
  if (!dateStr) return 'No especificada';
  return new Date(dateStr).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};
