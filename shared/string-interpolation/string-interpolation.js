(function () {
  // Ausgaben gemessen mit Temurin 25 und Default-Locale de-DE; STR mit Temurin 21 und
  // Corretto 22 (--enable-preview), die Meldung ab 23 mit Temurin 25.
  const stationen = [
    { id: "verkettung", version: "1.0", titel: "Verkettung mit +", art: "verfügbar",
      code: "String text = \"Hallo \" + name + \", Summe \" + summe;",
      ausgabe: "Hallo Ada, Summe 1234.5",
      text: "Der älteste Weg und für wenige Teile der lesbarste. Formatieren kann er nicht: Zahlen erscheinen, wie `toString()` sie liefert – unabhängig vom Locale. Seit Java 9 übersetzt der Compiler `+` in einen einzigen Aufruf zur Laufzeit (JEP 280); die alte Regel „in Schleifen nie `+`“ gilt trotzdem weiter." },
    { id: "stringbuilder", version: "1.0 · 5", titel: "StringBuffer und StringBuilder", art: "verfügbar",
      code: "StringBuilder text = new StringBuilder(\"Hallo \")\n        .append(name)\n        .append(\", Summe \")\n        .append(summe);",
      ausgabe: "Hallo Ada, Summe 1234.5",
      text: "Für Text, der Stück für Stück entsteht – vor allem in Schleifen. `StringBuilder` (Java 5) ist die nicht synchronisierte und damit schnellere Fassung von `StringBuffer`. Lesbar ist das bei kurzen Texten nicht." },
    { id: "messageformat", version: "1.1", titel: "MessageFormat", art: "verfügbar",
      code: "String text = MessageFormat.format(\n        \"Hallo {0}, Summe {1,number,#,##0.00}\", name, summe);",
      ausgabe: "Hallo Ada, Summe 1.234,50",
      text: "Platzhalter mit **Nummer** statt Reihenfolge – gedacht für Übersetzungen, bei denen die Wörter in jeder Sprache anders stehen (zusammen mit `ResourceBundle`). Formatiert nach Locale, die Syntax ist eigen und fehleranfällig (ein einzelnes Hochkomma verschluckt Text)." },
    { id: "format", version: "5", titel: "String.format", art: "verfügbar",
      code: "String text = String.format(\"Hallo %s, Summe %.2f\", name, summe);",
      ausgabe: "Hallo Ada, Summe 1234,50",
      text: "Platzhalter im Stil von `printf` aus C (`java.util.Formatter`): Breite, Nachkommastellen, Datum. Der Text und die Werte stehen getrennt – bei vielen Platzhaltern zählt man nach, welcher Wert zu welchem `%` gehört. Ohne Locale-Argument gilt das Default-Locale." },
    { id: "raw", version: "12", titel: "Raw String Literals – zurückgezogen", art: "zurückgezogen",
      code: "String pfad = `C:\\Programme\\Java`;   // nie erschienen",
      ausgabe: "—",
      text: "Ein erster Anlauf für Zeichenketten ohne Escapes, in Backticks (JEP 326). Er war für Java 12 als Preview vorgesehen und wurde **vor dem Release zurückgezogen** – abgelöst durch die Text-Blöcke. Zum ersten Mal sah man: Ein angekündigtes Sprachmittel ist nicht gesetzt." },
    { id: "textblock", version: "15", titel: "Text-Blöcke und formatted()", art: "verfügbar",
      code: "String text = \"\"\"\n        Hallo %s,\n        Summe %.2f\n        \"\"\".formatted(name, summe);",
      ausgabe: "Hallo Ada,\nSumme 1234,50",
      text: "Text-Blöcke (JEP 378) machen mehrzeiligen Text lesbar, und `formatted()` setzt Werte ein, ohne den Text vorn in `String.format` zu verstecken. Interpolation ist das nicht: Die Platzhalter sind dieselben wie bei `String.format` – samt Default-Locale (siehe Exkurs unten)." },
    { id: "templates", version: "21 · 22", titel: "String Templates (Preview)", art: "preview",
      code: "String text = STR.\"Hallo \\{name}, Du hast \\{menge} Artikel im Korb.\";",
      ausgabe: "Hallo Ada, Du hast 3 Artikel im Korb.",
      text: "Endlich Ausdrücke direkt im Text: `\\{name}`. Davor steht ein **Verarbeiter** (*template processor*): `STR` setzt ein, `FMT` formatiert wie `String.format`, `RAW` liefert die unverarbeitete Vorlage. Eigene Verarbeiter sollten die Gefahr der Interpolation bannen – JEP 430: „Interpolation is especially dangerous for SQL statements because it can lead to injection attacks.“ Ein SQL-Verarbeiter hätte aus der Vorlage ein `PreparedStatement` gemacht. Preview in Java 21 (JEP 430) und 22 (JEP 459), nur mit `--enable-preview`." },
    { id: "rueckzug", version: "23", titel: "Zurückgezogen", art: "zurückgezogen",
      code: "String text = STR.\"Hallo \\{name}\";\n\nerror: illegal escape character",
      ausgabe: "—",
      text: "Die dritte Preview (JEP 465) wurde zurückgezogen; seit Java 23 gibt es String Templates **auch mit `--enable-preview` nicht mehr**. Brian Goetz begründete das im März 2024: Erfassen und Verarbeiten der Vorlage seien „complected, when they should be separate, composable features“ – miteinander verwoben, wo sie getrennt sein sollten. Der neue Ansatz: Eine Vorlage ist ein Wert vom Typ `StringTemplate`, und Bibliotheken nehmen ihn entgegen – keine Verarbeiter, kein `STR.` mehr. Gavin Bierman zog im April 2024 die Folgerung: Es gebe „still a broad range of opinions on exactly what form this feature should take“, deshalb „no string template feature, even with --enable-preview, in JDK 23“. So soll Preview funktionieren: ausprobieren, Rückmeldung, notfalls umentscheiden." },
    { id: "heute", version: "heute", titel: "Was heute verfügbar ist", art: "verfügbar",
      code: "// wenige Teile\nString kurz = \"Hallo \" + name;\n// Formatierung, für Menschen\nString summeText = \"Summe %.2f\".formatted(summe);\n// für Maschinen: Locale festlegen\nString csv = String.format(Locale.ROOT, \"%s;%.2f\", name, summe);\n// SQL: nie zusammensetzen\nPreparedStatement abfrage = verbindung.prepareStatement(\n        \"SELECT * FROM kunde WHERE name = ?\");\nabfrage.setString(1, name);",
      ausgabe: "csv → Ada;1234.50",
      text: "Ein Nachfolger der String Templates hat bisher **keinen JEP**: Die Projektseite von Amber führt nur JEP 465 als zurückgezogen. Bis dahin hat jedes Werkzeug seinen Platz – `+` für wenige Teile, `StringBuilder` in Schleifen, `formatted()` oder `String.format` zum Formatieren, `MessageFormat` für Übersetzungen, Text-Blöcke für mehrere Zeilen. Werte in SQL setzt man über Parameter ein, nie über eine Zeichenkette." }
  ];

  const localeZeilen = [
    { code: "\"Hallo \" + name + \", Summe \" + summe", de: "Hallo Ada, Summe 1234.5", en: "Hallo Ada, Summe 1234.5", abhängig: false },
    { code: "\"Hallo %s, Summe %.2f\".formatted(name, summe)", de: "Hallo Ada, Summe 1234,50", en: "Hallo Ada, Summe 1234.50", abhängig: true },
    { code: "String.format(\"Hallo %s, Summe %.2f\", name, summe)", de: "Hallo Ada, Summe 1234,50", en: "Hallo Ada, Summe 1234.50", abhängig: true },
    { code: "String.format(Locale.ROOT, \"Hallo %s, Summe %.2f\", name, summe)", de: "Hallo Ada, Summe 1234.50", en: "Hallo Ada, Summe 1234.50", abhängig: false },
    { code: "MessageFormat.format(\"Hallo {0}, Summe {1,number,#,##0.00}\", name, summe)", de: "Hallo Ada, Summe 1.234,50", en: "Hallo Ada, Summe 1,234.50", abhängig: true }
  ];
  const locales = [{ id: "de", knopf: "Default-Locale de-DE" }, { id: "en", knopf: "Default-Locale en-US" }];
  const arten = { "verfügbar": "verfügbar", "preview": "Preview", "zurückgezogen": "zurückgezogen" };

  const zustand = { station: 0, locale: "de" };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function text(s) {
    return esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\*([^*]+)\*/g, "<i>$1</i>").replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function färben(roh) {
    if (window.skr && window.skr.highlight) return window.skr.highlight.code(roh, "java");
    return esc(roh);
  }
  function artKlasse(art) { return art === "verfügbar" ? "verfuegbar" : art === "preview" ? "preview" : "zurueck"; }

  function aufbauen() {
    const leiste = document.getElementById("si-leiste");
    leiste.innerHTML = stationen.map(function (s, i) {
      return '<button type="button" class="si-punkt si-punkt--' + artKlasse(s.art) + '" data-i="' + i + '"><b>' + esc(s.version) + "</b><span>" + esc(s.titel) + "</span><em>" + esc(arten[s.art]) + "</em></button>";
    }).join("");
    leiste.addEventListener("click", function (e) {
      const k = e.target.closest(".si-punkt");
      if (k) wählen(Number(k.dataset.i));
    });
    leiste.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { wählen(zustand.station + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { wählen(zustand.station - 1); e.preventDefault(); }
    });
    const knöpfe = document.getElementById("si-locale");
    knöpfe.addEventListener("click", function (e) {
      const k = e.target.closest(".si-knopf");
      if (!k) return;
      zustand.locale = k.dataset.id;
      localeZeichnen();
      const neu = document.querySelector('#si-locale .si-knopf[data-id="' + zustand.locale + '"]');
      if (neu) neu.focus();
      if (window.skr && window.skr.state) window.skr.state.update();
    });
    document.getElementById("si-druck").innerHTML = stationen.map(function (s) {
      return "<section><h3>" + esc(s.version) + " · " + esc(s.titel) + " (" + esc(arten[s.art]) + ")</h3><pre>" + esc(s.code) + "</pre><p>Ausgabe: " + esc(s.ausgabe) + "</p><p>" + text(s.text) + "</p></section>";
    }).join("");
  }

  function wählen(i) {
    if (i < 0 || i >= stationen.length || i === zustand.station) return;
    zustand.station = i;
    stationZeichnen();
    const knopf = document.querySelector('.si-punkt[data-i="' + i + '"]');
    if (knopf && document.activeElement && document.activeElement.classList.contains("si-punkt")) knopf.focus();
    if (window.skr && window.skr.state) window.skr.state.update();
  }

  function stationZeichnen() {
    const s = stationen[zustand.station];
    document.querySelectorAll(".si-punkt").forEach(function (k, i) {
      k.setAttribute("aria-pressed", String(i === zustand.station));
    });
    document.getElementById("si-station").innerHTML =
      '<div class="si-info"><p class="si-art si-art--' + artKlasse(s.art) + '">' + esc(arten[s.art]) + "</p>"
      + "<h2>" + esc(s.version) + " · " + esc(s.titel) + "</h2>"
      + "<p>" + text(s.text) + "</p></div>"
      + '<div><pre class="si-code"><code class="hljs">' + färben(s.code) + "</code></pre>"
      + '<p class="si-titel">Ausgabe</p><pre class="si-ausgabe">' + esc(s.ausgabe) + "</pre></div>";
  }

  function localeZeichnen() {
    document.getElementById("si-locale").innerHTML = locales.map(function (l) {
      return '<button type="button" class="si-knopf" data-id="' + l.id + '" aria-pressed="' + String(l.id === zustand.locale) + '">' + esc(l.knopf) + "</button>";
    }).join("");
    document.getElementById("si-locale-zeilen").innerHTML = localeZeilen.map(function (z) {
      return "<tr><td><code>" + esc(z.code) + "</code></td><td><samp>" + esc(z[zustand.locale]) + "</samp></td><td>" + (z.abhängig ? "ja" : "nein") + "</td></tr>";
    }).join("");
  }

  function anmelden() {
    if (!(window.skr && window.skr.state)) return;
    window.skr.state.register({ key: "station",
      read: function () { return stationen[zustand.station].id; },
      apply: function (w) {
        const i = stationen.findIndex(function (s) { return s.id === w; });
        zustand.station = i >= 0 ? i : 0;
        stationZeichnen();
      } });
    window.skr.state.register({ key: "locale",
      read: function () { return zustand.locale; },
      apply: function (w) { zustand.locale = w === "en" ? "en" : "de"; localeZeichnen(); } });
  }

  function start() {
    aufbauen();
    stationZeichnen();
    localeZeichnen();
    anmelden();
  }
  if (!(window.skr && window.skr.highlight)) {
    document.addEventListener("skr-highlight-ready", function () { stationZeichnen(); }, { once: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
