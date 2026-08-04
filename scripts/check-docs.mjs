import { auditDocs } from "../src/docs-audit.js";

const audit = auditDocs();
console.log(`Docs audit: ${audit.status} (${audit.score}/100) — ${audit.counts.errors} errors, ${audit.counts.warnings} warnings across ${audit.counts.pages} pages.`);
for (const item of audit.issues) console.log(`${item.severity.toUpperCase()} ${item.code}${item.page ? ` [${item.page}]` : ""}: ${item.message}`);
if (audit.counts.errors > 0) process.exitCode = 1;
