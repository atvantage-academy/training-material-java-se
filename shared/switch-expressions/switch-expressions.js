(function () {
  const aufzählung = "enum Status { NEU, BEZAHLT, VERSENDET, STORNIERT }";

  const klassisch = [
    "static String text(Status status) {",
    "    String text;",
    "    switch (status) {",
    "        case NEU:",
    "            text = \"wartet auf Zahlung\";",
    "            break;",
    "        case BEZAHLT:",
    "        case VERSENDET:",
    "            text = \"in Bearbeitung\";",
    "            break;",
    "        case STORNIERT:",
    "            text = \"storniert\";",
    "            break;",
    "        default:",
    "            throw new IllegalStateException(\"Unbekannt: \" + status);",
    "    }",
    "    return text;",
    "}"
  ];
  const durchfall = [
    "static String text(Status status) {",
    "    String text = \"?\";",
    "    switch (status) {",
    "        case NEU:",
    "            text = \"wartet auf Zahlung\";",
    "            // break vergessen",
    "        case BEZAHLT:",
    "        case VERSENDET:",
    "            text = \"in Bearbeitung\";",
    "            break;",
    "        case STORNIERT:",
    "            text = \"storniert\";",
    "            break;",
    "    }",
    "    return text;",
    "}"
  ];
  const pfeil = [
    "static String text(Status status) {",
    "    return switch (status) {",
    "        case NEU -> \"wartet auf Zahlung\";",
    "        case BEZAHLT, VERSENDET -> \"in Bearbeitung\";",
    "        case STORNIERT -> \"storniert\";",
    "    };",
    "}"
  ];
  const mitYield = [
    "static String text(Status status, int tage) {",
    "    return switch (status) {",
    "        case NEU -> {",
    "            if (tage > 14) {",
    "                yield \"Zahlung überfällig\";",
    "            }",
    "            yield \"wartet auf Zahlung\";",
    "        }",
    "        case BEZAHLT, VERSENDET -> \"in Bearbeitung\";",
    "        case STORNIERT -> \"storniert\";",
    "    };",
    "}"
  ];
  const unvollständig = [
    "static String text(Status status) {",
    "    return switch (status) {",
    "        case NEU -> \"wartet auf Zahlung\";",
    "        case BEZAHLT, VERSENDET -> \"in Bearbeitung\";",
    "        // case STORNIERT fehlt",
    "    };",
    "}"
  ];

  // Ausgaben und Meldungen gemessen mit Temurin 25.
  const stufen = [
    { id: "8", label: "8", unter: "Anweisung", titel: "Klassisch: Anweisung mit break", marken: ["Java 1.0 bis heute"],
      code: [aufzählung, ""].concat(klassisch),
      neu: "Der `switch` ist eine **Anweisung**: Er hat keinen Wert, deshalb die Hilfsvariable `text`. Jeder Fall endet mit `break`; zwei Konstanten teilen sich einen Fall, indem der erste leer **durchfällt**.",
      weg: "–",
      probe: "`text(Status.NEU)` → `wartet auf Zahlung`. Der `default` ist hier nötig, sonst meldet der Compiler `variable text might not have been initialized`." },
    { id: "durchfall", label: "break?", unter: "Fehler", titel: "Der Klassiker: vergessenes break", marken: ["Java 1.0 bis heute"],
      code: [aufzählung, ""].concat(durchfall),
      neu: "Ein `break` fehlt – und der Code übersetzt trotzdem. Nach `case NEU` läuft die Ausführung in den nächsten Fall weiter und überschreibt `text`.",
      weg: "Ein `break` – und mit ihm die Sicherheit.",
      probe: "`text(Status.NEU)` → `in Bearbeitung`. Kein Compilerfehler, keine Warnung ohne `-Xlint:fallthrough` – der Fehler zeigt sich erst im Test." },
    { id: "14", label: "14", unter: "LTS 17", titel: "Pfeil-Syntax als Ausdruck", marken: ["Java 14", "JEP 361", "LTS 17"],
      code: [aufzählung, ""].concat(pfeil),
      neu: "`case … ->` fällt **nie** durch. Der `switch` ist ein **Ausdruck** und liefert seinen Wert direkt an `return`. Mehrere Konstanten stehen mit Komma in einem Fall.",
      weg: "Alle `break`, die Hilfsvariable – und der `default`: Über ein Enum ist der Ausdruck mit allen vier Konstanten vollständig.",
      probe: "`text(Status.VERSENDET)` → `in Bearbeitung`. Mit `--release 13`: `switch expressions are not supported in -source 13`." },
    { id: "yield", label: "yield", unter: "LTS 17", titel: "Ein Block mit yield", marken: ["Java 14", "JEP 361", "LTS 17"],
      code: [aufzählung, ""].concat(mitYield),
      neu: "Braucht ein Fall mehr als einen Ausdruck, steht rechts vom Pfeil ein **Block**. `yield` gibt seinen Wert zurück – `return` würde die ganze Methode verlassen.",
      weg: "–",
      probe: "`text(Status.NEU, 20)` → `Zahlung überfällig`. `yield` ist kein reserviertes Wort: Als Variablenname bleibt es erlaubt, nur eine eigene Methode `yield()` lässt sich nicht mehr unqualifiziert aufrufen." },
    { id: "vollstaendig", label: "✓?", unter: "Prüfung", titel: "Der Compiler prüft mit", marken: ["Java 14", "JEP 361", "LTS 17"],
      code: [aufzählung, ""].concat(unvollständig),
      neu: "Ein `switch`-**Ausdruck** muss für jeden möglichen Wert ein Ergebnis haben. Fehlt eine Konstante des Enums, übersetzt er nicht – kommt eine fünfte dazu, meldet der Compiler jede Stelle.",
      weg: "Der Laufzeitfehler aus dem `default` – er wird zum Übersetzungsfehler.",
      probe: "`error: the switch expression does not cover all possible input values`. Als **Anweisung** (ohne Ergebnis) muss ein `switch` über ein Enum dagegen weiterhin nicht vollständig sein." }
  ];

  let aktuell = 0;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function text(s) {
    return esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function färben(zeile) {
    if (!zeile) return " ";
    if (window.skr && window.skr.highlight) return window.skr.highlight.code(zeile, "java");
    return esc(zeile);
  }
  if (!(window.skr && window.skr.highlight)) {
    document.addEventListener("skr-highlight-ready", function () { zeichnen(); }, { once: true });
  }

  function aufbauen() {
    const box = document.getElementById("swx-stufen");
    box.innerHTML = stufen.map(function (s, i) {
      return '<button type="button" class="swx-stufe" data-i="' + i + '"><b>' + esc(s.label) + "</b><span>" + esc(s.unter) + "</span></button>";
    }).join("");
    box.addEventListener("click", function (e) {
      const k = e.target.closest(".swx-stufe");
      if (k) wählen(Number(k.dataset.i));
    });
    document.getElementById("swx-zurueck").addEventListener("click", function () { wählen(aktuell - 1); });
    document.getElementById("swx-weiter").addEventListener("click", function () { wählen(aktuell + 1); });
    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { wählen(aktuell + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { wählen(aktuell - 1); e.preventDefault(); }
    });
    document.getElementById("swx-druck").innerHTML = stufen.map(function (s) {
      return "<section><h3>" + esc(s.titel) + " (" + esc(s.marken.join(" · ")) + ")</h3><p>" + text(s.neu) + "</p><p>" + text(s.probe) + "</p><pre>" + esc(s.code.join("\n")) + "</pre></section>";
    }).join("");
  }

  function wählen(i) {
    if (i < 0 || i >= stufen.length || i === aktuell) return;
    aktuell = i;
    zeichnen();
    if (window.skr && window.skr.state) window.skr.state.update();
    const knopf = document.querySelector('.swx-stufe[data-i="' + i + '"]');
    if (knopf && document.activeElement && document.activeElement.classList.contains("swx-stufe")) knopf.focus();
  }

  function zeichnen() {
    const s = stufen[aktuell];
    const vorher = aktuell > 0 ? stufen[aktuell - 1].code : null;
    document.querySelectorAll(".swx-stufe").forEach(function (k, i) {
      k.setAttribute("aria-pressed", String(i === aktuell));
      k.classList.toggle("is-vorbei", i < aktuell);
    });
    document.getElementById("swx-zurueck").disabled = aktuell === 0;
    document.getElementById("swx-weiter").disabled = aktuell === stufen.length - 1;
    document.getElementById("swx-code").innerHTML = s.code.map(function (z) {
      const neu = vorher && z.trim() !== "" && vorher.indexOf(z) === -1;
      return '<span class="swx-zeile' + (neu ? " is-neu" : "") + '">' + färben(z) + "</span>";
    }).join("");
    document.getElementById("swx-info").innerHTML =
      "<h2>" + esc(s.titel) + "</h2>"
      + '<p class="swx-marken-stufe">' + s.marken.map(function (m) {
          return '<span class="skr-badge">' + esc(m) + "</span>";
        }).join(" ") + "</p>"
      + "<h3>Neu</h3><p>" + text(s.neu) + "</p>"
      + "<h3>Fällt weg</h3><p>" + text(s.weg) + "</p>"
      + '<p class="swx-probe">' + text(s.probe) + "</p>";
  }

  function anmelden() {
    if (!(window.skr && window.skr.state)) return;
    window.skr.state.register({
      key: "stufe",
      read: function () { return stufen[aktuell].id; },
      apply: function (wert) {
        const i = stufen.findIndex(function (s) { return s.id === wert; });
        aktuell = i >= 0 ? i : 0;
        zeichnen();
      }
    });
  }

  function start() {
    aufbauen();
    zeichnen();
    anmelden();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
