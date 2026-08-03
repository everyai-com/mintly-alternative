import { AssistantError, handleAssistantRequest } from "./assistant-core.js";

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "vessel" });
    }

    if (url.pathname === "/api/assistant") {
      return assistantResponse(request, env);
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
