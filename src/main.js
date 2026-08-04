const surfaceDemo = document.querySelector("#surface-demo");
const surfaceTabs = Array.from(document.querySelectorAll("[data-surface]"));
const suitePreview = document.querySelector("#suite-preview");
const suiteTabs = Array.from(document.querySelectorAll("[data-suite]"));
const toast = document.querySelector("#toast");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");

const surfaceViews = {
  human: [
    '<div class="demo-window__top">',
    '<div class="window-dots"><span></span><span></span><span></span></div>',
    '<span class="demo-window__path">docs.acme.dev / quickstart</span>',
    '<span class="demo-window__live"><span></span> synced</span>',
    "</div>",
    '<div class="human-demo">',
    '<aside class="human-demo__nav">',
    '<h4>Guides</h4>',
    '<a class="is-current" href="#demo">Quickstart</a>',
    '<a href="#demo">Authentication</a>',
    '<a href="#demo">Errors</a>',
    '<div class="nav-group"><h4>Reference</h4>',
    '<a href="#demo">Checkout</a>',
    '<a href="#demo">Customers</a>',
    '<a href="#demo">Webhooks</a>',
    "</div>",
    "</aside>",
    '<article class="human-demo__article">',
    '<div class="article-breadcrumb">Guides <span>/ Quickstart</span></div>',
    "<h3>Ship your first checkout in five minutes.</h3>",
    "<p>Use the SDK or a single API request to create a hosted checkout session for your customer.</p>",
    '<div class="demo-code">',
    '<div class="demo-code__top"><span>create-checkout.ts</span><span>Node</span></div>',
    "<pre><span class=\"code-key\">const</span> session = <span class=\"code-key\">await</span> vessel.checkout.<span class=\"code-value\">create</span>({\n  price: <span class=\"code-value\">\"price_basic\"</span>,\n  successUrl: <span class=\"code-value\">\"/success\"</span>\n});</pre>",
    "</div>",
    '<div class="article-footnote"><span>✦</span> Copy, run, and keep moving.</div>',
    "</article>",
    '<aside class="human-demo__context">',
    '<div class="agent-context__panel"><div class="agent-context__label">Agent context</div><p class="agent-context__value">Create a checkout session for a one-time payment.</p><span class="context-chip">high confidence</span></div>',
    '<div class="context-row"><span>Source pages</span><strong>3</strong></div>',
    '<div class="context-row"><span>Examples</span><strong>7</strong></div>',
    '<div class="context-row"><span>Last sync</span><strong>2m ago</strong></div>',
    "</aside>",
    "</div>"
  ].join(""),
  index: [
    '<div class="demo-window__top">',
    '<div class="window-dots"><span></span><span></span><span></span></div>',
    '<span class="demo-window__path">docs.acme.dev / llms.txt</span>',
    '<span class="demo-window__live"><span></span> generated</span>',
    "</div>",
    '<div class="index-demo">',
    '<div>',
    '<h3 class="index-demo__heading">A clean map for smaller context windows.</h3>',
    '<p class="index-demo__subheading">Vessel generates a concise overview and a full context export on every build.</p>',
    '<div class="index-code">',
    '<strong># Acme payments API</strong><br>',
    '<span class="description">&gt; Create checkout experiences with a few API calls.</span><br><br>',
    '<span class="hash">## Start here</span><br>',
    '<span class="link">- [Quickstart](/docs/quickstart.md)</span> <span class="description">: Ship a checkout in five minutes.</span><br>',
    '<span class="link">- [Authentication](/docs/auth.md)</span> <span class="description">: Use bearer tokens securely.</span><br><br>',
    '<span class="hash">## Reference</span><br>',
    '<span class="link">- [Checkout API](/api/checkout.md)</span> <span class="description">: Create and expire sessions.</span><br>',
    '<span class="link">- [Webhooks](/guides/webhooks.md)</span> <span class="description">: Keep order state in sync.</span>',
    "</div>",
    "</div>",
    '<aside class="index-side">',
    '<div class="index-side__label">Build outputs</div>',
    '<div class="index-side__item"><span>⌁</span> llms.txt</div>',
    '<div class="index-side__item"><span>↗</span> llms-full.txt</div>',
    '<div class="index-side__item"><span>✓</span> sitemap.xml</div>',
    '<div class="index-side__foot">8 pages<br>14,822 tokens<br>0 stale links</div>',
    "</aside>",
    "</div>"
  ].join(""),
  mcp: [
    '<div class="demo-window__top">',
    '<div class="window-dots"><span></span><span></span><span></span></div>',
    '<span class="demo-window__path">docs.acme.dev / mcp</span>',
    '<span class="demo-window__live"><span></span> connected</span>',
    "</div>",
    '<div class="mcp-demo">',
    '<div>',
    '<h3 class="mcp-demo__heading">Give agents a safe, typed way in.</h3>',
    '<p class="mcp-demo__subheading">Expose read-only resources first. Add actions when your permission model is ready.</p>',
    '<div class="mcp-demo__tools">',
    '<div class="mcp-tool"><span class="mcp-tool__icon">⌕</span><span><strong>search_docs</strong><small>Find relevant pages and examples</small></span><span class="mcp-tool__arrow">→</span></div>',
    '<div class="mcp-tool"><span class="mcp-tool__icon">▤</span><span><strong>get_page</strong><small>Read a page with full metadata</small></span><span class="mcp-tool__arrow">→</span></div>',
    '<div class="mcp-tool"><span class="mcp-tool__icon">⌁</span><span><strong>list_examples</strong><small>Return runnable code by language</small></span><span class="mcp-tool__arrow">→</span></div>',
    "</div>",
    "</div>",
    '<aside class="mcp-demo__aside">',
    '<div class="index-side__label">Connection</div>',
    "<p>Works with any MCP client that can discover tools and resources.</p>",
    '<div class="mcp-connection"><span></span> server ready</div>',
    "</aside>",
    "</div>"
  ].join("")
};

const suiteViews = {
  editor: [
    '<div class="demo-window__top">',
    '<div class="window-dots"><span></span><span></span><span></span></div>',
    '<span class="demo-window__path">vessel / editor / quickstart.mdx</span>',
    '<span class="demo-window__live"><span></span> preview ready</span>',
    "</div>",
    '<div class="suite-editor">',
    '<aside class="suite-editor__tree">',
    '<div class="suite-preview-label">Pages</div>',
    '<a class="is-current" href="#suite">Quickstart</a>',
    '<a href="#suite">Authentication</a>',
    '<a href="#suite">Errors</a>',
    '<div class="tree-group"><div class="suite-preview-label">Reference</div><a href="#suite">Checkout API</a><a href="#suite">Webhooks</a></div>',
    "</aside>",
    '<div class="suite-editor__main">',
    '<div class="suite-editor__breadcrumb">Guides <span>/ Quickstart</span></div>',
    '<h3>Write once. Preview every surface.</h3>',
    '<p>Use the editor your team already loves, then see the human page and agent context update together.</p>',
    '<div class="suite-editor__code">',
    '<div class="suite-editor__code-top"><span>quickstart.mdx</span><span>MDX</span></div>',
    '<pre><span class="code-key">title</span>: <span class="code-value">Ship your first checkout</span>\n<span class="code-key">description</span>: <span class="code-value">A working path in five minutes.</span>\n\n<span class="code-key">&lt;Steps&gt;</span>\n  Connect your account\n  Create a session\n<span class="code-key">&lt;/Steps&gt;</span></pre>',
    "</div>",
    "</div>",
    '<aside class="suite-editor__checks">',
    '<strong>AI checks</strong>',
    '<div class="suite-check"><span>✓</span>Syntax is valid</div>',
    '<div class="suite-check"><span>✓</span>Links resolve</div>',
    '<div class="suite-check suite-check--pending"><span>↗</span>Preview updated</div>',
    '<span class="suite-editor__status">3 checks passed</span>',
    "</aside>",
    "</div>"
  ].join(""),
  api: [
    '<div class="demo-window__top">',
    '<div class="window-dots"><span></span><span></span><span></span></div>',
    '<span class="demo-window__path">vessel / api reference / checkout</span>',
    '<span class="demo-window__live"><span></span> schema synced</span>',
    "</div>",
    '<div class="suite-api">',
    '<div class="suite-api__head">',
    '<div class="suite-api__eyebrow">API reference / checkout</div>',
    '<h3>Try the endpoint before you write a line.</h3>',
    '<p>Generate a reference from OpenAPI or AsyncAPI, then let readers send a safe, realistic request from the page.</p>',
    "</div>",
    '<div class="suite-api__endpoint"><span class="api-method">POST</span><code>/v1/checkout</code><a class="api-run" href="/api/">Open playground <span aria-hidden="true">↗</span></a></div>',
    '<div class="suite-api__columns">',
    '<div class="suite-api__panel"><div class="suite-api__panel-head"><span>Request</span><span>JSON</span></div><pre>{\n  <span class="code-key">"price"</span>: <span class="code-value">"price_basic"</span>,\n  <span class="code-key">"success_url"</span>: <span class="code-value">"/success"</span>\n}</pre></div>',
    '<div class="suite-api__panel"><div class="suite-api__panel-head"><span>Response</span><span>201</span></div><pre>{\n  <span class="code-key">"id"</span>: <span class="code-value">"cs_01J..."</span>,\n  <span class="code-key">"status"</span>: <span class="code-value">"open"</span>\n}</pre></div>',
    "</div>",
    '<div class="suite-api__meta"><span>Node</span><span>Python</span><span>cURL</span><span>Auth inherited</span><span>Copy code</span></div>',
    "</div>"
  ].join(""),
  assistant: [
    '<div class="demo-window__top">',
    '<div class="window-dots"><span></span><span></span><span></span></div>',
    '<span class="demo-window__path">vessel / assistant / grounded answer</span>',
    '<span class="demo-window__live"><span></span> citations on</span>',
    "</div>",
    '<div class="suite-assistant">',
    '<div class="suite-assistant__hero">',
    '<div class="suite-assistant__eyebrow">Assistant + agent mode</div>',
    '<h3>Answers that show their work.</h3>',
    '<p>Readers get a clear explanation with navigable sources. Builders get a plan, validation, and a reviewable pull request.</p>',
    '<div class="suite-assistant__prompt"><span>⌕</span><span>How do I handle a failed payment?</span></div>',
    "</div>",
    '<div class="suite-assistant__answer">',
    '<div class="suite-assistant__answer-label">Grounded answer · 0.96</div>',
    '<p><strong>Listen for the payment.failed event</strong>, then retrieve the session and show a retry path. Keep the original idempotency key when you retry.</p>',
    '<div class="assistant-sources"><span class="assistant-source">Payments guide ↗</span><span class="assistant-source">Webhooks ↗</span><span class="assistant-source">Errors ↗</span></div>',
    "</div>",
    "</div>"
  ].join(""),
  insights: [
    '<div class="demo-window__top">',
    '<div class="window-dots"><span></span><span></span><span></span></div>',
    '<span class="demo-window__path">vessel / insights / comprehension</span>',
    '<span class="demo-window__live"><span></span> live sample</span>',
    "</div>",
    '<div class="suite-insights">',
    '<div class="suite-insights__head"><div><div class="suite-insights__eyebrow">Search + agent analytics</div><h3>Find the gaps before users do.</h3></div><span class="insights-range">Last 30 days⌄</span></div>',
    '<div class="insights-stats"><div class="insight-stat"><strong>94%</strong><small>answer confidence</small></div><div class="insight-stat"><strong>12.4k</strong><small>page views</small></div><div class="insight-stat"><strong>38</strong><small>search gaps</small></div></div>',
    '<div class="insights-chart"><i style="height:42%"></i><i style="height:57%"></i><i style="height:49%"></i><i style="height:72%"></i><i style="height:64%"></i><i style="height:84%"></i><i style="height:77%"></i><i style="height:93%"></i><i style="height:88%"></i><i style="height:100%"></i></div>',
    '<div class="insights-gaps"><strong>Top low-confidence search</strong><span>“rotate a production key” · 18 searches · no result</span></div>',
    "</div>"
  ].join(""),
  release: [
    '<div class="demo-window__top">',
    '<div class="window-dots"><span></span><span></span><span></span></div>',
    '<span class="demo-window__path">vessel / releases / v2.4</span>',
    '<span class="demo-window__live"><span></span> protected preview</span>',
    "</div>",
    '<div class="suite-release">',
    '<div class="suite-release__head">',
    '<div class="suite-release__eyebrow">Release + control</div>',
    '<h3>Ship changes with a paper trail.</h3>',
    '<p>Versions, preview deployments, access rules, webhooks, and changelogs belong in the same release loop.</p>',
    '<div class="release-timeline"><div class="release-item"><strong>v2.4 preview</strong><span>PR #184 · protected · 2 minutes ago</span></div><div class="release-item"><strong>Authentication guide</strong><span>Updated with OAuth examples</span></div><div class="release-item"><strong>Changelog published</strong><span>RSS and announcement feeds notified</span></div></div>',
    "</div>",
    '<aside class="suite-release__side"><strong>Controls</strong><div class="release-control"><span></span> Preview auth</div><div class="release-control"><span></span> Search indexing</div><div class="release-control release-control--off"><span></span> Public MCP writes</div><span class="release-chip">read-only by default</span></aside>',
    "</div>"
  ].join("")
};

function renderSurface(surface) {
  if (!surfaceDemo || !surfaceViews[surface]) return;
  surfaceDemo.innerHTML = surfaceViews[surface];
  surfaceTabs.forEach((tab) => {
    const isActive = tab.dataset.surface === surface;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
}

surfaceTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    renderSurface(tab.dataset.surface);
  });
});

renderSurface("human");

function renderSuite(suite) {
  if (!suitePreview || !suiteViews[suite]) return;
  suitePreview.innerHTML = suiteViews[suite];
  suiteTabs.forEach((tab) => {
    const isActive = tab.dataset.suite === suite;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
}

suiteTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    renderSuite(tab.dataset.suite);
  });
});

renderSuite("editor");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

let toastTimer;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
}

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) return;

    try {
      await copyText(target.textContent.trim());
      showToast("Command copied to your clipboard");
    } catch {
      showToast("Select the command and copy it manually");
    }
  });
});

document.querySelectorAll("[data-deploy]").forEach((button) => {
  button.addEventListener("click", () => {
    const provider = button.dataset.deploy === "cloudflare" ? "Cloudflare Workers" : "Netlify";
    showToast("Opening the " + provider + " one-click deploy flow");
  });
});

const queryForm = document.querySelector("#query-form");
const queryInput = document.querySelector("#agent-query");
const terminalAnswer = document.querySelector("#terminal-answer");

if (queryForm && queryInput && terminalAnswer) {
  queryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = queryInput.value.toLowerCase();
    let response = {
      label: "Vessel found the shortest path",
      answer: "Open the quickstart and follow the smallest working example for your stack.",
      source: "Sources: Quickstart · Concepts · API reference"
    };

    if (query.includes("auth") || query.includes("token") || query.includes("login")) {
      response = {
        label: "Vessel found the security path",
        answer: "Use a bearer token in the Authorization header and keep it server-side.",
        source: "Sources: Authentication · Security guide · Error reference"
      };
    } else if (query.includes("webhook") || query.includes("event")) {
      response = {
        label: "Vessel found the integration path",
        answer: "Create a signed webhook endpoint, then replay the event from the local CLI.",
        source: "Sources: Webhooks · Local development · CLI reference"
      };
    } else if (query.includes("checkout") || query.includes("payment") || query.includes("session")) {
      response = {
        label: "Vessel found the shortest path",
        answer: "Use POST /v1/checkout with a price and success URL.",
        source: "Sources: Quickstart · API reference · Node SDK"
      };
    }

    terminalAnswer.innerHTML = [
      '<div class="terminal-answer__label">',
      response.label,
      "</div><strong>",
      response.answer.replace("POST /v1/checkout", "<span>POST /v1/checkout</span>"),
      "</strong><small>",
      response.source,
      "</small>"
    ].join("");
    showToast("Context refreshed for this question");
  });
}

const assistantSettingsForm = document.querySelector("#assistant-settings-form");
const assistantDemoForm = document.querySelector("#assistant-demo-form");
const assistantProviderTabs = Array.from(document.querySelectorAll("[data-provider]"));
const assistantKeyInput = document.querySelector("#assistant-key");
const assistantKeyStatus = document.querySelector("#assistant-key-status");
const assistantModel = document.querySelector("#assistant-model");
const assistantMaxTokens = document.querySelector("#assistant-max-tokens");
const assistantBaseUrl = document.querySelector("#assistant-base-url");
const assistantPrompt = document.querySelector("#assistant-prompt");
const assistantDemoAnswer = document.querySelector("#assistant-demo-answer");

const assistantProviderConfig = {
  openrouter: {
    placeholder: "sk-or-v1-••••••••",
    endpoint: "https://openrouter.ai/api/v1",
    models: ["openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet", "google/gemini-2.5-flash"]
  },
  openai: {
    placeholder: "sk-••••••••",
    endpoint: "https://api.openai.com/v1",
    models: ["gpt-4o-mini", "gpt-4.1-mini", "o4-mini"]
  },
  anthropic: {
    placeholder: "sk-ant-••••••••",
    endpoint: "https://api.anthropic.com/v1",
    models: ["claude-3-5-haiku-latest", "claude-3-5-sonnet-latest", "claude-3-opus-latest"]
  },
  custom: {
    placeholder: "provider-key-••••••••",
    endpoint: "https://your-endpoint.example/v1",
    models: ["your-model"]
  }
};

let assistantProvider = "openrouter";
let assistantSessionKey = "";

function setAssistantStatus(ready) {
  if (!assistantKeyStatus) return;
  assistantKeyStatus.classList.toggle("is-ready", ready);
  assistantKeyStatus.innerHTML = ready ? "<i></i> ready in session" : "<i></i> not connected";
}

function updateAssistantProvider(provider) {
  const config = assistantProviderConfig[provider];
  if (!config) return;
  assistantProvider = provider;
  assistantProviderTabs.forEach((tab) => {
    const active = tab.dataset.provider === provider;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  if (assistantKeyInput) assistantKeyInput.placeholder = config.placeholder;
  if (assistantBaseUrl) {
    assistantBaseUrl.value = config.endpoint;
    assistantBaseUrl.readOnly = provider !== "custom";
  }
  if (assistantModel) {
    assistantModel.innerHTML = config.models.map((model) => `<option value="${model}">${model}</option>`).join("");
  }
  setAssistantStatus(Boolean(assistantSessionKey));
}

function renderAssistantAnswer(answer, provider, live = false) {
  if (!assistantDemoAnswer) return;
  assistantDemoAnswer.innerHTML = "";
  const heading = document.createElement("div");
  heading.className = "assistant-answer-panel__heading";
  const mark = document.createElement("span");
  mark.textContent = "✦";
  const title = document.createElement("strong");
  title.textContent = live ? "Live provider answer" : "Vessel Assistant";
  const score = document.createElement("span");
  score.className = "assistant-answer-panel__score";
  score.textContent = live ? provider + " · BYOK" : "preview · grounded";
  heading.append(mark, title, score);
  const paragraph = document.createElement("p");
  paragraph.textContent = answer;
  const steps = document.createElement("div");
  steps.className = "assistant-answer-panel__steps";
  steps.innerHTML = "<span>01</span> Ground <i></i><span>02</span> Answer <i></i><span>03</span> Link";
  assistantDemoAnswer.append(heading, paragraph, steps);
}

function localAssistantAnswer(question) {
  const query = question.toLowerCase();
  if (query.includes("payment") || query.includes("failed")) {
    return "Listen for payment.failed, retrieve the session, and show a retry path while preserving the original idempotency key.";
  }
  if (query.includes("auth") || query.includes("key") || query.includes("token")) {
    return "Create a replacement credential, deploy the overlap window, move traffic, then revoke the old credential after active clients have rotated.";
  }
  if (query.includes("webhook") || query.includes("event")) {
    return "Verify the signature before parsing the event, persist the event id for idempotency, and return a fast 2xx response.";
  }
  return "Start with the smallest linked example, then follow the API reference for the exact request and response contract.";
}

assistantProviderTabs.forEach((tab) => {
  tab.addEventListener("click", () => updateAssistantProvider(tab.dataset.provider));
});

document.querySelectorAll("[data-toggle-secret]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!assistantKeyInput) return;
    const showing = assistantKeyInput.type === "text";
    assistantKeyInput.type = showing ? "password" : "text";
    button.textContent = showing ? "Show" : "Hide";
  });
});

if (assistantSettingsForm && assistantKeyInput) {
  assistantSettingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    assistantSessionKey = assistantKeyInput.value.trim();
    setAssistantStatus(Boolean(assistantSessionKey));
    if (assistantSessionKey) {
      showToast("Provider ready for this tab only");
    } else {
      showToast("Add a provider key to enable live answers");
    }
  });
}

if (assistantDemoForm && assistantPrompt) {
  assistantDemoForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = assistantPrompt.value.trim();
    if (!message) return;

    if (!assistantSessionKey) {
      renderAssistantAnswer(localAssistantAnswer(message), assistantProvider);
      showToast("Preview answer — add a key to call your provider");
      return;
    }

    const submitButton = assistantDemoForm.querySelector("button[type=submit]");
    if (submitButton) submitButton.disabled = true;
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message,
          provider: assistantProvider,
          apiKey: assistantSessionKey,
          model: assistantModel?.value,
          baseUrl: assistantProvider === "custom" ? assistantBaseUrl?.value : undefined,
          maxTokens: assistantMaxTokens?.value,
          context: "Vessel documentation: answers must be grounded in linked guides, API references, examples, and security runbooks."
        })
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.message || "The provider request failed.");
      renderAssistantAnswer(payload.answer, payload.provider || assistantProvider, true);
      showToast("Live answer returned from " + (payload.provider || assistantProvider));
    } catch (error) {
      renderAssistantAnswer(localAssistantAnswer(message), assistantProvider);
      showToast(error instanceof Error ? error.message : "Provider request failed; showing the local preview");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

updateAssistantProvider("openrouter");

const maintenanceFeed = document.querySelector("#maintenance-feed");
const maintenanceTabs = Array.from(document.querySelectorAll("[data-maintenance]"));
const maintenanceViews = {
  code: [
    '<div class="maintenance-feed__label">Latest code signals</div>',
    '<div class="maintenance-event"><span class="maintenance-event__icon">↗</span><span><strong>OpenAPI contract changed</strong><small>3 checkout pages need a response example refresh</small></span><span class="maintenance-event__time">6m ago</span></div>',
    '<div class="maintenance-event"><span class="maintenance-event__icon">✓</span><span><strong>Docs PR opened</strong><small>Generated diff is ready for a human reviewer</small></span><span class="maintenance-event__time">9m ago</span></div>',
    '<div class="maintenance-event"><span class="maintenance-event__icon">⌁</span><span><strong>GraphQL style rule passed</strong><small>18 operations match the team contract</small></span><span class="maintenance-event__time">14m ago</span></div>'
  ].join(""),
  support: [
    '<div class="maintenance-feed__label">Questions becoming content</div>',
    '<div class="maintenance-event"><span class="maintenance-event__icon">?</span><span><strong>“Rotate a production key”</strong><small>18 similar questions · no confident result</small></span><span class="maintenance-event__time">today</span></div>',
    '<div class="maintenance-event"><span class="maintenance-event__icon">✦</span><span><strong>Draft article suggested</strong><small>Security guide + runbook outline generated</small></span><span class="maintenance-event__time">today</span></div>',
    '<div class="maintenance-event"><span class="maintenance-event__icon">↗</span><span><strong>Support link attached</strong><small>Zendesk ticket cluster now points to the draft</small></span><span class="maintenance-event__time">2h ago</span></div>'
  ].join(""),
  audit: [
    '<div class="maintenance-feed__label">Scheduled semantic review</div>',
    '<div class="maintenance-event"><span class="maintenance-event__icon">⌁</span><span><strong>42 pages reviewed</strong><small>Pricing, screenshots, links, and terminology checked</small></span><span class="maintenance-event__time">weekly</span></div>',
    '<div class="maintenance-event"><span class="maintenance-event__icon">!</span><span><strong>2 claims need evidence</strong><small>Both are held back from publish until reviewed</small></span><span class="maintenance-event__time">weekly</span></div>',
    '<div class="maintenance-event"><span class="maintenance-event__icon">✓</span><span><strong>Audit report exported</strong><small>Markdown report committed beside the docs build</small></span><span class="maintenance-event__time">weekly</span></div>'
  ].join("")
};

function renderMaintenance(view) {
  if (!maintenanceFeed || !maintenanceViews[view]) return;
  maintenanceFeed.innerHTML = maintenanceViews[view];
  maintenanceTabs.forEach((tab) => {
    const active = tab.dataset.maintenance === view;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

maintenanceTabs.forEach((tab) => {
  tab.addEventListener("click", () => renderMaintenance(tab.dataset.maintenance));
});

renderMaintenance("code");
