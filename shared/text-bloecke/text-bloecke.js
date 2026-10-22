(function () {
  // Inhaltszeilen ohne den Einzug des Quelltexts; im Quelltext stehen sie 12 Spalten tief.
  const beispiele = [
    { id: "json", knopf: "JSON", variable: "json",
      zeilen: ["{", "  \"artikel\": \"Tasse\",", "  \"menge\": 2", "}"],
      text: "Die Einrückung **innerhalb** des JSON (zwei Leerzeichen vor den Schlüsseln) bleibt, der Einzug des Quelltexts fällt weg." },
    { id: "umbruch", knopf: "Lange Zeile mit \\", variable: "satz",
      zeilen: ["Eine sehr lange Zeile, \\", "die im Quelltext umbricht."],
      text: "Das `\\` am Zeilenende unterdrückt den Umbruch: Aus zwei Zeilen im Quelltext wird eine in der Zeichenkette." },
    { id: "leerzeichen", knopf: "Leerzeichen am Ende mit \\s", variable: "tabelle",
      zeilen: ["Spalte1   \\s", "Spalte2   "],
      text: "In beiden Zeilen stehen drei Leerzeichen am Ende. Bei `Spalte2` entfernt sie der Compiler; bei `Spalte1` beendet `\\s` die Zeile, die Leerzeichen davor bleiben – und `\\s` wird selbst zu einem." }
  ];
  const enden = [
    { id: "unter", knopf: "unter dem Inhalt", spalte: 12 },
    { id: "links", knopf: "4 weiter links", spalte: 8 },
    { id: "zeile", knopf: "am Ende der letzten Zeile", spalte: null }
  ];
  const einzugInhalt = 12;

  const zustand = { beispiel: "json", ende: "unter" };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function text(s) {
    return esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function leer(n) { return " ".repeat(n); }
  function färben(roh) {
    if (window.skr && window.skr.highlight) return window.skr.highlight.code(roh, "java");
    return esc(roh);
  }

  function quellzeilen(b, e) {
    const zeilen = ["        String " + b.variable + " = \"\"\""];
    b.zeilen.forEach(function (z, i) {
      const letzte = i === b.zeilen.length - 1;
      zeilen.push(leer(einzugInhalt) + z + (letzte && e.spalte === null ? "\"\"\";" : ""));
    });
    if (e.spalte !== null) zeilen.push(leer(e.spalte) + "\"\"\";");
    return zeilen;
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
    return { wert: roh, kleinste: kleinste };
  }

  function sichtbar(s) {
    return esc(s).replace(/ /g, '<span class="tb-z">·</span>').replace(/\n/g, '<span class="tb-z">↵</span>\n');
  }
  function literal(s) {
    const teile = s.split("\n");
    const stücke = teile.map(function (t, i) {
      const umbruch = i < teile.length - 1 ? "\\n" : "";
      return "\"" + t.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + umbruch + "\"";
    }).filter(function (t) { return t !== "\"\""; });
    return "String wert = " + (stücke.length ? stücke.join("\n           + ") : "\"\"") + ";";
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

  function zeichnen() {
    const b = beispiele.find(function (x) { return x.id === zustand.beispiel; }) || beispiele[0];
    const e = enden.find(function (x) { return x.id === zustand.ende; }) || enden[0];
    knöpfe("tb-beispiel", beispiele, b.id, "beispiel");
    knöpfe("tb-ende", enden, e.id, "ende");
    document.getElementById("tb-quelle").innerHTML = färben(quellzeilen(b, e).join("\n"));
    const r = ergebnis(b, e);
    document.getElementById("tb-ergebnis").innerHTML = sichtbar(r.wert);
    document.getElementById("tb-literal").innerHTML = färben(literal(r.wert));
    let erklärung = "Entfernt werden **" + r.kleinste + " Leerzeichen** je Zeile – die kleinste Einrückung";
    if (e.spalte === null) erklärung += " der Inhaltszeilen. Die schließenden `\"\"\"` stehen am Ende der letzten Zeile, deshalb fehlt der letzte Zeilenumbruch.";
    else if (e.spalte < einzugInhalt) erklärung += ", hier die der schließenden `\"\"\"`. Jede Zeile behält " + (einzugInhalt - e.spalte) + " Leerzeichen Einzug.";
    else erklärung += ". Die schließenden `\"\"\"` stehen genau unter dem Inhalt und ändern nichts; der letzte Zeilenumbruch bleibt.";
    document.getElementById("tb-erklaerung").innerHTML = "<p>" + text(erklärung) + "</p><p>" + text(b.text) + "</p>";
  }

  function anmelden() {
    if (!(window.skr && window.skr.state)) return;
    window.skr.state.register({ key: "beispiel",
      read: function () { return zustand.beispiel; },
      apply: function (w) { zustand.beispiel = beispiele.some(function (x) { return x.id === w; }) ? w : "json"; zeichnen(); } });
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
