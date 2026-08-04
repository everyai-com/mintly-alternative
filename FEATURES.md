# Vessel feature map

Vessel is aiming to be a self-hostable, open-source documentation maker with the product depth people expect from a hosted docs platform and a first-class interface for AI agents.

This map keeps the promise precise: the landing page shows the intended experience, while the compiler and services are built in public. “Preview” means the capability is represented in the local UI; it is not a claim that the production backend already exists.

## Feature inventory

| Surface | What Vessel is designed to ship | Current status |
| --- | --- | --- |
| Content | Markdown/MDX, frontmatter, browser editor, AI syntax fixes, custom components | Markdown compiler, provenance/freshness metadata, and quality audit now; visual editor next |
| Design | Themes, typography, custom CSS, responsive pages, custom domains | UI system in place; config next |
| Navigation | Groups, tabs, menus, breadcrumbs, versions, redirects, localization | Config-driven groups plus version/locale contract now; full renderer next |
| API docs | OpenAPI and AsyncAPI import, generated references, schemas, examples | OpenAPI JSON/YAML ingestion, generated references, schemas, and examples now; AsyncAPI next |
| API playground | Interactive requests, responses, auth inheritance, language tabs | Safe curl/fetch request preview and documented mock responses now; authenticated proxy next |
| API lifecycle | OpenAPI, AsyncAPI, and GraphQL design-first specs, contract diffs, lint/style rules | UI preview; parser and linter next |
| Assistant | Grounded answers, citations, code examples, search analytics, BYOK provider adapters | UI + gateway + source-grounded retrieval now; citations/analytics next |
| Agent workflow | Repo/web research, plans, validation, AGENTS.md, reviewable PRs | Agent manifest, permissions, skill workflow, and docs audit now; research/PR worker next |
| Maintenance | Code/product/support drift, scheduled semantic audits, explainable patches, suggested PRs | UI preview; source adapters + scheduler next |
| Collaboration | MDX/Git editing, visual editing, inline comments, bidirectional sync, previews | UI preview; editor service next |
| Knowledge hubs | Public docs, customer help center, private wiki, indexed embedded help widget | UI preview; routing/search/auth next |
| Governance | RBAC, category/page access, multi-step approvals, diffs, comments, audit logs | UI preview; policy service next |
| Machine context | `llms.txt`, `llms-full.txt`, sitemap, page metadata | Generated docs/API indexes, agent manifest, permissions, `skill.md`, provenance, and freshness metadata now |
| MCP | Search, page retrieval, examples, API operations, read-only resources, typed tools | Read-only JSON-RPC endpoint with docs and OpenAPI resources/tools plus `audit_docs`; auth/streaming next |
| Access | JWT, OAuth, password gates, page/group rules, roles, SSO-ready boundaries | Concept preview; auth service next |
| Insights | Visitors, popular pages, failed searches, support deflection, endpoint usage, feedback, agent confidence | Concept preview; self-hosted telemetry next |
| Releases | Changelog, tags, RSS, announcements, update components | UI preview; content model next |
| Visual + reach | Browser screenshots, visual QA, localization, SEO redirects, migration tooling | UI preview; workers + compiler next |
| Integrations | GitHub/GitLab, Slack, webhooks, browser extension, support tools, admin API, CI checks | Roadmap |
| Hosting | Netlify, Cloudflare Workers, static export, own infrastructure | Build/deploy scaffold + Worker/Function APIs now |
| GitHub | One-click source connection, optional GitHub App, commit previews, reviewable PRs | One-click source flow + install route scaffold; App setup next |
| Onboarding | Guided local setup, environment templates, health checks, one-command verification | `npm run setup`, `npm run doctor`, and `npm run verify` now |

## Build order

1. Render the indexed Markdown and OpenAPI source into human docs, API reference pages, components, themes, and versioned routes.
2. Generate `llms.txt`, `llms-full.txt`, agent contracts, sitemap metadata, and the MCP-readable index from the same model.
3. Add preview builds, link/style checks, hybrid browser editing, YAML/AsyncAPI/GraphQL contract linting, and richer language tabs.
4. Add the maintenance scheduler, source/support adapters, drift explanations, and reviewable repair PRs.
5. Add Assistant citations, feedback, support deflection, endpoint usage, and agent confidence signals.
6. Add help-center/wiki surfaces, the embedded widget, localization, screenshot checks, migration-safe redirects, and governance.
7. Add authentication, access rules, changelogs, webhooks, Slack, and the research-to-PR agent workflow.

## What the comparison surfaced

The comparison covers hosted AI docs platforms and open-source docs frameworks. Vessel does not need to copy every editor, pricing tier, or brand-specific workflow. The highest-leverage additions are the ones that keep agent-facing docs correct and give teams a safe ownership loop:

- P0: drift detection, scheduled audits, support-question mining, API contract lifecycle, explainable patches, and human approval.
- P1: Git plus visual editing, public/help-center/private knowledge surfaces, governance, version diffs, and audit history.
- P2: embedded help, screenshots and visual QA, localization, migration-safe SEO redirects, and integrations.

| Market signal | Common strength | Vessel response | Status |
| --- | --- | --- | --- |
| Mintlify | Beautiful components, API playgrounds, Assistant, analytics, versions/localization, agent jobs | Keep the visual quality target while making source, deployment, and agent access portable | OpenAPI reference/preview now; analytics and agent jobs next |
| GitBook | Git sync plus visual editing, Assistant, Agent, MCP, authenticated publishing | Keep Git as the source of truth and add an explicit agent contract and permission boundary | Agent contract now; visual sync next |
| Fern | Spec-first API references, SDK workflows, and a documentation MCP server | Add OpenAPI ingestion without coupling the docs source to a hosted service | MCP and OpenAPI renderer now; SDK workflows next |
| ReadMe | API-specific onboarding, auth-aware landing pages, custom content, and management API | Make API contract metadata and runnable examples available to agents and static builds | Contract model and generated reference now; auth-aware proxy next |
| Docusaurus | Open-source versioning, localization, plugin ecosystem, and Git-native builds | Keep the portable build model while adding agent-readable navigation/version metadata | Config contract now; full versions/locales next |

The differentiator is not another hosted chatbot: it is a reproducible documentation build that emits human pages, machine context, permissions, and a quality score from one reviewed source tree.

The maintenance section on the landing page is an honest product preview of this priority. It does not imply that the scheduler, editor, adapters, linter, or governance service are production-ready yet.

## Research basis

The inventory is based on Mintlify’s public documentation and pricing surface, not private product assumptions:

- [Pricing and feature matrix](https://www.mintlify.com/pricing)
- [Navigation, versions, and localization](https://mintlify.com/docs/navigation)
- [API playground](https://mintlify.com/docs/api-playground/overview)
- [Components](https://www.mintlify.com/mintlify/docs/components/index)
- [Assistant](https://mintlify.com/docs/guides/assistant)
- [Analytics](https://mintlify.com/docs/guides/analytics)
- [Agent](https://www.mintlify.com/docs/agent)
