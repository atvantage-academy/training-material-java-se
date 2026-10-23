(function () {
  // Gemessen mit spielwiese/Speicherlast.java (-Xmx1g, 12 Kerne, „jfr view gc-pauses“);
  // Shenandoah mit Temurin 25 in Docker, die übrigen mit OpenJDK 25.

  // ---- 1 · Garbage Collector ----
  const collectoren = [
    { id: "serial", knopf: "Serial", option: "-XX:+UseSerialGC",
      messung: { dauer: 3430, pausen: 31, mittel: 28.4, längste: 177 }, nebenher: false,
      wie: "Ein einziger GC-Thread. Für jede Sammlung hält er die ganze Anwendung an und räumt allein auf – erst die jungen Objekte, bei Bedarf den ganzen Heap.",
      wann: "Ein Kern, ein kleiner Heap, kurze Programme. Im kleinen Container wählt ihn die JVM bis Java 26 von selbst.",
      kosten: "Kaum zusätzlicher Speicher und keine zusätzliche CPU – aber lange Pausen, sobald der Heap wächst.",
      stationen: [["seit jeher", ""]] },
    { id: "parallel", knopf: "Parallel", option: "-XX:+UseParallelGC",
      messung: { dauer: 2908, pausen: 25, mittel: 7.58, längste: 43.4 }, nebenher: false,
      wie: "Wie Serial, aber mit einem GC-Thread je Kern: Die Anwendung steht während jeder Sammlung, dafür ist die Sammlung schneller vorbei.",
      wann: "Durchsatz vor Antwortzeit – ein Batch, der nachts rechnet und dem eine Pause egal ist. Bis Java 8 der Standard.",
      kosten: "Wenig Speicher, volle CPU während der Pause.",
      stationen: [["Standard bis 8", ""]] },
    { id: "g1", knopf: "G1", option: "-XX:+UseG1GC",
      messung: { dauer: 2873, pausen: 17, mittel: 7.75, längste: 52.5 }, nebenher: true,
      wie: "Teilt den Heap in gleich große Regionen und räumt zuerst die mit dem meisten Müll („Garbage First“). Das Markieren läuft nebenher; kurze Pausen bleiben, ihr Ziel ist einstellbar (Standard 200 ms).",
      wann: "Fast immer richtig – der Standard. Ausgewogen zwischen Pausen, Durchsatz und Speicher.",
      kosten: "Etwas Speicher für seine Verwaltung und etwas CPU nebenher.",
      stationen: [["Standard seit 9", "JEP 248 · LTS 11"], ["auch im kleinen Container ab 27", "JEP 523 · Ausblick"]] },
    { id: "z", knopf: "ZGC", option: "-XX:+UseZGC",
      messung: { dauer: 4427, pausen: 71, mittel: 0.00554, längste: 0.0131 }, nebenher: true,
      wie: "Erledigt fast alles nebenher, auch das Verschieben der Objekte. Die Anwendung hält nur für Sekundenbruchteile an – unabhängig davon, wie groß der Heap ist.",
      wann: "Kurze Antwortzeiten bei großem Heap – ein Dienst, bei dem jede Pause beim Kunden ankommt.",
      kosten: "Mehr CPU und mehr Speicher; im Messlauf brauchte er die längste Zeit.",
      stationen: [["experimentell in 11", "JEP 333"], ["produktiv seit 15", "JEP 377 · LTS 17"], ["mit Generationen seit 21", "JEP 439 · LTS 21"], ["nur noch mit Generationen seit 24", "JEP 490 · LTS 25"]] },
    { id: "shenandoah", knopf: "Shenandoah", option: "-XX:+UseShenandoahGC",
      messung: { dauer: 3713, pausen: 52, mittel: 0, längste: 0.281 }, nebenher: true,
      wie: "Wie ZGC: Markieren und Verschieben laufen nebenher, die Pausen bleiben kurz. Entwickelt von Red Hat.",
      wann: "Wie ZGC. Nicht in jedem JDK: Temurin, Corretto und Red Hat liefern ihn, die Builds von Oracle nicht.",
      kosten: "Mehr CPU und Speicher als G1.",
      stationen: [["experimentell in 12", "JEP 189"], ["produktiv seit 15", "JEP 379 · LTS 17"], ["mit Generationen seit 25", "JEP 521 · LTS 25"]] }
  ];

  // ---- 2 · Container ----
  const jdks = [{ id: "25", knopf: "bis 26" }, { id: "27", knopf: "ab 27" }];
  const kerne = [{ id: "1", knopf: "1" }, { id: "2", knopf: "2" }, { id: "4", knopf: "4" }];
  const speicher = [{ id: "512", knopf: "512 MB" }, { id: "1024", knopf: "1 GB" }, { id: "2048", knopf: "2 GB" }, { id: "4096", knopf: "4 GB" }];
  const heaps = [{ id: "standard", knopf: "ohne Angabe" }, { id: "75", knopf: "MaxRAMPercentage=75" }];

  // ---- 3 · Startzeit ----
  const stufen = [
    { id: "ohne", knopf: "Ohne Archiv", ms: 345, option: "-Xshare:off", erledigt: 0,
      text: "Jede Klasse wird gesucht, gelesen, geprüft und verknüpft – bei jedem Start von vorn. So startete Java 8 ohne Zutun.",
      marke: "" },
    { id: "standard", knopf: "Standard-CDS", ms: 303, option: "ohne Option", erledigt: 1,
      text: "Das JDK bringt ein Archiv seiner eigenen Klassen mit und nutzt es von selbst. Deine Klassen lädt es weiter einzeln.",
      marke: "seit 12 · JEP 341 · LTS 17" },
    { id: "eigen", knopf: "Eigenes CDS-Archiv", ms: 226, option: "-XX:ArchiveClassesAtExit=app.jsa, dann -XX:SharedArchiveFile=app.jsa", erledigt: 2,
      text: "Ein Lauf schreibt beim Beenden alle geladenen Klassen – auch Deine – in ein Archiv; die nächsten Starts lesen sie daraus.",
      marke: "AppCDS seit 10 · JEP 310 · dynamisch seit 13 · JEP 350 · LTS 17" },
    { id: "aot", knopf: "AOT-Cache", ms: 204, option: "-XX:AOTCacheOutput=app.aot, dann -XX:AOTCache=app.aot", erledigt: 4,
      text: "Ein Trainingslauf schreibt die Klassen geladen und schon verknüpft weg, dazu Profile, welche Methoden oft laufen – der JIT optimiert sie danach früher.",
      marke: "seit 24 · JEP 483 · in einem Schritt und mit Profilen seit 25 · JEP 514, 515 · LTS 25" }
  ];
  const schritte = ["Klassen finden", "lesen und prüfen", "verknüpfen", "Profile sammeln"];

  const zustand = { gc: "g1", jdk: "25", kerne: "1", speicher: "1024", heap: "standard", stufe: "aot" };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function zahl(x) {
    if (x >= 10) return String(Math.round(x * 10) / 10).replace(".", ",");
    if (x >= 0.1) return String(Math.round(x * 100) / 100).replace(".", ",");
    return String(Math.round(x * 10000) / 10000).replace(".", ",");
  }

  function knöpfe(behälterId, liste, gewählt, wählen) {
    const behälter = document.getElementById(behälterId);
    behälter.innerHTML = "";
    liste.forEach(function (e) {
      const k = document.createElement("button");
      k.type = "button";
      k.className = "lz-knopf";
      k.dataset.id = e.id;
      k.textContent = e.knopf;
      k.setAttribute("aria-pressed", gewählt(e.id) ? "true" : "false");
      k.addEventListener("click", function () { wählen(e.id); });
      behälter.appendChild(k);
    });
  }

  function zeitleisteZeichnen(gc) {
    const breite = 1000, höhe = gc.nebenher ? 118 : 84;
    const längsteDauer = Math.max.apply(null, collectoren.map(function (c) { return c.messung.dauer; }));
    const ende = 20 + (breite - 40) * gc.messung.dauer / längsteDauer;
    const pxJeMs = (breite - 40) / längsteDauer;
    let svg = '<svg viewBox="0 0 ' + breite + " " + höhe + '" role="img" aria-label="' +
      esc(gc.knopf + ": " + gc.messung.pausen + " Pausen in " + gc.messung.dauer + " ms, längste " + zahl(gc.messung.längste) + " ms" +
      (gc.nebenher ? ", ein Teil der Arbeit läuft nebenher" : ", die Anwendung steht bei jeder Sammlung")) + '">';
    svg += '<text x="20" y="16" class="lz-zl-text">Anwendung</text>';
    svg += '<rect class="lz-zl-lauf" x="20" y="24" width="' + (ende - 20) + '" height="26" rx="4"/>';
    const n = gc.messung.pausen;
    for (let i = 0; i < n; i++) {
      const mitte = 20 + (ende - 20) * (i + 0.5) / n;
      const dauer = i === Math.floor(n * 0.6) ? gc.messung.längste : gc.messung.mittel;
      const w = Math.max(1.5, dauer * pxJeMs);
      svg += '<rect class="lz-zl-pause" x="' + (mitte - w / 2) + '" y="20" width="' + w + '" height="34"/>';
    }
    if (gc.nebenher) {
      svg += '<text x="20" y="76" class="lz-zl-text">GC nebenher</text>';
      for (let i = 0; i < Math.min(n, 12); i++) {
        const x = 20 + (ende - 20) * (i / Math.min(n, 12)) + 8;
        svg += '<rect class="lz-zl-nebenher" x="' + x + '" y="84" width="' + ((ende - 20) / Math.min(n, 12) * 0.55) + '" height="14" rx="3"/>';
      }
    }
    svg += '<text x="' + ende + '" y="16" text-anchor="end" class="lz-zl-text lz-zl-text--stark">' + esc(String(gc.messung.dauer).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ms") + "</text>";
    svg += "</svg>";
    document.getElementById("lz-zeitleiste").innerHTML = svg;
  }

  function gcZeichnen() {
    const gc = collectoren.find(function (c) { return c.id === zustand.gc; });
    zeitleisteZeichnen(gc);
    const m = gc.messung;
    document.getElementById("lz-gc-karte").innerHTML =
      '<p class="lz-kennzahlen"><span><b>' + m.pausen + "</b> Pausen</span><span>längste <b>" + zahl(m.längste) + " ms</b></span>" +
      (m.mittel ? "<span>Median <b>" + zahl(m.mittel) + " ms</b></span>" : "") + "<span>Laufzeit <b>" + String(m.dauer).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ms</b></span></p>" +
      "<dl class=\"lz-steckbrief\"><dt>Wie er arbeitet</dt><dd>" + esc(gc.wie) + "</dd><dt>Wann sinnvoll</dt><dd>" + esc(gc.wann) + "</dd><dt>Was er kostet</dt><dd>" + esc(gc.kosten) + "</dd>" +
      "<dt>Seit wann</dt><dd><ul>" + gc.stationen.map(function (s) { return "<li>" + esc(s[0]) + (s[1] ? ' <span class="skr-badge">' + esc(s[1]) + "</span>" : "") + "</li>"; }).join("") + "</ul></dd>" +
      "<dt>Wählen mit</dt><dd><code>" + esc(gc.option) + "</code></dd></dl>";
    knöpfe("lz-gcs", collectoren, function (id) { return id === zustand.gc; }, function (id) { setzen("gc", id); });
  }

  function containerZeichnen() {
    const k = Number(zustand.kerne), mb = Number(zustand.speicher);
    const klein = k < 2 || mb < 1792;
    const gc = zustand.jdk === "27" || !klein ? "G1" : "Serial";
    const anteil = zustand.heap === "75" ? 0.75 : 0.25;
    const heap = mb * anteil;
    const heapText = heap >= 1024 ? zahl(heap / 1024) + " GB" : Math.round(heap) + " MB";
    const option = zustand.heap === "75" ? " -XX:MaxRAMPercentage=75" : "";
    let urteil;
    if (gc === "Serial") {
      urteil = "Die JVM hält den Container für zu klein für einen „Server“ – " + (k < 2 ? "ein Kern" : "unter 1792 MB") + " – und nimmt Serial. Für einen Dienst mit vielen gleichzeitigen Anfragen ist das selten gut: Jede Sammlung hält alles an. Wähle den Collector ausdrücklich oder gib dem Container mehr.";
    } else if (zustand.jdk === "27" && klein) {
      urteil = "Ab Java 27 nimmt die JVM immer G1, auch im kleinen Container (JEP 523). Bis 26 wäre es hier Serial gewesen.";
    } else {
      urteil = "Genug Kerne und Speicher: Die JVM nimmt G1, den Standard.";
    }
    const heapUrteil = zustand.heap === "75"
      ? "Mit <code>-XX:MaxRAMPercentage=75</code> darf der Heap drei Viertel des Containers belegen – der Rest bleibt für Threads, Metaspace und Puffer."
      : "Ohne Angabe nimmt die JVM ein Viertel des Containers als Heap. Im Container, in dem nur die JVM läuft, bleibt so viel ungenutzt.";
    document.getElementById("lz-container").innerHTML =
      '<p class="lz-kennzahlen"><span>Collector <b>' + gc + "</b></span><span>Heap höchstens <b>" + heapText + "</b></span></p>" +
      "<p>" + esc(urteil) + "</p><p>" + heapUrteil + "</p>" +
      '<pre class="lz-befehl"><code>docker run --rm --cpus ' + k + " -m " + (mb >= 1024 ? mb / 1024 + "g" : mb + "m") + " eclipse-temurin:" + zustand.jdk + " java" + option + " -Xlog:gc,gc+init -version</code></pre>";
    knöpfe("lz-jdk", jdks, function (id) { return id === zustand.jdk; }, function (id) { setzen("jdk", id); });
    knöpfe("lz-kerne", kerne, function (id) { return id === zustand.kerne; }, function (id) { setzen("kerne", id); });
    knöpfe("lz-speicher", speicher, function (id) { return id === zustand.speicher; }, function (id) { setzen("speicher", id); });
    knöpfe("lz-heap", heaps, function (id) { return id === zustand.heap; }, function (id) { setzen("heap", id); });
  }

  function stufeZeichnen() {
    const st = stufen.find(function (s) { return s.id === zustand.stufe; });
    document.getElementById("lz-schritte").innerHTML = schritte.map(function (s, i) {
      const vorab = i < st.erledigt;
      return '<li class="lz-schritt' + (vorab ? " lz-schritt--vorab" : "") + '"><span class="lz-schritt__name">' + esc(s) +
        '</span><span class="lz-schritt__wann">' + (vorab ? "✓ vorab erledigt" : "bei jedem Start") + "</span></li>";
    }).join("");
    document.getElementById("lz-stufe-karte").innerHTML = "<p>" + esc(st.text) + "</p>" +
      (st.marke ? '<p><span class="skr-badge">' + esc(st.marke) + "</span></p>" : "") +
      "<p>Option: <code>" + esc(st.option) + "</code></p>";
    const höchstwert = stufen[0].ms;
    document.getElementById("lz-balken").innerHTML = stufen.map(function (s) {
      const gewählt = s.id === zustand.stufe;
      return '<div class="lz-balkenzeile' + (gewählt ? " lz-balkenzeile--gewählt" : "") + '"><span class="lz-balkenzeile__name">' + esc(s.knopf) +
        (gewählt ? " (gewählt)" : "") + '</span><span class="lz-balkenzeile__spur"><span class="lz-balkenzeile__balken" style="width:' +
        (100 * s.ms / höchstwert) + '%"></span></span><span class="lz-balkenzeile__wert">' + s.ms + " ms</span></div>";
    }).join("");
    knöpfe("lz-stufen", stufen, function (id) { return id === zustand.stufe; }, function (id) { setzen("stufe", id); });
  }

  function zeichnen() {
    gcZeichnen();
    containerZeichnen();
    stufeZeichnen();
  }

  function setzen(schlüssel, wert) {
    zustand[schlüssel] = wert;
    const fokus = document.activeElement && document.activeElement.classList.contains("lz-knopf")
      ? { box: document.activeElement.parentElement.id, id: document.activeElement.dataset.id } : null;
    zeichnen();
    if (fokus) {
      const k = document.querySelector("#" + fokus.box + ' .lz-knopf[data-id="' + fokus.id + '"]');
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
    [["gc", collectoren, "g1"], ["jdk", jdks, "25"], ["kerne", kerne, "1"], ["speicher", speicher, "1024"],
      ["heap", heaps, "standard"], ["stufe", stufen, "aot"]].forEach(function (e) {
      st.register({ key: e[0],
        read: function () { return zustand[e[0]]; },
        apply: function (w) { zustand[e[0]] = gültig(e[1], w, e[2]); zeichnen(); } });
    });
  }

  function start() {
    zeichnen();
    anmelden();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
