const DEFAULTS = {
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4o-mini"
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini"
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-3-5-haiku-latest"
  },
  custom: {
    baseUrl: "",
    model: ""
  }
};

const MAX_MESSAGE_LENGTH = 12000;
const MAX_CONTEXT_LENGTH = 18000;

export class AssistantError extends Error {
  constructor(message, status = 400, code = "assistant_error") {
    super(message);
    this.name = "AssistantError";
    this.status = status;
    this.code = code;
  }
}

function firstValue(source, names) {
  for (const name of names) {
    if (typeof source?.[name] === "string" && source[name].trim()) {
      return source[name].trim();
    }
  }
  return "";
}

function cleanBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function providerKeyNames(provider) {
  if (provider === "openrouter") return ["OPENROUTER_API_KEY", "AI_API_KEY"];
  if (provider === "openai") return ["OPENAI_API_KEY", "AI_API_KEY"];
  if (provider === "anthropic") return ["ANTHROPIC_API_KEY", "AI_API_KEY"];
  return ["AI_API_KEY"];
}

function normalizeProvider(value) {
  const provider = String(value || "openrouter").toLowerCase().trim();
  if (provider === "openai-compatible" || provider === "openai_compatible") return "custom";
  if (Object.hasOwn(DEFAULTS, provider)) return provider;
  throw new AssistantError("Choose OpenRouter, OpenAI, Anthropic, or a configured custom endpoint.", 400, "unsupported_provider");
}

function clampNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function endpointFor(baseUrl, suffix) {
  const base = cleanBaseUrl(baseUrl);
  if (!base) throw new AssistantError("A provider endpoint is required for this configuration.", 400, "missing_base_url");
  try {
    const url = new URL(base);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("unsupported protocol");
  } catch {
    throw new AssistantError("The provider endpoint must be a valid HTTP or HTTPS URL.", 400, "invalid_base_url");
  }
  return `${base}${suffix}`;
}

function parseUpstreamPayload(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 500) };
  }
}

function textFromPayload(provider, payload) {
  if (provider === "anthropic") {
    return Array.isArray(payload?.content)
      ? payload.content.filter((item) => item?.type === "text").map((item) => item.text).join("\n").trim()
      : "";
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.map((item) => item?.text || "").join("\n").trim();
  return "";
}

function errorMessage(payload, status) {
  return payload?.error?.message || payload?.message || `The model provider returned HTTP ${status}.`;
}

export function resolveAssistantConfig(body = {}, env = {}) {
  const provider = normalizeProvider(body.provider || firstValue(env, ["AI_PROVIDER"]) || "openrouter");
  const defaults = DEFAULTS[provider];
  const envBaseUrl = firstValue(env, ["AI_BASE_URL"]);
  const bodyBaseUrl = typeof body.baseUrl === "string" ? body.baseUrl.trim() : "";
  const allowClientEndpoint = firstValue(env, ["ALLOW_CUSTOM_ENDPOINTS"]) === "true";
  const baseUrl = provider === "custom"
    ? envBaseUrl || (allowClientEndpoint ? bodyBaseUrl : "")
    : envBaseUrl || defaults.baseUrl;
  const apiKey = typeof body.apiKey === "string" && body.apiKey.trim()
    ? body.apiKey.trim()
    : firstValue(env, providerKeyNames(provider));
  const model = typeof body.model === "string" && body.model.trim()
    ? body.model.trim()
    : firstValue(env, ["AI_MODEL"]) || defaults.model;

  if (!apiKey) {
    throw new AssistantError("No provider key is configured. Add a key in your private deployment settings or send an ephemeral BYOK key.", 401, "missing_api_key");
  }

  if (!model) {
    throw new AssistantError("No model is configured for this provider.", 400, "missing_model");
  }

  return { provider, baseUrl, apiKey, model };
}

export async function handleAssistantRequest({ body = {}, env = {} }) {
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) throw new AssistantError("Ask a question before sending the request.", 400, "missing_message");
  if (message.length > MAX_MESSAGE_LENGTH) throw new AssistantError("Questions must be 12,000 characters or fewer.", 413, "message_too_long");

  const context = typeof body.context === "string" ? body.context.trim().slice(0, MAX_CONTEXT_LENGTH) : "";
  const config = resolveAssistantConfig(body, env);
  const system = [
    "You are Vessel Assistant, a documentation-focused AI assistant.",
    "Answer from the supplied documentation context when it is present.",
    "If the context does not support an answer, say what is missing instead of inventing an API.",
    "Prefer concise steps and runnable examples."
  ].join(" ");
  const prompt = context ? `Documentation context:\n${context}\n\nQuestion:\n${message}` : message;
  const maxTokens = clampNumber(body.maxTokens, 900, 128, 2048);

  let upstream;
  if (config.provider === "anthropic") {
    upstream = await fetch(endpointFor(config.baseUrl, "/messages"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }]
      })
    });
  } else {
    const headers = {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`
    };
    if (config.provider === "openrouter") {
      headers["HTTP-Referer"] = env.VESSEL_SITE_URL || "https://github.com/everyai-com/mintly-alternative";
      headers["X-OpenRouter-Title"] = env.VESSEL_SITE_NAME || "Vessel";
    }
    upstream = await fetch(endpointFor(config.baseUrl, "/chat/completions"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt }
        ]
      })
    });
  }

  const rawText = await upstream.text();
  const payload = parseUpstreamPayload(rawText);
  if (!upstream.ok) throw new AssistantError(errorMessage(payload, upstream.status), upstream.status >= 500 ? 502 : upstream.status, "provider_error");

  const answer = textFromPayload(config.provider, payload);
  if (!answer) throw new AssistantError("The provider returned an empty answer.", 502, "empty_provider_answer");

  return {
    provider: config.provider,
    model: config.model,
    answer,
    usage: payload.usage || null
  };
}
