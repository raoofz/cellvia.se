# AGENTS.md

## Cursor Cloud specific instructions

This is a pure static HTML+CSS website (no JavaScript, no build tools, no package manager, no dependencies).

### Running the site

Serve with any static file server from the workspace root:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080/ in a browser. No build step or dependency installation is required.

### Structure

- `index.html` — Single-page landing site (Swedish language)
- `styles.css` — All styling
- `assets/` — JPEG images used by the page

### Lint / Test / Build

There are no automated tests, linters, or build steps configured in this repository. For HTML/CSS validation, use external tools if needed (e.g., `npx html-validate index.html`).
