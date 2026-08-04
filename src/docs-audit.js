import { docsIndex, docsNavigation, siteConfig } from "./generated/docs-index.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function issue(severity, code, page, message) {
  return { severity, code, ...(page ? { page: page.slug } : {}), message };
}

function normalizeSlug(value) {
  return String(value || "").replace(/^\/docs\//, "").replace(/^\/+|\/+$/g, "").toLowerCase();
}

function localDocLinks(content) {
  const links = [];
  const pattern = /\]\(\s*(\/docs\/[^)#\s]+)(?:#[^)]*)?\s*\)/g;
  let match;
  while ((match = pattern.exec(String(content || "")))) links.push(match[1]);
  return links;
}

export function auditDocs({ now = new Date(), maxAgeDays = siteConfig.audit?.maxAgeDays || 365 } = {}) {
  const issues = [];
  const knownSlugs = new Set();
  const navigationSlugs = new Set();
  const duplicateNavigationSlugs = new Set();

  for (const group of docsNavigation) {
    for (const page of group.pages) {
      if (navigationSlugs.has(page.slug)) duplicateNavigationSlugs.add(page.slug);
      navigationSlugs.add(page.slug);
    }
  }
  for (const slug of duplicateNavigationSlugs) issues.push({ severity: "error", code: "duplicate_navigation_page", message: `Page ${slug} appears in more than one navigation group.` });

  for (const page of docsIndex) {
    if (knownSlugs.has(page.slug)) issues.push(issue("error", "duplicate_slug", page, "The page slug is duplicated."));
    knownSlugs.add(page.slug);

    if (!page.title.trim()) issues.push(issue("error", "missing_title", page, "Every page needs a title."));
    if (page.description.trim().length < 20) issues.push(issue("warning", "short_description", page, "Add a more useful description for search and agent selection."));
    if (!page.audience?.length) issues.push(issue("warning", "missing_audience", page, "Declare the intended human or agent audience."));
    if (!page.updated) {
      issues.push(issue("warning", "missing_updated", page, "Add an updated date so freshness can be evaluated."));
    } else {
      const updated = new Date(`${page.updated}T00:00:00Z`);
      if (Number.isNaN(updated.getTime())) {
        issues.push(issue("error", "invalid_updated", page, `The updated date ${page.updated} is not ISO-compatible.`));
      } else if (now.getTime() - updated.getTime() > maxAgeDays * DAY_MS) {
        issues.push(issue("warning", "stale_page", page, `The page has not been updated within the ${maxAgeDays}-day freshness window.`));
      }
    }
    if (!page.headings?.some((heading) => heading.level === 1)) issues.push(issue("error", "missing_h1", page, "Every page needs a level-one heading."));
    if (!page.examples?.length) issues.push(issue("warning", "missing_example", page, "Add at least one runnable example for agent retrieval."));
    if (!navigationSlugs.has(page.slug)) issues.push(issue("warning", "not_in_navigation", page, "The page is indexed but not present in the configured navigation."));

    for (const related of page.related || []) {
      if (!knownSlugs.has(related) && !docsIndex.some((candidate) => candidate.slug === related)) {
        issues.push(issue("error", "missing_related_page", page, `Related page ${related} does not exist.`));
      }
    }
    for (const link of localDocLinks(page.content)) {
      if (!knownSlugs.has(normalizeSlug(link)) && !docsIndex.some((candidate) => candidate.slug === normalizeSlug(link))) {
        issues.push(issue("error", "broken_doc_link", page, `The link ${link} does not resolve to an indexed page.`));
      }
    }
  }

  const errors = issues.filter((item) => item.severity === "error").length;
  const warnings = issues.filter((item) => item.severity === "warning").length;
  const score = Math.max(0, 100 - errors * 20 - warnings * 5);
  return {
    schemaVersion: 1,
    checkedAt: now.toISOString(),
    freshnessWindowDays: maxAgeDays,
    status: errors ? "fail" : warnings ? "warn" : "pass",
    score,
    counts: { pages: docsIndex.length, errors, warnings },
    issues
  };
}
