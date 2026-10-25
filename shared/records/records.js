(function () {
  // Alle Ausgaben gemessen: javap aus Temurin 17, Compilermeldungen aus javac 25.
  // code ist Java (gefärbt), ausgabe die Programmausgabe oder Compilermeldung dazu.
  const teile = [
    { id: "felder", gruppe: "ja", knopf: "Felder",
      titel: "Je Komponente ein privates, finales Feld",
      text: "Aus jeder Komponente im Kopf wird ein Feld mit `private final`. Das Objekt ist danach **flach unveränderlich**: Die Felder lassen sich nicht neu belegen – ein enthaltenes Objekt wie eine Liste kann sich aber selbst noch ändern.",
      code: "private final java.lang.String artikel;\nprivate final int menge;\nprivate final java.math.BigDecimal einzelpreis;",
      quelle: "javap -p Position.class" },
    { id: "konstruktor", gruppe: "ja", knopf: "Kanonischer Konstruktor",
      titel: "Ein Konstruktor mit allen Komponenten",
      text: "Der **kanonische** Konstruktor nimmt alle Komponenten in ihrer Reihenfolge. Der **kompakte** Konstruktor `public Position { … }` ist sein Rumpf ohne Parameterliste: Er prüft, die Zuweisung an die Felder ergänzt der Compiler danach.",
      code: "public Position(java.lang.String, int, java.math.BigDecimal);\n\nnew Position(\"Tasse\", 0, BigDecimal.ONE)",
      ausgabe: "IllegalArgumentException: Menge muss positiv sein: 0",
      quelle: "javap -p, Programmausgabe" },
    { id: "zugriff", gruppe: "ja", knopf: "Zugriffsmethoden",
      titel: "Je Komponente eine Zugriffsmethode – ohne get",
      text: "Die Methode heißt wie die Komponente: `artikel()`, nicht `getArtikel()`. Wer Code mit Gettern auf einen Record umstellt, ändert deshalb auch **alle Aufrufer** – und jedes Framework, das nach `get…` sucht, muss Records kennen.",
      code: "public java.lang.String artikel();\npublic int menge();\npublic java.math.BigDecimal einzelpreis();",
      quelle: "javap -p Position.class" },
    { id: "methoden", gruppe: "ja", knopf: "equals, hashCode, toString",
      titel: "Gleichheit und Text aus allen Komponenten",
      text: "Zwei Records mit gleichen Werten sind **gleich**, und `toString` zeigt alle Werte. Für eine handgeschriebene Klasse sind das die Methoden, in denen sich beim nächsten neuen Feld ein Fehler versteckt.",
      code: "System.out.println(new Position(\"Tasse\", 2, new BigDecimal(\"4.50\")));\nSystem.out.println(new Position(\"Tasse\", 2, new BigDecimal(\"4.50\"))\n    .equals(new Position(\"Tasse\", 2, new BigDecimal(\"4.50\"))));",
      ausgabe: "Position[artikel=Tasse, menge=2, einzelpreis=4.50]\ntrue",
      quelle: "Programmausgabe" },
    { id: "final", gruppe: "ja", knopf: "final und extends Record",
      titel: "Die Klasse ist final und erbt von java.lang.Record",
      text: "Von einem Record kann niemand erben. Interfaces darf er implementieren – auch ein versiegeltes, und so werden Records zu den Fällen einer abgeschlossenen Hierarchie.",
      code: "public final class Position extends java.lang.Record { … }",
      quelle: "javap -p Position.class" },
    { id: "setter", gruppe: "nein", knopf: "Setter",
      titel: "Keine Setter",
      text: "Die Felder sind `final` – auch eine selbst geschriebene Setter-Methode übersetzt nicht. Eine Änderung ist ein **neues** Objekt.",
      code: "public void setMenge(int menge) { this.menge = menge; }",
      ausgabe: "error: cannot assign a value to final variable menge",
      quelle: "javac 25" },
    { id: "leer", gruppe: "nein", knopf: "Parameterloser Konstruktor",
      titel: "Kein parameterloser Konstruktor",
      text: "Ein Record entsteht immer **vollständig**. Wer ihn leer erzeugen und danach befüllen will – so arbeiten JPA-Entitäten und ältere Mapper –, bekommt einen Fehler. Einen zusätzlichen Konstruktor darf man schreiben, er muss aber an den kanonischen weiterreichen.",
      code: "new Position()",
      ausgabe: "error: constructor Position in record Position cannot be applied to given types;\n  required: String,int,BigDecimal\n  found:    no arguments\n  reason: actual and formal argument lists differ in length",
      quelle: "javac 25" },
    { id: "zusatzfeld", gruppe: "nein", knopf: "Weitere Instanzfelder",
      titel: "Keine Felder außer den Komponenten",
      text: "Der Zustand eines Records ist genau seine Komponenten. Ein zusätzliches Instanzfeld – etwa ein Zwischenspeicher oder eine Versionsnummer – ist verboten; statische Felder sind erlaubt.",
      code: "private int version;",
      ausgabe: "error: field declaration must be static\n  (consider replacing field with record component)",
      quelle: "javac 25" },
    { id: "oberklasse", gruppe: "nein", knopf: "Eigene Oberklasse",
      titel: "Keine eigene Oberklasse, keine Unterklasse",
      text: "Ein Record erbt immer von `java.lang.Record`; `extends` gibt es im Kopf nicht. Frameworks, die eine Klasse zur Laufzeit **ableiten** (Proxies für Lazy Loading, CDI-Scopes), können mit einem Record nichts anfangen.",
      code: "public record Position(…) extends Basis { }",
      ausgabe: "error: '{' expected",
      quelle: "javac 25" }
  ];

  let aktuell = 0;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  // Neu eingesetzte Codeblöcke meldet die Seite dem Skriptorium (`skr-content-added`):
  // Läuft einer waagerecht über, gibt es ihm einen Haltepunkt in der Tabulatorreihenfolge.
  function inhaltMelden(id) {
    document.getElementById(id).dispatchEvent(new CustomEvent("skr-content-added", { bubbles: true }));
  }
  function text(s) {
    return esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function knöpfeBauen() {
    ["ja", "nein"].forEach(function (gruppe) {
      const box = document.getElementById("rec-" + gruppe);
      box.innerHTML = teile.map(function (t, i) {
        if (t.gruppe !== gruppe) return "";
        return '<button type="button" class="rec-knopf" data-i="' + i + '" aria-pressed="false">' + esc(t.knopf) + "</button>";
      }).join("");
      box.addEventListener("click", function (e) {
        const k = e.target.closest(".rec-knopf");
        if (k) wählen(Number(k.dataset.i));
      });
    });
    document.getElementById("rec-druck").innerHTML = teile.map(function (t) {
      return "<section><h3>" + (t.gruppe === "ja" ? "✓ " : "✗ ") + esc(t.titel) + "</h3><p>" + text(t.text) + "</p><pre>" + esc(t.code + (t.ausgabe ? "\n\n" + t.ausgabe : "")) + "</pre></section>";
    }).join("");
  }

  function wählen(i) {
    if (i < 0 || i >= teile.length || i === aktuell) return;
    aktuell = i;
    zeichnen();
    if (window.skr && window.skr.state) window.skr.state.update();
  }

  function zeichnen() {
    const t = teile[aktuell];
    document.querySelectorAll(".rec-knopf").forEach(function (k) {
      k.setAttribute("aria-pressed", String(Number(k.dataset.i) === aktuell));
    });
    document.getElementById("rec-erklaerung").innerHTML =
      '<span class="rec-art rec-art--' + t.gruppe + '">' + (t.gruppe === "ja" ? "✓ Erzeugt der Compiler" : "✗ Gibt es nicht") + "</span>"
      + "<h3>" + esc(t.titel) + "</h3>"
      + "<p>" + text(t.text) + "</p>"
      + '<pre><code class="language-java">' + esc(t.code) + "</code></pre>"
      + (t.ausgabe ? '<p class="rec-art">Ausgabe</p><pre><code>' + esc(t.ausgabe) + "</code></pre>" : "")
      + '<p class="rec-art">' + esc(t.quelle) + "</p>";
    inhaltMelden("rec-erklaerung");
    färben();
  }

  // Gefärbt wird über die Hervorhebung des Skriptoriums (`skr.highlight`); steht sie noch
  // nicht bereit, meldet sie sich mit `skr-highlight-ready`. Ausgaben bleiben ungefärbt.
  function färben() {
    const box = document.getElementById("rec-erklaerung");
    if (window.skr && window.skr.highlight) { window.skr.highlight.apply(box); return; }
    document.addEventListener("skr-highlight-ready", function () { window.skr.highlight.apply(box); }, { once: true });
  }

  function anmelden() {
    if (!(window.skr && window.skr.state)) return;
    window.skr.state.register({
      key: "teil",
      read: function () { return teile[aktuell].id; },
      apply: function (wert) {
        const i = teile.findIndex(function (t) { return t.id === wert; });
        aktuell = i >= 0 ? i : 0;
        zeichnen();
      }
    });
  }

  function start() {
    knöpfeBauen();
    zeichnen();
    anmelden();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
