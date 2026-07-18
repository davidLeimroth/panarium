import type { Lang } from './taxonomy';

/** Country code → emoji flag (regional indicator pairs). */
export function flagEmoji(cc: string): string {
  if (!/^[A-Z]{2}$/.test(cc)) return '🌍';
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

const displayNamesCache = new Map<string, Intl.DisplayNames>();

export function regionName(cc: string, lang: Lang): string {
  try {
    let dn = displayNamesCache.get(lang);
    if (!dn) {
      dn = new Intl.DisplayNames([lang], { type: 'region' });
      displayNamesCache.set(lang, dn);
    }
    return dn.of(cc) ?? cc;
  } catch {
    return cc;
  }
}

/** "95 min" → "1 h 35 min"; universal abbreviations across en/de/es/fr. */
export function formatMinutes(min: number): string {
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h >= 48) return `${Math.round(h / 24)} d`;
  if (h >= 24) {
    const days = Math.floor(h / 24);
    const restH = h % 24;
    return restH ? `${days} d ${restH} h` : `${days} d`;
  }
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatPct(n: number, lang: Lang, decimals = 1): string {
  return `${new Intl.NumberFormat(lang, { maximumFractionDigits: decimals }).format(n)} %`;
}

export function formatNum(n: number, lang: Lang, decimals = 0): string {
  return new Intl.NumberFormat(lang, { maximumFractionDigits: decimals }).format(n);
}
