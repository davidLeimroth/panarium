-- Panarium backend schema. Canonical document lives as JSONB (the same shape
-- as data/seed/recipes/*.json); hot filter fields are generated columns.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS recipes (
  slug        text PRIMARY KEY,
  doc         jsonb NOT NULL,
  -- generated filter columns
  leaven      text          GENERATED ALWAYS AS (doc->>'leaven') STORED,
  family      text          GENERATED ALWAYS AS (doc->>'family') STORED,
  country     text          GENERATED ALWAYS AS (doc->'origin'->>'country') STORED,
  hydration   numeric       GENERATED ALWAYS AS (((doc->'formula'->>'hydrationPct'))::numeric) STORED,
  salt_pct    numeric       GENERATED ALWAYS AS (((doc->'formula'->>'saltPct'))::numeric) STORED,
  total_min   numeric       GENERATED ALWAYS AS (((doc->'time'->>'totalMin'))::numeric) STORED,
  active_min  numeric       GENERATED ALWAYS AS (((doc->'time'->>'activeMin'))::numeric) STORED,
  difficulty  int           GENERATED ALWAYS AS (((doc->>'difficulty'))::int) STORED,
  keeps_days  numeric       GENERATED ALWAYS AS (((doc->'keeping'->>'freshDays'))::numeric) STORED,
  vegan       boolean       GENERATED ALWAYS AS (((doc->'diet'->>'vegan'))::boolean) STORED,
  overnight   boolean       GENERATED ALWAYS AS (COALESCE((doc->'time'->>'overnight')::boolean, false)) STORED,
  -- flattened text for fuzzy name lookup
  names_flat  text          GENERATED ALWAYS AS (
                  (doc->'name'->>'en') || ' ' || (doc->'name'->>'de') || ' ' ||
                  (doc->'name'->>'es') || ' ' || (doc->'name'->>'fr') || ' ' ||
                  COALESCE(doc->'name'->>'native', '')
                ) STORED,
  -- per-language full text search
  tsv_en tsvector GENERATED ALWAYS AS (to_tsvector('english',
           (doc->'name'->>'en') || ' ' || (doc->'description'->>'en'))) STORED,
  tsv_de tsvector GENERATED ALWAYS AS (to_tsvector('german',
           (doc->'name'->>'de') || ' ' || (doc->'description'->>'de'))) STORED,
  tsv_es tsvector GENERATED ALWAYS AS (to_tsvector('spanish',
           (doc->'name'->>'es') || ' ' || (doc->'description'->>'es'))) STORED,
  tsv_fr tsvector GENERATED ALWAYS AS (to_tsvector('french',
           (doc->'name'->>'fr') || ' ' || (doc->'description'->>'fr'))) STORED,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- containment queries (flavors, purposes, flours, equipment) run against doc
CREATE INDEX IF NOT EXISTS recipes_doc_gin        ON recipes USING gin (doc jsonb_path_ops);
CREATE INDEX IF NOT EXISTS recipes_leaven_idx     ON recipes (leaven);
CREATE INDEX IF NOT EXISTS recipes_family_idx     ON recipes (family);
CREATE INDEX IF NOT EXISTS recipes_country_idx    ON recipes (country);
CREATE INDEX IF NOT EXISTS recipes_hydration_idx  ON recipes (hydration);
CREATE INDEX IF NOT EXISTS recipes_total_min_idx  ON recipes (total_min);
CREATE INDEX IF NOT EXISTS recipes_difficulty_idx ON recipes (difficulty);
CREATE INDEX IF NOT EXISTS recipes_keeps_idx      ON recipes (keeps_days);
CREATE INDEX IF NOT EXISTS recipes_names_trgm     ON recipes USING gin (names_flat gin_trgm_ops);
CREATE INDEX IF NOT EXISTS recipes_tsv_en_idx     ON recipes USING gin (tsv_en);
CREATE INDEX IF NOT EXISTS recipes_tsv_de_idx     ON recipes USING gin (tsv_de);
CREATE INDEX IF NOT EXISTS recipes_tsv_es_idx     ON recipes USING gin (tsv_es);
CREATE INDEX IF NOT EXISTS recipes_tsv_fr_idx     ON recipes USING gin (tsv_fr);

CREATE TABLE IF NOT EXISTS import_runs (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  note        text,
  stats       jsonb
);
