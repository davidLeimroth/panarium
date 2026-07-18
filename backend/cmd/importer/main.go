// Importer: loads data/seed/recipes/*.json into Postgres (optionally applying
// migrations first). The seed files are the canonical documents; this command
// is idempotent (upsert by slug).
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/davidLeimroth/bread/backend/internal/store"
)

func main() {
	dir := flag.String("dir", "../data/seed/recipes", "directory of recipe JSON files")
	migrations := flag.String("migrate", "", "optional path to a migration .sql to apply first")
	flag.Parse()

	ctx := context.Background()
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://localhost:5432/panarium?sslmode=disable"
	}
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer pool.Close()

	if *migrations != "" {
		sql, err := os.ReadFile(*migrations)
		if err != nil {
			log.Fatalf("read migration: %v", err)
		}
		if _, err := pool.Exec(ctx, string(sql)); err != nil {
			log.Fatalf("apply migration: %v", err)
		}
		log.Printf("applied %s", *migrations)
	}

	files, err := filepath.Glob(filepath.Join(*dir, "*.json"))
	if err != nil {
		log.Fatal(err)
	}
	if len(files) == 0 {
		log.Fatalf("no .json files in %s", *dir)
	}

	docs := make([][]byte, 0, len(files))
	for _, f := range files {
		b, err := os.ReadFile(f)
		if err != nil {
			log.Fatalf("read %s: %v", f, err)
		}
		docs = append(docs, b)
	}

	st := store.New(pool)
	upserted, errs := st.Upsert(ctx, docs)
	var run int64
	err = pool.QueryRow(ctx,
		`INSERT INTO import_runs (finished_at, note, stats)
		 VALUES (now(), 'seed import', jsonb_build_object('files', $1::int, 'upserted', $2::int, 'errors', $3::int))
		 RETURNING id`,
		len(files), upserted, len(errs)).Scan(&run)
	if err != nil {
		log.Printf("warn: could not record import run: %v", err)
	}

	fmt.Printf("import run %d: %d/%d upserted, %d errors\n", run, upserted, len(files), len(errs))
	for _, e := range errs {
		fmt.Println("  error:", e)
	}
	if len(errs) > 0 {
		os.Exit(1)
	}
}
