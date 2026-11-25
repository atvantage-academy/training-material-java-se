/* Klassendiagramm von Object + Popups je Methode. Ein Zustand (offeneMethode), eine
   Funktion, die ihn sichtbar macht (zeigen). Der Zustand steht über skr.state in der
   Adresse (#/?methode=hashcode). Selektoren und ids bleiben ASCII, Bezeichner tragen
   Umlaute (AGENTS.md, A-006). */
(function () {
  "use strict";
  var diagramm = document.getElementById("obj-diagramm");
  var linien = document.getElementById("obj-linien");
  if (!diagramm || !linien) return;
  var knöpfe = Array.prototype.slice.call(diagramm.querySelectorAll(".obj-methode"));
  var kinder = Array.prototype.slice.call(diagramm.querySelectorAll(".obj-kind"));
  var dialoge = Array.prototype.slice.call(document.querySelectorAll("dialog.obj-dialog"));
  var offeneMethode = "";

  function dialogFür(methode) { return methode ? document.getElementById("obj-dialog-" + methode) : null; }
  function methodeVon(dialog) { return dialog.id.replace("obj-dialog-", ""); }
  function adresseAktualisieren() { if (window.skr && window.skr.state) window.skr.state.update(); }

  /* Unbekannte Werte (#/?methode=quatsch) führen still in den Ausgangszustand. */
  function zeigen(methode) {
    if (!dialogFür(methode)) methode = "";
    offeneMethode = methode;
    dialoge.forEach(function (d) {
      var soll = methodeVon(d) === methode;
      if (soll && !d.open) d.showModal();
      if (!soll && d.open) d.close();
    });
    knöpfe.forEach(function (k) { k.setAttribute("aria-pressed", String(k.dataset.methode === methode)); });
  }

  knöpfe.forEach(function (k) {
    k.addEventListener("click", function () { zeigen(k.dataset.methode); adresseAktualisieren(); });
  });

  dialoge.forEach(function (d) {
    var zu = d.querySelector(".obj-dialog__zu");
    if (zu) zu.addEventListener("click", function () { d.close(); });
    /* Klick auf den Hintergrund: trifft den <dialog> selbst, nicht seinen Inhalt. */
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
    /* „close“ kommt bei Esc, ×, Hintergrund – und beim Wechsel über die Adresse.
       Nur wenn DIESES Popup noch als offen gilt, hat die Person es geschlossen. */
    d.addEventListener("close", function () {
      if (offeneMethode !== methodeVon(d)) return;
      var knopf = diagramm.querySelector('[data-methode="' + methodeVon(d) + '"]');
      offeneMethode = "";
      knöpfe.forEach(function (k) { k.setAttribute("aria-pressed", "false"); });
      adresseAktualisieren();
      if (knopf) knopf.focus();
    });
  });

  /* Linien: von der Oberkante jeder Unterklasse senkrecht auf eine Sammelschiene,
     von dort zur Unterkante von Object; dort die hohle Spitze. */
  function linienZeichnen() {
    var oben = document.getElementById("obj-object");
    if (!oben || !kinder.length) return;
    var breite = diagramm.scrollWidth, höhe = diagramm.scrollHeight;
    linien.setAttribute("width", breite);
    linien.setAttribute("height", höhe);
    linien.setAttribute("viewBox", "0 0 " + breite + " " + höhe);
    var ox = oben.offsetLeft + oben.offsetWidth / 2;
    var oy = oben.offsetTop + oben.offsetHeight;
    var spitze = 13;
    var schiene = Math.min.apply(null, kinder.map(function (k) { return k.offsetTop; })) - 24;
    var xs = kinder.map(function (k) { return k.offsetLeft + k.offsetWidth / 2; });
    var d = "M" + ox + " " + (oy + spitze) + " V" + schiene +
            " M" + Math.min.apply(null, xs.concat(ox)) + " " + schiene + " H" + Math.max.apply(null, xs.concat(ox));
    kinder.forEach(function (k, i) { d += " M" + xs[i] + " " + schiene + " V" + k.offsetTop; });
    linien.innerHTML = '<path class="obj-linie" d="' + d + '"/>' +
      '<polygon class="obj-spitze" points="' + ox + "," + oy + " " + (ox - 8) + "," + (oy + spitze) + " " + (ox + 8) + "," + (oy + spitze) + '"/>';
  }

  linienZeichnen();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(linienZeichnen);
  if ("ResizeObserver" in window) new ResizeObserver(linienZeichnen).observe(diagramm);
  else window.addEventListener("resize", linienZeichnen);
  window.addEventListener("beforeprint", linienZeichnen);
  window.addEventListener("afterprint", linienZeichnen);

  function anmelden() {
    if (!window.skr || !window.skr.state) return;
    window.skr.state.register({
      key: "methode",
      read: function () { return offeneMethode; },
      apply: function (wert) { zeigen(wert || ""); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", anmelden);
  else anmelden();
})();
