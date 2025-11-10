# Dedicated Search Page

This document describes the architecture and maintenance guidelines of the dedicated `/search` page.

## Goals

- Isolate search functionality from other parts of the app to avoid conflicts.
- Provide accessible, responsive controls for search, filtering, sorting, and pagination.
- Implement robust error handling and performance-aware fetching.

## Structure

- Route: `app/search/page.tsx` — server component wrapper that renders the client UI.
- Component: `components/search/SearchResultsPage.tsx` — client component containing the full search UI.

## Data Flow

- Source: `GET /api/products` supports `q`, `category`, `limit`, `offset` and returns `{ total, offset, limit, results, hasMore }`.
- Client state: `query`, `category`, `sort`, `pageSize`, `pageIndex`, `inStockOnly`.
- Pagination: uses `total` from API and `pageSize` to compute `totalPages`.
- Sorting: performed client-side for price and rating (API orders by `created_at` desc).

## Accessibility

- All controls have labels and ARIA attributes.
- Results status is announced via `aria-live`.
- Pagination controls have descriptive `aria-label`s.

## Error Handling

- Network and HTTP errors are caught, surfaced in a status area, and the grid shows an error message.
- Fetches are abortable, avoiding race conditions when users change inputs rapidly.

## Security

- Query input is trimmed, length-limited, and sanitized before being sent.
- No dynamic HTML injection is used; React escapes output.

## Performance

- Uses `fetchWithRetry` for resilient requests.
- Aborts in-flight fetches when inputs change.
- Defers query updates via `useDeferredValue` to reduce churn.

## Testing

- Unit tests in `tests/search-page.test.tsx` cover initial render, successful result rendering, and error handling.

## Maintenance

- If API shape changes, update `SearchResponse` type and pagination logic.
- To add new filters (e.g., price), prefer server-side support in `/api/products` and pass through params rather than heavy client-side filtering of partial data.

