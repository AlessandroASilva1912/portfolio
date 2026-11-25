(() => {
  const storageKey = "portfolio-language";
  const buttons = document.querySelectorAll("[data-lang]");
  const originals = new WeakMap();
  const attributes = ["aria-label", "title", "alt", "placeholder", "content"];
  // Add an en entry once the translated PDF is available.
  const resumes = { "pt-BR": "doc/AlessandroCV.pdf" };
  let language = "pt-BR";
  try {
    if (localStorage.getItem(storageKey) === "en") language = "en";
  } catch {
    /* The choice still applies to this page. */
  }

  function translate(node, field, value, write) {
    const source = originals.get(node)?.get(field) ?? value;
    const key = source.trim().replace(/\s+/g, " ");
    const translations = window.portfolioTranslations || {};
    const en = translations[key];
    if (typeof en !== "string") return;
    if (!originals.has(node)) originals.set(node, new Map());
    originals.get(node).set(field, source);
    const next =
      language === "en" ? source.replace(/\S[\s\S]*\S|\S/, () => en) : source;
    if (next !== value) write(next);
  }

  function apply(root = document) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement?.closest("script, style, [translate=no]") ||
          !node.data.trim()
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      },
    });
    while (walker.nextNode()) {
      const node = walker.currentNode;
      translate(node, "text", node.data, (value) => {
        node.data = value;
      });
    }
    const selector =
      "[aria-label], [title], [alt], [placeholder], meta[content]";
    const elements = [...root.querySelectorAll(selector)];
    if (root.matches?.(selector)) elements.unshift(root);
    for (const element of elements) {
      if (element.closest("[translate=no]")) continue;
      for (const name of attributes) {
        if (element.hasAttribute(name)) {
          translate(element, name, element.getAttribute(name), (value) =>
            element.setAttribute(name, value),
          );
        }
      }
    }
  }

  function activate() {
    document.documentElement.lang = language;
    for (const button of buttons) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.lang === language),
      );
    }
    apply();
    for (const link of document.querySelectorAll("[data-resume]")) {
      const available = resumes[language] ? language : "pt-BR";
      link.href = resumes[available];
      link.hreflang = available;
    }
    document.dispatchEvent(
      new CustomEvent("portfolio:language", { detail: language }),
    );
  }
  for (const button of buttons) {
    button.addEventListener("click", () => {
      language = button.dataset.lang;
      try {
        localStorage.setItem(storageKey, language);
      } catch {
        /* Storage is optional. */
      }
      activate();
    });
  }
  window.portfolioI18n = { apply };
  activate();
})();
