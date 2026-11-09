// SQL-Editor für die LV Datengewinnung & -aufbereitung.
// Läuft komplett im Browser: SQLite (sql.js, WebAssembly) mit der
// W3Schools-Beispieldatenbank im Arbeitsspeicher.
//
// URL-Parameter:
//   q=<SQL>   Abfrage vorbelegen (URL-kodiert)
//   run=0     Abfrage beim Laden nicht automatisch ausführen
//   er=0      ER-Diagramm ausblenden
(function () {
  var SQLJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
  var DATA_URL = 'w3schools.sql';
  var ER_URL = '../slides/assets/2-1-4-er.svg';
  var MAX_ROWS = 500;
  var STORAGE_KEY = 'dga-sql-editor-query';

  var params = new URLSearchParams(location.search);
  var embedded = window.self !== window.top;
  if (embedded) document.body.classList.add('embedded');

  var resultEl = document.getElementById('result');
  var statusEl = document.getElementById('status');
  var SQL = null, db = null, dataScript = null;

  // ---------- Editor ----------
  var initial = params.get('q');
  if (initial === null) {
    try { initial = localStorage.getItem(STORAGE_KEY); } catch (e) { initial = null; }
  }
  if (!initial) initial = 'SELECT *\nFROM Customers';

  // SQL-Modus mit zusätzlichen Schlüsselwörtern TOP und LIMIT
  var base = CodeMirror.resolveMode('text/x-mssql');
  CodeMirror.defineMIME('text/x-dga', Object.assign({}, base, {
    keywords: Object.assign({}, base.keywords, {
      top: true, limit: true, and: true, or: true, not: true, in: true, like: true,
      between: true, is: true, null: true, distinct: true, asc: true, desc: true, as: true,
      on: true, join: true, left: true, inner: true, outer: true, full: true, having: true
    })
  }));

  var editor = CodeMirror.fromTextArea(document.getElementById('sql'), {
    mode: 'text/x-dga',
    lineNumbers: false,
    matchBrackets: true,
    indentUnit: 2,
    lineWrapping: true,
    extraKeys: {
      'Ctrl-Enter': run,
      'Cmd-Enter': run,
      'Shift-Enter': run
    }
  });
  editor.setValue(initial);

  editor.on('change', function () {
    if (params.get('q') !== null) return; // vorgegebene Abfragen nicht speichern
    try { localStorage.setItem(STORAGE_KEY, editor.getValue()); } catch (e) { /* egal */ }
  });

  // „Eigenes Fenster“ übernimmt die aktuelle Abfrage
  var popout = document.getElementById('popout');
  popout.addEventListener('click', function () {
    popout.href = 'index.html?q=' + encodeURIComponent(editor.getValue());
  });

  // ---------- Beispiele aus den Folien ----------
  var examples = document.getElementById('examples');
  if (embedded) examples.hidden = true;   // Beispiele nur im eigenen Fenster
  (window.DGA_BEISPIELE || []).forEach(function (b, i) {
    var group = examples.querySelector('optgroup[label="' + b.gruppe + '"]');
    if (!group) {
      group = document.createElement('optgroup');
      group.label = b.gruppe;
      examples.appendChild(group);
    }
    var opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = b.titel;
    group.appendChild(opt);
  });
  examples.addEventListener('change', function () {
    var b = window.DGA_BEISPIELE[Number(examples.value)];
    examples.value = '';          // Menü zurücksetzen, damit dasselbe Beispiel erneut wählbar ist
    if (!b) return;
    editor.setValue(b.sql);
    run();
    editor.focus();
  });

  // ---------- Musterlösung (URL-Parameter loesung=) ----------
  var solution = params.get('loesung');
  var solutionBtn = document.getElementById('solution');
  if (solution && embedded) {   // Lösung nur eingebettet (Übungsfolien), nicht im eigenen Fenster
    solutionBtn.hidden = false;
    solutionBtn.addEventListener('click', function () {
      // Aufgabe (führende Kommentarzeilen) behalten, darunter die Lösung
      var lines = editor.getValue().split('\n');
      var head = [];
      for (var i = 0; i < lines.length && /^\s*--/.test(lines[i]); i++) head.push(lines[i]);
      editor.setValue((head.length ? head.join('\n') + '\n\n' : '') + solution);
      run();
      editor.focus();
    });
  }

  // ---------- ER-Diagramm ----------
  var erEl = document.getElementById('er');
  var zoom = 1;
  fetch(ER_URL).then(function (r) { return r.text(); }).then(function (svg) {
    erEl.innerHTML = svg;
    erEl.querySelectorAll('g.table').forEach(function (g) {
      var name = g.querySelector('text').textContent.trim();
      g.addEventListener('click', function () {
        editor.setValue('SELECT *\nFROM ' + name);
        run();
        editor.focus();
      });
    });
  }).catch(function () { erEl.textContent = 'ER-Diagramm konnte nicht geladen werden.'; });

  function setZoom(z) {
    zoom = Math.min(3, Math.max(0.6, z));
    erEl.style.setProperty('--zoom', zoom);
  }
  document.getElementById('zoom-in').addEventListener('click', function () { setZoom(zoom + 0.25); });
  document.getElementById('zoom-out').addEventListener('click', function () { setZoom(zoom - 0.25); });

  var toggleEr = document.getElementById('toggle-er');
  function showEr(on) {
    document.body.classList.toggle('no-er', !on);
    toggleEr.setAttribute('aria-pressed', on ? 'true' : 'false');
    setTimeout(function () { editor.refresh(); }, 0);
  }
  toggleEr.addEventListener('click', function () { showEr(document.body.classList.contains('no-er')); });
  showEr(params.get('er') !== '0');

  // ---------- Bereiche vergrößern (Trennbalken) ----------
  var panes = document.querySelector('.panes');
  var SIZE_KEY = 'dga-sql-editor-sizes';
  var MIN = { er: 90, bottom: 160, editor: 200, result: 220 };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function setSizes(erH, edW, save) {
    var box = panes.getBoundingClientRect();
    if (erH != null) {
      erH = clamp(erH, MIN.er, box.height - 10 - MIN.bottom);
      panes.style.setProperty('--er-h', erH + 'px');
    }
    if (edW != null) {
      edW = clamp(edW, MIN.editor, box.width - 10 - MIN.result);
      panes.style.setProperty('--ed-w', edW + 'px');
    }
    editor.refresh();
    if (save && !embedded) {
      try {
        localStorage.setItem(SIZE_KEY, JSON.stringify({
          erH: erH != null ? erH / box.height : undefined,
          edW: edW != null ? edW / box.width : undefined
        }));
      } catch (e) { /* egal */ }
    }
  }

  // gespeicherte Größen (als Anteil) wiederherstellen
  if (!embedded) {
    try {
      var saved = JSON.parse(localStorage.getItem(SIZE_KEY) || 'null');
      if (saved) {
        var box0 = panes.getBoundingClientRect();
        setSizes(saved.erH ? saved.erH * box0.height : null, saved.edW ? saved.edW * box0.width : null, false);
      }
    } catch (e) { /* egal */ }
  }

  function makeGutter(el, horizontal) {
    function sizeFromPointer(ev) {
      var box = panes.getBoundingClientRect();
      if (horizontal) setSizes(ev.clientY - box.top - 5, null, false);
      else setSizes(null, ev.clientX - box.left - 5, false);
    }
    function current() {
      var r = (horizontal ? document.querySelector('.pane-er') : document.querySelector('.pane-editor')).getBoundingClientRect();
      return horizontal ? r.height : r.width;
    }
    el.addEventListener('pointerdown', function (ev) {
      ev.preventDefault();
      try { el.setPointerCapture(ev.pointerId); } catch (e) { /* z. B. bei Tests */ }
      el.classList.add('active');
      document.body.classList.add('resizing', horizontal ? 'resizing-h' : 'resizing-v');
      function move(e) { sizeFromPointer(e); }
      function up(e) {
        try { el.releasePointerCapture(e.pointerId); } catch (err) { /* egal */ }
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        el.classList.remove('active');
        document.body.classList.remove('resizing', 'resizing-h', 'resizing-v');
        if (horizontal) setSizes(current(), null, true); else setSizes(null, current(), true);
      }
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
    // Tastatur: Pfeiltasten verschieben den Balken um 20 px
    el.addEventListener('keydown', function (ev) {
      var step = { ArrowUp: -20, ArrowDown: 20, ArrowLeft: -20, ArrowRight: 20 }[ev.key];
      if (!step || (horizontal && /Left|Right/.test(ev.key)) || (!horizontal && /Up|Down/.test(ev.key))) return;
      ev.preventDefault();
      if (horizontal) setSizes(current() + step, null, true); else setSizes(null, current() + step, true);
    });
    // Doppelklick: Ausgangsgröße
    el.addEventListener('dblclick', function () {
      panes.style.removeProperty(horizontal ? '--er-h' : '--ed-w');
      editor.refresh();
      try { localStorage.removeItem(SIZE_KEY); } catch (e) { /* egal */ }
    });
  }

  makeGutter(document.getElementById('gutter-h'), true);
  makeGutter(document.getElementById('gutter-v'), false);

  // ---------- Datenbank ----------
  function loadDatabase() {
    if (db) db.close();
    db = new SQL.Database();
    db.exec(dataScript);
  }

  // Zurücksetzen: Datenbank neu laden und, falls die Abfrage vorgegeben war
  // (Folien, Übungen), auch den Editor auf die Vorgabe zurücksetzen.
  // Eine eingefügte Lösung verschwindet dadurch wieder.
  document.getElementById('reset').addEventListener('click', function () {
    if (!SQL) return;
    loadDatabase();
    statusEl.textContent = '';
    var preset = params.get('q');
    if (preset !== null) {
      editor.setValue(preset);
      editor.setCursor(editor.lineCount(), 0);
      if (params.get('run') !== '0') { run(); return; }
      showMessage('Abfrage und Datenbank wurden zurückgesetzt.');
      return;
    }
    showMessage('Die Datenbank wurde in den Ausgangszustand zurückgesetzt.');
  });
  document.getElementById('run').addEventListener('click', run);

  Promise.all([
    initSqlJs({ locateFile: function (f) { return SQLJS_BASE + f; } }),
    fetch(DATA_URL).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
  ]).then(function (res) {
    SQL = res[0];
    dataScript = res[1];
    loadDatabase();
    if (params.get('run') !== '0') run();
    else showMessage(window.innerWidth > 1100
      ? 'Abfrage eingeben und mit ▶ Ausführen oder Shift + Enter starten.'
      : 'Abfrage eingeben und mit ▶ Ausführen starten.');
  }).catch(function (err) {
    showError('Die Datenbank konnte nicht geladen werden (' + err.message + '). Ist eine Internetverbindung vorhanden?');
  });

  // ---------- Ausführen ----------
  // SQL-Server-Schreibweise „SELECT TOP n …“ in SQLite-Schreibweise „… LIMIT n“ übersetzen,
  // damit auch Abfragen in SQL-Server-Schreibweise unverändert funktionieren.
  function translateTop(sql) {
    return sql.split(';').map(function (stmt) {
      var m = stmt.match(/^((?:\s*--[^\n]*\n)*\s*SELECT\s+(?:DISTINCT\s+)?)TOP\s*\(?\s*(\d+)\s*\)?\s+/i);
      if (!m) return stmt;
      var rest = stmt.slice(m[0].length);
      return m[1] + rest.replace(/\s*$/, '') + '\nLIMIT ' + m[2] + (/\s$/.test(stmt) ? '\n' : '');
    }).join(';');
  }

  function run() {
    if (!db) return;
    var sql = editor.getSelection() || editor.getValue();
    if (!sql.trim()) { showMessage('Keine Abfrage eingegeben.'); return; }
    var t0 = performance.now();
    try {
      var results = db.exec(translateTop(sql));
      var ms = Math.round(performance.now() - t0);
      if (!results.length) {
        statusEl.textContent = ms + ' ms';
        showMessage('Die Abfrage wurde ausgeführt, liefert aber keine Zeilen.');
        return;
      }
      var last = results[results.length - 1];
      renderTable(last);
      var n = last.values.length;
      statusEl.textContent = n + (n === 1 ? ' Zeile' : ' Zeilen') + ' · ' + ms + ' ms';
    } catch (err) {
      statusEl.textContent = '';
      showError(translateError(err.message));
    }
  }

  function translateError(msg) {
    var m;
    if ((m = msg.match(/no such table: (\S+)/))) return 'Unbekannte Tabelle: ' + m[1] + '. Tabellennamen stehen im ER-Diagramm.';
    if ((m = msg.match(/no such column: (\S+)/))) return 'Unbekannte Spalte: ' + m[1] + '. Schreibweise prüfen (z. B. PostalCode, nicht Postleitzahl).';
    if ((m = msg.match(/near "([^"]*)": syntax error/))) return 'Syntaxfehler bei „' + m[1] + '“. Kommas, Anführungszeichen und Schlüsselwörter prüfen.';
    if (/incomplete input/.test(msg)) return 'Die Abfrage ist unvollständig.';
    return 'Fehler: ' + msg;
  }

  function renderTable(res) {
    var table = document.createElement('table');
    table.className = 'result';
    var thead = table.createTHead().insertRow();
    res.columns.forEach(function (c) {
      var th = document.createElement('th');
      th.textContent = c;
      thead.appendChild(th);
    });
    var tbody = table.createTBody();
    res.values.slice(0, MAX_ROWS).forEach(function (row) {
      var tr = tbody.insertRow();
      row.forEach(function (v) {
        var td = tr.insertCell();
        if (v === null) { td.textContent = 'NULL'; td.className = 'null'; }
        else {
          td.textContent = typeof v === 'number' ? String(Math.round(v * 100) / 100) : v;
          if (typeof v === 'number') td.className = 'num';
        }
      });
    });
    resultEl.innerHTML = '';
    resultEl.appendChild(table);
    if (res.values.length > MAX_ROWS) {
      var note = document.createElement('p');
      note.className = 'note';
      note.textContent = 'Angezeigt werden die ersten ' + MAX_ROWS + ' von ' + res.values.length + ' Zeilen.';
      resultEl.appendChild(note);
    }
    resultEl.scrollTop = 0;
    resultEl.scrollLeft = 0;
  }

  function showMessage(text) {
    resultEl.innerHTML = '';
    var p = document.createElement('p');
    p.className = 'placeholder';
    p.textContent = text;
    resultEl.appendChild(p);
  }

  function showError(text) {
    resultEl.innerHTML = '';
    var div = document.createElement('div');
    div.className = 'error';
    div.textContent = text;
    resultEl.appendChild(div);
  }
})();
