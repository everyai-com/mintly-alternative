# Working on Vessel

## Purpose

Vessel is an open-source, static-first documentation layer for humans and AI agents. The marketing surface in this repository demonstrates the product direction: one Git-backed source can become human docs, an agent index, and an MCP-ready interface.

## Source map

- index.html contains the semantic page structure, full-platform feature preview, and demo surfaces.
- src/styles.css contains all visual styling and responsive layout rules.
- src/main.js contains surface switching, copy feedback, mobile navigation, the local agent query demo, provider settings, and the maintenance audit feed.
- src/assistant-core.js contains the provider-neutral BYOK adapter shared by the Worker and Netlify Function.
- src/worker.js is the minimal Cloudflare Worker entrypoint for static assets and /health.
- public/llms.txt and public/llms-full.txt are the first machine-readable context artifacts.
- netlify.toml, netlify/functions/, and wrangler.jsonc keep both deploy paths configured.

## Commands

Use the existing scripts:

    npm install
    npm run dev
    npm run build
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

## Verification

Run npm run build after UI or configuration changes. Check the generated dist folder and test the key interactions in a browser: surface tabs, mobile navigation, copy buttons, provider deploy messaging, and the agent query form.
