import { useEffect, useMemo, useState } from 'react';
import type { Dict } from '../../i18n';
import { fmt } from '../../i18n';
import { flagEmoji, regionName } from '../../lib/format';
import {
  applyFilters,
  EMPTY_FILTERS,
  facetCounts,
  filtersToParams,
  type HydrationBucket,
  hydrationBucket,
  paramsToFilters,
  type ReadyIn,
  type RecipeIndexEntry,
  type SearchFilters,
  type SortKey,
  sortEntries,
} from '../../lib/search';
import { FAMILIES, FLAVORS, FLOURS, type Lang, LEAVENS, PURPOSES } from '../../lib/taxonomy';
import { BreadCard } from './BreadCard';

const HYDRATION_BUCKETS: HydrationBucket[] = ['dry', 'moderate', 'high', 'very-high'];
const READY_OPTIONS: ReadyIn[] = ['2h', '4h', '8h', '24h', '3d'];

interface Props {
  entries: RecipeIndexEntry[];
  lang: Lang;
  t: Dict;
}

function Chip({
  on,
  label,
  count,
  onClick,
}: {
  on: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  const dead = count === 0 && !on;
  return (
    <button type="button" className="chip" aria-pressed={on} onClick={onClick} disabled={dead}>
      {label}
      {count !== undefined ? <span className="count">{count}</span> : null}
    </button>
  );
}

function Group({
  title,
  children,
  open = true,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details className="facet-group" open={open}>
      <summary>{title}</summary>
      <div className="facet-body">{children}</div>
    </details>
  );
}

export default function SearchExplorer({ entries, lang, t }: Props) {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>('name');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const parsed = paramsToFilters(new URLSearchParams(window.location.search));
    setFilters(parsed.filters);
    setSort(parsed.sort);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const params = filtersToParams(filters, sort);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [filters, sort, ready]);

  const results = useMemo(
    () => sortEntries(applyFilters(entries, filters), sort),
    [entries, filters, sort],
  );

  const countries = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) map.set(e.country, (map.get(e.country) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([cc]) => cc);
  }, [entries]);

  const cLeaven = facetCounts(entries, filters, 'leavens', LEAVENS, (e) => e.leaven);
  const cFamily = facetCounts(entries, filters, 'families', FAMILIES, (e) => e.family);
  const cFlavor = facetCounts(entries, filters, 'flavors', FLAVORS, (e) => e.flavors);
  const cPurpose = facetCounts(entries, filters, 'purposes', PURPOSES, (e) => e.purposes);
  const cFlour = facetCounts(entries, filters, 'flours', FLOURS, (e) => e.flours);
  const cCountry = facetCounts(entries, filters, 'countries', countries, (e) => e.country);
  const cHydration = facetCounts(entries, filters, 'hydration', HYDRATION_BUCKETS, (e) =>
    hydrationBucket(e.hydration),
  );

  const toggle = <K extends keyof SearchFilters>(key: K, value: string) => {
    setFilters((f) => {
      const list = f[key] as string[];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...f, [key]: next };
    });
  };

  const set = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const active =
    filters.q !== '' ||
    filters.leavens.length > 0 ||
    filters.families.length > 0 ||
    filters.flavors.length > 0 ||
    filters.purposes.length > 0 ||
    filters.countries.length > 0 ||
    filters.flours.length > 0 ||
    filters.hydration.length > 0 ||
    filters.readyIn !== null ||
    filters.activeUnder !== null ||
    filters.difficultyMax !== null ||
    filters.keepsAtLeast !== null ||
    filters.vegan ||
    filters.glutenFree ||
    filters.wholegrain ||
    filters.noSpecialKit;

  const s = t.search;
  const hydrationLabel: Record<HydrationBucket, string> = {
    dry: s.hydrationBuckets.dry,
    moderate: s.hydrationBuckets.moderate,
    high: s.hydrationBuckets.high,
    'very-high': s.hydrationBuckets.veryHigh,
  };

  return (
    <div className="explorer">
      <div className="explorer-top">
        <input
          type="search"
          placeholder={s.placeholder}
          value={filters.q}
          onChange={(ev) => set('q', ev.target.value)}
          aria-label={s.placeholder}
        />
        <label className="sort mono">
          {s.sortBy}
          <select value={sort} onChange={(ev) => setSort(ev.target.value as SortKey)}>
            <option value="name">{s.sorts.name}</option>
            <option value="time">{s.sorts.time}</option>
            <option value="active">{s.sorts.active}</option>
            <option value="hydration-desc">{s.sorts.hydrationDesc}</option>
            <option value="hydration-asc">{s.sorts.hydrationAsc}</option>
            <option value="keeps">{s.sorts.keeps}</option>
            <option value="difficulty">{s.sorts.difficulty}</option>
          </select>
        </label>
        <span className="count mono" aria-live="polite">
          {results.length === 1 ? s.resultOne : fmt(s.results, { n: results.length })}
        </span>
        {active ? (
          <button type="button" className="chip clear" onClick={() => setFilters(EMPTY_FILTERS)}>
            ✕ {s.clearAll}
          </button>
        ) : null}
      </div>

      <div className="explorer-grid">
        <aside className="facets">
          <Group title={s.groups.leaven}>
            {LEAVENS.map((v) => (
              <Chip
                key={v}
                on={filters.leavens.includes(v)}
                label={t.taxonomy.leaven[v]}
                count={cLeaven[v]}
                onClick={() => toggle('leavens', v)}
              />
            ))}
          </Group>
          <Group title={s.groups.time}>
            <div className="facet-sub mono">{s.readyIn}</div>
            {READY_OPTIONS.map((v) => (
              <Chip
                key={v}
                on={filters.readyIn === v}
                label={s.readyOptions[v]}
                onClick={() => set('readyIn', filters.readyIn === v ? null : v)}
              />
            ))}
            <div className="facet-sub mono">{s.activeUnder}</div>
            {[30, 60].map((v) => (
              <Chip
                key={v}
                on={filters.activeUnder === v}
                label={`${v} min`}
                onClick={() =>
                  set('activeUnder', filters.activeUnder === v ? null : (v as 30 | 60))
                }
              />
            ))}
          </Group>
          <Group title={s.groups.hydration}>
            {HYDRATION_BUCKETS.map((v) => (
              <Chip
                key={v}
                on={filters.hydration.includes(v)}
                label={hydrationLabel[v]}
                count={cHydration[v]}
                onClick={() => toggle('hydration', v)}
              />
            ))}
          </Group>
          <Group title={s.groups.family}>
            {FAMILIES.map((v) => (
              <Chip
                key={v}
                on={filters.families.includes(v)}
                label={t.taxonomy.family[v]}
                count={cFamily[v]}
                onClick={() => toggle('families', v)}
              />
            ))}
          </Group>
          <Group title={s.groups.flavor} open={false}>
            {FLAVORS.map((v) => (
              <Chip
                key={v}
                on={filters.flavors.includes(v)}
                label={t.taxonomy.flavor[v]}
                count={cFlavor[v]}
                onClick={() => toggle('flavors', v)}
              />
            ))}
          </Group>
          <Group title={s.groups.purpose} open={false}>
            {PURPOSES.map((v) => (
              <Chip
                key={v}
                on={filters.purposes.includes(v)}
                label={t.taxonomy.purpose[v]}
                count={cPurpose[v]}
                onClick={() => toggle('purposes', v)}
              />
            ))}
          </Group>
          <Group title={s.groups.origin} open={false}>
            {countries.map((cc) => (
              <Chip
                key={cc}
                on={filters.countries.includes(cc)}
                label={`${flagEmoji(cc)} ${regionName(cc, lang)}`}
                count={cCountry[cc]}
                onClick={() => toggle('countries', cc)}
              />
            ))}
          </Group>
          <Group title={s.groups.flour} open={false}>
            {FLOURS.filter((v) => (cFlour[v] ?? 0) > 0 || filters.flours.includes(v)).map((v) => (
              <Chip
                key={v}
                on={filters.flours.includes(v)}
                label={t.taxonomy.flour[v]}
                count={cFlour[v]}
                onClick={() => toggle('flours', v)}
              />
            ))}
          </Group>
          <Group title={s.groups.practical} open={false}>
            <div className="facet-sub mono">{s.difficultyMax}</div>
            {[1, 2, 3, 4].map((v) => (
              <Chip
                key={v}
                on={filters.difficultyMax === v}
                label={'●'.repeat(v) + '○'.repeat(5 - v)}
                onClick={() => set('difficultyMax', filters.difficultyMax === v ? null : v)}
              />
            ))}
            <div className="facet-sub mono">{s.keepsAtLeast}</div>
            {[
              [2, s.keepsOptions.d2],
              [4, s.keepsOptions.d4],
              [7, s.keepsOptions.d7],
            ].map(([v, label]) => (
              <Chip
                key={v}
                on={filters.keepsAtLeast === v}
                label={label as string}
                onClick={() =>
                  set('keepsAtLeast', filters.keepsAtLeast === v ? null : (v as number))
                }
              />
            ))}
            <div className="facet-sub mono">{s.groups.diet}</div>
            <Chip on={filters.vegan} label={s.vegan} onClick={() => set('vegan', !filters.vegan)} />
            <Chip
              on={filters.glutenFree}
              label={s.glutenFree}
              onClick={() => set('glutenFree', !filters.glutenFree)}
            />
            <Chip
              on={filters.wholegrain}
              label={s.wholegrain}
              onClick={() => set('wholegrain', !filters.wholegrain)}
            />
            <Chip
              on={filters.noSpecialKit}
              label={s.noSpecialKit}
              onClick={() => set('noSpecialKit', !filters.noSpecialKit)}
            />
          </Group>
        </aside>

        <div className="results">
          {results.length === 0 ? (
            <p className="empty">{s.noResults}</p>
          ) : (
            <div className="card-grid">
              {results.map((e) => (
                <BreadCard key={e.slug} e={e} lang={lang} t={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
