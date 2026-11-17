export const LANGUAGE_KEY = 'theposter-language';
export const normalizeLanguage = value => value === 'en' ? 'en' : 'id';
export const localeFor = language => normalizeLanguage(language) === 'en' ? 'en-US' : 'id-ID';

export function translate(text, language, dictionary) {
  if (typeof text !== 'string') return text;
  return dictionary[text]?.[normalizeLanguage(language)] || text;
}

export function timeAgo(value, language = 'id', now = Date.now()) {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const seconds = Math.max(0, (now - date.getTime()) / 1000);
  if (seconds < 60) return language === 'en' ? 'just now' : 'baru saja';
  if (seconds < 3600) return language === 'en' ? `${Math.floor(seconds / 60)} min ago` : `${Math.floor(seconds / 60)} mnt`;
  if (seconds < 86400) return language === 'en' ? `${Math.floor(seconds / 3600)} hr ago` : `${Math.floor(seconds / 3600)} jam`;
  if (seconds < 7 * 86400) {
    const days = Math.floor(seconds / 86400);
    return language === 'en' ? `${days} ${days === 1 ? 'day' : 'days'} ago` : `${days} hari`;
  }
  return date.toLocaleDateString(localeFor(language));
}
