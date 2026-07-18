import { useEffect, useMemo, useState } from 'react';
import type { Dict } from '../../i18n';
import { fmt, withBase } from '../../i18n';
import { flagEmoji, formatMinutes, regionName } from '../../lib/format';
import type { RecipeIndexEntry } from '../../lib/search';
import type { Lang } from '../../lib/taxonomy';
import { CrumbSvg } from './CrumbSvg';

interface Props {
  indexUrl: string;
  lang: Lang;
  t: Dict;
}

export default function Compare({ indexUrl, lang, t }: Props) {
  const [entries, setEntries] = useState<RecipeIndexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [a, setA] = useState<string>('');
  const [b, setB] = useState<string>('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(indexUrl)
      .then((r) => r.json())
      .then((data: RecipeIndexEntry[]) => {
        if (cancelled) return;
        setEntries(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [indexUrl]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setA(p.get('a') ?? '');
    setB(p.get('b') ?? '');
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (a) p.set('a', a);
    if (b) p.set('b', b);
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [a, b, ready]);

  const sorted = useMemo(
    () => [...entries].sort((x, y) => x.name.localeCompare(y.name)),
    [entries],
  );
  const ea = entries.find((e) => e.slug === a);
  const eb = entries.find((e) => e.slug === b);

  const c = t.compare;
  const r = t.recipe;
  const keeps = (e: RecipeIndexEntry) =>
    e.keepsDays <= 1 ? r.dayOne : fmt(r.days, { n: e.keepsDays });
  const diffLabel = (n: number) => r.difficultyNames[n as 1 | 2 | 3 | 4 | 5];

  const rows: Array<{ label: string; render: (e: RecipeIndexEntry) => React.ReactNode }> = [
    { label: r.hydration, render: (e) => `${Math.round(e.hydration)}%` },
    { label: r.salt, render: (e) => `${e.salt}%` },
    { label: r.wholegrain, render: (e) => `${Math.round(e.wholegrain)}%` },
    { label: r.totalTime, render: (e) => formatMinutes(e.totalMin) },
    { label: r.activeTime, render: (e) => formatMinutes(e.activeMin) },
    {
      label: r.difficulty,
      render: (e) =>
        `${'●'.repeat(e.difficulty)}${'○'.repeat(5 - e.difficulty)} ${diffLabel(e.difficulty)}`,
    },
    { label: r.keepsLabel, render: (e) => keeps(e) },
    { label: r.crumb, render: (e) => t.taxonomy.crumb[e.crumb] },
    { label: r.crust, render: (e) => t.taxonomy.crust[e.crust] },
    { label: t.search.groups.leaven, render: (e) => t.taxonomy.leaven[e.leaven] },
    { label: t.search.groups.family, render: (e) => t.taxonomy.family[e.family] },
    { label: r.origin, render: (e) => `${flagEmoji(e.country)} ${regionName(e.country, lang)}` },
  ];

  return (
    <div>
      <div className="compare-controls">
        <label className="field">
          <span className="lbl">{c.pick} A</span>
          <select value={a} onChange={(ev) => setA(ev.target.value)}>
            <option value="">{c.pick}</option>
            {sorted.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="lbl">{c.pick} B</span>
          <select value={b} onChange={(ev) => setB(ev.target.value)}>
            <option value="">{c.pick}</option>
            {sorted.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="compare-empty">{t.search.loading}</p>
      ) : !ea && !eb ? (
        <p className="compare-empty">{c.empty}</p>
      ) : (
        <div className="compare-grid">
          {([ea, eb] as const).map((e, idx) => (
            <div className="compare-col card pad" key={e?.slug ?? `empty-${idx}`}>
              {e ? (
                <>
                  <div className="compare-art">
                    <CrumbSvg
                      input={{
                        slug: e.slug,
                        family: e.family,
                        crumb: e.crumb,
                        hydrationPct: e.hydration,
                        wholegrainPct: e.wholegrain,
                        ryePct: e.rye,
                      }}
                      label={e.name}
                    />
                  </div>
                  <h3>
                    <a href={withBase(`/${lang}/breads/${e.slug}/`)}>{e.name}</a>
                  </h3>
                  <p className="compare-sub">
                    {flagEmoji(e.country)} {regionName(e.country, lang)}
                    {e.region ? `, ${e.region}` : ''}
                  </p>
                </>
              ) : (
                <h3>{c.pick}</h3>
              )}
            </div>
          ))}
        </div>
      )}

      {ea || eb ? (
        <table className="compare-table">
          <thead>
            <tr>
              <th> </th>
              <th>{ea?.name ?? '—'}</th>
              <th>{eb?.name ?? '—'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="row-label">{row.label}</td>
                <td>{ea ? row.render(ea) : '—'}</td>
                <td>{eb ? row.render(eb) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
