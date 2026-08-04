import { apiIndex } from "./generated/openapi-index.js";

export function listApiOperations() {
  return apiIndex.operations;
}

export function getApiOperation(id) {
  const normalized = String(id || "").trim().toLowerCase();
  return apiIndex.operations.find((operation) => operation.id.toLowerCase() === normalized || operation.slug === normalized) || null;
}

export function getApiIndex() {
  return apiIndex;
}
