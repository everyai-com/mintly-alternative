const FRONTMATTER_START = "---";

export function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseValue(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => parseValue(item))
      .filter(Boolean);
  }
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

export function parseFrontmatter(source) {
  const lines = String(source || "").replace(/\r\n/g, "\n").split("\n");
  if (lines[0]?.trim() !== FRONTMATTER_START) return { data: {}, body: lines.join("\n").trim() };

  const end = lines.findIndex((line, index) => index > 0 && line.trim() === FRONTMATTER_START);
  if (end < 0) return { data: {}, body: lines.join("\n").trim() };

  const data = {};
  for (const line of lines.slice(1, end)) {
    const separator = line.indexOf(":");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    data[key] = parseValue(line.slice(separator + 1));
  }

  return { data, body: lines.slice(end + 1).join("\n").trim() };
}

export function extractHeadings(markdown) {
  return String(markdown || "")
    .split("\n")
    .map((line) => line.match(/^(#{1,6})\s+(.+?)\s*#*$/))
    .filter(Boolean)
    .map((match) => ({ level: match[1].length, text: match[2].trim() }));
}

export function extractExamples(markdown) {
  const examples = [];
  const pattern = /```([^\n]*)\n([\s\S]*?)```/g;
  let match;
  while ((match = pattern.exec(String(markdown || "")))) {
    examples.push({
      language: match[1].trim() || "text",
      code: match[2].trim()
    });
  }
  return examples;
}

export function plainText(markdown) {
  return String(markdown || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(value) {
  let html = escapeHtml(value);
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, (_match, label, href) => {
    const external = href.startsWith("http");
    return `<a href="${href}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${label}</a>`;
  });
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return html;
}

export function renderMarkdown(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const output = [];
  let paragraph = [];
  let list = [];
  let code = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${paragraph.map((line) => renderInline(line)).join(" ")}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      output.push(`<ul>${list.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      list = [];
    }
  };

  for (const line of lines) {
    const fence = line.match(/^```(.*)$/);
    if (fence) {
      flushParagraph();
      flushList();
      if (code) {
        output.push(`<pre><code${code.language ? ` class="language-${escapeHtml(code.language)}"` : ""}>${escapeHtml(code.lines.join("\n"))}</code></pre>`);
        code = null;
      } else {
        code = { language: fence[1].trim(), lines: [] };
      }
      continue;
    }
    if (code) {
      code.lines.push(line);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      output.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`);
      continue;
    }
    const item = line.match(/^\s*[-*]\s+(.+)$/);
    if (item) {
      flushParagraph();
      list.push(item[1].trim());
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    paragraph.push(line.trim());
  }

  if (code) output.push(`<pre><code>${escapeHtml(code.lines.join("\n"))}</code></pre>`);
  flushParagraph();
  flushList();
  return output.join("\n");
}

export function parseMarkdown(source, fileName = "page.md") {
  const parsed = parseFrontmatter(source);
  const fallbackSlug = slugify(fileName.replace(/\.md$/i, ""));
  const slug = slugify(parsed.data.slug || fallbackSlug);
  const contentText = plainText(parsed.body);
  const title = String(parsed.data.title || extractHeadings(parsed.body)[0]?.text || slug || "Untitled page");
  const description = String(parsed.data.description || contentText.slice(0, 180));

  return {
    slug,
    title,
    description,
    section: String(parsed.data.section || "Guides"),
    order: Number.isFinite(Number(parsed.data.order)) ? Number(parsed.data.order) : 999,
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [],
    headings: extractHeadings(parsed.body),
    examples: extractExamples(parsed.body),
    content: parsed.body,
    text: contentText
  };
}
