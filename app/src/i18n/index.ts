import type { Lang } from '../lib/taxonomy';
import { de } from './de';
import { type Dict, en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ro } from './ro';

export { LANGS } from '../lib/taxonomy';
export type { Dict };

export const DICTS: Record<Lang, Dict> = { en, de, es, fr, ro };

export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  ro: 'Română',
};

export function getDict(lang: Lang): Dict {
  return DICTS[lang] ?? en;
}

/**
 * Pick a localized value from a data object that may not yet have every
 * language, falling back to English. Recipe and science data are only
 * translated into en/de/es/fr, so Romanian pages render English instead of
 * "undefined" until the corpus is translated.
 */
export function pick<T extends { en: string }>(v: T, lang: Lang): string {
  return (v as Record<string, string>)[lang] || v.en;
}

/**
 * Deploy base path (empty for local/root, '/panarium' for the project Pages
 * build). import.meta.env.BASE_URL is '/' at root and '/panarium/' under a base.
 */
export const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

/** Prefix an absolute in-app path with the deploy base. `path` starts with '/'. */
export function withBase(path: string): string {
  return `${BASE}${path}`;
}

/** Tiny interpolation: fmt('Hi {name}', { name: 'X' }) → 'Hi X'. */
export function fmt(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) =>
    key in params ? String(params[key]) : m,
  );
}

/** Swap the language prefix of a pathname: /en/breads/x → /de/breads/x (base-aware). */
export function switchLangPath(pathname: string, to: Lang): string {
  let p = pathname;
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length);
  const parts = p.split('/').filter(Boolean);
  if (parts.length === 0) return withBase(`/${to}/`);
  parts[0] = to;
  return withBase(`/${parts.join('/')}/`);
}
