/* Klassendiagramm + Popups. Ein Zustand (offenerTyp), eine Funktion, die ihn
   sichtbar macht (zeigen). Der Zustand steht über skr.state in der Adresse
   (#/?typ=hashset); den gewählten Reiter führt der Theme-Baustein selbst (open=…).
   Selektoren und ids bleiben ASCII (AGENTS.md), Bezeichner tragen Umlaute. */
(function () {
  "use strict";
  var diagramm = document.getElementById("cap-diagramm");
  var linien = document.getElementById("cap-linien");
  if (!diagramm || !linien) return;
  var knöpfe = Array.prototype.slice.call(diagramm.querySelectorAll(".cap-typ"));
  var dialoge = Array.prototype.slice.call(document.querySelectorAll("dialog.cap-dialog"));
  var offenerTyp = "";

  function dialogFür(typ) { return typ ? document.getElementById("cap-dialog-" + typ) : null; }
  function typVon(dialog) { return dialog.id.replace("cap-dialog-", ""); }
  function adresseAktualisieren() { if (window.skr.state) window.skr.state.update(); }

  /* Unbekannte Werte (#/?typ=quatsch) führen still in den Ausgangszustand. */
  function zeigen(typ) {
    if (!dialogFür(typ)) typ = "";
    offenerTyp = typ;
    dialoge.forEach(function (d) {
      var soll = typVon(d) === typ;
      if (soll && !d.open) d.showModal();
      if (!soll && d.open) d.close();
    });
    knöpfe.forEach(function (k) { k.setAttribute("aria-pressed", String(k.dataset.typ === typ)); });
  }

  /* Nach dem Schließen wieder auf den ersten Reiter – sonst bliebe der zuletzt
     gewählte Reiter eines geschlossenen Popups in der Adresse stehen. */
  function reiterZurücksetzen(dialog) {
    var erster = dialog.querySelector("details.skr-tabs__panel");
    if (erster && !erster.open) erster.open = true;
  }

  knöpfe.forEach(function (k) {
    k.addEventListener("click", function () { zeigen(k.dataset.typ); adresseAktualisieren(); });
  });

  dialoge.forEach(function (d) {
    var zu = d.querySelector(".cap-dialog__zu");
    if (zu) zu.addEventListener("click", function () { d.close(); });
    /* Verweise auf Abschnitte der Seite (#mengen) schließen das Popup – sonst
       spränge die Seite unsichtbar hinter dem Hintergrund. */
    d.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function () { d.close(); });
    });
    /* Klick auf den Hintergrund: trifft den <dialog> selbst, nicht seinen Inhalt. */
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
    /* „close“ kommt bei Esc, ×, Hintergrund – und beim Wechsel über die Adresse.
       Nur wenn DIESES Popup noch als offen gilt, hat die Person es geschlossen. */
    d.addEventListener("close", function () {
      if (offenerTyp !== typVon(d)) return;
      var knopf = diagramm.querySelector('[data-typ="' + typVon(d) + '"]');
      offenerTyp = "";
      reiterZurücksetzen(d);
      knöpfe.forEach(function (k) { k.setAttribute("aria-pressed", "false"); });
      adresseAktualisieren();
      if (knopf) knopf.focus();
    });
  });

  /* Linien aus den echten Positionen der Kästen: von der Unterkante des Elterntyps
     senkrecht auf eine Sammelschiene über den Kindern, von dort zu jedem Kind.
     Spitze (hohles Dreieck) an der Unterkante des Elterntyps. */
  function linienZeichnen() {
    var breite = diagramm.scrollWidth, höhe = diagramm.scrollHeight;
    linien.setAttribute("width", breite);
    linien.setAttribute("height", höhe);
    linien.setAttribute("viewBox", "0 0 " + breite + " " + höhe);
    var kinderJe = {};
    knöpfe.forEach(function (k) {
      var e = k.dataset.eltern;
      if (e) (kinderJe[e] = kinderJe[e] || []).push(k);
    });
    var svg = "";
    Object.keys(kinderJe).forEach(function (typ) {
      var oben = diagramm.querySelector('[data-typ="' + typ + '"]');
      var kinder = kinderJe[typ];
      var ox = oben.offsetLeft + oben.offsetWidth / 2;
      var oy = oben.offsetTop + oben.offsetHeight;
      var spitze = 13;
      var schiene = Math.min.apply(null, kinder.map(function (k) { return k.offsetTop; })) - 22;
      var xs = kinder.map(function (k) { return k.offsetLeft + k.offsetWidth / 2; });
      var d = "M" + ox + " " + (oy + spitze) + " V" + schiene +
              " M" + Math.min.apply(null, xs.concat(ox)) + " " + schiene + " H" + Math.max.apply(null, xs.concat(ox));
      kinder.forEach(function (k, i) { d += " M" + xs[i] + " " + schiene + " V" + k.offsetTop; });
      var gestrichelt = kinder[0].dataset.beziehung === "implements";
      svg += '<path class="cap-linie' + (gestrichelt ? " cap-linie--gestrichelt" : "") + '" d="' + d + '"/>';
      svg += '<polygon class="cap-spitze" points="' + ox + "," + oy + " " + (ox - 8) + "," + (oy + spitze) + " " + (ox + 8) + "," + (oy + spitze) + '"/>';
    });
    linien.innerHTML = svg;
  }

  linienZeichnen();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(linienZeichnen);
  if ("ResizeObserver" in window) new ResizeObserver(linienZeichnen).observe(diagramm);
  else window.addEventListener("resize", linienZeichnen);
  window.addEventListener("beforeprint", linienZeichnen);
  window.addEventListener("afterprint", linienZeichnen);

  function anmelden() {
    if (!window.skr.state) return;
    window.skr.state.register({
      key: "typ",
      read: function () { return offenerTyp; },
      apply: function (wert) { zeigen(wert || ""); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", anmelden);
  else anmelden();
})();
