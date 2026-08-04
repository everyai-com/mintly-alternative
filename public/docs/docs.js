(() => {
  const input = document.querySelector("#docs-search");
  const cards = [...document.querySelectorAll("[data-doc-card]")];
  const empty = document.querySelector("[data-doc-empty]");
  const count = document.querySelector("[data-doc-count]");

  function filterDocs() {
    if (!input) return;
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    for (const card of cards) {
      const matches = !query || card.dataset.docSearch.toLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) visible += 1;
    }
    for (const group of document.querySelectorAll(".docs-index-section")) {
      group.hidden = !group.querySelector("[data-doc-card]:not([hidden])");
    }
    if (empty) empty.hidden = visible > 0;
    if (count) count.textContent = `${visible} ${visible === 1 ? "page" : "pages"}`;
  }

  input?.addEventListener("input", filterDocs);
  document.addEventListener("keydown", (event) => {
    if ((event.key === "/" && document.activeElement !== input) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) {
      event.preventDefault();
      input?.focus();
    }
    if (event.key === "Escape" && document.activeElement === input) {
      input.value = "";
      filterDocs();
      input.blur();
    }
  });

  document.querySelectorAll("[data-copy-path]").forEach((button) => button.addEventListener("click", async () => {
    await navigator.clipboard?.writeText(button.dataset.copyPath);
    const label = button.textContent;
    button.textContent = "Copied";
    window.setTimeout(() => { button.textContent = label; }, 1200);
  }));
})();
