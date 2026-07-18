import { useEffect, useMemo, useState } from 'react';
import type { Dict } from '../../i18n';
import { fmt } from '../../i18n';
import {
  assessSpec,
  computeFormula,
  convertYeast,
  type DoughSpec,
  estimateTimeline,
  type LeavenMode,
  waterTempForDdt,
  type YeastType,
} from '../../lib/bakersMath';
import { LIMITS, STYLE_RANGES, styleByKey } from '../../lib/scienceData';
import { FLOURS, type Flour, type Lang } from '../../lib/taxonomy';
import { formatMass, formatTemp, type UnitSystem } from '../../lib/units';

interface Props {
  lang: Lang;
  t: Dict;
}

const PIECE_DEFAULTS: Record<string, { pieces: number; g: number }> = {
  'country-sourdough': { pieces: 1, g: 900 },
  baguette: { pieces: 3, g: 350 },
  ciabatta: { pieces: 4, g: 250 },
  'pan-de-cristal': { pieces: 3, g: 300 },
  focaccia: { pieces: 1, g: 800 },
  'pizza-napoletana': { pieces: 4, g: 260 },
  'sandwich-loaf': { pieces: 1, g: 900 },
  'whole-wheat': { pieces: 1, g: 900 },
  'rye-mixed': { pieces: 1, g: 1000 },
  'rye-100': { pieces: 1, g: 1100 },
  brioche: { pieces: 1, g: 600 },
  challah: { pieces: 1, g: 700 },
  'milk-bread': { pieces: 1, g: 600 },
  bagel: { pieces: 6, g: 115 },
  pretzel: { pieces: 6, g: 110 },
  pita: { pieces: 8, g: 90 },
  'english-muffin': { pieces: 8, g: 90 },
  'burger-bun': { pieces: 8, g: 90 },
};

const EXTRA_PRESETS: Array<{ id: string; waterFraction: number }> = [
  { id: 'sunflower-seeds', waterFraction: 0 },
  { id: 'sesame-seeds', waterFraction: 0 },
  { id: 'flax-seeds', waterFraction: 0 },
  { id: 'walnuts', waterFraction: 0 },
  { id: 'raisins', waterFraction: 0.15 },
  { id: 'rolled-oats', waterFraction: 0 },
  { id: 'milk', waterFraction: 0.88 },
  { id: 'egg', waterFraction: 0.75 },
  { id: 'yogurt', waterFraction: 0.85 },
  { id: 'mashed-potato', waterFraction: 0.8 },
  { id: 'honey', waterFraction: 0.17 },
  { id: 'cheese', waterFraction: 0.4 },
];

function specForStyle(key: string): DoughSpec {
  const range = styleByKey(key);
  const pd = PIECE_DEFAULTS[key] ?? { pieces: 2, g: 500 };
  const pff = range?.prefermentedFlourTypical ?? 0;
  const yp = range?.yeastPctTypical ?? 0;
  const mode: LeavenMode = pff > 0 && yp > 0 ? 'hybrid' : pff > 0 ? 'levain' : 'yeast';
  let blend: DoughSpec['flourBlend'];
  if (key === 'rye-100') {
    blend = [
      { type: 'rye-whole', pct: 90 },
      { type: 'rye', pct: 10 },
    ];
  } else if (key === 'rye-mixed') {
    blend = [
      { type: 'rye', pct: 70 },
      { type: 'wheat-white', pct: 30 },
    ];
  } else {
    const whole = Math.round(range?.wholegrainTypicalPct ?? 0);
    blend =
      whole >= 100
        ? [{ type: 'wheat-whole', pct: 100 }]
        : whole > 0
          ? [
              { type: 'wheat-white', pct: 100 - whole },
              { type: 'wheat-whole', pct: whole },
            ]
          : [{ type: 'wheat-white', pct: 100 }];
  }
  return {
    pieces: pd.pieces,
    pieceWeightG: pd.g,
    hydrationPct: range?.hydration.ideal ?? 70,
    saltPct: range?.salt.ideal ?? 2,
    mode,
    levainPct: pff > 0 ? Math.round(pff * 2) : 0,
    levainHydrationPct: 100,
    yeastType: 'instant',
    yeastPct: mode === 'levain' ? 0 : yp || 1,
    sugarPct: range?.sugarPctTypical ?? 0,
    fatPct: range?.fatPctTypical ?? 0,
    flourBlend: blend,
    extras: [],
  };
}

const GROUP_COLORS: Record<string, string> = {
  flour: 'var(--viz-flour)',
  liquid: 'var(--viz-water)',
  leaven: 'var(--viz-levain)',
  seasoning: 'var(--viz-salt)',
  enrichment: 'var(--viz-enrich)',
  extra: 'var(--viz-extra)',
};

export default function Calculator({ lang, t }: Props) {
  const [styleKey, setStyleKey] = useState('country-sourdough');
  const [spec, setSpec] = useState<DoughSpec>(() => specForStyle('country-sourdough'));
  const [sys, setSys] = useState<UnitSystem>('metric');
  const [showTotals, setShowTotals] = useState(false);
  const [copied, setCopied] = useState<'formula' | 'link' | null>(null);
  const [ddt, setDdt] = useState({ target: 25, room: 21, flour: 21, friction: 3, pref: 24 });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (!p.has('h')) return;
    const num = (k: string, d: number) => (p.has(k) ? Number(p.get(k)) : d);
    const base = specForStyle(p.get('st') ?? 'country-sourdough');
    const blendRaw = p.get('blend');
    const exRaw = p.get('ex');
    setStyleKey(p.get('st') ?? 'custom');
    setSpec({
      ...base,
      pieces: num('p', base.pieces),
      pieceWeightG: num('w', base.pieceWeightG),
      hydrationPct: num('h', base.hydrationPct),
      saltPct: num('s', base.saltPct),
      mode: (p.get('m') as LeavenMode) ?? base.mode,
      levainPct: num('lp', base.levainPct),
      levainHydrationPct: num('lh', base.levainHydrationPct),
      yeastType: (p.get('yt') as YeastType) ?? base.yeastType,
      yeastPct: num('yp', base.yeastPct),
      sugarPct: num('su', base.sugarPct),
      fatPct: num('fa', base.fatPct),
      flourBlend: blendRaw
        ? blendRaw.split('|').map((s) => {
            const [type, pct] = s.split(':');
            return { type: type as Flour, pct: Number(pct) };
          })
        : base.flourBlend,
      extras: exRaw
        ? exRaw.split('|').map((s) => {
            const [id, pct, wf] = s.split(':');
            return { id: id ?? 'extra', pct: Number(pct), waterFraction: Number(wf) };
          })
        : base.extras,
    });
  }, []);

  const result = useMemo(() => computeFormula(spec), [spec]);
  const feedback = useMemo(() => {
    const range = styleByKey(styleKey);
    return assessSpec(spec, range, LIMITS);
  }, [spec, styleKey]);

  const timeline = useMemo(() => {
    const mode = spec.mode === 'hybrid' ? 'levain' : spec.mode;
    const inoc = spec.mode === 'yeast' ? spec.yeastPct : spec.levainPct;
    return estimateTimeline(mode, ddt.target, inoc);
  }, [spec, ddt.target]);

  const waterTemp = useMemo(
    () =>
      waterTempForDdt({
        ddtC: ddt.target,
        roomC: ddt.room,
        flourC: ddt.flour,
        frictionC: ddt.friction,
        prefermentC: spec.mode === 'yeast' || spec.mode === 'none' ? undefined : ddt.pref,
      }),
    [ddt, spec.mode],
  );

  const up = (patch: Partial<DoughSpec>) => {
    setSpec((s) => ({ ...s, ...patch }));
    setCopied(null);
  };

  const applyStyle = (key: string) => {
    setStyleKey(key);
    if (styleByKey(key)) setSpec(specForStyle(key));
  };

  const lineLabel = (id: string): string => {
    const dict = t.ingredients as Record<string, string>;
    if (id.startsWith('yeast:')) {
      const yt = id.slice(6) as YeastType;
      return `${dict['instant-yeast'] && yt === 'instant' ? dict['instant-yeast'] : yt === 'active-dry' ? dict['active-dry-yeast'] : yt === 'fresh' ? dict['fresh-yeast'] : dict['instant-yeast']}`;
    }
    if (id === 'fat') return t.lab.fat;
    return dict[id] ?? id;
  };

  const groups = useMemo(() => {
    const sums = new Map<string, number>();
    for (const l of result.finalMix) sums.set(l.group, (sums.get(l.group) ?? 0) + l.grams);
    const order = ['flour', 'liquid', 'leaven', 'seasoning', 'enrichment', 'extra'];
    return order
      .filter((g) => (sums.get(g) ?? 0) > 0)
      .map((g) => ({ group: g, grams: sums.get(g) ?? 0 }));
  }, [result]);

  const groupLabel: Record<string, string> = {
    flour: t.lab.compositionGroups.flour,
    liquid: t.lab.compositionGroups.water,
    leaven: t.lab.compositionGroups.levain,
    seasoning: t.lab.compositionGroups.salt,
    enrichment: t.lab.compositionGroups.enrichment,
    extra: t.lab.compositionGroups.extra,
  };

  const copyFormula = async () => {
    const lines = result.finalMix
      .map(
        (l) =>
          `${lineLabel(l.id).padEnd(28)} ${String(Math.round(l.grams)).padStart(6)} g ${l.bakerPct}%`,
      )
      .join('\n');
    const head = `${t.lab.title}, ${t.lab.totalDough}: ${result.totalDoughG} g\n${t.lab.totalFlour}: ${result.totalFlourG} g · ${t.lab.hydration}: ${spec.hydrationPct}%\n\n`;
    await navigator.clipboard.writeText(head + lines);
    setCopied('formula');
  };

  const share = async () => {
    const p = new URLSearchParams();
    p.set('st', styleKey);
    p.set('p', String(spec.pieces));
    p.set('w', String(spec.pieceWeightG));
    p.set('h', String(spec.hydrationPct));
    p.set('s', String(spec.saltPct));
    p.set('m', spec.mode);
    p.set('lp', String(spec.levainPct));
    p.set('lh', String(spec.levainHydrationPct));
    p.set('yt', spec.yeastType);
    p.set('yp', String(spec.yeastPct));
    p.set('su', String(spec.sugarPct));
    p.set('fa', String(spec.fatPct));
    p.set('blend', spec.flourBlend.map((b) => `${b.type}:${b.pct}`).join('|'));
    if (spec.extras.length)
      p.set('ex', spec.extras.map((e) => `${e.id}:${e.pct}:${e.waterFraction}`).join('|'));
    const url = `${window.location.origin}${window.location.pathname}?${p.toString()}`;
    window.history.replaceState(null, '', `?${p.toString()}`);
    await navigator.clipboard.writeText(url);
    setCopied('link');
  };

  const yeastEquivalents = useMemo(() => {
    if (spec.mode === 'levain' || spec.mode === 'none' || spec.yeastPct <= 0) return null;
    const grams = (result.totalFlourG * spec.yeastPct) / 100;
    const others = (['instant', 'active-dry', 'fresh'] as YeastType[])
      .filter((y) => y !== spec.yeastType)
      .map((y) => {
        const g = convertYeast(grams, spec.yeastType, y);
        const label =
          y === 'instant'
            ? t.lab.yeastTypes.instant
            : y === 'active-dry'
              ? t.lab.yeastTypes.activeDry
              : t.lab.yeastTypes.fresh;
        return `${g} g ${label}`;
      });
    return `= ${others.join(' · ')}`;
  }, [spec, result.totalFlourG, t]);

  const l = t.lab;

  return (
    <div className="lab-grid">
      <section className="lab-inputs card">
        <label className="field">
          <span className="lbl">{l.style}</span>
          <select value={styleKey} onChange={(ev) => applyStyle(ev.target.value)}>
            {STYLE_RANGES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label?.[lang] ?? r.key}
              </option>
            ))}
            <option value="custom">{l.custom}</option>
          </select>
        </label>

        <div className="two">
          <label className="field">
            <span className="lbl">{l.pieces}</span>
            <input
              type="number"
              min={1}
              max={40}
              value={spec.pieces}
              onChange={(ev) => up({ pieces: Math.max(1, Number(ev.target.value)) })}
            />
          </label>
          <label className="field">
            <span className="lbl">{l.pieceWeight}</span>
            <input
              type="number"
              min={30}
              max={4000}
              step={10}
              value={spec.pieceWeightG}
              onChange={(ev) => up({ pieceWeightG: Math.max(30, Number(ev.target.value)) })}
            />
          </label>
        </div>

        <label className="field">
          <span className="lbl">
            {l.hydration}, <strong>{spec.hydrationPct}%</strong>
          </span>
          <input
            type="range"
            min={30}
            max={120}
            step={1}
            value={spec.hydrationPct}
            onChange={(ev) => up({ hydrationPct: Number(ev.target.value) })}
          />
        </label>
        <label className="field">
          <span className="lbl">
            {l.salt}, <strong>{spec.saltPct}%</strong>
          </span>
          <input
            type="range"
            min={0}
            max={4}
            step={0.1}
            value={spec.saltPct}
            onChange={(ev) => up({ saltPct: Number(ev.target.value) })}
          />
        </label>

        <div className="field">
          <span className="lbl">{l.leavenMode}</span>
          <div className="seg">
            {(['levain', 'yeast', 'hybrid', 'none'] as LeavenMode[]).map((m) => (
              <button
                key={m}
                type="button"
                className="chip"
                aria-pressed={spec.mode === m}
                onClick={() => up({ mode: m })}
              >
                {l.modes[m]}
              </button>
            ))}
          </div>
        </div>

        {(spec.mode === 'levain' || spec.mode === 'hybrid') && (
          <div className="two">
            <label className="field">
              <span className="lbl">
                {l.levainAmount}, <strong>{spec.levainPct}%</strong>
              </span>
              <input
                type="range"
                min={0}
                max={60}
                step={1}
                value={spec.levainPct}
                onChange={(ev) => up({ levainPct: Number(ev.target.value) })}
              />
            </label>
            <label className="field">
              <span className="lbl">{l.levainHydration}</span>
              <select
                value={spec.levainHydrationPct}
                onChange={(ev) => up({ levainHydrationPct: Number(ev.target.value) })}
              >
                {[50, 60, 80, 100, 125].map((v) => (
                  <option key={v} value={v}>
                    {v}%
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {(spec.mode === 'yeast' || spec.mode === 'hybrid') && (
          <div className="two">
            <label className="field">
              <span className="lbl">{l.yeastType}</span>
              <select
                value={spec.yeastType}
                onChange={(ev) => up({ yeastType: ev.target.value as YeastType })}
              >
                <option value="instant">{l.yeastTypes.instant}</option>
                <option value="active-dry">{l.yeastTypes.activeDry}</option>
                <option value="fresh">{l.yeastTypes.fresh}</option>
              </select>
            </label>
            <label className="field">
              <span className="lbl">{l.yeastAmount}</span>
              <input
                type="number"
                min={0}
                max={5}
                step={0.05}
                value={spec.yeastPct}
                onChange={(ev) => up({ yeastPct: Number(ev.target.value) })}
              />
              {yeastEquivalents ? <span className="fine mono">{yeastEquivalents}</span> : null}
            </label>
          </div>
        )}

        <div className="two">
          <label className="field">
            <span className="lbl">
              {l.sugar}, <strong>{spec.sugarPct}%</strong>
            </span>
            <input
              type="range"
              min={0}
              max={30}
              step={0.5}
              value={spec.sugarPct}
              onChange={(ev) => up({ sugarPct: Number(ev.target.value) })}
            />
          </label>
          <label className="field">
            <span className="lbl">
              {l.fat}, <strong>{spec.fatPct}%</strong>
            </span>
            <input
              type="range"
              min={0}
              max={60}
              step={0.5}
              value={spec.fatPct}
              onChange={(ev) => up({ fatPct: Number(ev.target.value) })}
            />
          </label>
        </div>

        <div className="field">
          <span className="lbl">{l.flourBlend}</span>
          {spec.flourBlend.map((b, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional editors
            <div className="blend-row" key={`${b.type}-${i}`}>
              <select
                value={b.type}
                onChange={(ev) => {
                  const blend = [...spec.flourBlend];
                  blend[i] = {
                    ...blend[i],
                    type: ev.target.value as Flour,
                    pct: blend[i]?.pct ?? 0,
                  };
                  up({ flourBlend: blend });
                }}
              >
                {FLOURS.map((f) => (
                  <option key={f} value={f}>
                    {t.taxonomy.flour[f]}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                max={100}
                value={b.pct}
                onChange={(ev) => {
                  const blend = [...spec.flourBlend];
                  blend[i] = {
                    type: blend[i]?.type ?? 'wheat-white',
                    pct: Number(ev.target.value),
                  };
                  up({ flourBlend: blend });
                }}
              />
              <button
                type="button"
                className="chip"
                aria-label="−"
                disabled={spec.flourBlend.length <= 1}
                onClick={() => up({ flourBlend: spec.flourBlend.filter((_, j) => j !== i) })}
              >
                −
              </button>
            </div>
          ))}
          <button
            type="button"
            className="chip"
            onClick={() =>
              up({ flourBlend: [...spec.flourBlend, { type: 'wheat-whole', pct: 10 }] })
            }
          >
            + {l.addFlour}
          </button>
        </div>

        <div className="field">
          <span className="lbl">{l.extras}</span>
          {spec.extras.map((e, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional editors
            <div className="blend-row" key={`${e.id}-${i}`}>
              <select
                value={e.id}
                onChange={(ev) => {
                  const preset = EXTRA_PRESETS.find((p) => p.id === ev.target.value);
                  const extras = [...spec.extras];
                  extras[i] = {
                    id: ev.target.value,
                    pct: extras[i]?.pct ?? 10,
                    waterFraction: preset?.waterFraction ?? 0,
                  };
                  up({ extras });
                }}
              >
                {EXTRA_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {(t.ingredients as Record<string, string>)[p.id] ?? p.id}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                max={80}
                value={e.pct}
                onChange={(ev) => {
                  const extras = [...spec.extras];
                  extras[i] = { ...e, pct: Number(ev.target.value) };
                  up({ extras });
                }}
              />
              <button
                type="button"
                className="chip"
                aria-label="−"
                onClick={() => up({ extras: spec.extras.filter((_, j) => j !== i) })}
              >
                −
              </button>
            </div>
          ))}
          <button
            type="button"
            className="chip"
            onClick={() =>
              up({ extras: [...spec.extras, { id: 'sunflower-seeds', pct: 10, waterFraction: 0 }] })
            }
          >
            + {l.addExtra}
          </button>
        </div>

        <button type="button" className="btn" onClick={() => applyStyle(styleKey)}>
          {l.reset}
        </button>
      </section>

      <section className="lab-out">
        <div className="card pad">
          <div className="sum-row mono">
            <span>
              {l.totalDough} <strong>{formatMass(result.totalDoughG, sys)}</strong>
            </span>
            <span>
              {l.totalFlour} <strong>{formatMass(result.totalFlourG, sys)}</strong>
            </span>
            <span>
              {l.totalWater} <strong>{formatMass(result.totalWaterG, sys)}</strong>
            </span>
            <span className="seg">
              <button
                type="button"
                className="chip"
                aria-pressed={sys === 'metric'}
                onClick={() => setSys('metric')}
              >
                g
              </button>
              <button
                type="button"
                className="chip"
                aria-pressed={sys === 'us'}
                onClick={() => setSys('us')}
              >
                oz
              </button>
            </span>
          </div>
          <p className="fine mono">
            {fmt(l.prefermentedOut, { pct: result.prefermentedFlourPct })} ·{' '}
            {fmt(l.effectiveHydration, { pct: result.effectiveHydrationPct })}
          </p>

          <h3 style={{ marginTop: '1rem' }}>{l.composition}</h3>
          <div className="stack-bar" role="img" aria-label={l.composition}>
            {groups.map((g) => {
              const pct = (g.grams / result.totalDoughG) * 100;
              return (
                <span
                  key={g.group}
                  className="seg"
                  style={{ width: `${pct}%`, background: GROUP_COLORS[g.group] }}
                >
                  {pct >= 12 ? `${Math.round(pct)}%` : ''}
                </span>
              );
            })}
          </div>
          <div className="legend">
            {groups.map((g) => (
              <span key={g.group}>
                <span className="swatch" style={{ background: GROUP_COLORS[g.group] }} />
                {groupLabel[g.group]} {Math.round((g.grams / result.totalDoughG) * 100)}%
              </span>
            ))}
          </div>
        </div>

        <div className="card pad">
          <div className="between">
            <h3>{showTotals ? l.fullFormula : l.finalMix}</h3>
            <button type="button" className="chip" onClick={() => setShowTotals(!showTotals)}>
              {showTotals ? l.finalMix : l.fullFormula}
            </button>
          </div>
          {result.levain && !showTotals ? (
            <p className="fine">
              {l.levainBuild}:{' '}
              {fmt(l.levainLine, {
                grams: result.levain.weightG,
                hydration: result.levain.hydrationPct,
                flour: result.levain.flourG,
                water: result.levain.waterG,
              })}
            </p>
          ) : null}
          <table className="ledger">
            <thead>
              <tr>
                <th>{l.colIngredient}</th>
                <th className="num">{sys === 'metric' ? l.colGrams : 'oz'}</th>
                <th className="num">{l.colPct}</th>
              </tr>
            </thead>
            <tbody>
              {(showTotals ? result.totals : result.finalMix).map((line, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: ledger lines are positional
                <tr key={`${line.id}-${i}`}>
                  <td>{lineLabel(line.id)}</td>
                  <td className="num">{formatMass(line.grams, sys)}</td>
                  <td className="num">{line.bakerPct}</td>
                </tr>
              ))}
              <tr className="total">
                <td>{l.totalDough}</td>
                <td className="num">{formatMass(result.totalDoughG, sys)}</td>
                <td className="num" />
              </tr>
            </tbody>
          </table>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={copyFormula}>
              {copied === 'formula' ? l.copied : l.copyFormula}
            </button>
            <button type="button" className="btn" onClick={share}>
              {copied === 'link' ? l.shared : l.share}
            </button>
          </div>
        </div>

        {feedback.length > 0 && (
          <div className="card pad">
            <h3>{l.feedbackTitle}</h3>
            <ul className="feedback">
              {feedback.map((f) => (
                <li key={f.code} data-level={f.level}>
                  <span className="mark" aria-hidden="true">
                    {f.level === 'good' ? '✓' : f.level === 'note' ? '•' : '!'}
                  </span>
                  {fmt(l.feedback[f.code as keyof typeof l.feedback] ?? f.code, f.params ?? {})}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card pad">
          <h3>{l.ddtTitle}</h3>
          <p className="fine">{l.ddtLead}</p>
          <div className="ddt-grid">
            {(
              [
                ['target', l.ddtTarget],
                ['room', l.ddtRoom],
                ['flour', l.ddtFlour],
                ['friction', l.ddtFriction],
              ] as const
            ).map(([k, label]) => (
              <label className="field" key={k}>
                <span className="lbl">{label}</span>
                <input
                  type="number"
                  min={-10}
                  max={45}
                  step={0.5}
                  value={ddt[k]}
                  onChange={(ev) => setDdt((d) => ({ ...d, [k]: Number(ev.target.value) }))}
                />
              </label>
            ))}
            {spec.mode !== 'yeast' && spec.mode !== 'none' ? (
              <label className="field">
                <span className="lbl">{l.ddtPreferment}</span>
                <input
                  type="number"
                  min={0}
                  max={40}
                  step={0.5}
                  value={ddt.pref}
                  onChange={(ev) => setDdt((d) => ({ ...d, pref: Number(ev.target.value) }))}
                />
              </label>
            ) : null}
          </div>
          <p className="ddt-result">{fmt(l.ddtResult, { temp: formatTemp(waterTemp, sys) })}</p>
          <p className="fine mono">{l.ddtFrictionHint}</p>
        </div>

        {spec.mode !== 'none' && (
          <div className="card pad">
            <h3>{l.timelineTitle}</h3>
            <p className="fine">{fmt(l.timelineAt, { temp: formatTemp(ddt.target, sys) })}</p>
            <div className="sum-row mono">
              <span>
                {l.bulk} <strong>≈ {timeline.bulkHours} h</strong>
              </span>
              <span>
                {l.proof} <strong>≈ {timeline.proofHours} h</strong>
              </span>
            </div>
            <p className="fine">{l.timelineNote}</p>
          </div>
        )}
      </section>
    </div>
  );
}
