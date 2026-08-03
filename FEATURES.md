# Vessel feature map

Vessel is aiming to be a self-hostable, open-source documentation maker with the product depth people expect from a hosted docs platform and a first-class interface for AI agents.

This map keeps the promise precise: the landing page shows the intended experience, while the compiler and services are built in public. “Preview” means the capability is represented in the local UI; it is not a claim that the production backend already exists.

## Feature inventory

| Surface | What Vessel is designed to ship | Current status |
| --- | --- | --- |
| Content | Markdown/MDX, frontmatter, browser editor, AI syntax fixes, custom components | Markdown source compiler + index now; visual editor next |
| Design | Themes, typography, custom CSS, responsive pages, custom domains | UI system in place; config next |
| Navigation | Groups, tabs, menus, breadcrumbs, versions, redirects, localization | UI preview; navigation model next |
| API docs | OpenAPI and AsyncAPI import, generated references, schemas, examples | UI preview; renderer next |
| API playground | Interactive requests, responses, auth inheritance, language tabs | UI preview; proxy next |
| API lifecycle | OpenAPI, AsyncAPI, and GraphQL design-first specs, contract diffs, lint/style rules | UI preview; parser and linter next |
| Assistant | Grounded answers, citations, code examples, search analytics, BYOK provider adapters | UI + gateway + source-grounded retrieval now; citations/analytics next |
| Agent workflow | Repo/web research, plans, validation, AGENTS.md, reviewable PRs | UI preview; worker + integrations next |
| Maintenance | Code/product/support drift, scheduled semantic audits, explainable patches, suggested PRs | UI preview; source adapters + scheduler next |
| Collaboration | MDX/Git editing, visual editing, inline comments, bidirectional sync, previews | UI preview; editor service next |
| Knowledge hubs | Public docs, customer help center, private wiki, indexed embedded help widget | UI preview; routing/search/auth next |
| Governance | RBAC, category/page access, multi-step approvals, diffs, comments, audit logs | UI preview; policy service next |
| Machine context | `llms.txt`, `llms-full.txt`, sitemap, page metadata | Static artifacts + generated docs index now |
| MCP | Search, page retrieval, examples, read-only resources, typed tools | Read-only JSON-RPC endpoint now; auth/streaming next |
| Access | JWT, OAuth, password gates, page/group rules, roles, SSO-ready boundaries | Concept preview; auth service next |
| Insights | Visitors, popular pages, failed searches, support deflection, endpoint usage, feedback, agent confidence | Concept preview; self-hosted telemetry next |
| Releases | Changelog, tags, RSS, announcements, update components | UI preview; content model next |
| Visual + reach | Browser screenshots, visual QA, localization, SEO redirects, migration tooling | UI preview; workers + compiler next |
| Integrations | GitHub/GitLab, Slack, webhooks, browser extension, support tools, admin API, CI checks | Roadmap |
| Hosting | Netlify, Cloudflare Workers, static export, own infrastructure | Build/deploy scaffold + Worker/Function APIs now |
| GitHub | One-click source connection, optional GitHub App, commit previews, reviewable PRs | One-click source flow + install route scaffold; App setup next |

## Build order

1. Render the indexed Markdown source into human docs, API reference pages, components, themes, and versioned routes.
2. Generate `llms.txt`, `llms-full.txt`, sitemap metadata, and the MCP-readable index from the same model.
3. Add preview builds, link/style checks, hybrid browser editing, and OpenAPI/AsyncAPI/GraphQL contract linting.
4. Add the maintenance scheduler, source/support adapters, drift explanations, and reviewable repair PRs.
5. Add Assistant citations, feedback, support deflection, endpoint usage, and agent confidence signals.
6. Add help-center/wiki surfaces, the embedded widget, localization, screenshot checks, migration-safe redirects, and governance.
7. Add authentication, access rules, changelogs, webhooks, Slack, and the research-to-PR agent workflow.

## Selected from the attached inventory

The attached comparison covers nine adjacent products. Vessel does not need to copy every editor, pricing tier, or brand-specific workflow. The highest-leverage additions are the ones that keep agent-facing docs correct and give teams a safe ownership loop:

- P0: drift detection, scheduled audits, support-question mining, API contract lifecycle, explainable patches, and human approval.
- P1: Git plus visual editing, public/help-center/private knowledge surfaces, governance, version diffs, and audit history.
- P2: embedded help, screenshots and visual QA, localization, migration-safe SEO redirects, and integrations.

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
