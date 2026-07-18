import { useMemo, useState } from 'react';
import type { Dict } from '../../i18n';
import { type FinderAnswers, findBreads } from '../../lib/recommend';
import type { RecipeIndexEntry } from '../../lib/search';
import type { Lang } from '../../lib/taxonomy';
import { BreadCard } from './BreadCard';

interface Props {
  entries: RecipeIndexEntry[];
  lang: Lang;
  t: Dict;
}

type Draft = Partial<FinderAnswers>;

export default function Finder({ entries, lang, t }: Props) {
  const [draft, setDraft] = useState<Draft>({});
  const [done, setDone] = useState(false);
  const f = t.finder;

  const questions: Array<{
    key: keyof FinderAnswers;
    title: string;
    options: Array<{ value: string | number; label: string }>;
  }> = [
    {
      key: 'time',
      title: f.q1,
      options: (['2h', 'today', 'overnight', 'project'] as const).map((v) => ({
        value: v,
        label: f.q1o[v],
      })),
    },
    {
      key: 'skill',
      title: f.q2,
      options: ([1, 2, 3] as const).map((v) => ({ value: v, label: f.q2o[v] })),
    },
    {
      key: 'flavor',
      title: f.q3,
      options: (['mild', 'hearty', 'tangy', 'sweet'] as const).map((v) => ({
        value: v,
        label: f.q3o[v],
      })),
    },
    {
      key: 'goal',
      title: f.q4,
      options: (['everyday', 'dinner', 'celebration', 'breakfast', 'snack'] as const).map((v) => ({
        value: v,
        label: f.q4o[v],
      })),
    },
    {
      key: 'kit',
      title: f.q5,
      options: (['none', 'basic', 'full'] as const).map((v) => ({ value: v, label: f.q5o[v] })),
    },
  ];

  const complete = questions.every((q) => draft[q.key] !== undefined);

  const matches = useMemo(() => {
    if (!done || !complete) return [];
    return findBreads(entries, draft as FinderAnswers, 6);
  }, [done, complete, draft, entries]);

  return (
    <div className="finder">
      {!done ? (
        <>
          <ol className="finder-steps stagger">
            {questions.map((q, idx) => (
              <li key={q.key} className="card pad">
                <h3>
                  <span className="qnum mono">{idx + 1}</span> {q.title}
                </h3>
                <div className="chips">
                  {q.options.map((o) => (
                    <button
                      key={String(o.value)}
                      type="button"
                      className="chip"
                      aria-pressed={draft[q.key] === o.value}
                      onClick={() => setDraft((d) => ({ ...d, [q.key]: o.value as never }))}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="btn btn-primary big"
            disabled={!complete}
            onClick={() => setDone(true)}
          >
            {f.see}
          </button>
        </>
      ) : (
        <>
          <div className="between">
            <h2>{f.matches}</h2>
            <button type="button" className="chip" onClick={() => setDone(false)}>
              ↺ {f.restart}
            </button>
          </div>
          {matches.length === 0 ? (
            <p className="empty">{f.noMatch}</p>
          ) : (
            <div className="card-grid">
              {matches.map((m) => (
                <BreadCard key={m.entry.slug} e={m.entry} lang={lang} t={t} reasons={m.reasons} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
