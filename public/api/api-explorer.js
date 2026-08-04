const root = document.querySelector("[data-api-explorer]");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pretty(value) {
  return value === undefined ? "" : JSON.stringify(value, null, 2);
}

function exampleValue(parameter) {
  if (parameter.example !== undefined && parameter.example !== null) return parameter.example;
  if (parameter.schema?.enum?.length) return parameter.schema.enum[0];
  return parameter.in === "path" ? parameter.name : "";
}

function operationUrl(operation, values, baseUrl) {
  let path = operation.path;
  for (const parameter of operation.parameters) {
    if (parameter.in === "path") path = path.replace(`{${parameter.name}}`, encodeURIComponent(values[parameter.name] || exampleValue(parameter)));
  }
  const query = new URLSearchParams();
  for (const parameter of operation.parameters) {
    if (parameter.in === "query" && values[parameter.name]) query.set(parameter.name, values[parameter.name]);
  }
  return `${String(baseUrl || "").replace(/\/$/, "")}${path}${query.toString() ? `?${query}` : ""}`;
}

function buildCurl(operation, request) {
  const lines = [`curl ${JSON.stringify(request.url)}`];
  for (const [name, value] of Object.entries(request.headers)) lines.push(`  -H ${JSON.stringify(`${name}: ${value}`)}`);
  if (request.body) lines.push(`  --data ${JSON.stringify(request.body)}`);
  return lines.join(" \\\n");
}

function buildFetch(operation, request) {
  const options = [`  method: ${JSON.stringify(operation.method)}`, `  headers: ${JSON.stringify(request.headers, null, 2).replace(/\n/g, "\n  ")}`];
  if (request.body) options.push(`  body: ${JSON.stringify(request.body)}`);
  return `const response = await fetch(${JSON.stringify(request.url)}, {\n${options.join(",\n")}\n});\nconst data = await response.json();`;
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function render(rootElement, data) {
  if (!Array.isArray(data.operations) || data.operations.length === 0) {
    rootElement.innerHTML = '<p class="api-error">No operations were found in the OpenAPI contract.</p>';
    return;
  }
  const first = data.operations[0];
  rootElement.innerHTML = `<div class="api-playground__header"><div><span class="docs-kicker">Request preview</span><h2>Explore the contract safely.</h2><p>Build a curl or fetch request from the OpenAPI source. Nothing is sent from this page; mock responses keep credentials and arbitrary endpoints out of the browser.</p></div><span class="api-safe-pill">Read-only preview</span></div>
    <div class="api-playground__grid">
      <div class="api-playground__form">
        <label>Operation<select data-api-operation>${data.operations.map((operation) => `<option value="${escapeHtml(operation.id)}">${escapeHtml(operation.method)} ${escapeHtml(operation.path)} · ${escapeHtml(operation.summary)}</option>`).join("")}</select></label>
        <label>Base URL<input data-api-base value="${escapeHtml(first.servers?.[0]?.url || "https://api.example.com")}" /></label>
        <label>Bearer token <span class="api-optional">optional · never stored</span><input data-api-token type="password" placeholder="sk_..." autocomplete="off" /></label>
        <div data-api-parameters></div>
        <label data-api-body-label>JSON body<textarea data-api-body spellcheck="false"></textarea></label>
        <div class="api-playground__actions"><button class="api-button api-button--primary" type="button" data-api-build>Build request</button><button class="api-button" type="button" data-api-mock>Preview mock response</button></div>
      </div>
      <div class="api-playground__output"><div class="api-output-card"><div class="api-output-card__heading"><span>curl</span><button type="button" data-api-copy="curl" aria-label="Copy curl command">Copy</button></div><pre><code data-api-curl aria-live="polite">Build a request to see the generated command.</code></pre></div><div class="api-output-card"><div class="api-output-card__heading"><span>fetch</span><button type="button" data-api-copy="fetch" aria-label="Copy fetch snippet">Copy</button></div><pre><code data-api-fetch aria-live="polite">Build a request to see the generated snippet.</code></pre></div><div class="api-output-card api-output-card--response"><div class="api-output-card__heading"><span>mock response</span><span class="api-optional">no network request</span></div><pre><code data-api-response aria-live="polite">Select “Preview mock response” to inspect the contract example.</code></pre></div></div>
    </div>`;

  const operationSelect = rootElement.querySelector("[data-api-operation]");
  const baseInput = rootElement.querySelector("[data-api-base]");
  const tokenInput = rootElement.querySelector("[data-api-token]");
  const parameters = rootElement.querySelector("[data-api-parameters]");
  const bodyLabel = rootElement.querySelector("[data-api-body-label]");
  const bodyInput = rootElement.querySelector("[data-api-body]");
  const curlOutput = rootElement.querySelector("[data-api-curl]");
  const fetchOutput = rootElement.querySelector("[data-api-fetch]");
  const responseOutput = rootElement.querySelector("[data-api-response]");
  let currentRequest = null;

  function currentOperation() {
    return data.operations.find((operation) => operation.id === operationSelect.value) || data.operations[0];
  }

  function selectFromHash() {
    let id = "";
    try {
      id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    } catch {
      return;
    }
    if (id && data.operations.some((operation) => operation.id === id)) operationSelect.value = id;
  }

  function updateOperation() {
    const operation = currentOperation();
    baseInput.value = operation.servers?.[0]?.url || baseInput.value;
    parameters.innerHTML = operation.parameters.map((parameter) => `<label>${escapeHtml(parameter.name)} <span class="api-optional">${escapeHtml(parameter.in)}${parameter.required ? " · required" : ""}</span><input data-api-param="${escapeHtml(parameter.name)}" value="${escapeHtml(exampleValue(parameter))}" /></label>`).join("");
    bodyLabel.hidden = operation.requestBody == null;
    bodyInput.value = operation.requestBody?.example === undefined ? "" : pretty(operation.requestBody.example);
    curlOutput.textContent = "Build a request to see the generated command.";
    fetchOutput.textContent = "Build a request to see the generated snippet.";
    responseOutput.textContent = "Select “Preview mock response” to inspect the contract example.";
    currentRequest = null;
  }

  function readRequest() {
    const operation = currentOperation();
    const values = Object.fromEntries([...parameters.querySelectorAll("[data-api-param]")].map((input) => [input.dataset.apiParam, input.value]));
    const headers = {};
    if (operation.requestBody) headers["Content-Type"] = operation.requestBody.contentType || "application/json";
    if (tokenInput.value.trim()) headers.Authorization = `Bearer ${tokenInput.value.trim()}`;
    for (const parameter of operation.parameters) if (parameter.in === "header" && values[parameter.name]) headers[parameter.name] = values[parameter.name];
    let body = bodyInput.value.trim();
    if (body) {
      try {
        body = JSON.stringify(JSON.parse(body));
      } catch {
        body = bodyInput.value.trim();
      }
    }
    return { operation, url: operationUrl(operation, values, baseInput.value), headers, body };
  }

  operationSelect.addEventListener("change", updateOperation);
  window.addEventListener("hashchange", () => {
    selectFromHash();
    updateOperation();
  });
  rootElement.querySelector("[data-api-build]").addEventListener("click", () => {
    currentRequest = readRequest();
    curlOutput.textContent = buildCurl(currentRequest.operation, currentRequest);
    fetchOutput.textContent = buildFetch(currentRequest.operation, currentRequest);
  });
  rootElement.querySelector("[data-api-mock]").addEventListener("click", () => {
    const operation = currentOperation();
    const response = operation.responses.find((item) => /^2/.test(item.status)) || operation.responses[0];
    responseOutput.textContent = response?.example === undefined ? `${response?.status || "200"} — ${response?.description || "No example response in the contract."}` : pretty(response.example);
  });
  rootElement.querySelectorAll("[data-api-copy]").forEach((button) => button.addEventListener("click", async () => {
    const value = button.dataset.apiCopy === "curl" ? curlOutput.textContent : fetchOutput.textContent;
    try {
      await copyText(value);
      button.textContent = "Copied";
      window.setTimeout(() => { button.textContent = "Copy"; }, 1200);
    } catch {
      button.textContent = "Select text";
      window.setTimeout(() => { button.textContent = "Copy"; }, 1400);
    }
  }));
  selectFromHash();
  updateOperation();
}

if (root) {
  fetch(root.dataset.indexUrl)
    .then((response) => response.json())
    .then((data) => render(root, data))
    .catch(() => { root.innerHTML = "<p class=\"api-error\">The OpenAPI index could not be loaded. The generated operation pages are still available below.</p>"; });
}
