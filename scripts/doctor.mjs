import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const args = new Set(process.argv.slice(2));
const full = args.has("--full");
const checks = [
  ["package.json", "package.json"],
  ["package-lock.json", "package-lock.json"],
  ["docs.config.json", "docs.config.json"],
  [".env.example", ".env.example"],
  ["netlify.toml", "netlify.toml"],
  ["wrangler.jsonc", "wrangler.jsonc"],
  ["content/", "content"],
  ["openapi/", "openapi"],
  ["generated docs index", "src/generated/docs-index.js"],
  ["generated OpenAPI index", "src/generated/openapi-index.js"],
  ["agent manifest", "public/agent-manifest.json"]
];

let failures = 0;
console.log("Vessel doctor\n");

const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor >= 22) pass(`Node.js ${process.versions.node}`);
else fail(`Node.js ${process.versions.node} found; use Node.js 22 or newer.`);

for (const [label, relativePath] of checks) {
  if (await exists(join(root, relativePath))) pass(label);
  else fail(`Missing ${label}`);
}

try {
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  const lockJson = JSON.parse(await readFile(join(root, "package-lock.json"), "utf8"));
  if (packageJson.version === lockJson.version && lockJson.packages?.[""]?.version === packageJson.version) pass(`package metadata is aligned (${packageJson.version})`);
  else fail("package.json and package-lock.json versions are out of sync");
} catch {
  fail("package metadata could not be parsed");
}

try {
  const config = JSON.parse(await readFile(join(root, "docs.config.json"), "utf8"));
  if (config.site?.name && config.navigation?.length) pass(`docs config is valid (${config.site.name})`);
  else fail("docs.config.json is missing site or navigation data");
} catch {
  fail("docs.config.json could not be parsed");
}

if (await exists(join(root, ".env"))) info(".env exists; local provider settings are available to the gateway");
else info(".env is not present; run npm run setup if you want a local environment file");
info("No provider key is required for the static docs, API reference, or MCP read-only surfaces");

if (full) {
  console.log("\nRunning the full verification gate…");
  const { spawn } = await import("node:child_process");
  const result = await new Promise((resolve) => {
    const child = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "verify"], { cwd: root, stdio: "inherit" });
    child.on("close", (code) => resolve(code ?? 1));
  });
  if (result !== 0) failures += 1;
}

console.log(`\n${failures ? "Doctor found issues" : "Doctor is clear"}.`);
if (!failures) console.log("Start with: npm run dev");
process.exitCode = failures ? 1 : 0;

function pass(message) {
  console.log(`PASS  ${message}`);
}

function fail(message) {
  failures += 1;
  console.log(`FAIL  ${message}`);
}

function info(message) {
  console.log(`INFO  ${message}`);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
