(function () {
  // Alle Abläufe und Meldungen gemessen mit Temurin 25 (die Preview-Meldung mit Corretto 22).

  // TEIL 3 – ein Programm, Schritt für Schritt: welche Zeile läuft, welche Bindungen
  // gelten (innerste zuletzt) und was bis dahin ausgegeben ist.
  const programm = [
    "static final ScopedValue<String> ANFRAGE =",
    "        ScopedValue.newInstance();",
    "",
    "static void schreibe(String wo) {",
    "    System.out.println(wo + \": \" + ANFRAGE.get());",
    "}",
    "",
    "// in main:",
    "System.out.println(ANFRAGE.isBound());",
    "ScopedValue.where(ANFRAGE, \"A-1\").run(() -> {",
    "    schreibe(\"innen\");",
    "    ScopedValue.where(ANFRAGE, \"A-2\").run(() ->",
    "        schreibe(\"geschachtelt\"));",
    "    schreibe(\"wieder außen\");",
    "});",
    "System.out.println(ANFRAGE.isBound());"
  ];
  const schritte = [
    { zeile: 8, bindungen: [], ausgabe: "false",
      text: "Vor `where` ist `ANFRAGE` **ungebunden**: `isBound()` liefert `false`, `get()` würde werfen." },
    { zeile: 9, bindungen: ["A-1"], ausgabe: "",
      text: "`where` bindet `A-1`, `run` führt die Aufgabe aus. Die Bindung gilt **nur innerhalb** dieses Aufrufs." },
    { zeile: 10, bindungen: ["A-1"], ausgabe: "innen: A-1", liest: true,
      text: "`schreibe` liest mit `ANFRAGE.get()` (oben markiert) – ohne dass der Wert als Parameter übergeben wurde." },
    { zeile: 11, bindungen: ["A-1", "A-2"], ausgabe: "",
      text: "Eine **geschachtelte** Bindung: `A-2` verdeckt `A-1` für den inneren Aufruf. Geändert wird `A-1` dabei nicht." },
    { zeile: 12, bindungen: ["A-1", "A-2"], ausgabe: "geschachtelt: A-2", liest: true,
      text: "Innen gilt die innerste Bindung." },
    { zeile: 13, bindungen: ["A-1"], ausgabe: "wieder außen: A-1", liest: true,
      text: "Der innere Aufruf ist zu Ende, seine Bindung ist **weg** – `A-1` gilt wieder, ohne dass jemand etwas zurückgesetzt hat." },
    { zeile: 14, bindungen: [], ausgabe: "",
      text: "Der äußere Aufruf endet. Das ist das „Löschen“: Es gibt kein `remove()`, die Bindung endet mit dem Aufruf – auch wenn darin eine Ausnahme fliegt." },
    { zeile: 15, bindungen: [], ausgabe: "false",
      text: "Danach ist `ANFRAGE` wieder ungebunden." }
  ];

  // TEIL 4 – Fehlerfälle: Code, Urteil, gemessene Meldung, Erklärung.
  const fehlerFälle = [
    { id: "get", knopf: "get() ohne Bindung",
      code: ["static final ScopedValue<String> ANFRAGE = ScopedValue.newInstance();", "",
             "String kennung = ANFRAGE.get();   // nirgends gebunden"],
      gut: false, meldung: "java.util.NoSuchElementException: ScopedValue not bound",
      text: "Zur Laufzeit. Wer nicht sicher ist, ob gebunden wurde, fragt `isBound()` oder liest mit `orElse(…)`." },
    { id: "set", knopf: "set(…) gibt es nicht",
      code: ["static final ScopedValue<String> ANFRAGE = ScopedValue.newInstance();", "",
             "ANFRAGE.set(\"A-1\");"],
      gut: false, meldung: "error: cannot find symbol\n  symbol:   method set(String)",
      text: "Schon beim Übersetzen: Ein Scoped Value ist **unveränderlich**. Einen anderen Wert gibt es nur über eine neue, geschachtelte Bindung mit `where`." },
    { id: "thread", knopf: "neuer Thread",
      code: ["ScopedValue.where(ANFRAGE, \"A-4\").run(() -> {",
             "    new Thread(() -> System.out.println(ANFRAGE.isBound())).start();",
             "});"],
      gut: true, meldung: "false",
      text: "Übersetzt, aber der neue Thread sieht die Bindung **nicht** – sie gilt nur im Thread, der `run` aufruft. An Kind-Threads weitergeben kann sie nur Structured Concurrency (`StructuredTaskScope`, in JDK 25 noch Preview)." },
    { id: "ausnahme", knopf: "Ausnahme in der Aufgabe",
      code: ["try {",
             "    ScopedValue.where(ANFRAGE, \"A-5\").run(() -> {",
             "        throw new IllegalStateException(\"Fehler in der Aufgabe\");",
             "    });",
             "} catch (IllegalStateException e) {",
             "    System.out.println(ANFRAGE.isBound());",
             "}"],
      gut: true, meldung: "false",
      text: "Kein Fehler des Scoped Value: Auch nach einer Ausnahme ist die Bindung weg. Ein `finally` zum Aufräumen – bei einer `ThreadLocal` Pflicht – entfällt." },
    { id: "preview", knopf: "mit JDK 21 bis 24",
      code: ["static final ScopedValue<String> ANFRAGE = ScopedValue.newInstance();"],
      gut: false, meldung: "error: ScopedValue is a preview API and is disabled by default.",
      text: "Bis Java 24 war die API Preview (JEP 446 bis 487) und nur mit `--enable-preview` zu haben. Final ist sie erst in Java 25 – gemessen mit JDK 22." }
  ];

  const zustand = { schritt: 0, fehler: "get" };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function text(s) {
    return esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function färben(roh) {
    if (window.skr && window.skr.highlight) return window.skr.highlight.code(roh, "java");
    return esc(roh);
  }

  function knöpfe(boxId, einträge, aktiv, wahl) {
    const box = document.getElementById(boxId);
    box.innerHTML = einträge.map(function (e) {
      return '<button type="button" class="sv-knopf" data-id="' + esc(e.id) + '" aria-pressed="' + String(e.id === aktiv) + '">' + esc(e.knopf) + "</button>";
    }).join("");
    box.onclick = function (ereignis) {
      const k = ereignis.target.closest(".sv-knopf");
      if (!k) return;
      wahl(k.dataset.id);
      const neu = document.querySelector("#" + boxId + ' .sv-knopf[data-id="' + k.dataset.id + '"]');
      if (neu) neu.focus();
    };
  }

  function ablaufZeichnen() {
    const s = schritte[zustand.schritt];
    document.getElementById("sv-ablauf-code").innerHTML = programm.map(function (z, i) {
      return '<span class="sv-zeile' + (i === s.zeile || (s.liest && i === 4) ? " sv-zeile--aktiv" : "") + '">' + färben(z) + "</span>";
    }).join("\n");
    const stapel = document.getElementById("sv-stapel");
    stapel.innerHTML = s.bindungen.length
      ? s.bindungen.slice().reverse().map(function (b, i) {
          return '<div class="sv-bindung' + (i === 0 ? " sv-bindung--gilt" : "") + '">' + esc(b) + (i === 0 ? " <small>gilt</small>" : " <small>verdeckt</small>") + "</div>";
        }).join("")
      : '<div class="sv-bindung sv-bindung--leer">ungebunden</div>';
    const bisher = schritte.slice(0, zustand.schritt + 1).map(function (x) { return x.ausgabe; }).filter(Boolean);
    document.getElementById("sv-ausgabe").textContent = bisher.join("\n") || " ";
    document.getElementById("sv-erklaerung").innerHTML = text(s.text);
    knöpfe("sv-schritte",
      [{ id: "zurück", knopf: "◀ Zurück" }, { id: "weiter", knopf: "Weiter ▶" }, { id: "anfang", knopf: "Von vorn" }],
      null,
      function (id) {
        const n = id === "anfang" ? 0 : Math.min(schritte.length - 1, Math.max(0, zustand.schritt + (id === "weiter" ? 1 : -1)));
        setzen("schritt", n);
      });
    const knopf = document.querySelectorAll("#sv-schritte .sv-knopf");
    knopf[0].disabled = zustand.schritt === 0;
    knopf[1].disabled = zustand.schritt === schritte.length - 1;
  }

  function fehlerZeichnen() {
    const f = fehlerFälle.find(function (x) { return x.id === zustand.fehler; }) || fehlerFälle[0];
    document.getElementById("sv-fehler-code").innerHTML = färben(f.code.join("\n"));
    document.getElementById("sv-fehler-urteil").innerHTML =
      '<p class="sv-ergebnis sv-ergebnis--' + (f.gut ? "gut" : "schlecht") + '">' + (f.gut ? "✓ übersetzt und läuft – Ausgabe:" : "✗ " + (f.id === "get" ? "wirft zur Laufzeit:" : "übersetzt nicht:")) + "</p>"
      + '<pre class="sv-meldung"><code>' + esc(f.meldung) + "</code></pre><p>" + text(f.text) + "</p>";
    knöpfe("sv-fehler", fehlerFälle, f.id, function (id) { setzen("fehler", id); });
    // Der eingefügte Block mit der Meldung kann überlaufen: dem Skriptorium melden.
    document.getElementById("sv-fehler-urteil").dispatchEvent(new CustomEvent("skr-content-added", { bubbles: true }));
  }

  function zeichnen() {
    ablaufZeichnen();
    fehlerZeichnen();
  }

  function setzen(schlüssel, wert) {
    zustand[schlüssel] = wert;
    zeichnen();
    if (window.skr && window.skr.state) window.skr.state.update();
  }

  function anmelden() {
    if (!(window.skr && window.skr.state)) return;
    window.skr.state.register({ key: "schritt",
      read: function () { return zustand.schritt ? String(zustand.schritt + 1) : ""; },
      apply: function (w) { const n = parseInt(w, 10); zustand.schritt = n >= 1 && n <= schritte.length ? n - 1 : 0; zeichnen(); } });
    window.skr.state.register({ key: "fehler",
      read: function () { return zustand.fehler === "get" ? "" : zustand.fehler; },
      apply: function (w) { zustand.fehler = fehlerFälle.some(function (x) { return x.id === w; }) ? w : "get"; zeichnen(); } });
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
