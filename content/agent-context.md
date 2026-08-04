---
title: Agent context and permissions
description: Give coding agents linked context, explicit constraints, and a read-only default.
section: Agent docs
order: 4
tags: [agents, mcp, context, permissions]
audience: [coding-agent, support-agent]
related: [authentication, api-checkout]
version: current
locale: en
updated: 2026-08-04
stability: stable
---
# Agent context and permissions

Agents should discover a compact map before loading every page. Use the indexed search endpoint or the read-only MCP tools to find the smallest source-grounded context for a task.

## Discover the contract

```bash
curl "https://docs.example.com/api/docs/index"
curl "https://docs.example.com/api/docs/search?q=authentication"
```

## Safe defaults

- Read documentation and examples before proposing a change.
- Keep repository writes behind a human-reviewed pull request.
- Cite the page path that supports an answer.
- Say what is missing when the source does not answer the question.

## MCP discovery

The Vessel gateway exposes `search_docs`, `get_page`, and `list_examples`. It also exposes each page as a `vessel://docs/<slug>` read-only resource. Mutating tools are intentionally absent until the permission and approval service is in place.
