export const getAssetUrl = (path?: string): string => {
  if (!path) return '';

  // Si ya es una URL completa (http, https, data URI)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Base del servidor backend sin slashes finales ni /api/v1 (ej: http://localhost:3001)
  const serverUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:3001'
  )
    .replace(/\/+$/, '')
    .replace(/\/api(\/v1)?\/?$/, '');

  // Limpiar slashes iniciales o prefijos ./ o public/
  const cleanPath = path
    .replace(/^(\.\.\/)+public\//, '')
    .replace(/^(\.\/)+public\//, '')
    .replace(/^(\.\/)+/, '')
    .replace(/^\//, '');

  // Si la ruta almacenada ya incluye "uploads/" (ej: uploads/photos/...)
  // Resultado: http://localhost:3001/uploads/photos/filename.png
  if (cleanPath.startsWith('uploads/')) {
    return `${serverUrl}/${cleanPath}`;
  }

  // Si la ruta almacenada es relativa a uploads (ej: photos/..., documents/..., general/...)
  // Resultado: http://localhost:3001/uploads/photos/filename.png
  if (
    cleanPath.startsWith('photos/') ||
    cleanPath.startsWith('documents/') ||
    cleanPath.startsWith('general/')
  ) {
    return `${serverUrl}/uploads/${cleanPath}`;
  }

  // Fallback para recursos estáticos del frontend en public/ (ej. logo.png)
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
