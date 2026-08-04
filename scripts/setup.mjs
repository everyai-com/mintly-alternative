import { access, copyFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const args = new Set(process.argv.slice(2));
const envExamplePath = join(root, ".env.example");
const envPath = join(root, ".env");

if (args.has("--help") || args.has("-h")) {
  console.log("Vessel setup\n\nUsage: npm run setup [-- --dry-run] [-- --skip-env]\n\nCreates a local .env from .env.example without overwriting an existing file. No provider key is required for the static docs demo.");
  process.exit(0);
}

await requireFile(envExamplePath, ".env.example");
const hasEnv = await fileExists(envPath);
const skipEnv = args.has("--skip-env");
const dryRun = args.has("--dry-run");

if (!skipEnv && !hasEnv) {
  if (dryRun) {
    console.log("[dry-run] Would create .env from .env.example");
  } else {
    await copyFile(envExamplePath, envPath);
    console.log("Created .env from .env.example (no secrets were added).");
  }
} else if (hasEnv) {
  console.log("Kept existing .env; setup never overwrites local configuration.");
} else {
  console.log("Skipped .env creation (--skip-env).");
}

const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
console.log(`\nVessel ${packageJson.version} is ready.`);
console.log("\nNext steps:\n  npm run dev       Start the local docs site\n  npm run doctor    Check the repository setup\n  npm run verify    Run the complete build and test gate");
console.log("\nOptional Assistant setup: add AI_PROVIDER, AI_MODEL, and AI_API_KEY to .env for your private deployment.");
console.log("OpenAPI contracts belong in openapi/; Markdown docs belong in content/.");

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function requireFile(path, label) {
  if (!(await fileExists(path))) {
    console.error(`Missing ${label}. Restore it from the repository before running setup.`);
    process.exit(1);
  }
}
