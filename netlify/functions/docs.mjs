import { getPage, listPages, searchDocs } from "../../src/docs-core.js";

export default async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, body: "" };
  if (event.httpMethod !== "GET") return json({ ok: false, code: "method_not_allowed", allowed: ["GET"] }, 405);

  const route = String(event.queryStringParameters?.path || "").replace(/^\/+|\/+$/g, "");
  if (route === "search") {
    const query = event.queryStringParameters?.q || "";
    const limit = event.queryStringParameters?.limit || "8";
    return json({ ok: true, query, results: searchDocs(query, limit) });
  }

  if (route === "index") return json({ ok: true, version: 1, pages: listPages() });

  if (route === "page") {
    const slug = event.queryStringParameters?.slug || "";
    const page = getPage(slug);
    if (!page) return json({ ok: false, code: "page_not_found", slug }, 404);
    return json({ ok: true, page });
  }

  return json({ ok: false, code: "unknown_docs_route", message: "Use /api/docs/index, /api/docs/search, or /api/docs/page." }, 404);
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
