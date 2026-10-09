import { Fragment, ReactNode } from 'react';
import { Link } from 'react-router-dom';

// Must mirror the backend rules in app/services/post_service.go.
export const POST_RULES = {
  titleMin: 5,
  titleMax: 100,
  descriptionMinWords: 160,
  descriptionMaxWords: 6000,
  hashtagsMin: 3,
  hashtagsMax: 9,
  shopHashtagsMax: 30,
  mentionsMin: 1,
  mentionsMax: 10,
  imagesMax: 6,
  shopVideoMin: 30,
  shopVideoMax: 90,
  shortMin: 60,
  shortMax: 90,
  videoMaxSeconds: 30 * 60,
};

export const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export function parseTokens(raw: string, prefix: '#' | '@'): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of raw.split(/[\s,]+/)) {
    const value = part.trim().replace(prefix === '#' ? /^#+/ : /^@+/, '').toLowerCase();
    if (value && !seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
}

// Tokens typed inside the description count too (the backend merges them).
export function tokensInText(text: string, prefix: '#' | '@'): string[] {
  const pattern = prefix === '#' ? /(?:^|\s)#([\p{L}\p{N}_]{2,63})/gu : /(?:^|\s)@([a-z0-9_]{3,40})/gi;
  return Array.from(text.matchAll(pattern), (match) => match[1].toLowerCase());
}

export function mergeTokens(...lists: string[][]): string[] {
  return Array.from(new Set(lists.flat()));
}

export function timeAgo(value?: string): string {
  if (!value) return '';
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'baru saja';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mnt`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)} hari`;
  return new Date(value).toLocaleDateString();
}

// Currencies without minor units store the whole amount in price_minor.
const ZERO_DECIMAL = new Set(['IDR', 'JPY', 'KRW', 'VND', 'CLP', 'ISK', 'UGX', 'XAF', 'XOF']);

export const currencyDecimals = (currency: string) => (ZERO_DECIMAL.has(currency.toUpperCase()) ? 0 : 2);

export function formatPrice(priceMinor: number, currency: string): string {
  const decimals = currencyDecimals(currency);
  const amount = priceMinor / 10 ** decimals;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(decimals)}`;
  }
}

export function toMinorUnits(amount: string, currency: string): number {
  const value = Number(amount.replace(',', '.'));
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 10 ** currencyDecimals(currency));
}

const TOKEN_PATTERN = /(https?:\/\/[^\s]+)|(^|\s)([#@])([\p{L}\p{N}_]{2,63})/gu;

// Renders text with clickable links, #hashtags (search), and @mentions.
export function RichText({ text }: { text?: string | null }) {
  if (!text) return null;
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (match[1]) {
      nodes.push(text.slice(last, index));
      nodes.push(<a key={index} href={match[1]} target="_blank" rel="noopener noreferrer nofollow ugc" className="text-primary hover:underline break-all">{match[1]}</a>);
      last = index + match[1].length;
    } else {
      const lead = match[2] || '';
      nodes.push(text.slice(last, index) + lead);
      const symbol = match[3];
      const token = match[4];
      const target = symbol === '#' ? `/search?q=${encodeURIComponent('#' + token)}` : `/u/${encodeURIComponent(token.toLowerCase())}`;
      nodes.push(<Link key={index} to={target} className="text-primary font-semibold hover:underline">{symbol}{token}</Link>);
      last = index + match[0].length;
    }
  }
  nodes.push(text.slice(last));
  return <>{nodes.map((node, i) => <Fragment key={i}>{node}</Fragment>)}</>;
}
