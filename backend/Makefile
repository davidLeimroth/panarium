.PHONY: generate build vet import db-migrate

generate:
	cd .. && buf generate

build:
	go build ./...

vet:
	go vet ./...

# DATABASE_URL=postgres://localhost:5432/panarium?sslmode=disable
db-migrate:
	go run ./cmd/importer -dir ../data/seed/recipes -migrate migrations/0001_init.sql

import:
	go run ./cmd/importer -dir ../data/seed/recipes

serve:
	go run ./cmd/server
