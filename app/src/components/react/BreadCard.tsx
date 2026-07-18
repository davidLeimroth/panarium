import type { Dict } from '../../i18n';
import { fmt, withBase } from '../../i18n';
import { flagEmoji, formatMinutes, regionName } from '../../lib/format';
import type { RecipeIndexEntry } from '../../lib/search';
import type { Lang } from '../../lib/taxonomy';
import { CrumbSvg } from './CrumbSvg';

export function keepsText(t: Dict, days: number): string {
  if (days <= 1) return t.recipe.dayOne;
  return fmt(t.recipe.days, { n: days % 1 === 0 ? days : days.toFixed(1) });
}

export function BreadCard({
  e,
  lang,
  t,
  reasons,
}: {
  e: RecipeIndexEntry;
  lang: Lang;
  t: Dict;
  reasons?: string[];
}) {
  return (
    <a className="bread-card card" href={withBase(`/${lang}/breads/${e.slug}/`)}>
      <div className="art">
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
      <div className="body">
        <h3>
          {e.name}
          {e.native && e.native !== e.name ? <span className="native"> · {e.native}</span> : null}
        </h3>
        <p className="origin mono">
          <span aria-hidden="true">{flagEmoji(e.country)}</span> {regionName(e.country, lang)}
          {e.region ? `, ${e.region}` : ''}
        </p>
        <p className="desc">{e.desc}</p>
        <div className="chips">
          {e.kitchenTested ? (
            <span
              className="chip chip-tested"
              role="img"
              title={t.recipe.kitchenTested}
              aria-label={t.recipe.kitchenTested}
            />
          ) : null}
          <span className="chip chip-static">{t.taxonomy.leaven[e.leaven]}</span>
          <span className="chip chip-static">{t.taxonomy.family[e.family]}</span>
          <span className="chip chip-static">
            <svg width="8" height="11" viewBox="0 0 8 11" aria-hidden="true">
              <path
                d="M4 0.5 C 5.8 3.2, 7.4 5.2, 7.4 7.1 A 3.4 3.4 0 1 1 0.6 7.1 C 0.6 5.2, 2.2 3.2, 4 0.5 Z"
                fill="var(--viz-water)"
              />
            </svg>
            {Math.round(e.hydration)}%
          </span>
          <span className="chip chip-static">{formatMinutes(e.totalMin)}</span>
          {e.overnight ? <span className="chip chip-static">{t.recipe.overnightBadge}</span> : null}
        </div>
        <div className="meta mono">
          <span
            className="dots"
            title={t.recipe.difficultyNames[e.difficulty as 1 | 2 | 3 | 4 | 5]}
          >
            {'●'.repeat(e.difficulty)}
            {'○'.repeat(5 - e.difficulty)}
          </span>
          <span>{fmt(t.recipe.keeps, { days: keepsText(t, e.keepsDays) })}</span>
        </div>
        {reasons && reasons.length > 0 ? (
          <div className="chips reasons">
            {reasons.map((r) => (
              <span key={r} className="chip chip-static reason">
                {t.finder.reasons[r as keyof Dict['finder']['reasons']] ?? r}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </a>
  );
}
