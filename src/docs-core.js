import { docsIndex } from "./generated/docs-index.js";

const MAX_LIMIT = 20;
const MCP_PROTOCOL_VERSION = "2025-06-18";

function clampLimit(value, fallback = 8) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(MAX_LIMIT, Math.max(1, Math.round(parsed)));
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .replace(/^\/docs\//, "")
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

function publicPage(page) {
  if (!page) return null;
  return {
    slug: page.slug,
    path: `/docs/${page.slug}/`,
    title: page.title,
    description: page.description,
    section: page.section,
    tags: page.tags,
    headings: page.headings,
    examples: page.examples,
    content: page.content
  };
}

function searchResult(page, score) {
  return {
    slug: page.slug,
    path: `/docs/${page.slug}/`,
    title: page.title,
    description: page.description,
    section: page.section,
    tags: page.tags,
    excerpt: page.text.slice(0, 220),
    score: Math.round(score * 100) / 100
  };
}

export function getPage(slug) {
  const normalized = normalizeSlug(slug);
  return publicPage(docsIndex.find((page) => page.slug === normalized));
}

export function listPages() {
  return docsIndex.map((page) => ({
    slug: page.slug,
    path: `/docs/${page.slug}/`,
    title: page.title,
    description: page.description,
    section: page.section,
    tags: page.tags,
    headings: page.headings
  }));
}

export function searchDocs(query, limit = 8) {
  const normalized = String(query || "").trim().toLowerCase();
  const safeLimit = clampLimit(limit);
  if (!normalized) return docsIndex.slice(0, safeLimit).map((page) => searchResult(page, 1));

  const terms = normalized.split(/[^a-z0-9]+/).filter((term) => term.length > 1);
  const matches = docsIndex
    .map((page) => {
      const title = page.title.toLowerCase();
      const description = page.description.toLowerCase();
      const tags = page.tags.join(" ").toLowerCase();
      const headings = page.headings.map((heading) => heading.text).join(" ").toLowerCase();
      const text = page.text.toLowerCase();
      let score = 0;

      for (const term of terms) {
        if (title.includes(term)) score += 8;
        if (description.includes(term)) score += 4;
        if (tags.includes(term)) score += 5;
        if (headings.includes(term)) score += 3;
        if (text.includes(term)) score += 1;
      }
      if (title === normalized) score += 12;
      return { page, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.page.order - right.page.order)
    .slice(0, safeLimit);

  return matches.map(({ page, score }) => searchResult(page, score));
}

export function listExamples(query = "", limit = 8) {
  const normalized = String(query || "").trim().toLowerCase();
  const examples = [];
  for (const page of docsIndex) {
    for (const example of page.examples) {
      const haystack = `${page.title} ${page.description} ${page.tags.join(" ")} ${example.language} ${example.code}`.toLowerCase();
      if (!normalized || haystack.includes(normalized)) {
        examples.push({
          page: { slug: page.slug, path: `/docs/${page.slug}/`, title: page.title },
          language: example.language,
          code: example.code
        });
      }
    }
  }
  return examples.slice(0, clampLimit(limit));
}

export function buildGroundedContext(question, suppliedContext = "", limit = 4) {
  const matches = searchDocs(question, limit);
  const sections = [];
  const provided = String(suppliedContext || "").trim();
  if (provided) sections.push(`Provided documentation context:\n${provided}`);

  for (const match of matches) {
    const page = getPage(match.slug);
    if (!page) continue;
    sections.push(`Source: ${page.title} (/docs/${page.slug}/)\n${page.content.slice(0, 3600)}`);
  }

  return {
    text: sections.join("\n\n").slice(0, 18000),
    sources: matches.map((match) => ({ title: match.title, path: match.path, slug: match.slug }))
  };
}

const MCP_TOOLS = [
  {
    name: "search_docs",
    description: "Search the indexed Vessel documentation and return grounded page matches.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "The documentation question or search phrase." }, limit: { type: "integer", minimum: 1, maximum: MAX_LIMIT } },
      required: ["query"]
    }
  },
  {
    name: "get_page",
    description: "Retrieve one complete documentation page by its slug.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string", description: "A page slug such as quickstart or authentication." } },
      required: ["slug"]
    }
  },
  {
    name: "list_examples",
    description: "List runnable code examples from the indexed documentation.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: MAX_LIMIT } }
    }
  }
];

export function getMcpManifest() {
  return {
    name: "vessel-docs",
    protocol: "MCP",
    protocolVersion: MCP_PROTOCOL_VERSION,
    transport: "JSON-RPC 2.0 over POST",
    endpoint: "/api/mcp",
    readOnly: true,
    tools: MCP_TOOLS.map((tool) => tool.name),
    resources: listPages().map((page) => `vessel://docs/${page.slug}`)
  };
}

function hasId(request) {
  return Object.prototype.hasOwnProperty.call(request, "id");
}

function success(request, result) {
  return hasId(request) ? { jsonrpc: "2.0", id: request.id, result } : null;
}

function failure(request, code, message, data) {
  return hasId(request)
    ? { jsonrpc: "2.0", id: request.id ?? null, error: { code, message, ...(data ? { data } : {}) } }
    : null;
}

function toolResult(request, payload, isError = false) {
  return success(request, {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
    isError
  });
}

export function handleMcpRequest(request) {
  if (!request || request.jsonrpc !== "2.0" || typeof request.method !== "string") {
    return { jsonrpc: "2.0", id: request?.id ?? null, error: { code: -32600, message: "Invalid JSON-RPC request." } };
  }

  const params = request.params && typeof request.params === "object" ? request.params : {};
  switch (request.method) {
    case "initialize":
      return success(request, {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false }, resources: { subscribe: false, listChanged: false } },
        serverInfo: { name: "vessel-docs", version: "0.2.0" },
        instructions: "Vessel exposes read-only, source-grounded documentation tools. Cite the returned page paths in answers."
      });
    case "notifications/initialized":
      return null;
    case "ping":
      return success(request, {});
    case "tools/list":
      return success(request, { tools: MCP_TOOLS });
    case "resources/list":
      return success(request, {
        resources: listPages().map((page) => ({
          uri: `vessel://docs/${page.slug}`,
          name: page.title,
          description: page.description,
          mimeType: "text/markdown"
        }))
      });
    case "resources/read": {
      const uri = String(params.uri || "");
      const prefix = "vessel://docs/";
      if (!uri.startsWith(prefix)) return failure(request, -32602, "The resource URI must start with vessel://docs/.");
      let slug;
      try {
        slug = decodeURIComponent(uri.slice(prefix.length));
      } catch {
        return failure(request, -32602, "The resource URI is not valid.");
      }
      const page = getPage(slug);
      if (!page) return failure(request, -32004, "Documentation page not found.");
      return success(request, { contents: [{ uri, mimeType: "text/markdown", text: page.content }] });
    }
    case "tools/call": {
      const name = String(params.name || "");
      const args = params.arguments && typeof params.arguments === "object" ? params.arguments : {};
      if (name === "search_docs") {
        if (!String(args.query || "").trim()) return failure(request, -32602, "search_docs requires a query.");
        return toolResult(request, { query: String(args.query).trim(), results: searchDocs(args.query, args.limit) });
      }
      if (name === "get_page") {
        const page = getPage(args.slug);
        if (!page) return toolResult(request, { error: "page_not_found", slug: args.slug || "" }, true);
        return toolResult(request, page);
      }
      if (name === "list_examples") return toolResult(request, { examples: listExamples(args.query, args.limit) });
      return failure(request, -32601, `Unknown tool: ${name}`);
    }
    default:
      return failure(request, -32601, `Method not found: ${request.method}`);
  }
}

export { MCP_PROTOCOL_VERSION };
