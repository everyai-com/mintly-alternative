import { AssistantError, handleAssistantRequest } from "../../src/assistant-core.js";

export default async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, body: "" };
  if (event.httpMethod !== "POST") return json({ ok: false, code: "method_not_allowed" }, 405);

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json({ ok: false, code: "invalid_json", message: "Send a JSON request body." }, 400);
  }

  try {
    const result = await handleAssistantRequest({ body, env: process.env });
    return json({ ok: true, ...result });
  } catch (error) {
    const status = error instanceof AssistantError ? error.status : 502;
    const code = error instanceof AssistantError ? error.code : "assistant_upstream_error";
    return json({ ok: false, code, message: error instanceof Error ? error.message : "Assistant request failed." }, status);
  }
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
