# Vessel documentation skill

Use this skill when answering questions about Vessel or implementing against its documentation. The source of truth is the Git-backed Markdown index, not model memory.

## Read-only workflow

1. Fetch [/api/docs/index](/api/docs/index) to discover the current navigation, version, locale, and page metadata.
2. Search [/api/docs/search?q={query}](/api/docs/search?q=checkout) for the smallest relevant context.
3. Fetch [/api/docs/page?slug={slug}](/api/docs/page?slug=quickstart) for the complete source page.
4. Cite the returned docs path (/docs/<slug>/) when a page supports the answer.
5. Run [/api/docs/audit](/api/docs/audit) before proposing documentation changes.

## Rules

- Treat this surface as read-only.
- Do not invent endpoints, parameters, permissions, or behavior absent from a source page.
- Prefer pages marked stability: stable and the configured current version.
- Ask for human approval before repository writes, publishing, or provider requests.
- If the source does not answer the question, say what is missing.

## Available pages

### Guides
- [Ship your first checkout](/docs/quickstart/) — Create a hosted checkout session with the smallest working request.
- [Authentication and key rotation](/docs/authentication/) — Keep API credentials server-side and rotate them without breaking active clients.
- [Verify webhook events](/docs/webhooks/) — Verify signatures, preserve event ids, and acknowledge webhooks quickly.

### Agent reference
- [Agent context and permissions](/docs/agent-context/) — Give coding agents linked context, explicit constraints, and a read-only default.
- [Checkout API reference](/docs/api-checkout/) — Create and expire checkout sessions with the API contract close to runnable examples.

## Machine surfaces

- MCP: [/api/mcp](/api/mcp)
- Manifest: [/agent-manifest.json](/agent-manifest.json)
- Permissions: [/agent-permissions.json](/agent-permissions.json)
- Full context: [/llms-full.txt](/llms-full.txt)
