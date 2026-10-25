(function () {
  // Inhaltszeilen ohne den Einzug des Quelltexts; im Quelltext stehen sie 4 Spalten tief.
  const beispiele = [
    { id: "json", knopf: "JSON", variable: "json",
      zeilen: ["{", "  \"artikel\": \"Tasse\",", "  \"menge\": 2", "}"] },
    { id: "umbruch", knopf: "Lange Zeile mit \\", variable: "satz",
      zeilen: ["Eine sehr lange Zeile, \\", "die im Quelltext umbricht."] },
    { id: "leerzeichen", knopf: "Leerzeichen am Ende mit \\s", variable: "tabelle",
      zeilen: ["Spalte1   \\s", "Spalte2   "] },
    { id: "formatted", knopf: "Werte mit formatted()", variable: "json",
      vorweg: ["String artikel = \"Tasse\";", "int menge = 2;"],
      zeilen: ["{", "  \"artikel\": \"%s\",", "  \"menge\": %d", "}"],
      aufruf: ".formatted(artikel, menge)", werte: ["Tasse", "2"] }
  ];
  const enden = [
    { id: "unter", knopf: "unter dem Inhalt", spalte: 4 },
    { id: "links", knopf: "4 weiter links", spalte: 0 },
    { id: "zeile", knopf: "am Ende der letzten Zeile", spalte: null }
  ];
  const einzugInhalt = 4;

  const zustand = { ende: "unter" };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function leer(n) { return " ".repeat(n); }
  function färben(roh) {
    if (window.skr && window.skr.highlight) return window.skr.highlight.code(roh, "java");
    return esc(roh);
  }

  function quellzeilen(b, e) {
    const schluss = "\"\"\"" + (b.aufruf || "") + ";";
    const zeilen = (b.vorweg || []).concat(["String " + b.variable + " = \"\"\""]);
    b.zeilen.forEach(function (z, i) {
      const letzte = i === b.zeilen.length - 1;
      zeilen.push(leer(einzugInhalt) + z + (letzte && e.spalte === null ? schluss : ""));
    });
    if (e.spalte !== null) zeilen.push(leer(e.spalte) + schluss);
    return zeilen;
  }

  // formatted(): die Platzhalter %s und %d der Reihe nach durch die Werte ersetzen.
  function einsetzen(s, werte) {
    let i = 0;
    return s.replace(/%[sd]/g, function () { return werte[i++]; });
  }

  // Verfahren nach JLS § 3.10.6: Zeilen samt schließender Zeile, kleinste Einrückung
  // der nicht leeren Zeilen entfernen, Leerzeichen am Zeilenende entfernen, dann Escapes.
  function ergebnis(b, e) {
    const inhalt = b.zeilen.map(function (z) { return leer(einzugInhalt) + z; });
    const alle = e.spalte === null ? inhalt.slice() : inhalt.concat([leer(e.spalte)]);
    const maßgeblich = alle.filter(function (z, i) {
      return z.trim() !== "" || (e.spalte !== null && i === alle.length - 1);
    });
    const kleinste = Math.min.apply(null, maßgeblich.map(function (z) { return z.length - z.replace(/^ +/, "").length; }));
    let zeilen = inhalt.map(function (z) { return z.slice(kleinste).replace(/[ \t]+$/, ""); });
    let roh = zeilen.join("\n") + (e.spalte === null ? "" : "\n");
    roh = roh.replace(/\\\n/g, "").replace(/\\s/g, " ").replace(/\\"/g, "\"");
    if (b.werte) roh = einsetzen(roh, b.werte);
    return { wert: roh };
  }

  function sichtbar(s) {
    return esc(s).replace(/ /g, '<span class="tb-z">·</span>').replace(/\n/g, '<span class="tb-z">↵</span>\n');
  }
  function knöpfe(boxId, einträge, aktiv, schlüssel) {
    const box = document.getElementById(boxId);
    box.innerHTML = einträge.map(function (e) {
      return '<button type="button" class="tb-knopf" data-id="' + e.id + '" aria-pressed="' + String(e.id === aktiv) + '">' + esc(e.knopf) + "</button>";
    }).join("");
    box.onclick = function (ereignis) {
      const k = ereignis.target.closest(".tb-knopf");
      if (!k) return;
      zustand[schlüssel] = k.dataset.id;
      zeichnen();
      const neu = document.querySelector("#" + boxId + ' .tb-knopf[data-id="' + k.dataset.id + '"]');
      if (neu) neu.focus();
      if (window.skr && window.skr.state) window.skr.state.update();
    };
  }

  // Alle Beispiele stehen je in einem Reiter (skr-tabs); gezeichnet werden alle, damit
  // der Wechsel des Reiters nichts neu berechnen muss.
  function zeichnen() {
    const e = enden.find(function (x) { return x.id === zustand.ende; }) || enden[0];
    knöpfe("tb-ende", enden, e.id, "ende");
    beispiele.forEach(function (b) {
      document.getElementById("tb-quelle-" + b.id).innerHTML = färben(quellzeilen(b, e).join("\n"));
      document.getElementById("tb-ergebnis-" + b.id).innerHTML = sichtbar(ergebnis(b, e).wert);
    });
  }

  function anmelden() {
    if (!(window.skr && window.skr.state)) return;
    window.skr.state.register({ key: "ende",
      read: function () { return zustand.ende; },
      apply: function (w) { zustand.ende = enden.some(function (x) { return x.id === w; }) ? w : "unter"; zeichnen(); } });
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
