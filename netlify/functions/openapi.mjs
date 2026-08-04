import { getApiIndex, getApiOperation } from "../../src/openapi-core.js";

export default async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, body: "" };
  if (event.httpMethod !== "GET") return json({ ok: false, code: "method_not_allowed", allowed: ["GET"] }, 405);

  const route = String(event.queryStringParameters?.path || "").replace(/^\/+|\/+$/g, "");
  if (route === "index") return json({ ok: true, ...getApiIndex() });
  if (route === "operation") {
    const id = event.queryStringParameters?.id || "";
    const operation = getApiOperation(id);
    if (!operation) return json({ ok: false, code: "operation_not_found", id }, 404);
    return json({ ok: true, operation });
  }
  return json({ ok: false, code: "unknown_openapi_route", message: "Use /api/openapi/index or /api/openapi/operation." }, 404);
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
