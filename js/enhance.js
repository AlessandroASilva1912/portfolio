/* enhance.js — motion e microinterações compartilhadas entre as páginas.
   Não mexe em menu/tema (cada página já cuida disso) — só adiciona. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Barra de progresso de leitura ---- */
  var bar = document.createElement('div');
  bar.id = 'scrollProgress';
  document.body.appendChild(bar);
  function updateProgress() {
    var h = document.documentElement;
    var scrolled = h.scrollTop || document.body.scrollTop;
    var height = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    bar.style.width = (height > 0 ? (scrolled / height) * 100 : 0) + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---- Scroll reveal: marca automaticamente elementos comuns ---- */
  var autoTargets = document.querySelectorAll(
    '.service-card, .project-card, .job-item, .skill-card, .cert-card, ' +
    '.education-item, .section-title, .page-title, .subtitle, .hero-content, .hero-image'
  );
  autoTargets.forEach(function (el) {
    /* Elementos dentro de abas (currículo) trocam de display via JS e podem
       nunca cruzar o IntersectionObserver enquanto escondidos — não aplica
       reveal neles, só ao que já nasce visível no fluxo da página. */
    if (el.closest('.content-section')) return;
    el.classList.add('reveal');
  });

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = (Array.prototype.indexOf.call(revealEls, el) % 4) * 80;
            setTimeout(function () { el.classList.add('is-visible'); }, delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Transição suave ao navegar para outra página do site ---- */
  document.querySelectorAll('a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || link.target === '_blank') {
      return;
    }
    link.addEventListener('click', function (e) {
      if (reduceMotion) return;
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(function () { window.location.href = href; }, 220);
    });
  });

  /* ---- Typewriter opcional: <span data-typewriter='["texto 1","texto 2"]'> ---- */
  document.querySelectorAll('[data-typewriter]').forEach(function (el) {
    var words;
    try { words = JSON.parse(el.getAttribute('data-typewriter')); }
    catch (err) { return; }
    if (!words || !words.length) return;

    if (reduceMotion) { el.textContent = words[0]; return; }

    el.classList.add('typewriter');
    var wordIndex = 0, charIndex = 0, deleting = false;

    function tick() {
      var current = words[wordIndex];
      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1800);
          return;
        }
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 65);
    }
    tick();
  });
})();
