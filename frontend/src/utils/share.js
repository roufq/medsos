export const SHARE_PLATFORMS = [
  { id: 'facebook', label: 'Facebook', color: '#1877F2' },
  { id: 'x', label: 'X', color: '#000000' },
  { id: 'threads', label: 'Threads', color: '#101010' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { id: 'instagram', label: 'Instagram', color: '#E1306C' },
  { id: 'telegram', label: 'Telegram', color: '#229ED9' },
  { id: 'tiktok', label: 'TikTok', color: '#111111' },
  { id: 'whatsapp', label: 'WhatsApp', color: '#128C4A' },
  { id: 'pinterest', label: 'Pinterest', color: '#E60023' },
];

const MANUAL_TARGETS = { instagram: 'https://www.instagram.com/', tiktok: 'https://www.tiktok.com/' };

function httpURL(value) {
  const url = new URL(value);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Tautan berbagi tidak valid.');
  return url.href;
}

// External sites cannot confirm publication; record only a completed handoff.
export async function sharePost(postId, channel, { share, copy, openWindow = (...args) => window.open(...args) }) {
  if (channel !== 'copy' && !SHARE_PLATFORMS.some(platform => platform.id === channel)) throw new Error('Tujuan berbagi tidak tersedia.');
  const manualTarget = MANUAL_TARGETS[channel];
  let popup = null;
  if (channel !== 'copy' && !manualTarget) {
    try { popup = openWindow('', '_blank', 'width=640,height=640'); if (popup) popup.opener = null; }
    catch { /* Offer a normal link when the browser refuses popups. */ }
  }
  let prepared, shareUrl, targetUrl, state;
  try {
    prepared = await share(postId, channel, { prepare_only: true });
    if (prepared?.prepared !== true) throw new Error('Server berbagi perlu diperbarui. Muat ulang setelah backend diperbarui.');
    shareUrl = httpURL(prepared.share_url);
    if (channel === 'copy' || manualTarget) {
      await copy(shareUrl);
      state = manualTarget ? 'manual' : 'copied';
      targetUrl = manualTarget || '';
    } else {
      if (!prepared.intent_url) throw new Error('Tujuan berbagi tidak tersedia.');
      targetUrl = httpURL(prepared.intent_url);
      if (!popup || popup.closed) return { state: 'blocked', shareUrl, targetUrl, counted: false, result: prepared };
      popup.location.href = targetUrl;
      state = 'opened';
    }
  } catch (error) {
    popup?.close();
    throw error;
  }
  try {
    const result = await share(postId, channel);
    return { state, shareUrl, targetUrl, counted: true, result };
  } catch {
    // The copy/navigation already succeeded; do not repeat it on a counter error.
    return { state, shareUrl, targetUrl, counted: false, result: prepared };
  }
}
