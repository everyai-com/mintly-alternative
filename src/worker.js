import { AssistantError, handleAssistantRequest } from "./assistant-core.js";
import { getDocsAudit, getDocsIndex, getMcpManifest, getPage, handleMcpRequest, searchDocs } from "./docs-core.js";
import { getApiIndex, getApiOperation } from "./openapi-core.js";

const REPOSITORY_URL = "https://github.com/everyai-com/mintly-alternative";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      "x-content-type-options": "nosniff"
    }
  });
}

async function assistantResponse(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") return jsonResponse({ ok: false, code: "method_not_allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, code: "invalid_json", message: "Send a JSON request body." }, 400);
  }

  try {
    const result = await handleAssistantRequest({ body, env });
    return jsonResponse({ ok: true, ...result });
  } catch (error) {
    const status = error instanceof AssistantError ? error.status : 502;
    const code = error instanceof AssistantError ? error.code : "assistant_upstream_error";
    return jsonResponse({ ok: false, code, message: error instanceof Error ? error.message : "Assistant request failed." }, status);
  }
}

function methodNotAllowed(allowed) {
  return jsonResponse({ ok: false, code: "method_not_allowed", allowed }, 405);
}

function docsResponse(request, url) {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);

  if (url.pathname === "/api/docs/search") {
    const query = url.searchParams.get("q") || "";
    const limit = url.searchParams.get("limit") || "8";
    return jsonResponse({ ok: true, query, results: searchDocs(query, limit) });
  }

  if (url.pathname === "/api/docs/index") {
    return jsonResponse({ ok: true, ...getDocsIndex() });
  }

  if (url.pathname === "/api/docs/audit") {
    const maxAgeDays = url.searchParams.get("maxAgeDays");
    return jsonResponse({ ok: true, audit: getDocsAudit(maxAgeDays ? { maxAgeDays } : {}) });
  }

  const slug = url.searchParams.get("slug") || "";
  const page = getPage(slug);
  if (!page) return jsonResponse({ ok: false, code: "page_not_found", slug }, 404);
  return jsonResponse({ ok: true, page });
}

function openApiResponse(request, url) {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);
  if (url.pathname === "/api/openapi/index") return jsonResponse({ ok: true, ...getApiIndex() });
  const id = url.searchParams.get("id") || "";
  const operation = getApiOperation(id);
  if (!operation) return jsonResponse({ ok: false, code: "operation_not_found", id }, 404);
  return jsonResponse({ ok: true, operation });
}

async function mcpResponse(request) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method === "GET") return jsonResponse({ ok: true, ...getMcpManifest() });
  if (request.method !== "POST") return methodNotAllowed(["POST"]);

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error." } }, 400);
  }

  const response = handleMcpRequest(body);
  if (!response) return new Response(null, { status: 202 });
  return jsonResponse(response);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "vessel" });
    }

    if (url.pathname === "/api/assistant") {
      return assistantResponse(request, env);
    }

    if (url.pathname === "/api/docs/search" || url.pathname === "/api/docs/page" || url.pathname === "/api/docs/index" || url.pathname === "/api/docs/audit") {
      return docsResponse(request, url);
    }

    if (url.pathname === "/api/openapi/index" || url.pathname === "/api/openapi/operation") {
      return openApiResponse(request, url);
    }

    if (url.pathname === "/api/mcp") {
      return mcpResponse(request);
    }

    if (url.pathname === "/api/github/install") {
      const slug = typeof env.GITHUB_APP_SLUG === "string" ? env.GITHUB_APP_SLUG.trim() : "";
      if (slug) return Response.redirect(`https://github.com/apps/${encodeURIComponent(slug)}/installations/new`, 302);
      return jsonResponse({
        ok: false,
        code: "github_app_not_configured",
        message: "Configure GITHUB_APP_SLUG after creating your public GitHub App.",
        repository: REPOSITORY_URL,
        docs: "/github"
      }, 501);
    }

    return env.ASSETS.fetch(request);
  }
};
