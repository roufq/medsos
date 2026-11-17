export function readAdminPage(data) {
  if (Array.isArray(data) || typeof data === 'string') {
    throw new Error('Backend aktivitas belum diperbarui. Bangun ulang dan jalankan ulang backend.');
  }
  if (!data || typeof data !== 'object' || typeof data.has_more !== 'boolean') {
    throw new Error('Respons aktivitas server tidak valid. Silakan coba lagi.');
  }
  // Empty SQL result sets may be encoded as null by older paginated backends.
  if (data.items === null && data.has_more === false) return { items: [], has_more: false };
  if (!Array.isArray(data.items)) throw new Error('Respons aktivitas server tidak valid. Silakan coba lagi.');
  return { items: data.items, has_more: data.has_more };
}
