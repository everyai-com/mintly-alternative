import { getDocsAudit, getDocsIndex, getPage, searchDocs } from "../../src/docs-core.js";

export default async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, body: "" };
  if (event.httpMethod !== "GET") return json({ ok: false, code: "method_not_allowed", allowed: ["GET"] }, 405);

  const route = String(event.queryStringParameters?.path || "").replace(/^\/+|\/+$/g, "");
  if (route === "search") {
    const query = event.queryStringParameters?.q || "";
    const limit = event.queryStringParameters?.limit || "8";
    return json({ ok: true, query, results: searchDocs(query, limit) });
  }

  if (route === "index") return json({ ok: true, ...getDocsIndex() });

  if (route === "audit") {
    const maxAgeDays = event.queryStringParameters?.maxAgeDays;
    return json({ ok: true, audit: getDocsAudit(maxAgeDays ? { maxAgeDays } : {}) });
  }

  if (route === "page") {
    const slug = event.queryStringParameters?.slug || "";
    const page = getPage(slug);
    if (!page) return json({ ok: false, code: "page_not_found", slug }, 404);
    return json({ ok: true, page });
  }

  return json({ ok: false, code: "unknown_docs_route", message: "Use /api/docs/index, /api/docs/search, /api/docs/page, or /api/docs/audit." }, 404);
}

function json(payload, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      "x-content-type-options": "nosniff"
    },
    body: JSON.stringify(payload)
  };
}
