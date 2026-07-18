// Package store is the Postgres data layer: recipes live as JSONB documents
// (the exact seed-file shape, which is also protojson for bread.v1.Recipe);
// generated columns carry the hot filter fields.
package store

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

var tsConfigs = map[string]string{
	"en": "english",
	"de": "german",
	"es": "spanish",
	"fr": "french",
}

type SearchParams struct {
	Query            string
	Lang             string
	Leavens          []string
	Families         []string
	Flavors          []string
	Purposes         []string
	Countries        []string
	Flours           []string
	HydrationMin     float64
	HydrationMax     float64
	ReadyWithinMin   int32
	ActiveUnderMin   int32
	DifficultyMax    int32
	KeepsAtLeastDays float64
	Vegan            bool
	Wholegrain       bool
	Sort             string
	Limit            int
	Offset           int
}

var sortSQL = map[string]string{
	"name":           "doc->'name'->>'en' ASC",
	"time":           "total_min ASC",
	"active":         "active_min ASC",
	"hydration-desc": "hydration DESC",
	"hydration-asc":  "hydration ASC",
	"keeps":          "keeps_days DESC",
	"difficulty":     "difficulty ASC",
}

// Search returns raw JSONB documents plus the unpaged total.
func (s *Store) Search(ctx context.Context, p SearchParams) ([][]byte, int, error) {
	var where []string
	var args []any
	arg := func(v any) string {
		args = append(args, v)
		return "$" + strconv.Itoa(len(args))
	}

	strList := func(col string, values []string) {
		if len(values) > 0 {
			where = append(where, fmt.Sprintf("%s = ANY(%s)", col, arg(values)))
		}
	}
	strList("leaven", p.Leavens)
	strList("family", p.Families)
	strList("country", p.Countries)

	jsonArr := func(field string, values []string) {
		if len(values) > 0 {
			where = append(where, fmt.Sprintf("doc->'%s' ?| %s", field, arg(values)))
		}
	}
	jsonArr("flavors", p.Flavors)
	jsonArr("purposes", p.Purposes)

	if len(p.Flours) > 0 {
		where = append(where, fmt.Sprintf(
			"EXISTS (SELECT 1 FROM jsonb_array_elements(doc->'formula'->'flours') f WHERE f->>'type' = ANY(%s))",
			arg(p.Flours)))
	}
	if p.HydrationMin > 0 {
		where = append(where, "hydration >= "+arg(p.HydrationMin))
	}
	if p.HydrationMax > 0 {
		where = append(where, "hydration <= "+arg(p.HydrationMax))
	}
	if p.ReadyWithinMin > 0 {
		where = append(where, "total_min <= "+arg(p.ReadyWithinMin))
	}
	if p.ActiveUnderMin > 0 {
		where = append(where, "active_min <= "+arg(p.ActiveUnderMin))
	}
	if p.DifficultyMax > 0 {
		where = append(where, "difficulty <= "+arg(p.DifficultyMax))
	}
	if p.KeepsAtLeastDays > 0 {
		where = append(where, "keeps_days >= "+arg(p.KeepsAtLeastDays))
	}
	if p.Vegan {
		where = append(where, "vegan")
	}
	if p.Wholegrain {
		where = append(where, "COALESCE((doc->'diet'->>'wholegrainPct')::numeric, 0) >= 50")
	}
	if q := strings.TrimSpace(p.Query); q != "" {
		cfg := tsConfigs[p.Lang]
		if cfg == "" {
			cfg = "english"
		}
		tsvCol := "tsv_" + langOr(p.Lang)
		where = append(where, fmt.Sprintf(
			"(%s @@ websearch_to_tsquery('%s', %s) OR names_flat ILIKE %s)",
			tsvCol, cfg, arg(q), arg("%"+q+"%")))
	}

	whereSQL := ""
	if len(where) > 0 {
		whereSQL = "WHERE " + strings.Join(where, " AND ")
	}
	order, ok := sortSQL[p.Sort]
	if !ok {
		order = sortSQL["name"]
	}
	if p.Limit <= 0 || p.Limit > 100 {
		p.Limit = 24
	}

	var total int
	if err := s.pool.QueryRow(ctx, "SELECT count(*) FROM recipes "+whereSQL, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sql := fmt.Sprintf("SELECT doc FROM recipes %s ORDER BY %s LIMIT %d OFFSET %d",
		whereSQL, order, p.Limit, p.Offset)
	rows, err := s.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	docs, err := collectDocs(rows)
	return docs, total, err
}

func langOr(lang string) string {
	switch lang {
	case "de", "es", "fr":
		return lang
	default:
		return "en"
	}
}

func (s *Store) Get(ctx context.Context, slug string) ([]byte, error) {
	var doc []byte
	err := s.pool.QueryRow(ctx, "SELECT doc FROM recipes WHERE slug = $1", slug).Scan(&doc)
	return doc, err
}

// Similar ranks by shared family/leaven, hydration distance and same origin.
func (s *Store) Similar(ctx context.Context, slug string, limit int) ([][]byte, error) {
	if limit <= 0 || limit > 24 {
		limit = 4
	}
	rows, err := s.pool.Query(ctx, `
		WITH target AS (SELECT family, leaven, hydration, country FROM recipes WHERE slug = $1)
		SELECT r.doc
		FROM recipes r, target t
		WHERE r.slug <> $1
		ORDER BY
		  (r.family = t.family)::int * 2
		+ (r.leaven = t.leaven)::int
		+ (r.country = t.country)::int
		+ (1 - LEAST(ABS(r.hydration - t.hydration), 30) / 30.0) DESC
		LIMIT $2`, slug, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return collectDocs(rows)
}

type FacetRow struct {
	Dimension string
	Value     string
	Count     int
}

func (s *Store) Facets(ctx context.Context) ([]FacetRow, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT 'leaven', leaven, count(*) FROM recipes GROUP BY leaven
		UNION ALL SELECT 'family', family, count(*) FROM recipes GROUP BY family
		UNION ALL SELECT 'country', country, count(*) FROM recipes GROUP BY country
		UNION ALL SELECT 'flavor', f, count(*) FROM recipes, jsonb_array_elements_text(doc->'flavors') f GROUP BY f
		UNION ALL SELECT 'purpose', p, count(*) FROM recipes, jsonb_array_elements_text(doc->'purposes') p GROUP BY p
		ORDER BY 1, 3 DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []FacetRow
	for rows.Next() {
		var r FacetRow
		if err := rows.Scan(&r.Dimension, &r.Value, &r.Count); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}

// Upsert writes documents keyed by their "slug" field.
func (s *Store) Upsert(ctx context.Context, docs [][]byte) (int, []string) {
	upserted := 0
	var errs []string
	for _, doc := range docs {
		_, err := s.pool.Exec(ctx, `
			INSERT INTO recipes (slug, doc) VALUES (($1::jsonb)->>'slug', $1::jsonb)
			ON CONFLICT (slug) DO UPDATE SET doc = EXCLUDED.doc, updated_at = now()`,
			string(doc))
		if err != nil {
			errs = append(errs, err.Error())
			continue
		}
		upserted++
	}
	return upserted, errs
}

func collectDocs(rows pgx.Rows) ([][]byte, error) {
	var docs [][]byte
	for rows.Next() {
		var doc []byte
		if err := rows.Scan(&doc); err != nil {
			return nil, err
		}
		docs = append(docs, doc)
	}
	return docs, rows.Err()
}
