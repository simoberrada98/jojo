# Accessibility Patterns and Requirements

This document captures accessibility patterns implemented across dialogs and UI components to meet WCAG 2.1 AA guidelines.

## Dialogs (Radix UI)

- `aria-labelledby` is automatically set on `DialogContent` and `AlertDialogContent` using generated IDs.
- `DialogTitle` and `DialogDescription` (and their AlertDialog counterparts) receive matching `id` attributes via context, creating proper association.
- If a title or description is omitted, a visually hidden fallback label and description are rendered to satisfy labeling requirements.
- Focus management and keyboard navigation are provided by Radix primitives. Close buttons include an accessible label and are keyboard reachable.
- Color contrast relies on design tokens and Tailwind classes that meet AA contrast. Maintain `text-foreground`/`bg-background` pairing and avoid low-contrast overlays.

### Authoring Guidance

- Always include a `DialogTitle` and `DialogDescription` when content is non-trivial.
- Prefer concise titles and descriptions; avoid multi-paragraph titles.
- Do not remove the close button without providing an alternative dismiss control.

## Error Handling and Fallbacks

- API fetching uses `fetchWithRetry` with exponential backoff and timeout to handle network instability and aborted requests.
- Product lists render a clear error alert with a retry button and avoid blank states.
- Product images include an error fallback with accessible messaging when images cannot load.

## Semantic HTML and Landmarks

- `app/layout.tsx` includes a skip-to-main link and a semantic `<main id="main-content" role="main">` landmark.
- Pages should maintain a logical heading hierarchy (`H1` → `H2` → `H3`) using typography components.

## Testing and Audits

- Unit tests validate dialog ARIA associations and include `axe-core` checks to catch violations.
- Regression tests cover fetch retry behaviors to prevent silent failures.

## Compliance Checklist (WCAG 2.1 AA)

- Labels and roles for interactive components.
- Keyboard operability and visible focus states.
- Adequate color contrast and semantic structure.
- Error identification and recovery paths.

