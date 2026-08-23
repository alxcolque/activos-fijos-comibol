export const getAssetUrl = (path?: string): string => {
  if (!path) return '';

  const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

  if (!rawApiUrl) {
    console.error(
      '[Config Error] No se encontró VITE_API_URL ni VITE_API_BASE_URL en las variables de entorno (.env).'
    );
  }

  // Base del servidor backend sin slashes finales ni /api/v1
  const serverUrl = (rawApiUrl || '')
    .replace(/\/+$/, '')
    .replace(/\/api(\/v1)?\/?$/, '');

  let processedPath = path;

  // 1. Si la ruta recibida es una URL absoluta apuntando a localhost / 127.0.0.1 (ej: http://localhost:3001/uploads/...)
  // y serverUrl apunta a producción (no localhost), la reemplazamos con el serverUrl configurado.
  if (
    processedPath.startsWith('http://localhost') ||
    processedPath.startsWith('http://127.0.0.1')
  ) {
    if (!serverUrl.includes('localhost') && !serverUrl.includes('127.0.0.1')) {
      processedPath = processedPath.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, serverUrl);
    }
  }

  // 2. Si la URL es http:// y serverUrl es https://, forzar https:// para prevenir Mixed Content
  if (processedPath.startsWith('http://') && serverUrl.startsWith('https://')) {
    processedPath = processedPath.replace(/^http:\/\//, 'https://');
  }

  // 3. Si ya es una URL completa (http, https, data URI)
  if (
    processedPath.startsWith('http://') ||
    processedPath.startsWith('https://') ||
    processedPath.startsWith('data:')
  ) {
    return processedPath;
  }

  // 4. Limpiar slashes iniciales o prefijos ./ o public/
  const cleanPath = processedPath
    .replace(/^(\.\.\/)+public\//, '')
    .replace(/^(\.\/)+public\//, '')
    .replace(/^(\.\/)+/, '')
    .replace(/^\//, '');

  // 5. Si la ruta almacenada ya incluye "uploads/" (ej: uploads/photos/...)
  if (cleanPath.startsWith('uploads/')) {
    return `${serverUrl}/${cleanPath}`;
  }

  // 6. Si la ruta almacenada es relativa a uploads (ej: photos/..., documents/..., general/...)
  if (
    cleanPath.startsWith('photos/') ||
    cleanPath.startsWith('documents/') ||
    cleanPath.startsWith('general/')
  ) {
    return serverUrl ? `${serverUrl}/uploads/${cleanPath}` : `/uploads/${cleanPath}`;
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
