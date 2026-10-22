(function () {
  const karten = [
    {"id": "text", "titel": "String und Text", "unter": "String, StringBuilder, HexFormat"},
    {"id": "collections", "titel": "Collections", "unter": "List, Set, Map, Sequenced Collections"},
    {"id": "stream", "titel": "Stream", "unter": "java.util.stream.Stream"},
    {"id": "collectors", "titel": "Collectors", "unter": "java.util.stream.Collectors"},
    {"id": "gatherers", "titel": "Gatherers", "unter": "java.util.stream.Gatherers – mit JDK 25"},
    {"id": "optional", "titel": "Optional", "unter": "java.util.Optional"},
    {"id": "io", "titel": "Dateien und Ströme", "unter": "Files, Path, InputStream, Reader"},
    {"id": "http", "titel": "HttpClient", "unter": "java.net.http"},
    {"id": "nebenlaeufig", "titel": "Nebenläufigkeit", "unter": "CompletableFuture, ExecutorService, Thread, ScopedValue"},
    {"id": "weitere", "titel": "Weitere", "unter": "Objects, Predicate, Math, java.time, ProcessHandle, RandomGenerator, IO"}
  ];
  const einträge = [
    {"id": "text-isblank", "k": "text", "sig": "isBlank()", "seit": 11, "was": "Prüft, ob ein Text leer ist oder nur aus Leerraum besteht – auch Unicode-Leerraum.", "bsp": "\"  \\t \".isBlank()          // true", "statt": "s.trim().isEmpty()"},
    {"id": "text-strip-stripleading-striptrailing", "k": "text", "sig": "strip(), stripLeading(), stripTrailing()", "seit": 11, "was": "Entfernt Leerraum an den Rändern – anders als trim() auch Unicode-Leerzeichen.", "bsp": "\"\\u2003 Hallo \".strip()    // \"Hallo\"\n\"\\u2003 Hallo \".trim()     // \"\\u2003 Hallo\" – trim kennt nur Zeichen bis U+0020", "statt": "trim()"},
    {"id": "text-lines", "k": "text", "sig": "lines()", "seit": 11, "was": "Zerlegt einen Text in einen Stream von Zeilen – mit jedem Zeilenende.", "bsp": "\"a\\nb\\r\\nc\".lines().toList()   // [a, b, c]", "statt": "split(\"\\\\R\")"},
    {"id": "text-repeat-int", "k": "text", "sig": "repeat(int)", "seit": 11, "was": "Wiederholt einen Text.", "bsp": "\"=\".repeat(5)              // \"=====\"", "statt": "Schleife mit StringBuilder"},
    {"id": "text-indent-int", "k": "text", "sig": "indent(int)", "seit": 12, "was": "Rückt jede Zeile ein (oder aus) und schließt mit einem Zeilenende ab.", "bsp": "\"a\\nb\".indent(2)            // \"  a\\n  b\\n\""},
    {"id": "text-transform-function", "k": "text", "sig": "transform(Function)", "seit": 12, "was": "Wendet eine Funktion auf den Text an – für Ketten ohne Zwischenvariable.", "bsp": "\" 42 \".transform(String::strip).transform(Integer::parseInt)   // 42"},
    {"id": "text-formatted-object", "k": "text", "sig": "formatted(Object...)", "seit": 15, "was": "String.format als Methode am Text – passt zu Text-Blöcken.", "bsp": "\"%s: %d Stück\".formatted(\"Tasse\", 3)   // \"Tasse: 3 Stück\"", "statt": "String.format(…)"},
    {"id": "text-stripindent-translateescapes", "k": "text", "sig": "stripIndent(), translateEscapes()", "seit": 15, "was": "Was ein Text-Block beim Übersetzen tut, als Methode – für Texte, die erst zur Laufzeit entstehen.", "bsp": "\"  a\\n    b\".stripIndent()      // \"a\\n  b\"\n\"Tab:\\\\t!\".translateEscapes()   // \"Tab:\\t!\""},
    {"id": "text-splitwithdelimiters-string-int", "k": "text", "sig": "splitWithDelimiters(String, int)", "seit": 21, "was": "Wie split, behält aber die Trennzeichen.", "bsp": "Arrays.toString(\"1+2-3\".splitWithDelimiters(\"[+-]\", 0))   // \"[1, +, 2, -, 3]\""},
    {"id": "text-stringbuilder-repeat", "k": "text", "sig": "StringBuilder.repeat(…)", "seit": 21, "was": "Hängt einen Text oder ein Zeichen mehrfach an.", "bsp": "new StringBuilder(\"|\").repeat(\"-\", 3).append(\"|\").toString()   // \"|---|\""},
    {"id": "text-hexformat", "k": "text", "sig": "HexFormat", "seit": 17, "was": "Bytes als Hexadezimaltext und zurück – ohne eigene Hilfsmethode.", "bsp": "HexFormat.of().formatHex(new byte[] {1, (byte) 0xAB})   // \"01ab\"", "statt": "Integer.toHexString in einer Schleife"},
    {"id": "collections-list-of-set-of-map-of", "k": "collections", "sig": "List.of, Set.of, Map.of", "seit": 9, "was": "Unveränderliche Collections in einer Zeile. Verbieten null; add wirft eine Exception.", "bsp": "var farben = List.of(\"rot\", \"grün\")\nvar preise = Map.of(\"Tasse\", 9, \"Teller\", 12)", "statt": "Arrays.asList, Collections.unmodifiable…"},
    {"id": "collections-map-ofentries-map-entry", "k": "collections", "sig": "Map.ofEntries, Map.entry", "seit": 9, "was": "Unveränderliche Maps mit mehr als zehn Einträgen.", "bsp": "Map.ofEntries(Map.entry(\"a\", 1), Map.entry(\"b\", 2)).size()   // 2"},
    {"id": "collections-list-copyof-set-copyof-map-copyof", "k": "collections", "sig": "List.copyOf, Set.copyOf, Map.copyOf", "seit": 10, "was": "Unveränderliche Kopie – etwa für einen Parameter, den man behalten will.", "bsp": "var kopie = List.copyOf(new ArrayList<>(List.of(1, 2)))\nkopie.getClass().getSimpleName()   // \"List12\" – unveränderlich", "statt": "new ArrayList<>(…) plus unmodifiableList"},
    {"id": "collections-getfirst-getlast-addfirst-removelast", "k": "collections", "sig": "getFirst(), getLast(), addFirst(…), removeLast() …", "seit": 21, "was": "Sequenced Collections: Anfang und Ende für List, Deque, LinkedHashSet und SortedSet einheitlich.", "bsp": "List.of(1, 2, 3).getLast()   // 3", "statt": "list.get(list.size() - 1)"},
    {"id": "collections-reversed", "k": "collections", "sig": "reversed()", "seit": 21, "was": "Eine umgekehrte Sicht – keine Kopie.", "bsp": "List.of(1, 2, 3).reversed()   // [3, 2, 1]", "statt": "Kopie plus Collections.reverse"},
    {"id": "collections-firstentry-lastentry-putfirst", "k": "collections", "sig": "firstEntry(), lastEntry(), putFirst(…) …", "seit": 21, "was": "Sequenced Maps: Anfang und Ende auch für LinkedHashMap.", "bsp": "var m = new LinkedHashMap<String, Integer>()\nm.put(\"a\", 1); m.put(\"b\", 2);\nm.lastEntry()   // b=2"},
    {"id": "stream-takewhile-dropwhile", "k": "stream", "sig": "takeWhile, dropWhile", "seit": 9, "was": "Nimmt bzw. überspringt Elemente, solange eine Bedingung gilt.", "bsp": "Stream.of(1, 2, 5, 1).takeWhile(x -> x < 3).toList()   // [1, 2]"},
    {"id": "stream-iterate-seed-hasnext-next", "k": "stream", "sig": "iterate(seed, hasNext, next)", "seit": 9, "was": "Eine for-Schleife als Stream – mit Abbruchbedingung.", "bsp": "Stream.iterate(1, i -> i <= 100, i -> i * 10).toList()   // [1, 10, 100]"},
    {"id": "stream-ofnullable-t", "k": "stream", "sig": "ofNullable(T)", "seit": 9, "was": "Ein Stream mit einem Element – oder leer bei null.", "bsp": "Stream.ofNullable(null).count()   // 0"},
    {"id": "stream-tolist", "k": "stream", "sig": "toList()", "seit": 16, "was": "Sammelt in eine unveränderliche Liste.", "bsp": "Stream.of(1, 2).toList()   // [1, 2] – add wirft UnsupportedOperationException", "statt": "collect(Collectors.toList())"},
    {"id": "stream-mapmulti-biconsumer", "k": "stream", "sig": "mapMulti(BiConsumer)", "seit": 16, "was": "Bildet ein Element auf null, eines oder mehrere ab – ohne einen Stream je Element.", "bsp": "Stream.of(1, 2).<Integer>mapMulti((x, raus) -> { raus.accept(x); raus.accept(-x); }).toList()   // [1, -1, 2, -2]", "statt": "flatMap"},
    {"id": "stream-gather-gatherer", "k": "stream", "sig": "gather(Gatherer)", "seit": 24, "was": "Eigene Zwischenoperationen – fertige liefert Gatherers.", "bsp": "Stream.of(1, 2, 3, 4, 5).gather(Gatherers.windowFixed(2)).toList()   // [[1, 2], [3, 4], [5]]"},
    {"id": "collectors-filtering-flatmapping", "k": "collectors", "sig": "filtering, flatMapping", "seit": 9, "was": "Filtern und Abflachen innerhalb einer Gruppierung.", "bsp": "Stream.of(\"a\", \"bb\", \"cc\").collect(Collectors.groupingBy(String::length,\n        Collectors.filtering(s -> !s.equals(\"cc\"), Collectors.toList())))   // {1=[a], 2=[bb]}"},
    {"id": "collectors-tounmodifiablelist-set-map", "k": "collectors", "sig": "toUnmodifiableList, …Set, …Map", "seit": 10, "was": "Sammelt in unveränderliche Collections.", "bsp": "Stream.of(\"a\", \"b\").collect(Collectors.toUnmodifiableSet()).size()   // 2"},
    {"id": "collectors-teeing-c1-c2-merger", "k": "collectors", "sig": "teeing(c1, c2, merger)", "seit": 12, "was": "Zwei Collectors in einem Durchlauf, Ergebnisse zusammengeführt.", "bsp": "Stream.of(3, 1, 2).collect(Collectors.teeing(Collectors.counting(),\n        Collectors.summingInt(x -> x), (anzahl, summe) -> summe / anzahl))   // 2"},
    {"id": "gatherers-windowfixed-int", "k": "gatherers", "sig": "windowFixed(int)", "seit": 24, "was": "Pakete fester Größe – etwa für Sammel-Inserts.", "bsp": "Stream.of(1, 2, 3, 4, 5).gather(Gatherers.windowFixed(2)).toList()   // [[1, 2], [3, 4], [5]]"},
    {"id": "gatherers-windowsliding-int", "k": "gatherers", "sig": "windowSliding(int)", "seit": 24, "was": "Gleitende Fenster – etwa für gleitende Durchschnitte.", "bsp": "Stream.of(1, 2, 3).gather(Gatherers.windowSliding(2)).toList()   // [[1, 2], [2, 3]]"},
    {"id": "gatherers-scan-fold", "k": "gatherers", "sig": "scan, fold", "seit": 24, "was": "Laufende Zwischenstände (scan) oder ein Endstand (fold) in Stream-Reihenfolge.", "bsp": "Stream.of(1, 2, 3).gather(Gatherers.scan(() -> 0, Integer::sum)).toList()   // [1, 3, 6]"},
    {"id": "gatherers-mapconcurrent-int-function", "k": "gatherers", "sig": "mapConcurrent(int, Function)", "seit": 24, "was": "Bildet gleichzeitig auf virtuellen Threads ab – höchstens n auf einmal, Reihenfolge bleibt.", "bsp": "Stream.of(1, 2, 3).gather(Gatherers.mapConcurrent(2, x -> x * 10)).toList()   // [10, 20, 30]"},
    {"id": "optional-ifpresentorelse", "k": "optional", "sig": "ifPresentOrElse(…)", "seit": 9, "was": "Ein Zweig für vorhanden, einer für leer.", "bsp": "Optional.empty().ifPresentOrElse(System.out::println, () -> System.out.println(\"leer\"))   // gibt \"leer\" aus", "statt": "isPresent() mit if/else"},
    {"id": "optional-or-supplier", "k": "optional", "sig": "or(Supplier)", "seit": 9, "was": "Ersatz-Optional, wenn leer – die Kette bleibt ein Optional.", "bsp": "Optional.empty().or(() -> Optional.of(\"Ersatz\")).get()   // \"Ersatz\""},
    {"id": "optional-stream", "k": "optional", "sig": "stream()", "seit": 9, "was": "Ein Optional als Stream mit null oder einem Element – gut in flatMap.", "bsp": "Stream.of(Optional.of(1), Optional.<Integer>empty()).flatMap(Optional::stream).toList()   // [1]"},
    {"id": "optional-orelsethrow", "k": "optional", "sig": "orElseThrow()", "seit": 10, "was": "Wie get(), aber der Name sagt, was passiert.", "bsp": "Optional.of(\"x\").orElseThrow()   // \"x\"", "statt": "get()"},
    {"id": "optional-isempty", "k": "optional", "sig": "isEmpty()", "seit": 11, "was": "Das Gegenstück zu isPresent().", "bsp": "Optional.empty().isEmpty()   // true", "statt": "!isPresent()"},
    {"id": "io-files-readstring-files-writestring", "k": "io", "sig": "Files.readString, Files.writeString", "seit": 11, "was": "Eine Textdatei in einem Aufruf lesen oder schreiben – UTF-8, wenn nichts anderes gesagt ist.", "bsp": "var datei = Files.writeString(Files.createTempFile(\"x\", \".txt\"), \"Grüße\")\nFiles.readString(datei)   // \"Grüße\"", "statt": "new String(Files.readAllBytes(…), UTF_8)"},
    {"id": "io-path-of", "k": "io", "sig": "Path.of(…)", "seit": 11, "was": "Erzeugt einen Pfad.", "bsp": "Path.of(\"daten\", \"bestellungen.csv\").toString()   // \"daten/bestellungen.csv\" (unter Unix)", "statt": "Paths.get(…)"},
    {"id": "io-files-mismatch-path-path", "k": "io", "sig": "Files.mismatch(Path, Path)", "seit": 12, "was": "Vergleicht zwei Dateien; −1, wenn sie gleich sind, sonst die erste abweichende Position.", "bsp": "var a = Files.writeString(Files.createTempFile(\"a\", \"\"), \"abc\")\nvar b = Files.writeString(Files.createTempFile(\"b\", \"\"), \"abd\")\nFiles.mismatch(a, b)   // 2"},
    {"id": "io-inputstream-transferto-readallbytes", "k": "io", "sig": "InputStream.transferTo, readAllBytes", "seit": 9, "was": "Einen Strom kopieren oder ganz lesen – ohne Puffer-Schleife.", "bsp": "new ByteArrayInputStream(\"abc\".getBytes()).readAllBytes().length   // 3", "statt": "Schleife mit byte[]-Puffer"},
    {"id": "io-inputstream-readnbytes-int-nullinputstre", "k": "io", "sig": "InputStream.readNBytes(int), nullInputStream()", "seit": 11, "was": "Genau n Bytes lesen; ein leerer Strom für Tests.", "bsp": "new ByteArrayInputStream(\"abcdef\".getBytes()).readNBytes(2).length   // 2"},
    {"id": "io-reader-of-charsequence", "k": "io", "sig": "Reader.of(CharSequence)", "seit": 24, "was": "Ein Reader über einen Text.", "bsp": "new BufferedReader(Reader.of(\"Zeile 1\\nZeile 2\")).lines().count()   // 2", "statt": "new StringReader(…)"},
    {"id": "http-httpclient-httprequest-httpresponse", "k": "http", "sig": "HttpClient, HttpRequest, HttpResponse", "seit": 11, "was": "HTTP im JDK, mit HTTP/2 – synchron mit send, asynchron mit sendAsync.", "bsp": "var client = HttpClient.newHttpClient();\nvar anfrage = HttpRequest.newBuilder(URI.create(\"https://example.org\")).build();\nvar antwort = client.send(anfrage, HttpResponse.BodyHandlers.ofString());\nantwort.statusCode();", "statt": "HttpURLConnection oder eine Bibliothek"},
    {"id": "http-httpclient-close", "k": "http", "sig": "HttpClient.close()", "seit": 21, "was": "HttpClient ist AutoCloseable – passt in try-with-resources.", "bsp": "try (var client = HttpClient.newHttpClient()) {\n    // Anfragen …\n}"},
    {"id": "nebenlaeufig-completablefuture-ortimeout-completeonti", "k": "nebenlaeufig", "sig": "CompletableFuture.orTimeout, completeOnTimeout", "seit": 9, "was": "Zeitlimit für einen asynchronen Aufruf – mit Fehler oder Ersatzwert.", "bsp": "new CompletableFuture<String>().completeOnTimeout(\"zu spät\", 10, TimeUnit.MILLISECONDS).join()   // \"zu spät\""},
    {"id": "nebenlaeufig-executorservice-close", "k": "nebenlaeufig", "sig": "ExecutorService.close()", "seit": 19, "was": "Wartet, bis alle Aufgaben fertig sind – ExecutorService passt in try-with-resources.", "bsp": "try (var executor = Executors.newFixedThreadPool(4)) {\n    executor.submit(() -> System.out.println(\"läuft\"));\n}   // wartet hier", "statt": "shutdown() plus awaitTermination(…)"},
    {"id": "nebenlaeufig-executors-newvirtualthreadpertaskexecuto", "k": "nebenlaeufig", "sig": "Executors.newVirtualThreadPerTaskExecutor()", "seit": 21, "was": "Ein virtueller Thread je Aufgabe – keine Poolgröße mehr.", "bsp": "try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    executor.submit(() -> System.out.println(Thread.currentThread().isVirtual()));   // true\n}"},
    {"id": "nebenlaeufig-thread-ofvirtual-thread-startvirtualthre", "k": "nebenlaeufig", "sig": "Thread.ofVirtual(), Thread.startVirtualThread(…)", "seit": 21, "was": "Virtuelle Threads direkt erzeugen.", "bsp": "Thread.startVirtualThread(() -> System.out.println(\"virtuell\")).join()"},
    {"id": "nebenlaeufig-scopedvalue", "k": "nebenlaeufig", "sig": "ScopedValue", "seit": 25, "was": "Ein unveränderlicher Wert für einen Aufruf und alles darin – Nachfolger von ThreadLocal für Kontext.", "bsp": "ScopedValue<String> ID = ScopedValue.newInstance();\nScopedValue.where(ID, \"anfrage-1\").run(() -> System.out.println(ID.get()));   // anfrage-1", "statt": "ThreadLocal"},
    {"id": "weitere-objects-requirenonnullelse-elseget", "k": "weitere", "sig": "Objects.requireNonNullElse, …ElseGet", "seit": 9, "was": "Ein Standardwert für null.", "bsp": "Objects.requireNonNullElse(null, \"Standard\")   // \"Standard\"", "statt": "x != null ? x : standard"},
    {"id": "weitere-predicate-not", "k": "weitere", "sig": "Predicate.not(…)", "seit": 11, "was": "Verneint eine Methodenreferenz.", "bsp": "Stream.of(\"a\", \"\", \"b\").filter(Predicate.not(String::isEmpty)).toList()   // [a, b]", "statt": "s -> !s.isEmpty()"},
    {"id": "weitere-math-clamp", "k": "weitere", "sig": "Math.clamp(…)", "seit": 21, "was": "Begrenzt einen Wert auf einen Bereich.", "bsp": "Math.clamp(150, 0, 100)   // 100", "statt": "Math.max(min, Math.min(max, x))"},
    {"id": "weitere-localdate-datesuntil-ofinstant", "k": "weitere", "sig": "LocalDate.datesUntil, ofInstant", "seit": 9, "was": "Alle Tage eines Zeitraums als Stream; ein Datum aus einem Zeitpunkt.", "bsp": "LocalDate.of(2026, 10, 1).datesUntil(LocalDate.of(2026, 10, 4)).count()   // 3"},
    {"id": "weitere-duration-tohourspart-tominutespart", "k": "weitere", "sig": "Duration.toHoursPart(), toMinutesPart() …", "seit": 9, "was": "Die Teile einer Dauer für die Anzeige.", "bsp": "Duration.ofMinutes(135).toHoursPart() + \" h \" + Duration.ofMinutes(135).toMinutesPart() + \" min\"   // \"2 h 15 min\""},
    {"id": "weitere-processhandle", "k": "weitere", "sig": "ProcessHandle", "seit": 9, "was": "PID, Elternprozess und Kinder eines Prozesses.", "bsp": "ProcessHandle.current().pid() > 0   // true"},
    {"id": "weitere-randomgenerator", "k": "weitere", "sig": "RandomGenerator", "seit": 17, "was": "Gemeinsame Schnittstelle für Zufallsgeneratoren, Algorithmus wählbar.", "bsp": "RandomGenerator.of(\"L64X128MixRandom\").nextInt(1, 7) <= 6   // true"},
    {"id": "weitere-io-println-io-readln", "k": "weitere", "sig": "IO.println(…), IO.readln(…)", "seit": 25, "was": "Ausgabe und Eingabe auf der Konsole ohne System.out – für kompakte Quelldateien.", "bsp": "IO.println(\"Hallo\")   // gibt \"Hallo\" aus", "statt": "System.out.println"}
  ];

  const sprünge = [
    { id: "", titel: "Alle" },
    { id: "11", titel: "8 → 11" }, { id: "17", titel: "11 → 17" },
    { id: "21", titel: "17 → 21" }, { id: "25", titel: "21 → 25" }
  ];
  const jdks = [{ id: "", titel: "egal" }, { id: "21", titel: "JDK 21" }, { id: "25", titel: "JDK 25" }];
  const stand = { lts: "", jdk: "", methode: "" };

  function lts(seit) { return seit <= 11 ? 11 : seit <= 17 ? 17 : seit <= 21 ? 21 : 25; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  // Gefärbt wird über die Hervorhebung des Skriptoriums (`skr.highlight`): Sie färbt jedes
  // `pre code.language-java`, das noch nicht gefärbt ist. Steht sie noch nicht bereit,
  // meldet sie sich mit `skr-highlight-ready`; ohne sie bleibt der Code ungefärbt.
  function färbenNach() {
    const box = document.getElementById("api-karten");
    if (!box) return;
    if (window.skr && window.skr.highlight) { window.skr.highlight.apply(box); return; }
    document.addEventListener("skr-highlight-ready", function () { window.skr.highlight.apply(box); }, { once: true });
  }

  function aufbauen() {
    const box = document.getElementById("api-karten");
    box.innerHTML = karten.map(function (k) {
      const drin = einträge.filter(function (e) { return e.k === k.id; })
                           .sort(function (a, b) { return a.seit - b.seit; });
      return '<section class="api-karte" data-karte="' + k.id + '"><h2>' + esc(k.titel) + '</h2><p class="api-karte__unter">' + esc(k.unter) + "</p>"
        + drin.map(function (e) {
            return '<div class="api-eintrag" data-id="' + e.id + '">'
              + '<button type="button" class="api-zeile" aria-expanded="false" aria-controls="api-d-' + e.id + '">'
              + '<span class="api-sig">' + esc(e.sig) + '</span><span class="api-marken"><span class="api-marke">Java ' + e.seit
              + '</span><span class="api-marke api-marke--lts">LTS ' + lts(e.seit) + "</span></span></button>"
              + '<div class="api-detail" id="api-d-' + e.id + '" hidden></div></div>';
          }).join("")
        + "</section>";
    }).join("");
    box.addEventListener("click", function (ev) {
      const z = ev.target.closest(".api-zeile");
      if (!z) return;
      const id = z.parentElement.dataset.id;
      stand.methode = stand.methode === id ? "" : id;
      zeichnen();
      melden();
    });
    knöpfe("api-knoepfe-lts", "lts", sprünge);
    knöpfe("api-knoepfe-jdk", "jdk", jdks);
  }

  function knöpfe(ziel, schlüssel, liste) {
    const box = document.getElementById(ziel);
    box.innerHTML = liste.map(function (x) {
      return '<button type="button" class="api-knopf" data-schluessel="' + schlüssel + '" data-wert="' + x.id + '">' + esc(x.titel) + "</button>";
    }).join("");
    box.addEventListener("click", function (ev) {
      const k = ev.target.closest(".api-knopf");
      if (!k) return;
      stand[schlüssel] = k.dataset.wert;
      zeichnen();
      melden();
    });
  }

  function detail(e) {
    let html = "<p>" + esc(e.was) + "</p>";
    if (e.statt) html += '<p class="api-hinweis">Statt: <code>' + esc(e.statt) + "</code></p>";
    if (stand.jdk && e.seit > Number(stand.jdk)) html += '<p class="api-hinweis"><b>Nicht auf JDK ' + stand.jdk + "</b> – erst ab Java " + e.seit + ".</p>";
    html += '<pre><code class="language-java">' + esc(e.bsp) + "</code></pre>";
    return html;
  }

  function zeichnen() {
    document.querySelectorAll(".api-knopf").forEach(function (k) {
      k.setAttribute("aria-pressed", String(stand[k.dataset.schluessel] === k.dataset.wert));
    });
    let sichtbar = 0, fehlt = 0;
    document.querySelectorAll(".api-eintrag").forEach(function (el) {
      const e = einträge.find(function (x) { return x.id === el.dataset.id; });
      const zeigen = !stand.lts || String(lts(e.seit)) === stand.lts;
      el.hidden = !zeigen;
      const fehlend = Boolean(stand.jdk) && e.seit > Number(stand.jdk);
      el.classList.toggle("is-fehlt", fehlend);
      if (zeigen) { sichtbar++; if (fehlend) fehlt++; }
      const offen = zeigen && stand.methode === e.id;
      const d = el.querySelector(".api-detail");
      el.querySelector(".api-zeile").setAttribute("aria-expanded", String(offen));
      if (offen) d.innerHTML = detail(e);
      d.hidden = !offen;
    });
    document.querySelectorAll(".api-karte").forEach(function (k) {
      k.hidden = !k.querySelector(".api-eintrag:not([hidden])");
    });
    document.getElementById("api-anzahl").textContent = sichtbar + " Methoden"
      + (stand.jdk ? (fehlt ? ", davon " + fehlt + " noch nicht auf JDK " + stand.jdk : ", alle auf JDK " + stand.jdk + " verfügbar") : "");
    färbenNach();
  }

  function melden() { if (window.skr.state) window.skr.state.update(); }
  function anmelden() {
    if (!window.skr.state) return;
    const gültig = {
      lts: function (w) { return sprünge.some(function (s) { return s.id === w; }) ? w : ""; },
      jdk: function (w) { return jdks.some(function (s) { return s.id === w; }) ? w : ""; },
      methode: function (w) { return einträge.some(function (e) { return e.id === w; }) ? w : ""; }
    };
    Object.keys(gültig).forEach(function (schlüssel) {
      window.skr.state.register({
        key: schlüssel,
        read: function () { return stand[schlüssel]; },
        apply: function (w) { stand[schlüssel] = gültig[schlüssel](w || ""); zeichnen(); }
      });
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
