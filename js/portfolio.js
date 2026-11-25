const themeButton = document.querySelector(".theme");

function setTheme(dark) {
  document.documentElement.classList.toggle("dark", dark);
  themeButton.setAttribute("aria-pressed", String(dark));
}

try {
  setTheme(localStorage.getItem("theme") === "dark");
} catch {
  setTheme(false);
}

themeButton.addEventListener("click", () => {
  const dark = !document.documentElement.classList.contains("dark");
  setTheme(dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    // A página continua funcionando quando o navegador bloqueia o armazenamento.
  }
});

const tablist = document.querySelector(".cv > nav");
if (tablist) {
  const tabs = [...tablist.querySelectorAll("a[href^='#']")];
  const panels = tabs.map((tab) => document.getElementById(tab.hash.slice(1)));
  const compact = matchMedia("(max-width: 760px)");
  function revealSelectedTab() {
    if (!compact.matches) return;
    const tab = tablist.querySelector('[aria-selected="true"]');
    if (!tab) return;
    const bounds = tablist.getBoundingClientRect();
    const item = tab.getBoundingClientRect();
    if (item.left < bounds.left) tablist.scrollLeft += item.left - bounds.left;
    else if (item.right > bounds.right)
      tablist.scrollLeft += item.right - bounds.right;
  }
  const setOrientation = () => {
    tablist.setAttribute(
      "aria-orientation",
      compact.matches ? "horizontal" : "vertical",
    );
    revealSelectedTab();
  };
  tablist.setAttribute("role", "tablist");
  setOrientation();
  compact.addEventListener("change", setOrientation);
  document.addEventListener("portfolio:language", revealSelectedTab);

  function selectFromUrl() {
    const selected = tabs.find((tab) => tab.hash === location.hash) || tabs[0];
    tabs.forEach((tab, i) => {
      const active = tab === selected;
      tab.tabIndex = active ? 0 : -1;
      tab.setAttribute("aria-selected", String(active));
      panels[i].hidden = !active;
      panels[i].classList.toggle("active", active);
    });
    revealSelectedTab();
  }
  function select(tab) {
    if (tab.hash !== location.hash) history.pushState(null, "", tab.hash);
    selectFromUrl();
  }
  tabs.forEach((tab, i) => {
    tab.id = "tab-" + panels[i].id;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panels[i].id);
    panels[i].setAttribute("role", "tabpanel");
    panels[i].setAttribute("aria-labelledby", tab.id);
    panels[i].tabIndex = 0;
    tab.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      select(tab);
    });
    tab.addEventListener("keydown", (event) => {
      const next = compact.matches ? "ArrowRight" : "ArrowDown";
      const prev = compact.matches ? "ArrowLeft" : "ArrowUp";
      const moves = {
        [next]: (i + 1) % tabs.length,
        [prev]: (i + tabs.length - 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };
      if (!Object.hasOwn(moves, event.key)) return;
      event.preventDefault();
      const target = tabs[moves[event.key]];
      select(target);
      target.focus();
    });
  });
  window.addEventListener("popstate", selectFromUrl);
  window.addEventListener("hashchange", selectFromUrl);
  selectFromUrl();
}

for (const gallery of document.querySelectorAll(".gallery")) {
  const slides = [...gallery.querySelectorAll("figure")];
  if (slides.length < 2) continue;
  let current = 0;
  function showSlide(step) {
    current = (current + step + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.hidden = index !== current;
    });
    gallery.querySelector("output").textContent =
      String(current + 1) + " / " + slides.length;
  }
  for (const button of gallery.querySelectorAll("[data-step]")) {
    button.addEventListener("click", () =>
      showSlide(Number(button.dataset.step)),
    );
  }
  gallery.classList.add("ready");
  showSlide(0);
}

if (
  "IntersectionObserver" in window &&
  matchMedia("(prefers-reduced-motion: no-preference)").matches
) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("entered");
        observer.unobserve(entry.target);
      }
    }
  });
  document
    .querySelectorAll(".preview, .case, .contact, .experience-card")
    .forEach((element) => observer.observe(element));
}
