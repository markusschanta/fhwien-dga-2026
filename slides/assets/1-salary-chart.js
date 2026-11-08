// Gehaltsvergleich für die Folie „Datenkompetenz ist gefragt und wird bezahlt“.
// Daten: Burning Glass Technologies im Auftrag des UK Department for Digital,
// Culture, Media & Sport (2019): No Longer Optional: Employer Demand for Digital
// Skills, S. 55. Ausgeschriebene Jahresgehälter (GBP) in UK-Stelleninseraten,
// alle Inserate des Berufs vs. Inserate mit SQL-Anforderung.
// Dieselbe Grafik lässt sich mit Altair bauen (Einheit 5), denn Altair erzeugt genau
// solche Vega-Lite-Spezifikationen.
(function () {
  // Zeilen von oben nach unten; typ 'h' = Überschrift (Beruf) ohne Balken.
  var data = [
    { id: 'h1', typ: 'h', beruf: 'Marketing Analyst' },
    { id: 'alle1', typ: 'alle', beruf: 'Marketing Analyst', variante: 'alle Inserate', gehalt: 35300 },
    { id: 'sql1', typ: 'sql', beruf: 'Marketing Analyst', variante: 'mit SQL', gehalt: 43200, plus: '+23 %' },
    { id: 'h2', typ: 'h', beruf: 'Financial Analyst' },
    { id: 'alle2', typ: 'alle', beruf: 'Financial Analyst', variante: 'alle Inserate', gehalt: 41300 },
    { id: 'sql2', typ: 'sql', beruf: 'Financial Analyst', variante: 'mit SQL', gehalt: 51900, plus: '+25 %' }
  ];
  data.forEach(function (d) {
    d.label = d.gehalt ? '£ ' + d.gehalt.toLocaleString('de-DE') : '';
    d.plus = d.plus || '';
  });

  var ink = '#4d4d4d';
  var purple = '#503795';
  var y = {
    field: 'id', type: 'nominal', sort: ['h1', 'alle1', 'sql1', 'h2', 'alle2', 'sql2'],
    axis: {
      title: null, domain: false, ticks: false, labelFontSize: 18, labelColor: ink, labelPadding: 12,
      minExtent: 150, maxExtent: 150,
      labelExpr: "indexof(datum.value, 'h') == 0 ? '' : (indexof(datum.value, 'alle') == 0 ? 'alle Inserate' : 'mit SQL')"
    }
  };
  var x = { field: 'gehalt', type: 'quantitative', scale: { domain: [0, 62000] }, axis: null };
  var bars = { filter: "datum.typ != 'h'" };

  var spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: data },
    width: 520,
    height: { step: 34 },
    layer: [
      {
        transform: [bars],
        mark: { type: 'bar', cornerRadiusEnd: 4, height: { band: 0.72 } },
        encoding: {
          y: y, x: x,
          color: { field: 'typ', type: 'nominal', scale: { domain: ['alle', 'sql'], range: ['#8f889e', purple] }, legend: null },
          tooltip: [
            { field: 'beruf', title: 'Beruf' },
            { field: 'variante', title: 'Inserate' },
            { field: 'gehalt', title: 'Gehalt (£)', format: ',.0f' }
          ]
        }
      },
      {
        transform: [bars],
        mark: { type: 'text', align: 'left', dx: 8, fontSize: 18, color: ink },
        encoding: { y: y, x: x, text: { field: 'label' } }
      },
      {
        transform: [bars],
        mark: { type: 'text', align: 'left', dx: 92, fontSize: 18, fontWeight: 700, color: purple },
        encoding: { y: y, x: x, text: { field: 'plus' } }
      },
      {
        transform: [{ filter: "datum.typ == 'h'" }],
        mark: { type: 'text', align: 'left', baseline: 'bottom', dy: 12, fontSize: 18, fontWeight: 700, color: purple },
        encoding: { y: y, x: { datum: 0, type: 'quantitative' }, text: { field: 'beruf' } }
      }
    ],
    config: { font: 'Noto Sans', view: { stroke: null }, background: null }
  };

  vegaEmbed('#salary-chart', spec, { renderer: 'svg', actions: false });
})();
