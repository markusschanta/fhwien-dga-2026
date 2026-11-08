// Seitliches Inhaltsverzeichnis für die Skripten.
// Liest alle Abschnitte (h2) und Unterabschnitte (h3) aus <main>, baut daraus
// das Verzeichnis in <aside class="sidetoc"> und hebt beim Scrollen den
// aktuellen Abschnitt hervor.
(function () {
  var aside = document.querySelector('aside.sidetoc');
  var main = document.querySelector('main');
  if (!aside || !main) return;

  function slug(text) {
    return text.toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  var headings = Array.prototype.filter.call(main.querySelectorAll('h2, h3'), function (h) {
    return !h.closest('nav.toc');
  });
  if (!headings.length) return;

  var title = document.createElement('p');
  title.className = 'sidetoc-title';
  title.textContent = 'Inhalt';
  aside.appendChild(title);

  var list = document.createElement('ol');
  aside.appendChild(list);

  var entries = [];
  var currentH2 = null;
  var group = -1;
  headings.forEach(function (h) {
    if (!h.id) {
      var base = slug(h.textContent), id = base, n = 2;
      while (document.getElementById(id)) { id = base + '-' + n++; }
      h.id = id;
    }
    var li = document.createElement('li');
    li.className = h.tagName === 'H2' ? 'level-2' : 'level-3';
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.title = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
    if (h.tagName === 'H2') { currentH2 = a; group++; }
    li.setAttribute('data-group', group);
    entries.push({ heading: h, link: a, item: li, group: group, parent: h.tagName === 'H3' ? currentH2 : null });
  });

  var active = null;

  function update() {
    var offset = 120;
    var current = entries[0];
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].heading.getBoundingClientRect().top - offset <= 0) current = entries[i];
      else break;
    }
    // Ganz unten angekommen: letzten Abschnitt markieren
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = entries[entries.length - 1];
    }
    if (current === active) return;
    if (active) {
      active.link.classList.remove('active');
      if (active.parent) active.parent.classList.remove('active-parent');
    }
    current.link.classList.add('active');
    if (current.parent) current.parent.classList.add('active-parent');
    active = current;

    // Unterabschnitte nur im aktuellen Abschnitt anzeigen
    entries.forEach(function (e) {
      if (e.item.className.indexOf('level-3') === -1) return;
      e.item.classList.toggle('open', e.group === current.group);
    });

    // aktiven Eintrag im Verzeichnis sichtbar halten
    var top = current.link.offsetTop, bottom = top + current.link.offsetHeight;
    if (top < aside.scrollTop + 40) aside.scrollTop = Math.max(0, top - 40);
    else if (bottom > aside.scrollTop + aside.clientHeight - 40) aside.scrollTop = bottom - aside.clientHeight + 40;
  }

  var pending = false;
  function onScroll() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () { pending = false; update(); });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('hashchange', onScroll);
  update();
})();
