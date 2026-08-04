# Vessel

Vessel is an open-source, self-hostable documentation layer for the teams building the next interface. It turns a Git-backed source into:

- human docs that are readable and fast;
- llms.txt and llms-full.txt context for AI systems;
- an MCP-ready surface for discoverable resources and tools;
- a generated agent manifest, permission contract, and `skill.md` workflow;
- repo-native agent instructions and runnable examples;
- a maintenance layer that detects drift, mines support gaps, and routes explainable changes through review;
- a provider-neutral AI Assistant with BYOK support for OpenRouter, OpenAI, Anthropic, and custom OpenAI-compatible endpoints.

This repository contains the product landing page, a Markdown source compiler, config-driven navigation/version metadata, a generated agent contract, grounded search, a read-only docs audit, read-only MCP tools, and a static-first deployment scaffold. The interactive previews are intentionally local and dependency-light while the authenticated control plane, analytics, and maintenance services are being designed in public.

See [FEATURES.md](FEATURES.md) for the Mintlify-class feature inventory, current demo coverage, and the implementation order for the open-source product.

## Run locally

    npm install
    npm run dev

Build and preview the production bundle:

    npm run build
    npm run preview

The Cloudflare Worker also exposes GET /health after deployment.

The functional docs surface is available at `GET /docs/`, `GET /api/docs/index`, `GET /api/docs/search?q=checkout`, `GET /api/docs/page?slug=quickstart`, `GET /api/docs/audit`, `GET /api/` for the generated API reference and safe request preview, `GET /api/openapi/index`, `GET /api/openapi/operation?id=createCheckoutSession`, `GET /agent-manifest.json`, and `POST /api/mcp`. Netlify exposes the same contracts through its Functions redirects.

Put OpenAPI JSON, YAML, or YML contracts in [`openapi/`](openapi/). `npm run docs:build` turns them into static operation pages, JSON artifacts, MCP resources, and request examples. The playground builds curl/fetch snippets and previews documented responses; it deliberately does not proxy arbitrary authenticated requests from a public docs site.

## Deploy

### Netlify

`netlify.toml` is already configured with the Vite build command, `dist` output directory, SPA fallback, Netlify Functions, template environment prompts, and safe response headers.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/everyai-com/mintly-alternative)

The Netlify flow connects the new site to the GitHub repository and prompts for the optional assistant environment variables. `USAGE.md` is included as the post-deploy setup guide.

### Cloudflare

`wrangler.jsonc` uses a Worker entrypoint and static assets binding, including `/api/assistant` and `/api/github/install`:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/everyai-com/mintly-alternative)

For a local authenticated deploy:

    npm run deploy

Cloudflare's Deploy to Cloudflare flow creates a GitHub/GitLab copy, configures the Worker, and sets up Workers Builds. Add the provider key after deployment with `wrangler secret put AI_API_KEY`; never commit it.

## AI Assistant and BYOK

The browser includes a polished provider settings surface for OpenRouter, OpenAI, Anthropic, and custom OpenAI-compatible endpoints. It keeps a key in memory only for the current tab and calls the same-origin `/api/assistant` gateway. The gateway now grounds the provider prompt with the indexed Markdown pages and returns source paths alongside the answer. The production path is server-side configuration through Worker secrets or Netlify environment variables.

Supported variables are documented in [.env.example](.env.example). Provider-specific behavior is implemented in `src/assistant-core.js`; the Cloudflare Worker and Netlify Function share the same adapter logic.

OpenRouter is a useful default because it exposes an OpenAI-compatible chat API and a broad model catalog. You can still point Vessel directly at OpenAI, Anthropic’s native Messages API, or a trusted compatible endpoint.

## GitHub connection

The source repository is [everyai-com/mintly-alternative](https://github.com/everyai-com/mintly-alternative). One-click deployment keeps GitHub in the loop for future pushes and previews. The optional GitHub App installer route is documented in [GITHUB.md](GITHUB.md) and intentionally stays disabled until `GITHUB_APP_SLUG` is configured.

## Agent contract and docs quality

`docs.config.json` is the portable site contract for navigation, versions, locales, agent capabilities, constraints, and freshness policy. `npm run docs:check` catches broken internal links, missing metadata, stale pages, missing examples, and navigation drift before a deployment. The generated `agent-manifest.json`, `agent-permissions.json`, and `skill.md` give coding agents an explicit read-only workflow instead of relying on page scraping or model memory.

## UI architecture

The public page is deliberately framework-light for fast, portable self-hosting. shadcn/ui is a good open-source choice for the next authenticated editor/control plane because it distributes editable component source under MIT; see [SHADCN.md](SHADCN.md) for the decision and boundary.

## Product direction

The first version is being shaped around three recurring needs in agent-facing documentation:

1. Agents need a compact map of a docs site, not only rendered HTML.
2. Agents need explicit constraints, examples, and permission boundaries beside the implementation.
3. Teams need an inspectable, self-hostable deployment path instead of a mandatory hosted control plane.

The product roadmap is:

- browser editing and MDX components on top of the current Markdown compiler and config-driven navigation/version contract;
- built-in components, themes, custom domains, and browser editing;
- OpenAPI/AsyncAPI reference rendering; the current OpenAPI JSON/YAML path already generates reference pages, examples, MCP operations, and a safe request-preview playground;
- generated llms.txt, full-context exports, agent contracts, quality audits, and an Assistant with richer citations and analytics;
- content drift detection, scheduled semantic audits, support-ticket adapters, and suggested reviewable PRs;
- a hybrid Git/visual editor with bidirectional sync, comments, previews, and GraphQL/style linting;
- public docs, customer help center, private wiki, embedded help widget, versions, localization, screenshots, and migration-safe redirects;
- authentication, page-level access, roles, approval stages, audit logs, and self-hosted analytics;
- changelogs, RSS, webhooks, Slack, support integrations, admin APIs, and MCP auth/streaming;
- an agent workflow that researches, plans, validates, and opens reviewable PRs.

The attached Mintlify-alternatives inventory informed this order. We selected the features that improve accuracy, ownership, and self-hosting first; the UI preview is not a claim that every listed backend exists today. See [FEATURES.md](FEATURES.md) for the category-by-category status and research links.

## Research notes

The product shape is informed by the current agent-doc primitives:

- the llms.txt proposal describes a concise Markdown overview for websites that is easier for LLMs to use than a full HTML crawl: https://llmstxt.org/
- the MCP specification defines discoverable tools and resources for model-controlled workflows: https://modelcontextprotocol.io/specification/2025-06-18/server/tools
- Netlify documents an official one-click Deploy button for public Git repositories: https://docs.netlify.com/deploy/create-deploys/
- Cloudflare documents Deploy to Cloudflare buttons for public repositories and automatic Workers setup: https://developers.cloudflare.com/workers/platform/deploy-buttons/
- shadcn/ui documents its open-code Vite setup: https://ui.shadcn.com/docs/installation/vite
- shadcn/ui’s source repository is MIT licensed: https://github.com/shadcn-ui/ui/blob/main/LICENSE.md
- OpenRouter documents its OpenAI-compatible quickstart: https://openrouter.ai/docs/quickstart
- OpenAI documents API authentication: https://developers.openai.com/api/reference/overview#authentication
- Anthropic documents its Messages API: https://platform.claude.com/docs/en/api/overview
- Mintlify's current platform surface is documented through its pricing feature matrix: https://www.mintlify.com/pricing
- Mintlify documents navigation, tabs, versions, and localization: https://mintlify.com/docs/navigation
- Mintlify documents OpenAPI/AsyncAPI interactive playgrounds: https://mintlify.com/docs/api-playground/overview
- Mintlify documents its component system: https://www.mintlify.com/mintlify/docs/components/index
- Mintlify documents Assistant citations and agentic retrieval: https://mintlify.com/docs/guides/assistant
- Mintlify documents search, feedback, and analytics: https://mintlify.com/docs/guides/analytics
- Mintlify documents the research-to-PR Agent workflow: https://www.mintlify.com/docs/agent
- GitBook documents Git sync, Assistant, Agent, and MCP: https://gitbook.com/docs
- GitBook documents extending Assistant with external MCP servers: https://gitbook.com/docs/publishing-documentation/gitbook-assistant
- Fern documents its documentation MCP server: https://buildwithfern.com/learn/docs/ai-features/mcp-server
- ReadMe documents API reference landing pages with authentication-aware setup: https://docs.readme.com/main/docs/reference-core-pages
- Docusaurus documents versioning: https://docusaurus.io/docs/versioning
- Docusaurus documents Git-based localization: https://docusaurus.io/docs/i18n/tutorial

## License

MIT. See LICENSE.
