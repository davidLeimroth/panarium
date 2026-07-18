import { useEffect, useMemo, useState } from 'react';
import type { Dict } from '../../i18n';
import { fmt } from '../../i18n';
import type { RecipeIngredient } from '../../lib/recipeSchema';
import { DENSITIES } from '../../lib/scienceData';
import type { Lang } from '../../lib/taxonomy';
import { formatMass, gramsToVolume, type UnitSystem } from '../../lib/units';

interface Props {
  ingredients: RecipeIngredient[];
  yieldCount: number;
  yieldGrams: number;
  lang: Lang;
  t: Dict;
}

const UNIT_KEY = 'panarium-units';

export default function FormulaCard({ ingredients, yieldCount, yieldGrams, lang, t }: Props) {
  const [sys, setSys] = useState<UnitSystem>('metric');
  const [volumes, setVolumes] = useState(false);
  const [pieces, setPieces] = useState(yieldCount);
  const [pieceG, setPieceG] = useState(yieldGrams);

  useEffect(() => {
    const stored = localStorage.getItem(UNIT_KEY);
    if (stored === 'us' || stored === 'metric') setSys(stored);
  }, []);

  const chooseSys = (v: UnitSystem) => {
    setSys(v);
    localStorage.setItem(UNIT_KEY, v);
  };

  const factor = useMemo(() => {
    const base = yieldCount * yieldGrams;
    const target = Math.max(1, pieces) * Math.max(10, pieceG);
    return base > 0 ? target / base : 1;
  }, [pieces, pieceG, yieldCount, yieldGrams]);

  const flourTotal = useMemo(
    () => ingredients.filter((i) => i.key?.startsWith('flour:')).reduce((a, i) => a + i.grams, 0),
    [ingredients],
  );

  const total = ingredients.reduce((a, i) => a + i.grams, 0);

  const label = (i: RecipeIngredient): string => {
    if (i.key) {
      const dict = t.ingredients as Record<string, string>;
      if (dict[i.key]) return dict[i.key];
    }
    return i.label?.[lang] ?? i.key ?? ', ';
  };

  return (
    <div className="formula-card card">
      <div className="formula-controls no-print">
        <fieldset className="seg" aria-label={t.recipe.units}>
          <button
            type="button"
            className="chip"
            aria-pressed={sys === 'metric'}
            onClick={() => chooseSys('metric')}
          >
            {t.recipe.unitMetric}
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={sys === 'us'}
            onClick={() => chooseSys('us')}
          >
            {t.recipe.unitUs}
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={volumes}
            onClick={() => setVolumes(!volumes)}
          >
            {t.recipe.showVolumes}
          </button>
        </fieldset>
        <div className="scale mono">
          <span>{t.recipe.scale}:</span>
          <input
            type="number"
            min={1}
            max={40}
            value={pieces}
            onChange={(ev) => setPieces(Number(ev.target.value))}
            aria-label={t.recipe.pieces}
          />
          <span>×</span>
          <input
            type="number"
            min={20}
            max={4000}
            step={10}
            value={pieceG}
            onChange={(ev) => setPieceG(Number(ev.target.value))}
            aria-label={t.recipe.pieceWeight}
          />
          <span>g</span>
        </div>
      </div>

      <table className="ledger">
        <thead>
          <tr>
            <th>{t.lab.colIngredient}</th>
            <th className="num">{sys === 'metric' ? 'g' : 'oz'}</th>
            {volumes ? <th className="num">vol</th> : null}
            {flourTotal > 0 ? <th className="num">{t.lab.colPct}</th> : null}
          </tr>
        </thead>
        <tbody>
          {ingredients.map((i, idx) => {
            const grams = i.grams * factor;
            const vol = volumes && i.key ? gramsToVolume(i.key, grams, DENSITIES) : null;
            return (
              <tr key={`${i.key ?? i.label?.en ?? idx}`}>
                <td>
                  {label(i)}
                  {i.note ? <span className="note">, {i.note}</span> : null}
                </td>
                <td className="num">{formatMass(grams, sys)}</td>
                {volumes ? <td className="num">{vol ? `${vol.qty} ${vol.unit}` : '·'}</td> : null}
                {flourTotal > 0 ? (
                  <td className="num">
                    {i.grams > 0 ? `${Math.round((i.grams / flourTotal) * 1000) / 10}` : '·'}
                  </td>
                ) : null}
              </tr>
            );
          })}
          <tr className="total">
            <td>{fmt(t.recipe.forYield, { count: pieces, grams: Math.round(pieceG) })}</td>
            <td className="num">{formatMass(total * factor, sys)}</td>
            {volumes ? <td className="num" /> : null}
            {flourTotal > 0 ? <td className="num" /> : null}
          </tr>
        </tbody>
      </table>
      {volumes ? <p className="fine">{t.recipe.volumeNote}</p> : null}
      <p className="fine">{t.recipe.bakersNote}</p>
    </div>
  );
}
