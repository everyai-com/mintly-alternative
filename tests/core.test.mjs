import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";
import { handleAssistantRequest } from "../src/assistant-core.js";
import { auditDocs } from "../src/docs-audit.js";
import { buildGroundedContext, getAgentManifest, getDocsIndex, getPage, handleMcpRequest, listExamples, listPages, searchDocs } from "../src/docs-core.js";
import docsFunction from "../netlify/functions/docs.mjs";
import mcpFunction from "../netlify/functions/mcp.mjs";

const assets = { fetch: async () => new Response("Not found", { status: 404 }) };
const env = { ASSETS: assets };

test("indexes source markdown and ranks grounded search results", () => {
  const results = searchDocs("rotate a production key", 4);
  assert.ok(results.length > 0);
  assert.equal(results[0].slug, "authentication");
  assert.equal(results[0].path, "/docs/authentication/");
});

test("retrieves complete pages and runnable examples", () => {
  const page = getPage("quickstart");
  assert.equal(page.title, "Ship your first checkout");
  assert.match(page.content, /vessel\.checkout\.create/);
  assert.equal(page.examples[0].language, "js");
  assert.equal(page.version, "current");
  assert.deepEqual(page.audience, ["developer", "coding-agent"]);
  assert.ok(listExamples("checkout").length >= 2);
  assert.equal(listPages().length, 5);
});

test("publishes a versioned agent contract and passing docs audit", () => {
  const index = getDocsIndex();
  assert.equal(index.versions[0].id, "current");
  assert.equal(index.navigation.length, 2);
  assert.equal(getAgentManifest().surfaces.skill, "/skill.md");

  const audit = auditDocs({ now: new Date("2026-08-04T00:00:00Z") });
  assert.equal(audit.status, "pass");
  assert.equal(audit.score, 100);
  assert.equal(audit.counts.errors, 0);
});

test("builds assistant context with source paths", () => {
  const grounded = buildGroundedContext("How do I verify a webhook?", "Team context: use the production endpoint.");
  assert.match(grounded.text, /Verify webhook events/);
  assert.match(grounded.text, /Team context/);
  assert.equal(grounded.sources[0].slug, "webhooks");
});

test("Assistant sends indexed source context to the selected provider", async () => {
  const originalFetch = globalThis.fetch;
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ choices: [{ message: { content: "Use the authentication guide." } }] }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };

  try {
    const result = await handleAssistantRequest({
      body: { provider: "openai", apiKey: "test-key", message: "How do I rotate a production key?" },
      env: {}
    });
    assert.match(requestBody.messages[1].content, /Authentication and key rotation/);
    assert.equal(result.sources[0].slug, "authentication");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("exposes read-only MCP discovery and tools", () => {
  const initialized = handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
  assert.equal(initialized.result.serverInfo.name, "vessel-docs");

  const tools = handleMcpRequest({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  assert.deepEqual(tools.result.tools.map((tool) => tool.name), ["search_docs", "get_page", "list_examples", "audit_docs"]);

  const search = handleMcpRequest({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "search_docs", arguments: { query: "checkout" } } });
  assert.equal(search.result.isError, false);
  assert.ok(search.result.structuredContent.results.length > 0);

  const resource = handleMcpRequest({ jsonrpc: "2.0", id: 4, method: "resources/read", params: { uri: "vessel://docs/quickstart" } });
  assert.match(resource.result.contents[0].text, /Ship your first checkout/);

  const manifest = handleMcpRequest({ jsonrpc: "2.0", id: 5, method: "resources/read", params: { uri: "vessel://agent-manifest" } });
  assert.match(manifest.result.contents[0].text, /vessel\.agent-manifest/);

  const audit = handleMcpRequest({ jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "audit_docs", arguments: {} } });
  assert.equal(audit.result.structuredContent.status, "pass");
});

test("Cloudflare routes expose search, page retrieval, and MCP", async () => {
  const indexResponse = await worker.fetch(new Request("https://vessel.test/api/docs/index"), env);
  assert.equal(indexResponse.status, 200);
  const index = await indexResponse.json();
  assert.equal(index.pages.length, 5);
  assert.equal(index.navigation[0].group, "Guides");

  const auditResponse = await worker.fetch(new Request("https://vessel.test/api/docs/audit"), env);
  assert.equal(auditResponse.status, 200);
  assert.equal((await auditResponse.json()).audit.status, "pass");

  const searchResponse = await worker.fetch(new Request("https://vessel.test/api/docs/search?q=webhook"), env);
  assert.equal(searchResponse.status, 200);
  assert.equal((await searchResponse.json()).results[0].slug, "webhooks");

  const pageResponse = await worker.fetch(new Request("https://vessel.test/api/docs/page?slug=authentication"), env);
  assert.equal(pageResponse.status, 200);
  assert.equal((await pageResponse.json()).page.slug, "authentication");

  const mcpResponse = await worker.fetch(new Request("https://vessel.test/api/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "get_page", arguments: { slug: "webhooks" } } })
  }), env);
  assert.equal(mcpResponse.status, 200);
  assert.equal((await mcpResponse.json()).result.structuredContent.slug, "webhooks");
});

test("Netlify Functions expose the same docs and MCP contracts", async () => {
  const indexResponse = await docsFunction({
    httpMethod: "GET",
    queryStringParameters: { path: "index" }
  });
  assert.equal(indexResponse.statusCode, 200);
  assert.equal(JSON.parse(indexResponse.body).navigation.length, 2);

  const auditResponse = await docsFunction({
    httpMethod: "GET",
    queryStringParameters: { path: "audit" }
  });
  assert.equal(auditResponse.statusCode, 200);
  assert.equal(JSON.parse(auditResponse.body).audit.status, "pass");

  const docsResponse = await docsFunction({
    httpMethod: "GET",
    queryStringParameters: { path: "search", q: "authentication" }
  });
  assert.equal(docsResponse.statusCode, 200);
  assert.equal(JSON.parse(docsResponse.body).results[0].slug, "authentication");

  const mcpResponse = await mcpFunction({
    httpMethod: "POST",
    body: JSON.stringify({ jsonrpc: "2.0", id: 8, method: "resources/list", params: {} })
  });
  assert.equal(mcpResponse.statusCode, 200);
  assert.equal(JSON.parse(mcpResponse.body).result.resources.length, 7);

  const manifestResponse = await mcpFunction({ httpMethod: "GET", queryStringParameters: {} });
  assert.equal(manifestResponse.statusCode, 200);
  assert.deepEqual(JSON.parse(manifestResponse.body).tools, ["search_docs", "get_page", "list_examples", "audit_docs"]);
});
