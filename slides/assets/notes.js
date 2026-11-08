/*
 * Lädt Speaker Notes aus einer privaten Markdown-Datei und hängt sie an die Folien.
 *
 * Erwartete Datei: ../private/notes/<foliensatz>.md  (z. B. private/notes/1-intro.md)
 * Der Ordner private/ ist nicht Teil des öffentlichen Repos. Auf GitHub Pages
 * existiert die Datei daher nicht und es werden keine Notizen angezeigt.
 *
 * Format der Notizdatei: Je Folie ein Abschnitt "## <id>", wobei <id> das
 * id-Attribut der <section> ist. Der Inhalt darunter ist Markdown.
 *
 * Sprecheransicht: Taste S während der Präsentation.
 */
(function () {
  var deck = location.pathname.split('/').pop().replace(/\.html$/, '');
  var url = '../private/notes/' + deck + '.md';

  function render(markdown) {
    var plugin = window.Reveal && Reveal.getPlugin && Reveal.getPlugin('markdown');
    if (plugin && typeof plugin.marked === 'function') {
      return plugin.marked(markdown);
    }
    var pre = document.createElement('div');
    pre.style.whiteSpace = 'pre-wrap';
    pre.textContent = markdown;
    return pre.outerHTML;
  }

  function apply(text) {
    var parts = text.split(/^##[ \t]+(\S+)[ \t]*$/m);
    var missing = [];
    for (var i = 1; i < parts.length; i += 2) {
      var id = parts[i];
      var body = parts[i + 1].trim();
      var slide = document.getElementById(id);
      if (!slide || slide.tagName !== 'SECTION') {
        missing.push(id);
        continue;
      }
      if (!body) continue;
      var old = slide.querySelector('aside.notes[data-private-notes]');
      if (old) old.remove();
      var aside = document.createElement('aside');
      aside.className = 'notes';
      aside.setAttribute('data-private-notes', '');
      aside.innerHTML = render(body);
      slide.appendChild(aside);
    }
    if (missing.length) {
      console.warn('Speaker Notes: keine Folie mit id ' + missing.join(', '));
    }
  }

  function load() {
    fetch(url, { cache: 'no-store' })
      .then(function (response) { return response.ok ? response.text() : null; })
      .then(function (text) { if (text) apply(text); })
      .catch(function () { /* keine privaten Notizen verfügbar */ });
  }

  if (Reveal.isReady()) {
    load();
  } else {
    Reveal.on('ready', load);
  }
})();
