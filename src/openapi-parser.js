import { parse as parseYaml } from "yaml";

const METHODS = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];

export function operationSlug(method, path) {
  return `${method}-${path}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function resolveReference(value, root) {
  if (!value || typeof value !== "object" || typeof value.$ref !== "string") return value;
  if (!value.$ref.startsWith("#/")) return value;
  return value.$ref.slice(2).split("/").map((key) => key.replace(/~1/g, "/").replace(/~0/g, "~")).reduce((current, key) => current?.[key], root) || value;
}

function exampleForSchema(schema, root, depth = 0) {
  const resolved = resolveReference(schema, root) || {};
  if (depth > 5) return null;
  if (resolved.example !== undefined) return resolved.example;
  if (resolved.default !== undefined) return resolved.default;
  if (Array.isArray(resolved.enum) && resolved.enum.length) return resolved.enum[0];
  if (resolved.type === "object" || resolved.properties) {
    return Object.fromEntries(Object.entries(resolved.properties || {}).map(([key, value]) => [key, exampleForSchema(value, root, depth + 1)]));
  }
  if (resolved.type === "array") return [exampleForSchema(resolved.items, root, depth + 1)];
  if (resolved.type === "integer" || resolved.type === "number") return 1;
  if (resolved.type === "boolean") return true;
  return "string";
}

function contentEntry(content, root) {
  if (!content || typeof content !== "object") return null;
  const contentType = Object.keys(content)[0];
  if (!contentType) return null;
  const entry = content[contentType] || {};
  const examples = entry.examples && typeof entry.examples === "object" ? Object.values(entry.examples) : [];
  const namedExample = examples.find((example) => example && typeof example === "object" && example.value !== undefined)?.value;
  return {
    contentType,
    schema: entry.schema ? resolveReference(entry.schema, root) : null,
    example: entry.example !== undefined ? entry.example : namedExample !== undefined ? namedExample : exampleForSchema(entry.schema, root)
  };
}

function parameterSummary(parameter, root) {
  const schema = resolveReference(parameter.schema, root) || {};
  return {
    name: String(parameter.name || "parameter"),
    in: String(parameter.in || "query"),
    required: Boolean(parameter.required),
    description: String(parameter.description || ""),
    example: parameter.example !== undefined ? parameter.example : exampleForSchema(schema, root),
    schema: {
      type: schema.type || "string",
      format: schema.format || undefined,
      enum: schema.enum || undefined
    }
  };
}

export function parseOpenApi(source, fileName = "openapi.json") {
  const spec = typeof source === "string" ? (/\.json$/i.test(fileName) ? JSON.parse(source) : parseYaml(source)) : source;
  const operations = [];
  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const method of METHODS) {
      const operation = pathItem?.[method];
      if (!operation || typeof operation !== "object") continue;
      const parameters = [...(pathItem.parameters || []), ...(operation.parameters || [])]
        .map((parameter) => resolveReference(parameter, spec))
        .filter(Boolean)
        .map((parameter) => parameterSummary(parameter, spec));
      const requestBody = contentEntry(resolveReference(operation.requestBody, spec)?.content, spec);
      const responses = Object.entries(operation.responses || {}).map(([status, response]) => {
        const resolved = resolveReference(response, spec) || {};
        const content = contentEntry(resolved.content, spec);
        return { status, description: String(resolved.description || ""), ...(content || {}) };
      });
      operations.push({
        id: String(operation.operationId || operationSlug(method, path)),
        slug: operationSlug(method, path),
        method: method.toUpperCase(),
        path,
        summary: String(operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`),
        description: String(operation.description || ""),
        tags: Array.isArray(operation.tags) ? operation.tags.map(String) : [],
        servers: (operation.servers || spec.servers || []).map((server) => ({ url: server.url, description: server.description || "" })),
        security: operation.security ?? spec.security ?? [],
        parameters,
        requestBody,
        responses,
        source: `openapi/${fileName}`
      });
    }
  }
  return {
    openapi: String(spec.openapi || "3.0.0"),
    title: String(spec.info?.title || fileName),
    version: String(spec.info?.version || "unknown"),
    description: String(spec.info?.description || ""),
    servers: (spec.servers || []).map((server) => ({ url: server.url, description: server.description || "" })),
    source: `openapi/${fileName}`,
    operations
  };
}
