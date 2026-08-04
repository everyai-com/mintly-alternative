# Contributing to Vessel

Vessel is being built in public as an open-source, self-hostable documentation layer for humans and AI agents. The current repository is a static-first product surface and deployment scaffold; the compiler, retrieval index, MCP server, maintenance services, and authenticated control plane are being added incrementally.

## Local workflow

```sh
npm install
npm run setup
npm run doctor
npm run dev
```

Before opening a pull request, run `npm run verify`, the JavaScript syntax checks in `.github/workflows/ci.yml`, and `git diff --check`. `npm run doctor -- --full` is a convenient equivalent when diagnosing a fresh clone.

## Scope and safety

- Keep provider keys out of source control. Use `.env.example` as the template.
- Keep the static build usable without a hosted database or provider key.
- Label UI previews honestly until their backend service exists.
- Prefer read-only agent access and human-reviewed changes before automation that writes to a repository.
- Keep changes portable across Cloudflare Workers, Netlify Functions, and static hosting.

Feature priorities and implementation status live in [FEATURES.md](FEATURES.md). The GitHub integration boundary is documented in [GITHUB.md](GITHUB.md).
