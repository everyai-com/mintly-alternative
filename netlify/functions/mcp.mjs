import { getMcpManifest, handleMcpRequest } from "../../src/docs-core.js";

export default async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, body: "" };
  if (event.httpMethod === "GET") return json({ ok: true, ...getMcpManifest() });
  if (event.httpMethod !== "POST") return json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "MCP requires POST." } }, 405);

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error." } }, 400);
  }

  const response = handleMcpRequest(body);
  if (!response) return { statusCode: 202, body: "" };
  return json(response);
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
