import type { Crumb, Family, Flavor } from './taxonomy';

/**
 * Generative crumb portraits: a seeded SVG cross-section of each bread whose
 * silhouette follows its family and whose hole structure is computed from its
 * real hydration + crumb classification. The artwork IS the data.
 */

export interface CrumbArtInput {
  slug: string;
  family: Family;
  crumb: Crumb;
  hydrationPct: number;
  wholegrainPct?: number;
  ryePct?: number;
  sugarPct?: number;
  flavors?: Flavor[];
  bakeTempC?: number;
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Silhouette {
  path: string;
  /** hole-scatter bounding box: x, y, w, h */
  box: [number, number, number, number];
  /** decorative score/blister marks drawn on top, in crust color */
  marks?: string;
}

/** All silhouettes live in a 240×200 viewBox. */
function silhouette(family: Family, r: () => number): Silhouette {
  const w = (a: number, b: number) => a + (b - a) * r();
  switch (family) {
    case 'hearth-loaf': {
      const bump = w(-6, 6);
      return {
        path: `M120 22 C ${168 + bump} 20, 212 62, 212 108 C 212 156, 172 182, 120 182 C 68 182, 28 156, 28 108 C 28 60, ${72 - bump} 24, 120 22 Z`,
        box: [40, 36, 160, 134],
        marks: `M78 52 Q 118 30 158 50 M92 40 Q 120 24 148 39`,
      };
    }
    case 'pan-loaf':
      return {
        path: 'M36 84 C 36 48, 82 34, 120 34 C 158 34, 204 48, 204 84 L 204 168 C 204 176, 196 182, 188 182 L 52 182 C 44 182, 36 176, 36 168 Z',
        box: [46, 48, 148, 122],
      };
    case 'baguette':
      return {
        path: 'M20 100 C 20 74, 44 62, 78 60 L 162 60 C 196 62, 220 74, 220 100 C 220 126, 196 138, 162 140 L 78 140 C 44 138, 20 126, 20 100 Z',
        box: [30, 68, 180, 64],
        marks: 'M60 96 L 92 76 M104 100 L 136 80 M148 102 L 180 82',
      };
    case 'flatbread':
      return {
        path: 'M22 118 C 30 92, 74 82, 120 82 C 166 82, 210 92, 218 118 C 210 142, 166 152, 120 152 C 74 152, 30 142, 22 118 Z',
        box: [36, 90, 168, 54],
        marks:
          'M70 104 a6 4 0 1 0 12 0 a6 4 0 1 0 -12 0 M150 128 a5 4 0 1 0 10 0 a5 4 0 1 0 -10 0 M120 98 a4 3 0 1 0 8 0 a4 3 0 1 0 -8 0',
      };
    case 'roll':
      return {
        path: 'M120 44 C 158 44, 188 72, 188 110 C 188 148, 158 172, 120 172 C 82 172, 52 148, 52 110 C 52 72, 82 44, 120 44 Z',
        box: [62, 56, 116, 104],
        marks: 'M96 74 Q 120 60 144 74',
      };
    case 'braid':
      return {
        path: 'M42 128 C 42 96, 62 78, 88 78 C 100 78, 110 84, 120 92 C 130 84, 140 78, 152 78 C 178 78, 198 96, 198 128 C 198 152, 176 164, 120 164 C 64 164, 42 152, 42 128 Z',
        box: [52, 88, 136, 66],
        marks: 'M88 92 Q 104 108 120 96 Q 136 108 152 92',
      };
    case 'ring':
      return {
        path: 'M120 40 C 172 40, 208 76, 208 112 C 208 150, 168 176, 120 176 C 72 176, 32 150, 32 112 C 32 76, 68 40, 120 40 Z M120 88 C 100 88, 84 98, 84 112 C 84 128, 100 138, 120 138 C 140 138, 156 128, 156 112 C 156 98, 140 88, 120 88 Z',
        box: [44, 52, 152, 112],
      };
    case 'crispbread':
      return {
        path: 'M32 84 L 208 84 C 214 84, 218 88, 218 94 L 218 128 C 218 134, 214 138, 208 138 L 32 138 C 26 138, 22 134, 22 128 L 22 94 C 22 88, 26 84, 32 84 Z',
        box: [30, 90, 180, 42],
      };
    case 'steamed':
      return {
        path: 'M120 42 C 168 42, 196 80, 196 118 C 196 152, 176 168, 120 168 C 64 168, 44 152, 44 118 C 44 80, 72 42, 120 42 Z',
        box: [56, 58, 128, 100],
      };
    case 'fried':
      return {
        path: 'M120 52 C 164 48, 202 78, 204 112 C 206 144, 170 166, 122 166 C 74 166, 36 146, 36 112 C 36 80, 76 56, 120 52 Z',
        box: [50, 66, 140, 90],
        marks: 'M84 84 a7 5 0 1 0 14 0 a7 5 0 1 0 -14 0 M144 132 a6 5 0 1 0 12 0 a6 5 0 1 0 -12 0',
      };
    case 'quick':
      return {
        path: 'M38 96 C 38 58, 84 40, 120 40 C 156 40, 202 58, 202 96 L 202 166 C 202 174, 194 180, 186 180 L 54 180 C 46 180, 38 174, 38 166 Z',
        box: [48, 56, 144, 114],
        marks: 'M78 52 Q 120 70 164 50',
      };
    case 'sweet-loaf':
      return {
        path: 'M120 30 C 162 30, 190 58, 190 92 C 190 104, 186 112, 180 118 L 180 164 C 180 174, 170 180, 158 180 L 82 180 C 70 180, 60 174, 60 164 L 60 118 C 54 112, 50 104, 50 92 C 50 58, 78 30, 120 30 Z',
        box: [62, 44, 116, 126],
        marks: 'M60 122 L 180 122',
      };
    default:
      return {
        path: 'M120 30 C 180 30, 210 80, 210 110 C 210 160, 170 180, 120 180 C 70 180, 30 160, 30 110 C 30 80, 60 30, 120 30 Z',
        box: [44, 44, 152, 124],
      };
  }
}

function mixHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => Number.parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => Number.parseInt(b.slice(i, i + 2), 16));
  const out = pa.map((v, i) => Math.round(v + ((pb[i] ?? 0) - v) * t));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function crumbBaseColor(input: CrumbArtInput): string {
  let c = '#f3e2bd'; // white wheat crumb
  const whole = (input.wholegrainPct ?? 0) / 100;
  const rye = (input.ryePct ?? 0) / 100;
  c = mixHex(c, '#c9a06a', Math.min(1, whole));
  c = mixHex(c, '#8f6b48', Math.min(1, rye));
  if (input.flavors?.includes('chocolate')) c = mixHex(c, '#6b4632', 0.7);
  return c;
}

function crustColor(input: CrumbArtInput): string {
  if (input.family === 'steamed') return '#ead9b4';
  if (input.family === 'fried') return '#d59a4c';
  let c = '#c17f3e';
  const temp = input.bakeTempC ?? 220;
  if (temp >= 240) c = '#9a5a24';
  if ((input.sugarPct ?? 0) >= 10 || input.family === 'sweet-loaf') c = '#a9622a';
  const rye = (input.ryePct ?? 0) / 100;
  return mixHex(c, '#5d3a1e', rye * 0.6);
}

/** Returns inner SVG markup (no outer <svg>); render inside an <svg viewBox="0 0 240 200">. */
export function crumbArt(input: CrumbArtInput): string {
  const rand = mulberry32(hashString(input.slug));
  const sil = silhouette(input.family, rand);
  const base = crumbBaseColor(input);
  const holeColor = mixHex(base, '#3b2712', 0.55);
  const crust = crustColor(input);
  const clipId = `c-${hashString(input.slug).toString(36)}`;

  const hydration = Math.max(40, Math.min(120, input.hydrationPct));
  const hydroScale = 0.6 + (hydration - 40) * 0.011; // 40% → ×0.6, 100% → ×1.26

  let count: number;
  let rMin: number;
  let rMax: number;
  switch (input.crumb) {
    case 'open':
      count = 15;
      rMin = 4;
      rMax = 13;
      break;
    case 'medium':
      count = 26;
      rMin = 2.4;
      rMax = 6.5;
      break;
    default:
      count = 46;
      rMin = 1.1;
      rMax = 3;
      break;
  }

  const [bx, by, bw, bh] = sil.box;
  const holes: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = bx + rand() * bw;
    const y = by + rand() * bh;
    const rr = (rMin + rand() * (rMax - rMin)) * hydroScale;
    const squish = 0.6 + rand() * 0.5;
    const rot = Math.round(rand() * 180);
    const op = 0.55 + rand() * 0.35;
    holes.push(
      `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rr.toFixed(1)}" ry="${(rr * squish).toFixed(1)}" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${holeColor}" opacity="${op.toFixed(2)}"/>`,
    );
  }

  const marks = sil.marks
    ? `<path d="${sil.marks}" fill="none" stroke="${crust}" stroke-width="4.5" stroke-linecap="round" opacity="0.85"/>`
    : '';

  return [
    `<defs><clipPath id="${clipId}"><path d="${sil.path}" clip-rule="evenodd"/></clipPath></defs>`,
    `<path d="${sil.path}" fill="${base}" fill-rule="evenodd"/>`,
    `<g clip-path="url(#${clipId})">${holes.join('')}</g>`,
    `<path d="${sil.path}" fill="none" stroke="${crust}" stroke-width="7" stroke-linejoin="round"/>`,
    marks,
  ].join('');
}
