// Kopfleiste für alle Foliensätze.
// Links: Logo, Titel der Lehrveranstaltung (Link zur Kursseite) und Semester.
// Rechts: Teil › Abschnitt und Foliennummer.
// Der Abschnitt kommt aus data-abschnitt am horizontalen Folienblock; fehlt er,
// wird die erste Überschrift des Blocks verwendet.
// Auf Folien mit data-state="no-header" (Titel, Kalender, sehr volle Folien)
// wird die Leiste ausgeblendet und die Folie nutzt die volle Höhe.
(function () {
  var COURSE_URL = '../index.html';   // relativ: funktioniert lokal und auf GitHub Pages
  var SEMESTER = 'WS 2026/27';
  var UNITS = {
    '1-intro': 'Teil 1 · Intro',
    '2-sql': 'Teil 2 · Datenbanken und SQL',
    '3-python': 'Teil 3 · Python',
    '4-pandas': 'Teil 4 · pandas',
    '5-altair': 'Teil 5 · Visualisierung mit Altair'
  };

  // Keine Kopfleiste im PDF-Export
  if (/view=print|print-pdf/.test(location.search)) return;

  var deck = location.pathname.split('/').pop().replace(/\.html$/, '');
  var header = document.createElement('header');
  header.className = 'dga-header';
  header.innerHTML =
    '<img src="assets/0-logo-fh.png" alt="FH Wien der WKW">' +
    '<a class="dga-header-title" href="' + COURSE_URL + '" target="_blank" rel="noopener">Datengewinnung &amp; -aufbereitung</a>' +
    '<span class="dga-header-semester">' + SEMESTER + '</span>' +
    '<span class="dga-header-where"><span class="dga-header-unit">' + (UNITS[deck] || '') + '</span>' +
    '<span class="dga-header-section"></span></span>' +
    '<span class="dga-header-number"></span>';
  document.body.insertBefore(header, document.body.firstChild);
  document.documentElement.classList.add('has-dga-header');

  var sectionEl = header.querySelector('.dga-header-section');
  var numberEl = header.querySelector('.dga-header-number');

  function sectionName(slide) {
    var stack = slide.parentNode && slide.parentNode.tagName === 'SECTION' ? slide.parentNode : slide;
    var name = stack.getAttribute('data-abschnitt');
    if (name) return name;
    var first = stack.querySelector('h1, h2, h3');
    return first ? first.textContent.trim() : '';
  }

  function update() {
    var slide = Reveal.getCurrentSlide();
    if (!slide) return;

    var name = sectionName(slide);
    sectionEl.textContent = name ? ' › ' + name : '';
    numberEl.textContent = (Reveal.getSlidePastCount() + 1) + ' / ' + Reveal.getTotalSlides();

    var hide = /(^|\s)no-header(\s|$)/.test(slide.getAttribute('data-state') || '');
    var root = document.documentElement;
    if (root.classList.contains('dga-header-hidden') !== hide) {
      root.classList.toggle('dga-header-hidden', hide);
      Reveal.layout();
    }
  }

  if (Reveal.isReady()) update(); else Reveal.on('ready', update);
  Reveal.on('slidechanged', update);
})();
