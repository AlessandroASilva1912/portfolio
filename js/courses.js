(() => {
  const groups = [
    ["qa", "Quality Assurance & Testes de Software", "vial"],
    ["development", "Desenvolvimento & Programação", "code"],
    ["data", "Banco de Dados & Análise de Dados", "database"],
    ["infrastructure", "Infraestrutura & Gestão de TI", "server"],
  ];
  const metricLabels = [
    ["completed", "Cursos concluídos", "book-open"],
    ["completedHours", "Horas de formação concluída", "clock"],
    ["ongoing", "Cursos em andamento", "book-reader"],
    ["ongoingHours", "Horas em andamento", "hourglass-half"],
    ["platforms", "Plataformas de ensino", "layer-group"],
  ];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function icon(name) {
    const node = element("i", "fas fa-" + name);
    node.setAttribute("aria-hidden", "true");
    return node;
  }

  function setMetrics(courses) {
    const completed = courses.filter((course) => course.status === "completed");
    const ongoing = courses.filter((course) => course.status === "in-progress");
    const hours = (list) =>
      list.reduce(
        (sum, course) =>
          sum +
          (Number.isFinite(course.hours) && course.hours >= 0
            ? course.hours
            : 0),
        0,
      );
    const values = {
      completed: completed.length,
      completedHours: hours(completed) + "h",
      ongoing: ongoing.length,
      ongoingHours: hours(ongoing) + "h",
      platforms: new Set(
        courses.map((course) => course.platform).filter(Boolean),
      ).size,
    };
    const stats = document.querySelector("#course-stats");
    if (stats) {
      for (const [key, label, glyph] of metricLabels) {
        const stat = element("div", "cert-stat");
        stat.append(
          icon(glyph),
          element("strong", "", values[key]),
          element("span", "", label),
        );
        stats.append(stat);
      }
    }
    for (const output of document.querySelectorAll("[data-course-stat]")) {
      output.textContent = values[output.dataset.courseStat];
    }
  }

  function externalURL(value) {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }

  function externalLink(url, label) {
    const link = element("a", "cert-link", label);
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }

  function formatDates() {
    const locale = document.documentElement.lang || "pt-BR";
    for (const time of document.querySelectorAll("time[data-course-date]")) {
      const value = time.dateTime;
      const hasDay = value.length === 10;
      const date = new Date(value + (hasDay ? "T12:00:00Z" : "-01T12:00:00Z"));
      time.textContent = new Intl.DateTimeFormat(locale, {
        month: "short",
        year: "numeric",
        day: hasDay ? "numeric" : undefined,
        timeZone: "UTC",
      }).format(date);
    }
  }

  function dateField(meta, value, label) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}(-\d{2})?$/.test(value))
      return;
    const isoDate = value.length === 7 ? value + "-01" : value;
    const parsed = new Date(isoDate + "T12:00:00Z");
    if (
      !Number.isFinite(parsed.valueOf()) ||
      parsed.toISOString().slice(0, 10) !== isoDate
    )
      return;
    const date = element("time");
    date.dateTime = value;
    date.dataset.courseDate = "";
    const field = element("span");
    field.append(icon("calendar-alt"));
    if (label) field.append(element("span", "", label));
    field.append(date);
    meta.append(field);
  }

  function openCertificate(url, isPDF, course, trigger) {
    const dialog = document.getElementById("certificate-dialog");
    const preview = dialog.querySelector(".certificate-preview");
    const media = element(isPDF ? "object" : "img");
    if (isPDF) {
      media.type = "application/pdf";
      media.data = url;
      media.setAttribute("aria-label", "Certificado do curso");
      media.append(externalLink(url, "Abrir em nova aba"));
    } else {
      media.src = url;
      media.alt = "Certificado do curso";
    }
    preview.replaceChildren(media);
    dialog
      .querySelector("#certificate-name")
      .replaceChildren(document.createTextNode(course.name));
    dialog
      .querySelector("#certificate-platform")
      .replaceChildren(document.createTextNode(course.platform || ""));
    dialog.querySelector("[data-certificate-open]").href = url;
    dialog.querySelector("[data-certificate-download]").href = url;
    window.portfolioI18n?.apply(dialog);
    dialog.addEventListener(
      "close",
      () => {
        preview.replaceChildren();
        trigger.focus({ preventScroll: true });
      },
      { once: true },
    );
    dialog.showModal();
  }

  async function addCertificate(card, course) {
    if (!course.certificate || course.status !== "completed") return;
    let control;
    const external = externalURL(course.certificate.url);
    if (external) {
      control = externalLink(external, "Visualizar certificado");
    } else {
      const file = course.certificate.file;
      if (
        typeof file !== "string" ||
        !file.startsWith("doc/certificados/") ||
        !/\.(pdf|png|jpe?g)$/i.test(file)
      )
        return;
      const url = new URL(file, document.baseURI);
      const directory = new URL("doc/certificados/", document.baseURI);
      if (!url.href.startsWith(directory.href)) return;
      const pdf = /\.pdf$/i.test(url.pathname);
      try {
        if (url.protocol === "file:" && !pdf) {
          const image = new Image();
          image.src = url.href;
          await image.decode();
        } else {
          const response = await fetch(url, { method: "HEAD" });
          const mime = (response.headers.get("content-type") || "")
            .split(";")[0]
            .trim()
            .toLowerCase();
          const expectedMime = pdf
            ? "application/pdf"
            : /\.png$/i.test(url.pathname)
              ? "image/png"
              : "image/jpeg";
          if (!response.ok || mime !== expectedMime) return;
        }
      } catch {
        return;
      }
      control = element("button", "cert-link", "Visualizar certificado");
      control.type = "button";
      control.setAttribute("aria-haspopup", "dialog");
      control.addEventListener("click", () =>
        openCertificate(url.href, pdf, course, control),
      );
    }
    control.prepend(icon("file-alt"));
    card.append(control);
    window.portfolioI18n?.apply(control);
  }

  function courseCard(course) {
    const ongoing = course.status === "in-progress";
    const card = element(
      "article",
      "cert-card" + (course.featured ? " cert-featured" : ""),
    );
    const header = element("div", "cert-card-header");
    if (course.platform)
      header.append(element("span", "cert-platform", course.platform));
    if (course.featured)
      header.append(element("span", "cert-highlight", "Foco profissional"));
    card.append(header, element("h4", "cert-name", course.name));
    const status = element(
      "span",
      "course-status",
      ongoing ? "Em andamento" : "Concluído",
    );
    status.dataset.status = course.status;
    card.append(status);
    const meta = element("div", "cert-meta");
    if (Number.isFinite(course.hours) && course.hours >= 0) {
      const hours = element("span");
      hours.append(icon("clock"), course.hours + "h");
      meta.append(hours);
    }
    dateField(meta, course.start, "Data de início");
    dateField(
      meta,
      ongoing ? course.expectedEnd : course.completedAt,
      ongoing ? "Previsão de conclusão" : "",
    );
    if (meta.childElementCount) card.append(meta);
    if (
      ongoing &&
      Number.isFinite(course.progress) &&
      course.progress >= 0 &&
      course.progress <= 100
    ) {
      const progress = element("progress");
      progress.max = 100;
      progress.value = course.progress;
      const label = element("label", "course-progress");
      label.append(
        element("span", "", "Progresso"),
        " " + course.progress + "% ",
        progress,
      );
      card.append(label);
    }
    if (course.skills?.length) {
      const tags = element("div", "cert-tags");
      tags.append(...course.skills.map((skill) => element("span", "", skill)));
      card.append(tags);
    }
    const url = externalURL(course.url);
    if (url) card.append(externalLink(url, "Plataforma do curso"));
    addCertificate(card, course);
    return card;
  }

  function category(title, glyph, courses) {
    const section = element("div", "cert-category");
    const heading = element("h3", "cert-category-title");
    heading.append(icon(glyph), document.createTextNode(title));
    section.append(heading);
    if (courses.length) {
      const grid = element("div", "cert-grid");
      grid.append(...courses.map(courseCard));
      section.append(grid);
    } else {
      section.append(element("p", "", "Nenhum curso em andamento cadastrado."));
    }
    return section;
  }

  function init() {
    const courses = window.portfolioCourses;
    setMetrics(courses);
    const catalog = document.getElementById("course-catalog");
    if (catalog) {
      const completed = courses.filter(
        (course) => course.status === "completed",
      );
      for (const [key, title, glyph] of groups) {
        const matches = completed.filter((course) => course.category === key);
        if (matches.length) catalog.append(category(title, glyph, matches));
      }
      const other = completed.filter(
        (course) => !groups.some(([key]) => key === course.category),
      );
      if (other.length)
        catalog.append(category("Outros cursos", "book", other));
      catalog.append(
        category(
          "Atualmente estudando",
          "book-reader",
          courses.filter((course) => course.status === "in-progress"),
        ),
      );
      const dialog = document.getElementById("certificate-dialog");
      dialog
        .querySelector(".certificate-close")
        .addEventListener("click", () => dialog.close());
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
      document.addEventListener("portfolio:language", formatDates);
    }
    window.portfolioI18n?.apply(document.body);
    formatDates();
  }
  document.addEventListener("DOMContentLoaded", init, { once: true });
})();
