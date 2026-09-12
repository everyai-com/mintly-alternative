# Working on Vessel

## Purpose

Vessel is an open-source, static-first documentation layer for humans and AI agents. The marketing surface in this repository demonstrates the product direction: one Git-backed source can become human docs, an agent index, and an MCP-ready interface.

## Source map

- index.html contains the semantic page structure, full-platform feature preview, and demo surfaces.
- src/styles.css contains all visual styling and responsive layout rules.
- src/main.js contains surface switching, copy feedback, mobile navigation, the local agent query demo, provider settings, and the maintenance audit feed.
- src/assistant-core.js contains the provider-neutral BYOK adapter shared by the Worker and Netlify Function.
- docs.config.json, src/docs-parser.js, src/docs-core.js, src/docs-audit.js, src/openapi-parser.js, src/openapi-core.js, content/, openapi/, and scripts/ contain the source compiler, navigation model, quality audit, indexed search, page retrieval, OpenAPI reference, MCP contract, and setup/doctor helpers.
- src/worker.js is the Cloudflare Worker entrypoint for static assets, docs APIs, the read-only assistant gateway, and /health.
- netlify/functions/docs.mjs, netlify/functions/openapi.mjs, and netlify/functions/mcp.mjs mirror the Worker docs/API/MCP contracts on Netlify.
- public/api/ contains generated API JSON, operation pages, and the safe request-preview explorer; edit openapi/* instead of generated files.
- public/llms.txt, public/llms-full.txt, public/agent-manifest.json, public/agent-permissions.json, public/skill.md, and public/.well-known/agent-manifest.json are generated machine-readable context artifacts.
- netlify.toml, netlify/functions/, and wrangler.jsonc keep both deploy paths configured.

## Commands

Use the existing scripts:

    npm install
    npm run setup
    npm run doctor
    npm run dev
    npm run build
    npm run verify
    npm run preview

npm run deploy builds the site and deploys the generated assets with Wrangler. It requires a logged-in Cloudflare account and a project name configured by the user.

## Product guardrails

- Preserve the human and agent surfaces as two views of one source of truth.
- Keep the full-platform feature inventory aligned with FEATURES.md; label previews as previews until a real service exists.
- Keep copy direct, specific, and grounded in the current product scope.
- Do not claim that the MCP gateway is production-ready until a real server implementation exists.
- Do not activate provider deploy links with a fake repository URL. Publish the repository first, then replace the placeholder URLs in the README and landing page.
- Prefer semantic HTML, keyboard-accessible controls, and responsive behavior.
- Keep the static build free of required hosted services.
- Keep the maintenance UI honest: drift adapters, scheduled audits, the hybrid editor, API linting, and governance are roadmap services until their backends land.
- Keep docs search, docs audit, and MCP read-only; repository writes require a separate approval boundary.

## Verification

Run npm run build, npm run docs:check, and npm test after UI, content, or configuration changes. `npm run doctor -- --full` is the one-command fresh-clone confidence check. Check the generated dist folder and test the key interactions in a browser: surface tabs, mobile navigation, copy buttons, provider deploy messaging, and the agent query form. The core tests cover both Worker and Netlify docs/MCP contracts.

## Harness / agent discovery

Mintly already publishes machine-readable agent surfaces. When the contract
changes, keep them in sync:

- public/agent-manifest.json (plus /agent-manifest.json and /.well-known/agent-manifest.json) — the Vessel agent contract: pages, API operations, surfaces, capabilities, constraints.
- public/agent-permissions.json — the explicit read-only permission model.
- public/skill.md — the step-by-step workflow for coding and support agents.
- public/llms.txt and public/llms-full.txt — the human+agent index.

The MCP surface is a **read-only JSON-RPC endpoint at POST /api/mcp**
(initialize, tools/list, tools/call, resources/list, resources/read), mirrored on
Netlify at netlify/functions/mcp.mjs. It is intentionally JSON-RPC, not a
streamable-HTTP MCP transport — document it as such and do not claim a standard
MCP transport until one exists. Tools: search_docs, get_page, list_examples,
audit_docs, list_api_operations, get_api_operation; resources under vessel://…
(api index, per-operation, agent-manifest, agent-permissions, docs/<slug>).
Repository writes require a separate approval boundary.
