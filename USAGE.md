# Vessel deployment setup

This file is shown by Netlify after the one-click template flow. The site works without an AI key as a static documentation demo; the key only enables live Assistant responses.

## Netlify

In Site configuration → Environment variables, add:

- `AI_PROVIDER`: `openrouter`, `openai`, `anthropic`, or `custom`.
- `AI_MODEL`: the model identifier for the selected provider.
- `AI_API_KEY`: a server-side provider key.
- `AI_BASE_URL`: only when using a custom OpenAI-compatible endpoint.
- `ALLOW_CUSTOM_ENDPOINTS`: keep `false` on public deployments; set `true` only on a trusted private deployment that intentionally accepts a browser-supplied custom endpoint.
- `GITHUB_APP_SLUG`: optional; enables `/api/github/install` after you create a public GitHub App.

Netlify Functions expose `/api/assistant`, `/api/docs/index`, `/api/docs/search`, `/api/docs/page`, `/api/mcp`, and `/api/github/install` through the redirects in `netlify.toml`.

## Docs and MCP API

The build reads Markdown files from `content/` and generates a typed index under `src/generated/` plus static JSON under `public/docs/`.

- `GET /docs/`: generated human-readable documentation index.
- `GET /api/docs/index`: compact page map for clients.
- `GET /api/docs/search?q=checkout`: ranked page search.
- `GET /api/docs/page?slug=quickstart`: complete page content and examples.
- `POST /api/mcp`: JSON-RPC `initialize`, `tools/list`, `tools/call`, `resources/list`, and `resources/read` for read-only agent access.

The same contracts run through the Cloudflare Worker and Netlify Functions. Run `npm test` to verify both adapters.

## Cloudflare Workers

Set public defaults in `wrangler.jsonc`, then add secrets outside source control:

```sh
wrangler secret put AI_API_KEY
wrangler secret put GITHUB_APP_SLUG
```

Use `wrangler secret delete AI_API_KEY` when rotating or removing a key. The Worker exposes the same `/api/assistant` and `/api/github/install` routes.

## Browser BYOK

The Assistant settings panel can send an explicitly entered key to the user’s own same-origin gateway. Vessel does not write it to local storage, a URL, source files, or analytics. Use server-side secrets for team deployments and shared instances.

## GitHub

The one-click provider flows clone the public [everyai-com/mintly-alternative](https://github.com/everyai-com/mintly-alternative) repository. For ongoing repository sync, configure the optional GitHub App described in [GITHUB.md](GITHUB.md).
