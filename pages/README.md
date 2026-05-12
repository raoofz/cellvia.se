Root HTML files are intentionally kept at the project root so existing public URLs such as
`produkter.html`, `skapa-paket.html`, and `spara.html` keep working.

The page behavior is modularized under `components/`, `lib/`, `data/seed/`, and `scripts/`.
Future routing can move these HTML entrypoints into a framework without rewriting the
business logic.
