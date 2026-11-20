// Prüft GROUP BY-Abfragen wie Microsoft SQL Server.
// SQLite erlaubt im SELECT Spalten, die weder im GROUP BY noch in einer Aggregatfunktion
// stehen („bare columns“), und zeigt dann einen beliebigen Wert der Gruppe an. SQL Server und
// der SQL-Standard lehnen solche Abfragen ab. Damit Studierende den Fehler bemerken, prüft der
// Editor einfache Abfragen vor dem Ausführen und meldet ihn auf Deutsch.
// Komplexe Abfragen (Unterabfragen, UNION, Fensterfunktionen) werden nicht geprüft, damit es
// keine falschen Fehlermeldungen gibt; dort gilt weiterhin das Verhalten von SQLite.
(function (global) {
  var AGGREGATE = /\b(count|sum|avg|min|max|total|group_concat|string_agg)\s*\(/i;
  var KEYWORDS = ('select distinct all top as from where group by having order limit offset asc desc and or not ' +
    'null is in like glob between case when then else end cast collate nocase true false exists escape').split(' ');

  function stripCommentsAndStrings(sql) {
    return sql
      .replace(/--[^\n]*/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/'(?:[^']|'')*'/g, "''")
      .replace(/"([^"]*)"|\[([^\]]*)\]|`([^`]*)`/g, function (m, a, b, c) { return a || b || c; });
  }

  // Positionen von Schlüsselwörtern auf oberster Klammerebene finden
  function topLevelIndex(s, re, from) {
    var depth = 0;
    for (var i = from || 0; i < s.length; i++) {
      var ch = s[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      else if (depth === 0 && /[a-z]/i.test(ch) && (i === 0 || !/[\w.]/.test(s[i - 1]))) {
        var m = s.slice(i).match(re);
        if (m && m.index === 0) return i;
      }
    }
    return -1;
  }

  function splitTopLevel(s) {
    var parts = [], depth = 0, start = 0;
    for (var i = 0; i < s.length; i++) {
      if (s[i] === '(') depth++;
      else if (s[i] === ')') depth--;
      else if (s[i] === ',' && depth === 0) { parts.push(s.slice(start, i)); start = i + 1; }
    }
    parts.push(s.slice(start));
    return parts.map(function (p) { return p.trim(); }).filter(Boolean);
  }

  function normalize(expr) { return expr.replace(/\s+/g, '').toLowerCase(); }

  // Alias entfernen: „expr AS name“ oder „expr name“
  function splitAlias(item) {
    var m = item.match(/^([\s\S]*\S)\s+as\s+([A-Za-z_]\w*)$/i);
    if (m) return { expr: m[1], alias: m[2] };
    m = item.match(/^([\s\S]*[\w)'])\s+([A-Za-z_]\w*)$/);
    if (m && KEYWORDS.indexOf(m[2].toLowerCase()) < 0 && !/\b(case|cast)\b/i.test(m[1])) return { expr: m[1], alias: m[2] };
    return { expr: item, alias: null };
  }

  // Spaltennamen in einem Ausdruck (ohne Funktionsnamen, Schlüsselwörter und Zahlen)
  function columns(expr) {
    var out = [], re = /([A-Za-z_]\w*)(?:\.([A-Za-z_]\w*))?(\s*\()?/g, m;
    while ((m = re.exec(expr))) {
      if (m[3]) continue;                                   // Funktionsname
      var name = m[2] || m[1];
      if (!m[2] && KEYWORDS.indexOf(name.toLowerCase()) >= 0) continue;
      out.push(name);
    }
    return out;
  }

  function message(col) {
    return 'Die Spalte „' + col + '“ steht weder im GROUP BY noch in einer Aggregatfunktion. ' +
      'GROUP BY liefert eine Zeile pro Gruppe, daher ist unklar, welcher Wert angezeigt werden soll. ' +
      'Die Spalte ins GROUP BY aufnehmen, in eine Aggregatfunktion setzen oder weglassen.';
  }

  function checkStatement(raw) {
    var s = stripCommentsAndStrings(raw).trim();
    if (!/^select\b/i.test(s)) return null;
    var body = s.slice(6);
    if (/\bselect\b|\b(union|intersect|except)\b|\bover\s*\(/i.test(body)) return null;

    var fromIdx = topLevelIndex(s, /^from\b/i, 6);
    var groupIdx = topLevelIndex(s, /^group\s+by\b/i, 6);
    var ends = [/^having\b/i, /^order\s+by\b/i, /^limit\b/i].map(function (re) { return topLevelIndex(s, re, 6); })
      .filter(function (i) { return i >= 0; });
    var selEnd = fromIdx >= 0 ? fromIdx : (groupIdx >= 0 ? groupIdx : (ends.length ? Math.min.apply(null, ends) : s.length));
    var selectList = s.slice(6, selEnd).replace(/^\s*(distinct|all)\b/i, '').replace(/^\s*top\s*\(?\s*\d+\s*\)?/i, '');
    var items = splitTopLevel(selectList).map(splitAlias);

    if (groupIdx < 0) {
      // Aggregatfunktion ohne GROUP BY: daneben darf keine einzelne Spalte stehen
      if (!items.some(function (it) { return AGGREGATE.test(it.expr); })) return null;
      for (var k = 0; k < items.length; k++) {
        if (AGGREGATE.test(items[k].expr)) continue;
        var cs = columns(items[k].expr);
        if (items[k].expr.trim() === '*' || cs.length) {
          var col = items[k].expr.trim() === '*' ? '*' : cs[0];
          return 'Die Spalte „' + col + '“ steht neben einer Aggregatfunktion, aber es gibt kein GROUP BY. ' +
            'Die Aggregatfunktion liefert nur eine Zeile, daher ist unklar, welcher Wert angezeigt werden soll. ' +
            'Entweder GROUP BY ' + col + ' ergänzen oder die Spalte weglassen.';
        }
      }
      return null;
    }

    var groupEnd = ends.filter(function (i) { return i > groupIdx; });
    var groupList = s.slice(groupIdx, groupEnd.length ? Math.min.apply(null, groupEnd) : s.length).replace(/^group\s+by/i, '');
    var groupExprs = {}, groupCols = {};
    splitTopLevel(groupList).forEach(function (g) {
      if (/^\d+$/.test(g) && items[+g - 1]) g = items[+g - 1].expr;           // GROUP BY 1
      items.forEach(function (it) { if (it.alias && it.alias.toLowerCase() === g.toLowerCase()) g = it.expr; });  // Alias
      groupExprs[normalize(g)] = true;
      columns(g).forEach(function (c) { groupCols[c.toLowerCase()] = true; });
    });

    for (var i = 0; i < items.length; i++) {
      var expr = items[i].expr.trim();
      if (expr === '*' || /\.\*$/.test(expr)) {
        return 'SELECT * ist zusammen mit GROUP BY nicht möglich: GROUP BY liefert eine Zeile pro Gruppe, ' +
          '* verlangt aber alle Spalten. Die Spalten einzeln angeben (Gruppierungsspalten und Aggregatfunktionen).';
      }
      if (groupExprs[normalize(expr)] || AGGREGATE.test(expr)) continue;
      var cols = columns(expr);
      for (var j = 0; j < cols.length; j++) {
        if (!groupCols[cols[j].toLowerCase()]) return message(cols[j]);
      }
    }
    return null;
  }

  global.DGA_checkGroupBy = function (sql) {
    var stmts = sql.split(';');
    for (var i = 0; i < stmts.length; i++) {
      var err = checkStatement(stmts[i]);
      if (err) return err;
    }
    return null;
  };
})(typeof window !== 'undefined' ? window : globalThis);
