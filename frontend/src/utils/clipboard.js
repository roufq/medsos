export async function copyToClipboard(text) {
  if (!text) throw new Error('Nothing to copy');
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return; } catch { /* Try the browser fallback. */ }
  }
  const field = document.createElement('textarea');
  field.value = text; field.style.position = 'fixed'; field.style.opacity = '0';
  document.body.appendChild(field);
  try { field.select(); if (!document.execCommand('copy')) throw new Error('Clipboard unavailable'); }
  finally { field.remove(); }
}
