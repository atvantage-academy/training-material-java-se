(function () {
  // Alle Meldungen gemessen mit Temurin 25 (Docker) an gleichwertigem Code, hier mit den Namen der Beispiel-Domäne.

  // ---- 2 · Pannen: Klassenpfad gegen Modulpfad ----
  const pannen = [
    { id: "doppelt", knopf: "Ein JAR liegt doppelt da",
      klassenpfad: { gut: false, text: "Zwei Fassungen desselben JARs, etwa nach einem Update: Es gewinnt **still** die, die zuerst im Pfad steht. Welche das ist, hängt von der Reihenfolge ab – auch von der, in der ein Server seine Ordner liest.", meldung: "" },
      modulpfad: { gut: true, text: "Zwei Module mit demselben Namen lehnt die JVM ab:",
        meldung: "Error occurred during initialization of boot layer\njava.lang.module.FindException: Two versions of module\n  katalog found in lib\n  (katalog-1.0.jar and katalog-0.9.jar)" } },
    { id: "geteilt", knopf: "Zwei JARs, ein Package",
      klassenpfad: { gut: false, text: "Zwei Bibliotheken bringen Klassen im **selben Package** mit („Split Package“). Auf dem Klassenpfad mischen sie sich; was dabei herauskommt, merkt man erst, wenn eine Klasse fehlt oder doppelt ist.", meldung: "" },
      modulpfad: { gut: true, text: "Ein Package gehört genau einem Modul. Der Compiler und die JVM lehnen die Mischung ab:",
        meldung: "error: module app reads package shop.util\n  from both katalog and pdf\n\njava.lang.LayerInstantiationException: Package shop.util\n  in both module katalog and module pdf" } }
  ];

  // ---- 3 · Direktiven und der Modulgraph ----
  const knoten = {
    app: { x: 20, y: 20, name: "app" },
    pdf: { x: 330, y: 20, name: "pdf" },
    katalog: { x: 175, y: 130, name: "katalog" },
    geld: { x: 20, y: 240, name: "geld" },
    jspecify: { x: 330, y: 240, name: "org.jspecify" }
  };
  const kanten = [
    { id: "app-katalog", von: "app", nach: "katalog", text: "requires", direktiven: ["requires", "exports"] },
    { id: "pdf-katalog", von: "pdf", nach: "katalog", text: "requires", direktiven: ["requires", "exports", "qualifiziert"] },
    { id: "katalog-geld", von: "katalog", nach: "geld", text: "requires transitive", direktiven: ["transitive"] },
    { id: "app-geld", von: "app", nach: "geld", text: "liest mit", direktiven: ["transitive"], nurAktiv: true },
    { id: "katalog-jspecify", von: "katalog", nach: "jspecify", text: "requires static", direktiven: ["static"] },
    { id: "pdf-app", von: "pdf", nach: "app", text: "provides → uses", direktiven: ["dienste"], dienst: true }
  ];
  const quelltext = [
    ["// katalog/module-info.java", ""],
    ["module katalog {", ""],
    ["    requires transitive geld;", "transitive"],
    ["    requires static org.jspecify;", "static"],
    ["    exports shop.katalog;", "exports"],
    ["    exports shop.katalog.export;", "exports"],
    ["    exports shop.katalog.intern to pdf;", "qualifiziert"],
    ["    opens shop.katalog.daten;", "opens"],
    ["}", ""],
    ["", ""],
    ["// pdf/module-info.java", ""],
    ["module pdf {", ""],
    ["    requires katalog;", "requires"],
    ["    provides shop.katalog.export.Exportformat", "dienste"],
    ["        with shop.pdf.PdfFormat;", "dienste"],
    ["}", ""],
    ["", ""],
    ["// app/module-info.java", ""],
    ["module app {", ""],
    ["    requires katalog;", "requires"],
    ["    uses shop.katalog.export.Exportformat;", "dienste"],
    ["}", ""]
  ];
  const direktiven = [
    { id: "requires", knopf: "requires",
      text: "**Ich brauche dieses Modul.** Ein Modul sieht nur die Module, die es liest. `java.base` liest jedes Modul von selbst, alles andere steht hier.",
      ohne: "Fehlt die Zeile, meldet der Compiler:", meldung: "error: package shop.katalog is not visible\n  (package shop.katalog is declared in module katalog,\n   but module app does not read it)" },
    { id: "transitive", knopf: "requires transitive",
      text: "**Wer mich liest, liest das mit.** Die API von `katalog` gibt Beträge aus `geld` zurück; mit `transitive` kann `app` sie nutzen, ohne `geld` selbst zu nennen. Gedacht für Module, deren Typen in der eigenen API auftauchen.",
      ohne: "Ohne `transitive` scheitert `app` an einem Typ, den es über `katalog` bekommt:", meldung: "error: package shop.geld is not visible\n  (package shop.geld is declared in module geld,\n   but module app does not read it)" },
    { id: "static", knopf: "requires static",
      text: "**Nur zum Übersetzen.** Typischer Fall: Annotationen wie `@Nullable`, die zur Laufzeit niemand braucht. Zur Laufzeit muss das Modul nicht da sein; wird es nicht anderweitig gebraucht, löst die JVM es gar nicht erst auf.",
      ohne: "", meldung: "" },
    { id: "exports", knopf: "exports",
      text: "**Das ist meine API.** Nur die `public`-Typen exportierter Packages sind von außen erreichbar – zum Übersetzen und zur Laufzeit. `public` heißt damit nicht mehr „für alle“, sondern „für alle, die das Package sehen“.",
      ohne: "Ein nicht exportiertes Package – auch eines mit `public`-Klassen:", meldung: "error: package shop.katalog.intern is not visible\n  (package shop.katalog.intern is declared in module katalog,\n   which does not export it)" },
    { id: "qualifiziert", knopf: "exports … to",
      text: "**Nur für bestimmte Module.** Ein Package wird genau den genannten Modulen gezeigt, etwa einem Exportformat aus demselben Haus. Das hält die Kopplung sichtbar, statt das Package für alle zu öffnen.",
      ohne: "Übersetzt man `katalog` allein, warnt javac, dass es das Zielmodul noch nicht kennt – das ist harmlos:", meldung: "warning: module not found: pdf" },
    { id: "opens", knopf: "opens",
      text: "**Für Reflection, auch auf Privates.** Frameworks wie JSON-Binding, JPA oder CDI greifen zur Laufzeit per Reflection auf Felder zu. Das geht nur in geöffneten Packages. `opens` ohne `exports` erlaubt Reflection, aber keinen Zugriff beim Übersetzen; `open module` öffnet alle Packages.",
      ohne: "Ohne `opens` scheitert der Griff auf ein privates Feld:", meldung: "java.lang.reflect.InaccessibleObjectException: Unable to make field\n  private java.lang.String shop.katalog.daten.Artikel.name accessible:\n  module katalog does not \"opens shop.katalog.daten\" to module …" },
    { id: "dienste", knopf: "uses / provides",
      text: "**Ein Erweiterungspunkt ohne feste Kopplung.** `app` kennt nur das Interface `Exportformat` und fragt den `ServiceLoader`; `pdf` meldet seine Umsetzung mit `provides` an. Kein Modul nennt das andere – der Pfeil steht für die Absprache über das Interface.",
      ohne: "Ohne `uses` verweigert der `ServiceLoader` die Arbeit. Ohne `provides` findet er nichts – eine Datei unter `META-INF/services` beachtet die JVM in einem benannten Modul nicht:", meldung: "java.util.ServiceConfigurationError: shop.katalog.export.Exportformat:\n  module app does not declare `uses`" }
  ];

  const zustand = { panne: "doppelt", direktive: "requires" };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function text(s) {
    return esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function färben(zeile) {
    if (!zeile) return "";
    if (window.skr && window.skr.highlight) return window.skr.highlight.code(zeile, "java");
    return esc(zeile);
  }
  function meldung(m) { return m ? "<pre><code>" + esc(m) + "</code></pre>" : ""; }
  // Neu eingesetzte Codeblöcke meldet die Seite dem Skriptorium (`skr-content-added`):
  // Läuft einer waagerecht über, gibt es ihm einen Haltepunkt in der Tabulatorreihenfolge.
  function inhaltMelden(id) {
    document.getElementById(id).dispatchEvent(new CustomEvent("skr-content-added", { bubbles: true }));
  }
  function urteil(gut, inhalt) {
    return '<p class="mx-ergebnis mx-ergebnis--' + (gut ? "gut" : "schlecht") + '">' + (gut ? "✓ fällt sofort auf" : "✗ fällt spät oder gar nicht auf") + "</p>" + inhalt;
  }

  function knöpfe(boxId, einträge, aktiv, wahl) {
    const box = document.getElementById(boxId);
    box.innerHTML = einträge.map(function (e) {
      return '<button type="button" class="mx-knopf" data-id="' + esc(e.id) + '" aria-pressed="' + String(aktiv(e.id)) + '">' + esc(e.knopf) + "</button>";
    }).join("");
    box.onclick = function (ereignis) {
      const k = ereignis.target.closest(".mx-knopf");
      if (k) wahl(k.dataset.id);
    };
  }

  function pannenZeichnen() {
    const p = pannen.find(function (x) { return x.id === zustand.panne; });
    document.getElementById("mx-klassenpfad").innerHTML = urteil(p.klassenpfad.gut, "<p>" + text(p.klassenpfad.text) + "</p>" + meldung(p.klassenpfad.meldung));
    document.getElementById("mx-modulpfad").innerHTML = urteil(p.modulpfad.gut, "<p>" + text(p.modulpfad.text) + "</p>" + meldung(p.modulpfad.meldung));
    inhaltMelden("mx-klassenpfad");
    inhaltMelden("mx-modulpfad");
    knöpfe("mx-pannen", pannen, function (id) { return id === zustand.panne; }, function (id) { setzen("panne", id); });
  }

  const breite = 170, höhe = 40;
  function mitte(k) { return { x: k.x + breite / 2, y: k.y + höhe / 2 }; }
  function randpunkt(von, nach) {
    // Schnittpunkt der Linie Mitte→Mitte mit dem Rand des Zielkastens
    const a = mitte(von), b = mitte(nach);
    const dx = a.x - b.x, dy = a.y - b.y;
    const sx = Math.abs(dx) > 0 ? (breite / 2) / Math.abs(dx) : Infinity;
    const sy = Math.abs(dy) > 0 ? (höhe / 2) / Math.abs(dy) : Infinity;
    const s = Math.min(sx, sy);
    return { x: b.x + dx * s, y: b.y + dy * s };
  }

  function graphZeichnen() {
    const d = zustand.direktive;
    const teile = ['<svg viewBox="0 0 520 300" role="img" aria-labelledby="mx-graph-titel"><title id="mx-graph-titel">Modulgraph: ' + esc(beschreibung()) + "</title>",
      '<defs><marker id="mx-spitze" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mx-pfeil" d="M0,0 L10,5 L0,10 z"/></marker>',
      '<marker id="mx-spitze-aktiv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="mx-pfeil--aktiv" d="M0,0 L10,5 L0,10 z"/></marker></defs>'];
    kanten.forEach(function (k) {
      const aktiv = k.direktiven.indexOf(d) !== -1;
      if (k.nurAktiv && !aktiv) return;
      const a = randpunkt(knoten[k.nach], knoten[k.von]), b = randpunkt(knoten[k.von], knoten[k.nach]);
      const klasse = "mx-kante" + (k.dienst || k.nurAktiv ? " mx-kante--dienst" : "") + (aktiv ? " mx-kante--aktiv" : "");
      teile.push('<line class="' + klasse + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" marker-end="url(#' + (aktiv ? "mx-spitze-aktiv" : "mx-spitze") + ')"/>');
      const tx = (a.x + b.x) / 2, ty = (a.y + b.y) / 2 - 6;
      teile.push('<text class="mx-kantentext' + (aktiv ? " mx-kantentext--aktiv" : "") + '" x="' + tx + '" y="' + ty + '" text-anchor="middle">' + esc(k.text) + "</text>");
    });
    Object.keys(knoten).forEach(function (id) {
      const k = knoten[id];
      teile.push('<g class="mx-knoten"><rect x="' + k.x + '" y="' + k.y + '" width="' + breite + '" height="' + höhe + '" rx="6"/><text x="' + (k.x + breite / 2) + '" y="' + (k.y + 25) + '" text-anchor="middle">' + esc(k.name) + "</text></g>");
    });
    teile.push("</svg>");
    document.getElementById("mx-graph").innerHTML = teile.join("");
  }
  function beschreibung() {
    const dir = direktiven.find(function (x) { return x.id === zustand.direktive; });
    const aktiv = kanten.filter(function (k) { return k.direktiven.indexOf(zustand.direktive) !== -1; })
      .map(function (k) { return knoten[k.von].name + " " + k.text + " " + knoten[k.nach].name; });
    return dir.knopf + (aktiv.length ? " – " + aktiv.join("; ") : " – betrifft nur katalog");
  }

  function direktiveZeichnen() {
    const dir = direktiven.find(function (x) { return x.id === zustand.direktive; });
    document.getElementById("mx-code").innerHTML = quelltext.map(function (z) {
      const html = färben(z[0]);
      return z[1] === dir.id ? '<span class="mx-zeile--aktiv">' + html + "</span>" : html;
    }).join("\n");
    document.getElementById("mx-erklaerung").innerHTML = "<p>" + text(dir.text) + "</p>" + (dir.ohne ? "<p>" + text(dir.ohne) + "</p>" : "") + meldung(dir.meldung);
    inhaltMelden("mx-erklaerung");
    graphZeichnen();
    knöpfe("mx-direktiven", direktiven, function (id) { return id === zustand.direktive; }, function (id) { setzen("direktive", id); });
  }

  function zeichnen() {
    pannenZeichnen();
    direktiveZeichnen();
  }

  function setzen(schlüssel, wert) {
    zustand[schlüssel] = wert;
    const fokus = document.activeElement && document.activeElement.classList.contains("mx-knopf")
      ? { box: document.activeElement.parentElement.id, id: document.activeElement.dataset.id } : null;
    zeichnen();
    if (fokus) {
      const k = document.querySelector("#" + fokus.box + ' .mx-knopf[data-id="' + fokus.id + '"]');
      if (k) k.focus();
    }
    if (window.skr && window.skr.state) window.skr.state.update();
  }

  function gültig(liste, wert, vorgabe) {
    return liste.some(function (e) { return e.id === wert; }) ? wert : vorgabe;
  }

  function anmelden() {
    if (!(window.skr && window.skr.state)) return;
    const st = window.skr.state;
    st.register({ key: "panne",
      read: function () { return zustand.panne; },
      apply: function (w) { zustand.panne = gültig(pannen, w, "doppelt"); zeichnen(); } });
    st.register({ key: "direktive",
      read: function () { return zustand.direktive; },
      apply: function (w) { zustand.direktive = gültig(direktiven, w, "requires"); zeichnen(); } });
  }

  function start() {
    zeichnen();
    anmelden();
  }
  if (!(window.skr && window.skr.highlight)) {
    document.addEventListener("skr-highlight-ready", function () { zeichnen(); }, { once: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
