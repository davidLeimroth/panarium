// Panarium API server: RecipeService + ImportService over ConnectRPC (h2c).
package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"

	"connectrpc.com/connect"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"google.golang.org/protobuf/encoding/protojson"

	breadv1 "github.com/davidLeimroth/bread/backend/gen/bread/v1"
	"github.com/davidLeimroth/bread/backend/gen/bread/v1/breadv1connect"
	"github.com/davidLeimroth/bread/backend/internal/store"
)

type recipeService struct {
	store *store.Store
}

var unmarshal = protojson.UnmarshalOptions{DiscardUnknown: true}

func docToRecipe(doc []byte) (*breadv1.Recipe, error) {
	var r breadv1.Recipe
	if err := unmarshal.Unmarshal(doc, &r); err != nil {
		return nil, err
	}
	return &r, nil
}

func docsToRecipes(docs [][]byte) ([]*breadv1.Recipe, error) {
	out := make([]*breadv1.Recipe, 0, len(docs))
	for _, d := range docs {
		r, err := docToRecipe(d)
		if err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, nil
}

func (s *recipeService) SearchRecipes(
	ctx context.Context,
	req *connect.Request[breadv1.SearchRecipesRequest],
) (*connect.Response[breadv1.SearchRecipesResponse], error) {
	m := req.Msg
	offset := 0
	if m.GetPageToken() != "" {
		if n, err := strconv.Atoi(m.GetPageToken()); err == nil && n >= 0 {
			offset = n
		}
	}
	limit := int(m.GetPageSize())
	docs, total, err := s.store.Search(ctx, store.SearchParams{
		Query:            m.GetQuery(),
		Lang:             m.GetLang(),
		Leavens:          m.GetLeavens(),
		Families:         m.GetFamilies(),
		Flavors:          m.GetFlavors(),
		Purposes:         m.GetPurposes(),
		Countries:        m.GetCountries(),
		Flours:           m.GetFlours(),
		HydrationMin:     m.GetHydrationMin(),
		HydrationMax:     m.GetHydrationMax(),
		ReadyWithinMin:   m.GetReadyWithinMin(),
		ActiveUnderMin:   m.GetActiveUnderMin(),
		DifficultyMax:    m.GetDifficultyMax(),
		KeepsAtLeastDays: m.GetKeepsAtLeastDays(),
		Vegan:            m.GetVegan(),
		Wholegrain:       m.GetWholegrain(),
		Sort:             m.GetSort(),
		Limit:            limit,
		Offset:           offset,
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	recipes, err := docsToRecipes(docs)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	next := ""
	if limit <= 0 {
		limit = 24
	}
	if offset+len(recipes) < total {
		next = strconv.Itoa(offset + limit)
	}
	return connect.NewResponse(&breadv1.SearchRecipesResponse{
		Recipes:       recipes,
		NextPageToken: next,
		Total:         int32(total),
	}), nil
}

func (s *recipeService) GetRecipe(
	ctx context.Context,
	req *connect.Request[breadv1.GetRecipeRequest],
) (*connect.Response[breadv1.GetRecipeResponse], error) {
	doc, err := s.store.Get(ctx, req.Msg.GetSlug())
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	r, err := docToRecipe(doc)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&breadv1.GetRecipeResponse{Recipe: r}), nil
}

func (s *recipeService) ListFacets(
	ctx context.Context,
	_ *connect.Request[breadv1.ListFacetsRequest],
) (*connect.Response[breadv1.ListFacetsResponse], error) {
	rows, err := s.store.Facets(ctx)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	byDim := map[string]*breadv1.Facet{}
	var order []string
	for _, r := range rows {
		f, ok := byDim[r.Dimension]
		if !ok {
			f = &breadv1.Facet{Dimension: r.Dimension}
			byDim[r.Dimension] = f
			order = append(order, r.Dimension)
		}
		f.Counts = append(f.Counts, &breadv1.FacetCount{Value: r.Value, Count: int32(r.Count)})
	}
	resp := &breadv1.ListFacetsResponse{}
	for _, dim := range order {
		resp.Facets = append(resp.Facets, byDim[dim])
	}
	return connect.NewResponse(resp), nil
}

func (s *recipeService) SimilarRecipes(
	ctx context.Context,
	req *connect.Request[breadv1.SimilarRecipesRequest],
) (*connect.Response[breadv1.SimilarRecipesResponse], error) {
	docs, err := s.store.Similar(ctx, req.Msg.GetSlug(), int(req.Msg.GetLimit()))
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	recipes, err := docsToRecipes(docs)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&breadv1.SimilarRecipesResponse{Recipes: recipes}), nil
}

type importService struct {
	store *store.Store
}

func (s *importService) UpsertRecipes(
	ctx context.Context,
	req *connect.Request[breadv1.UpsertRecipesRequest],
) (*connect.Response[breadv1.UpsertRecipesResponse], error) {
	marshal := protojson.MarshalOptions{UseProtoNames: false}
	docs := make([][]byte, 0, len(req.Msg.GetRecipes()))
	for _, r := range req.Msg.GetRecipes() {
		b, err := marshal.Marshal(r)
		if err != nil {
			return nil, connect.NewError(connect.CodeInvalidArgument, err)
		}
		docs = append(docs, b)
	}
	upserted, errs := s.store.Upsert(ctx, docs)
	return connect.NewResponse(&breadv1.UpsertRecipesResponse{
		Upserted: int32(upserted),
		Errors:   errs,
	}), nil
}

func main() {
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

	st := store.New(pool)
	mux := http.NewServeMux()
	mux.Handle(breadv1connect.NewRecipeServiceHandler(&recipeService{store: st}))
	mux.Handle(breadv1connect.NewImportServiceHandler(&importService{store: st}))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port
	log.Printf("panarium api listening on %s", addr)
	server := &http.Server{
		Addr:    addr,
		Handler: h2c.NewHandler(mux, &http2.Server{}),
	}
	log.Fatal(server.ListenAndServe())
}
