(function () {
  // ---------------------------------------------------------------------------
  // DATEN. v = Release, in dem der JEP final wurde; kette = Vorabfassungen
  // [nr, release, art] (art fehlt = Preview); weg = ganzer Weg, wenn er nicht mit
  // „final“ endet. risiko und r (Relevanz [REST, Batch, Server]) jeweils 0/1/2.
  // ---------------------------------------------------------------------------
  const jeps = [
    // ===== 8 → 11 =====
    { nr: 261, v: 9, b: "sprache", name: "Modulsystem", titel: "Module System",
      worum: "`module-info.java` beschreibt, was ein Modul braucht (`requires`) und zeigt (`exports`); das JDK selbst besteht seither aus Modulen.",
      warum: "Die Grundlage der starken Kapselung – auch wer keine eigenen Module schreibt, lebt mit ihren Folgen.",
      betrifft: "Deine Anwendung oder eine Bibliothek per Reflection in JDK-Interna greift.",
      risiko: 1, risikoText: "Eigene Module sind freiwillig, der Klassenpfad funktioniert weiter. Die Brüche kommen über die Kapselung (JEP 260, 396, 403).", r: [0, 0, 0] },
    { nr: 213, v: 9, b: "sprache", name: "Project Coin, Feinschliff", titel: "Milling Project Coin",
      worum: "Kleine Korrekturen: private Methoden in Interfaces, effektiv finale Variablen in try-with-resources, Diamant bei anonymen Klassen – und `_` ist kein Bezeichner mehr.",
      warum: "Private Interface-Methoden räumen Default-Methoden auf; der Rest spart Zeilen.",
      betrifft: "Du Default-Methoden mit gemeinsamer Logik schreibst – oder eine Variable `_` heißt.",
      risiko: 1, risikoText: "`_` als Bezeichner übersetzt ab Release 9 nicht mehr (im Übungsprojekt: Modul `unterstrich`).", r: [1, 1, 1] },
    { nr: 286, v: 10, b: "sprache", name: "var", titel: "Local-Variable Type Inference",
      worum: "Lokale Variablen mit `var` – der Typ wird aus der rechten Seite abgeleitet und bleibt statisch.",
      warum: "Weniger Wiederholung bei langen generischen Typen.",
      betrifft: "Du lokale Variablen mit langen Typen deklarierst.",
      risiko: 0, risikoText: "`var` ist ein eingeschränkter Typname: Eine Klasse namens `var` übersetzt nicht mehr – praktisch nie der Fall.", r: [1, 1, 1] },
    { nr: 323, v: 11, b: "sprache", name: "var in Lambdas", titel: "Local-Variable Syntax for Lambda Parameters",
      worum: "`var` auch für Lambda-Parameter – vor allem, um Annotationen anzubringen: `(@NonNull var s) -> …`.",
      warum: "Annotationen an Lambda-Parametern ohne ausgeschriebenen Typ.",
      betrifft: "Du Lambda-Parameter annotierst.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0] },
    { nr: 269, v: 9, b: "api", name: "List.of, Set.of, Map.of", titel: "Convenience Factory Methods for Collections",
      worum: "Unveränderliche Collections in einer Zeile: `List.of(…)`, `Set.of(…)`, `Map.of(…)`.",
      warum: "Ersetzt `Arrays.asList` und `Collections.unmodifiable…` – und verbietet `null`.",
      betrifft: "Du Konstanten, Testdaten oder Rückgabewerte als Collection baust.",
      risiko: 1, risikoText: "Still: `add` wirft `UnsupportedOperationException`, `contains(null)` eine `NullPointerException` – erst zur Laufzeit.", r: [2, 2, 2] },
    { nr: 266, v: 9, b: "api", name: "CompletableFuture mit Zeitlimit", titel: "More Concurrency Updates",
      worum: "`orTimeout`, `completeOnTimeout` und `delayedExecutor` für `CompletableFuture`, dazu die Reactive-Streams-Schnittstellen in `Flow`.",
      warum: "Zeitlimits für asynchrone Aufrufe ohne eigenen Scheduler.",
      betrifft: "Du andere Systeme asynchron aufrufst.",
      risiko: 0, risikoText: "Keins.", r: [2, 1, 1] },
    { nr: 102, v: 9, b: "api", name: "ProcessHandle", titel: "Process API Updates",
      worum: "`ProcessHandle` liefert PID, Elternprozess und Kinder und meldet das Ende eines Prozesses.",
      warum: "Prozesse steuern ohne plattformabhängige Kniffe.",
      betrifft: "Dein Programm andere Programme startet oder überwacht.",
      risiko: 0, risikoText: "Keins.", r: [0, 2, 0] },
    { nr: 259, v: 9, b: "api", name: "StackWalker", titel: "Stack-Walking API",
      worum: "`StackWalker` durchläuft den Aufrufstapel gezielt und günstig, statt eine Exception zu erzeugen.",
      warum: "Für Logging und Frameworks, die den Aufrufer kennen müssen.",
      betrifft: "Du den Aufrufer einer Methode ermittelst.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0] },
    { nr: 321, v: 11, b: "api", name: "HttpClient", titel: "HTTP Client (Standard)", kette: [[110, 9, "Incubator"]],
      worum: "Ein HTTP-Client im JDK – synchron und asynchron, mit HTTP/2 und WebSockets.",
      warum: "Ersetzt `HttpURLConnection` und oft eine Bibliothek.",
      betrifft: "Dein Code andere Systeme per HTTP aufruft.",
      risiko: 0, risikoText: "Keins; `HttpURLConnection` bleibt erhalten.", r: [2, 1, 1] },
    { nr: 248, v: 9, b: "jvm", name: "G1 als Standard", titel: "Make G1 the Default Garbage Collector",
      worum: "G1 löst den Parallel GC als Standard ab – kürzere Pausen bei fast gleichem Durchsatz.",
      warum: "Wer keinen GC wählt, bekommt G1 – außer im kleinen Container: Mit einem Kern oder unter knapp 1,8 GB wählt die JVM bis 26 Serial.",
      betrifft: "Deine Anwendung ohne GC-Option startet.",
      risiko: 1, risikoText: "Andere Pausen und etwas weniger Durchsatz als Parallel – messen, nicht raten.", r: [2, 1, 2] },
    { nr: 254, v: 9, b: "jvm", name: "Kompakte Strings", titel: "Compact Strings",
      worum: "Strings mit nur Latin-1-Zeichen belegen ein Byte je Zeichen statt zwei.",
      warum: "Weniger Heap ohne Codeänderung.",
      betrifft: "Deine Anwendung viele Texte im Speicher hält.",
      risiko: 0, risikoText: "Keins.", r: [1, 2, 1] },
    { nr: 310, v: 10, b: "jvm", name: "AppCDS", titel: "Application Class-Data Sharing",
      worum: "Auch Anwendungsklassen kommen ins Klassen-Archiv – der Start wird schneller.",
      warum: "Der Vorläufer des AOT-Cache.",
      betrifft: "Startzeit für Dich zählt.",
      risiko: 0, risikoText: "Keins.", r: [2, 1, 0] },
    { nr: 307, v: 10, b: "jvm", name: "Paralleler Full GC für G1", titel: "Parallel Full GC for G1",
      worum: "Muss G1 doch einmal den ganzen Heap aufräumen, nutzt er dafür alle Kerne.",
      warum: "Der schlimmste Fall von G1 wird deutlich kürzer.",
      betrifft: "Deine Anwendung G1 nutzt und der Heap knapp wird.",
      risiko: 0, risikoText: "Keins.", r: [1, 1, 1] },
    { nr: 328, v: 11, b: "jvm", name: "Flight Recorder", titel: "Flight Recorder",
      worum: "JFR zeichnet Ereignisse aus JVM und Anwendung auf – sparsam genug für den Dauerbetrieb.",
      warum: "Messen statt raten, auch in Produktion; vorher ein kommerzielles Feature von Oracle.",
      betrifft: "Du Leistung, GC-Pausen oder Pinning untersuchst.",
      risiko: 0, risikoText: "Keins.", r: [2, 2, 2] },
    { nr: 222, v: 9, b: "werkzeuge", name: "jshell", titel: "jshell: The Java Shell (Read-Eval-Print Loop)",
      worum: "Java-Ausdrücke und Schnipsel interaktiv ausprobieren.",
      warum: "Eine API ausprobieren, ohne ein Projekt anzulegen.",
      betrifft: "Du schnell etwas ausprobieren willst.",
      risiko: 0, risikoText: "Keins.", r: [1, 1, 1] },
    { nr: 247, v: 9, b: "werkzeuge", name: "--release", titel: "Compile for Older Platform Versions",
      worum: "`javac --release 8` übersetzt für ein älteres Release – und prüft, dass nur dessen API benutzt wird.",
      warum: "Ein neues JDK im Build, ohne den Zielbetrieb zu ändern – der erste Schritt jeder Migration.",
      betrifft: "Ihr das JDK im Build wechselt.",
      risiko: 0, risikoText: "Keins – im Gegenteil: `-source` und `-target` prüfen die API nicht.", r: [2, 2, 2] },
    { nr: 277, v: 9, b: "werkzeuge", name: "jdeprscan", titel: "Enhanced Deprecation",
      worum: "`@Deprecated(forRemoval = true, since = …)` kündigt Entfernungen an; `jdeprscan` findet ihre Nutzung im eigenen Code.",
      warum: "Was entfernt wird, wird vorher angekündigt – wer sucht, wird nicht überrascht.",
      betrifft: "Ihr eine Migration plant.",
      risiko: 0, risikoText: "Keins.", r: [2, 2, 2] },
    { nr: 158, v: 9, b: "werkzeuge", name: "-Xlog", titel: "Unified JVM Logging",
      worum: "Ein gemeinsames Logging für alle Bereiche der JVM: `-Xlog:gc`, `-Xlog:class+load` …",
      warum: "Ersetzt die alten GC-Log-Optionen.",
      betrifft: "Eure Startskripte GC-Logs schreiben.",
      risiko: 2, risikoText: "Gemessen auf 21 und 25: `-XX:+PrintGCDetails` und `-Xloggc` warnen nur, `-XX:+PrintGCDateStamps` verhindert den Start („Unrecognized VM option“).", r: [1, 1, 2] },
    { nr: 330, v: 11, b: "werkzeuge", name: "java Datei.java", titel: "Launch Single-File Source-Code Programs",
      worum: "`java Datei.java` übersetzt und startet ein Programm in einem Schritt.",
      warum: "Skripte und Spielwiesen in Java, ohne Build.",
      betrifft: "Du kleine Werkzeuge oder Versuche schreibst.",
      risiko: 0, risikoText: "Keins.", r: [1, 1, 0] },
    { nr: 238, v: 9, b: "werkzeuge", name: "Multi-Release-JARs", titel: "Multi-Release JAR Files",
      worum: "Ein JAR kann je Java-Release eigene Klassen mitbringen (`META-INF/versions/…`).",
      warum: "Bibliotheken unterstützen alte und neue JDKs zugleich.",
      betrifft: "Du Bibliotheken für mehrere Releases baust.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0] },
    { nr: 282, v: 9, b: "werkzeuge", name: "jlink", titel: "jlink: The Java Linker",
      worum: "Baut eine schlanke Laufzeitumgebung aus genau den Modulen, die eine Anwendung braucht.",
      warum: "Kleinere Container-Images.",
      betrifft: "Ihr Container-Images baut und jedes Megabyte zählt.",
      risiko: 0, risikoText: "Keins.", r: [1, 0, 0] },
    { nr: 260, v: 9, b: "entfernt", name: "Interna gekapselt", titel: "Encapsulate Most Internal APIs",
      worum: "Die meisten `sun.*`- und `com.sun.*`-Interna sind nicht mehr zugänglich; kritische wie `sun.misc.Unsafe` bleiben vorerst.",
      warum: "Der Anfang der starken Kapselung.",
      betrifft: "Dein Code oder eine Bibliothek Klassen aus `sun.*` importiert.",
      risiko: 1, risikoText: "Fehler beim Übersetzen, vorher zu finden mit `jdeps --jdk-internals`.", r: [1, 1, 1] },
    { nr: 252, v: 9, b: "entfernt", name: "CLDR als Standard", titel: "Use CLDR Locale Data by Default",
      worum: "Datums- und Zahlformate kommen aus dem Unicode-CLDR statt aus den JDK-eigenen Daten.",
      warum: "Still geänderte Ausgaben: „Mo., 14. Sept. 2026“ statt „Mo, 14. Sep 2026“, ein geschütztes Leerzeichen vor dem €.",
      betrifft: "Ihr formatierte Daten oder Beträge in Dateien oder Schnittstellen schreibt.",
      risiko: 2, risikoText: "Still – kein Fehler, nur andere Zeichen (Modul `datumsformat`). `-Djava.locale.providers=COMPAT` half bis 22; heute das Format im Code festlegen.", r: [1, 2, 1] },
    { nr: 291, v: 9, b: "entfernt", name: "CMS abgekündigt", titel: "Deprecate the Concurrent Mark Sweep (CMS) Garbage Collector",
      worum: "Der CMS-Collector wird abgekündigt – entfernt mit 14 (JEP 363).",
      warum: "Die Ankündigung, die viele überlesen haben.",
      betrifft: "Eure Startskripte `-XX:+UseConcMarkSweepGC` enthalten.",
      risiko: 1, risikoText: "Bis 13 eine Warnung, ab 14 startet die JVM nicht mehr.", r: [1, 1, 2] },
    { nr: 320, v: 11, b: "entfernt", name: "Java EE und CORBA entfernt", titel: "Remove the Java EE and CORBA Modules",
      worum: "JAXB, JAX-WS, JAF, `javax.annotation` und CORBA sind nicht mehr im JDK.",
      warum: "Der häufigste Bruch beim Sprung von 8 auf 11.",
      betrifft: "Ihr XML mit JAXB bindet oder SOAP-Dienste nutzt.",
      risiko: 2, risikoText: "Bricht beim Übersetzen und zur Laufzeit (Modul `jaxb`). Abhilfe: die Jakarta-Bibliotheken als Abhängigkeit; in Server-Anwendungen bringt sie der Server mit.", r: [1, 2, 1] },
    { nr: 335, v: 11, b: "entfernt", name: "Nashorn abgekündigt", titel: "Deprecate the Nashorn JavaScript Engine",
      worum: "Die JavaScript-Engine im JDK wird abgekündigt – entfernt mit 15 (JEP 372).",
      warum: "Wer Skripte per `ScriptEngine` ausführt, braucht eine Alternative.",
      betrifft: "Ihr Regeln oder Formeln als JavaScript ausführt.",
      risiko: 1, risikoText: "Bis 14 eine Warnung, ab 15 liefert `getEngineByName(\"nashorn\")` `null`.", r: [0, 1, 1] },

    // ===== 11 → 17 =====
    { nr: 361, v: 14, b: "sprache", name: "Switch-Expressions", titel: "Switch Expressions", kette: [[325, 12], [354, 13]],
      worum: "`switch` als Ausdruck mit `case … ->`, ohne Durchfallen, mit `yield` für Blöcke.",
      warum: "Kürzere, sichere Fallunterscheidungen; über Enums prüft der Compiler die Vollständigkeit.",
      betrifft: "Du Fallunterscheidungen über Enums oder Konstanten schreibst.",
      risiko: 1, risikoText: "`yield` ist eingeschränkt: Ein unqualifizierter Aufruf einer eigenen Methode `yield()` übersetzt nicht mehr (Modul `eingeschraenkte-bezeichner`).", r: [2, 2, 1] },
    { nr: 378, v: 15, b: "sprache", name: "Text-Blöcke", titel: "Text Blocks", kette: [[355, 13], [368, 14]],
      worum: "Mehrzeilige Zeichenketten zwischen `\"\"\"` – ohne `\\n` und Verkettung.",
      warum: "SQL, JSON und Berichte lesbar im Code.",
      betrifft: "Du mehrzeilige Texte im Code hast.",
      risiko: 0, risikoText: "Keins; beim Umbau auf Einrückung und Zeilenende achten.", r: [2, 2, 2] },
    { nr: 394, v: 16, b: "sprache", name: "Muster mit instanceof", titel: "Pattern Matching for instanceof", kette: [[305, 14], [375, 15]],
      worum: "`if (o instanceof Kunde k)` – prüfen und binden in einem Schritt, ohne Cast.",
      warum: "Der erste Schritt zu Mustern im `switch`.",
      betrifft: "Dein Code `instanceof` mit Cast enthält.",
      risiko: 0, risikoText: "Keins.", r: [1, 1, 2] },
    { nr: 395, v: 16, b: "sprache", name: "Records", titel: "Records", kette: [[359, 14], [384, 15]],
      worum: "`record Position(String artikel, int menge)` – Konstruktor, Zugriffsmethoden, `equals`, `hashCode` und `toString` vom Compiler.",
      warum: "Unveränderliche Datenträger ohne Boilerplate.",
      betrifft: "Du DTOs, Werte oder Ereignisse modellierst.",
      risiko: 1, risikoText: "`toString` zeigt alle Komponenten, auch sensible; Frameworks, die JavaBeans-Getter erwarten, kennen `artikel()` nicht.", r: [2, 2, 1] },
    { nr: 409, v: 17, b: "sprache", name: "Versiegelte Klassen", titel: "Sealed Classes", kette: [[360, 15], [397, 16]],
      worum: "`sealed interface Zahlart permits Rechnung, Lastschrift, …` legt fest, wer erben darf.",
      warum: "Der Compiler kennt alle Fälle – die Grundlage für vollständige `switch`.",
      betrifft: "Du eine feste Menge von Varianten modellierst.",
      risiko: 0, risikoText: "Keins.", r: [2, 2, 1] },
    { nr: 356, v: 17, b: "api", name: "Zufallszahlen", titel: "Enhanced Pseudo-Random Number Generators",
      worum: "`RandomGenerator` als gemeinsame Schnittstelle und neue Algorithmen, auch für Streams und parallele Arbeit.",
      warum: "Austauschbare, bessere Zufallszahlen.",
      betrifft: "Du Zufallszahlen für Simulationen oder Tests brauchst.",
      risiko: 0, risikoText: "Keins.", r: [0, 1, 0] },
    { nr: 380, v: 16, b: "api", name: "Unix-Domain-Sockets", titel: "Unix-Domain Socket Channels",
      worum: "`SocketChannel` und `ServerSocketChannel` auch über Unix-Domain-Sockets.",
      warum: "Schnelle Verbindungen zwischen Prozessen auf demselben Rechner, etwa zu einem Sidecar.",
      betrifft: "Prozesse auf demselben Rechner miteinander sprechen.",
      risiko: 0, risikoText: "Keins.", r: [1, 0, 0] },
    { nr: 358, v: 14, b: "jvm", name: "Hilfreiche NullPointerExceptions", titel: "Helpful NullPointerExceptions",
      worum: "Die Meldung nennt, was `null` war: „because the return value of …getKunde() is null“.",
      warum: "Fehler in Produktion schneller finden – ohne Codeänderung.",
      betrifft: "Du jemals eine NullPointerException gesucht hast.",
      risiko: 0, risikoText: "Keins; Tests, die auf den genauen Meldungstext prüfen, ändern sich.", r: [2, 2, 2] },
    { nr: 377, v: 15, b: "jvm", name: "ZGC", titel: "ZGC: A Scalable Low-Latency Garbage Collector (Production)", kette: [[333, 11, "Experimentell"]],
      worum: "Ein Collector mit Pausen unter einer Millisekunde, auch bei großen Heaps.",
      warum: "Für Dienste mit engen Antwortzeiten. Gemessen am Übungsprojekt: längste Pause 0,04 ms statt 8,5 ms mit G1.",
      betrifft: "Eure Antwortzeiten unter GC-Pausen leiden.",
      risiko: 0, risikoText: "Keins; kostet mehr CPU und Speicher.", r: [2, 0, 1] },
    { nr: 379, v: 15, b: "jvm", name: "Shenandoah", titel: "Shenandoah: A Low-Pause-Time Garbage Collector (Production)", kette: [[189, 12, "Experimentell"]],
      worum: "Ein weiterer Collector mit kurzen Pausen.",
      warum: "Eine Alternative zu ZGC – nicht in jeder Distribution enthalten.",
      betrifft: "Eure Distribution ihn mitliefert und ZGC nicht passt.",
      risiko: 0, risikoText: "Keins.", r: [1, 0, 0] },
    { nr: 341, v: 12, b: "jvm", name: "CDS-Standardarchiv", titel: "Default CDS Archives",
      worum: "Das JDK bringt ein Archiv seiner eigenen Klassen mit – jeder Start profitiert.",
      warum: "Schnellerer Start ohne eine einzige Option.",
      betrifft: "Startzeit zählt.",
      risiko: 0, risikoText: "Keins.", r: [1, 1, 0] },
    { nr: 350, v: 13, b: "jvm", name: "Dynamisches CDS-Archiv", titel: "Dynamic CDS Archives",
      worum: "`-XX:ArchiveClassesAtExit` schreibt nach einem Lauf ein Archiv der Anwendungsklassen.",
      warum: "AppCDS in einem Schritt. Gemessen: REST-Schnittstelle 311 → 218 ms Startzeit auf JDK 21.",
      betrifft: "Startzeit zählt und Ihr noch auf 21 seid.",
      risiko: 0, risikoText: "Keins.", r: [2, 1, 0] },
    { nr: 346, v: 12, b: "jvm", name: "G1 gibt Speicher zurück", titel: "Promptly Return Unused Committed Memory from G1",
      worum: "G1 gibt ungenutzten Heap auch im Leerlauf an das Betriebssystem zurück.",
      warum: "Im Container und in der Cloud zählt belegter, nicht genutzter Speicher.",
      betrifft: "Eure Anwendung lange Leerlaufphasen hat.",
      risiko: 0, risikoText: "Keins.", r: [2, 1, 1] },
    { nr: 349, v: 14, b: "jvm", name: "JFR-Streaming", titel: "JFR Event Streaming",
      worum: "JFR-Ereignisse laufend lesen, statt erst eine Aufzeichnung auszuwerten.",
      warum: "Überwachung im laufenden Betrieb.",
      betrifft: "Ihr eigene Überwachung baut.",
      risiko: 0, risikoText: "Keins.", r: [1, 0, 1] },
    { nr: 392, v: 16, b: "werkzeuge", name: "jpackage", titel: "Packaging Tool", kette: [[343, 14, "Incubator"]],
      worum: "Baut installierbare Pakete (`.msi`, `.dmg`, `.deb`) samt Laufzeit.",
      warum: "Für Desktop-Anwendungen.",
      betrifft: "Du Anwendungen zum Installieren auslieferst.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0] },
    { nr: 363, v: 14, b: "entfernt", name: "CMS entfernt", titel: "Remove the Concurrent Mark Sweep (CMS) Garbage Collector",
      worum: "Der CMS-Collector ist nicht mehr im JDK.",
      warum: "Alte Startskripte brechen – ein Bruch, der in keinem Quelltext steht.",
      betrifft: "`-XX:+UseConcMarkSweepGC` in Startskript oder Dockerfile steht.",
      risiko: 2, risikoText: "Gemessen auf 21 und 25: „Unrecognized VM option“ – die JVM startet nicht.", r: [1, 1, 2] },
    { nr: 372, v: 15, b: "entfernt", name: "Nashorn entfernt", titel: "Remove the Nashorn JavaScript Engine",
      worum: "Die JavaScript-Engine ist aus dem JDK entfernt.",
      warum: "Skripte brauchen eine eigene Engine, etwa GraalJS.",
      betrifft: "Ihr per `ScriptEngine` JavaScript ausführt.",
      risiko: 2, risikoText: "`getEngineByName(\"nashorn\")` liefert `null` – erst zur Laufzeit.", r: [0, 1, 1] },
    { nr: 390, v: 16, b: "entfernt", name: "Warnung bei Wertklassen", titel: "Warnings for Value-Based Classes",
      worum: "Der Compiler warnt, wenn auf `Integer`, `LocalDate` und anderen wertbasierten Klassen synchronisiert wird; ihre Konstruktoren wie `new Integer(…)` sind zur Entfernung abgekündigt.",
      warum: "Die Vorbereitung auf Valhalla (siehe Ausblick).",
      betrifft: "Du `new Integer(…)` schreibst oder auf solchen Objekten synchronisierst.",
      risiko: 1, risikoText: "Heute Warnungen, mit Valhalla Fehler.", r: [1, 1, 1] },
    { nr: 396, v: 16, b: "entfernt", name: "Kapselung als Standard", titel: "Strongly Encapsulate JDK Internals by Default",
      worum: "`--illegal-access=deny` wird Standard: Deep Reflection auf JDK-Interna scheitert zur Laufzeit.",
      warum: "Der Bruch, der den Sprung von 8 auf 17 für viele Bibliotheken schmerzhaft machte.",
      betrifft: "Dein Code oder eine Bibliothek per `setAccessible(true)` in JDK-Klassen greift.",
      risiko: 2, risikoText: "`InaccessibleObjectException` zur Laufzeit; Notlösung `--add-opens` (Modul `reflection`).", r: [1, 1, 2] },
    { nr: 403, v: 17, b: "entfernt", name: "Kapselung ohne Ausweg", titel: "Strongly Encapsulate JDK Internals",
      worum: "`--illegal-access` ist wirkungslos; nur noch `--add-opens` öffnet einzelne Pakete.",
      warum: "Ab 17 gibt es keinen Schalter mehr, der alles wieder öffnet.",
      betrifft: "Ihr bisher mit `--illegal-access=permit` gestartet habt.",
      risiko: 2, risikoText: "Startskripte und Bibliotheken müssen nachziehen.", r: [1, 1, 2] },
    { nr: 411, v: 17, b: "entfernt", name: "Security Manager abgekündigt", titel: "Deprecate the Security Manager for Removal",
      worum: "Der Security Manager wird zur Entfernung abgekündigt – abgeschaltet mit 24 (JEP 486).",
      warum: "Wer damit Plugins oder fremden Code einsperrt, braucht ein anderes Konzept.",
      betrifft: "Eure Anwendung oder Euer Server einen Security Manager installiert.",
      risiko: 1, risikoText: "Ab 18 eine Warnung, ab 24 vorbei.", r: [0, 1, 2] },
    { nr: 398, v: 17, b: "entfernt", name: "Applet-API abgekündigt", titel: "Deprecate the Applet API for Removal",
      worum: "Die Applet-API wird zur Entfernung abgekündigt – entfernt mit 26 (JEP 504).",
      warum: "Historisch; Browser führen seit Jahren keine Applets mehr aus.",
      betrifft: "Noch Applet-Klassen im Code liegen.",
      risiko: 0, risikoText: "Praktisch keins.", r: [0, 0, 0] },

    // ===== 17 → 21 =====
    { nr: 441, v: 21, b: "sprache", name: "Muster im switch", titel: "Pattern Matching for switch", kette: [[406, 17], [420, 18], [427, 19], [433, 20]],
      worum: "`switch` über Typen mit Mustern, `when`-Wächtern und `case null`; über versiegelte Typen vollständig ohne `default`.",
      warum: "Fallunterscheidungen, deren Vollständigkeit der Compiler prüft.",
      betrifft: "Du Typen unterscheidest oder einen Visitor pflegst.",
      risiko: 0, risikoText: "Keins.", r: [2, 2, 1] },
    { nr: 440, v: 21, b: "sprache", name: "Record-Patterns", titel: "Record Patterns", kette: [[405, 19], [432, 20]],
      worum: "Records im Muster zerlegen: `case Rechnung(var tage) -> …`.",
      warum: "Daten und Fallunterscheidung passen zusammen – der Visitor wird überflüssig.",
      betrifft: "Du Records nach ihrem Inhalt unterscheidest.",
      risiko: 0, risikoText: "Keins.", r: [2, 2, 1] },
    { nr: 430, v: 21, b: "sprache", name: "String Templates", titel: "String Templates (Preview)", zurückgezogen: true,
      weg: [[430, 21, "Preview"], [459, 22, "Preview"], [465, 23, "zurückgezogen"]],
      worum: "`STR.\"Hallo \\{name}\"` – Text mit eingebetteten Ausdrücken und Prozessoren, etwa für sicheres SQL.",
      warum: "Das Lehrbeispiel für Preview: zweimal ausgeliefert, vor 23 zurückgezogen. Wer es nutzte, musste zurückbauen.",
      betrifft: "Du Preview-Features in Produktion nutzen willst.",
      risiko: 2, risikoText: "Preview-Code bricht beim nächsten Release – hier sogar ganz.", r: [0, 0, 0] },
    { nr: 444, v: 21, b: "api", name: "Virtual Threads", titel: "Virtual Threads", kette: [[425, 19], [436, 20]],
      worum: "Leichte Threads, die beim Blockieren ihren Träger freigeben – Hunderttausende sind möglich.",
      warum: "Blockierender Code skaliert, ohne ihn reaktiv umzuschreiben. Gemessen: Batch-Import 1329 → 71 ms auf JDK 25.",
      betrifft: "Deine Anwendung viel auf andere Systeme wartet.",
      risiko: 1, risikoText: "Pinning bei `synchronized` bis 23 (behoben mit JEP 491); `ThreadLocal`-Caches vervielfachen sich.", r: [2, 2, 1] },
    { nr: 431, v: 21, b: "api", name: "Sequenced Collections", titel: "Sequenced Collections",
      worum: "`getFirst()`, `getLast()` und `reversed()` für Listen, Deques sowie sortierte Mengen und Maps.",
      warum: "Ein gemeinsamer Zugriff auf Anfang und Ende.",
      betrifft: "Du erste oder letzte Elemente liest – oder eigene Collections mit solchen Methoden hast.",
      risiko: 1, risikoText: "Eigene Methoden `getFirst()` mit anderem Rückgabetyp übersetzen nicht mehr (Modul `sequenced`).", r: [1, 1, 1] },
    { nr: 439, v: 21, b: "jvm", name: "Generational ZGC", titel: "Generational ZGC",
      worum: "ZGC trennt junge und alte Objekte und räumt die jungen häufiger auf.",
      warum: "Weniger CPU und Speicher für dieselben kurzen Pausen; ab 23 der Standard-Modus (JEP 474).",
      betrifft: "Ihr ZGC nutzt.",
      risiko: 0, risikoText: "Keins.", r: [2, 0, 1] },
    { nr: 408, v: 18, b: "werkzeuge", name: "jwebserver", titel: "Simple Web Server",
      worum: "`jwebserver` liefert ein Verzeichnis statischer Dateien aus.",
      warum: "Zum Testen und Ausprobieren, nicht für Produktion.",
      betrifft: "Du schnell Dateien per HTTP bereitstellen willst.",
      risiko: 0, risikoText: "Keins.", r: [1, 0, 0] },
    { nr: 413, v: 18, b: "werkzeuge", name: "@snippet in Javadoc", titel: "Code Snippets in Java API Documentation",
      worum: "`{@snippet …}` bindet geprüfte Code-Beispiele in Javadoc ein.",
      warum: "Beispiele, die nicht veralten.",
      betrifft: "Du Bibliotheken dokumentierst.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0] },
    { nr: 400, v: 18, b: "entfernt", name: "UTF-8 als Standard", titel: "UTF-8 by Default",
      worum: "Der Standard-Zeichensatz ist überall UTF-8, nicht mehr der des Betriebssystems.",
      warum: "Unter Windows lesen und schreiben `FileReader` und Co. plötzlich anders.",
      betrifft: "Ihr Dateien ohne ausdrücklichen Zeichensatz lest oder schreibt.",
      risiko: 2, risikoText: "Still – Umlaute werden falsch, kein Fehler (Modul `zeichensatz`). Notlösung `-Dfile.encoding=COMPAT`; besser den Zeichensatz im Code nennen.", r: [1, 2, 1] },
    { nr: 421, v: 18, b: "entfernt", name: "Finalisierung abgekündigt", titel: "Deprecate Finalization for Removal",
      worum: "`finalize()` ist zur Entfernung abgekündigt; mit `--finalization=disabled` lässt sich ihr Fehlen schon testen.",
      warum: "Aufräumen gehört in try-with-resources oder einen `Cleaner`.",
      betrifft: "Eure Klassen oder alte Bibliotheken `finalize()` überschreiben.",
      risiko: 1, risikoText: "Heute Warnungen; ist es entfernt, werden Ressourcen still nicht mehr freigegeben.", r: [1, 1, 1] },
    { nr: 451, v: 21, b: "entfernt", name: "Agenten nur noch beim Start", titel: "Prepare to Disallow the Dynamic Loading of Agents",
      worum: "Lädt sich ein Agent zur Laufzeit in eine JVM, gibt es eine Warnung; künftig braucht er `-XX:+EnableDynamicAgentLoading`.",
      warum: "Betrifft Mocking-Bibliotheken und Überwachungswerkzeuge.",
      betrifft: "Ihr Mockito, Byte Buddy oder einen APM-Agenten dynamisch ladet.",
      risiko: 1, risikoText: "Warnungen in Testläufen; Agenten besser beim Start mit `-javaagent` laden.", r: [1, 1, 1] },

    // ===== 21 → 25 =====
    { nr: 456, v: 22, b: "sprache", name: "Unbenannte Variablen _", titel: "Unnamed Variables & Patterns", kette: [[443, 21]],
      worum: "`_` für Variablen und Musterteile, die man nicht braucht: `catch (Exception _)`, `case Rechnung _`.",
      warum: "Zeigt im Code, was bewusst ungenutzt bleibt.",
      betrifft: "Du ungenutzte Variablen oder Musterteile hast.",
      risiko: 0, risikoText: "Keins – `_` war seit 9 kein Bezeichner mehr.", r: [1, 1, 0] },
    { nr: 513, v: 25, b: "sprache", name: "Flexible Konstruktoren", titel: "Flexible Constructor Bodies", kette: [[447, 22], [482, 23], [492, 24]],
      worum: "Code vor `super(…)` und `this(…)`: Argumente prüfen und berechnen, bevor die Oberklasse läuft.",
      warum: "Kein Umweg über statische Hilfsmethoden mehr für die Prüfung im Konstruktor.",
      betrifft: "Du Konstruktorargumente prüfst, bevor Du sie weiterreichst.",
      risiko: 0, risikoText: "Keins.", r: [1, 1, 1] },
    { nr: 512, v: 25, b: "sprache", name: "Kompakte Quelldateien", titel: "Compact Source Files and Instance Main Methods", kette: [[445, 21], [463, 22], [477, 23], [495, 24]],
      worum: "`void main() { … }` ohne Klasse und ohne `static`; `IO.println` für Ausgaben.",
      warum: "Kleine Programme ohne Zeremonie – für Skripte und den Einstieg.",
      betrifft: "Du kleine Werkzeuge in Java schreibst.",
      risiko: 0, risikoText: "Keins.", r: [0, 1, 0] },
    { nr: 511, v: 25, b: "sprache", name: "Modul-Importe", titel: "Module Import Declarations", kette: [[476, 23], [494, 24]],
      worum: "`import module java.base;` importiert alle exportierten Pakete eines Moduls.",
      warum: "Kurze Importe für Skripte und kleine Programme.",
      betrifft: "Du kleine Programme oder Skripte schreibst.",
      risiko: 1, risikoText: "Mehrdeutige Namen (`List` aus `java.util` und `java.awt`) brauchen einen Einzelimport.", r: [0, 0, 0] },
    { nr: 485, v: 24, b: "api", name: "Stream Gatherers", titel: "Stream Gatherers", kette: [[461, 22], [473, 23]],
      worum: "Eigene Zwischenoperationen für Streams: `gather(Gatherers.windowFixed(100))` für Pakete, gleitende Fenster, Abbruch.",
      warum: "Was mit Collectors nicht ging: Gruppen in der Reihenfolge des Streams.",
      betrifft: "Du Daten in Paketen oder Fenstern verarbeitest.",
      risiko: 0, risikoText: "Keins.", r: [1, 2, 0] },
    { nr: 506, v: 25, b: "api", name: "Scoped Values", titel: "Scoped Values", kette: [[429, 20, "Incubator"], [446, 21], [464, 22], [481, 23], [487, 24]],
      worum: "Ein Wert, der für einen Aufruf und alles darin gilt – unveränderlich und ohne Aufräumen.",
      warum: "Der Nachfolger von `ThreadLocal` für Kontext wie Korrelations-IDs, passend zu virtuellen Threads.",
      betrifft: "Ihr Kontext per `ThreadLocal` weiterreicht.",
      risiko: 0, risikoText: "Keins.", r: [2, 1, 1] },
    { nr: 454, v: 22, b: "api", name: "Foreign Function & Memory", titel: "Foreign Function & Memory API", kette: [[424, 19], [434, 20], [442, 21]],
      worum: "Native Bibliotheken aufrufen und Speicher außerhalb des Heaps verwalten – ohne JNI.",
      warum: "Der Nachfolger von JNI und den Speicherzugriffen in `sun.misc.Unsafe`.",
      betrifft: "Ihr native Bibliotheken anbindet.",
      risiko: 0, risikoText: "Keins.", r: [0, 1, 0] },
    { nr: 484, v: 24, b: "api", name: "Class-File API", titel: "Class-File API", kette: [[457, 22], [466, 23]],
      worum: "Klassendateien lesen, erzeugen und umbauen – mit dem JDK statt mit ASM.",
      warum: "Frameworks und Werkzeuge hängen nicht mehr am Release einer Bytecode-Bibliothek.",
      betrifft: "Du Bytecode erzeugst oder analysierst.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0] },
    { nr: 491, v: 24, b: "jvm", name: "Kein Pinning bei synchronized", titel: "Synchronize Virtual Threads without Pinning",
      worum: "Ein virtueller Thread, der in `synchronized` blockiert, gibt seinen Träger frei.",
      warum: "Der größte Vorbehalt gegen virtuelle Threads unter 21 entfällt. Gemessen: Batch-Import 893 ms auf 21, 71 ms auf 25.",
      betrifft: "Ihr virtuelle Threads mit altem Code oder alten Treibern nutzt.",
      risiko: 0, risikoText: "Keins.", r: [2, 2, 1] },
    { nr: 483, v: 24, b: "jvm", name: "AOT-Cache", titel: "Ahead-of-Time Class Loading & Linking",
      worum: "Ein Trainingslauf schreibt geladene und gelinkte Klassen in einen Cache; die nächsten Starts lesen ihn.",
      warum: "Gemessen: REST-Schnittstelle 311 → 194 ms Startzeit.",
      betrifft: "Startzeit zählt.",
      risiko: 0, risikoText: "Keins; der Cache passt nur zu gleichem JDK und Klassenpfad.", r: [2, 1, 0] },
    { nr: 514, v: 25, b: "jvm", name: "AOT in einem Schritt", titel: "Ahead-of-Time Command-Line Ergonomics",
      worum: "`-XX:AOTCacheOutput` erzeugt den Cache in einem Lauf statt in zwei.",
      warum: "Der AOT-Cache wird alltagstauglich.",
      betrifft: "Ihr den AOT-Cache im Build erzeugt.",
      risiko: 0, risikoText: "Keins.", r: [2, 1, 0] },
    { nr: 515, v: 25, b: "jvm", name: "AOT-Profile", titel: "Ahead-of-Time Method Profiling",
      worum: "Der Cache enthält auch Profile aus dem Trainingslauf – der JIT optimiert früher.",
      warum: "Schneller auf voller Leistung nach dem Start.",
      betrifft: "Eure Dienste kurz nach dem Start Last tragen müssen.",
      risiko: 0, risikoText: "Keins.", r: [2, 0, 0] },
    { nr: 519, v: 25, b: "jvm", name: "Kompakte Objekt-Header", titel: "Compact Object Headers", kette: [[450, 24, "Experimentell"]],
      worum: "Objekt-Header schrumpfen auf 8 Byte; einschalten mit `-XX:+UseCompactObjectHeaders`.",
      warum: "Weniger Heap bei vielen kleinen Objekten – ab 27 Standard.",
      betrifft: "Eure Anwendung viele kleine Objekte hält.",
      risiko: 0, risikoText: "Keins.", r: [1, 2, 1] },
    { nr: 474, v: 23, b: "jvm", name: "ZGC nur generational", titel: "ZGC: Generational Mode by Default",
      worum: "Generational ZGC wird Standard; mit 24 entfällt der alte Modus (JEP 490).",
      warum: "Wer ZGC einschaltet, bekommt die bessere Variante.",
      betrifft: "Eure Startskripte `-XX:-ZGenerational` setzen.",
      risiko: 1, risikoText: "Gemessen auf 25: Die Option wird mit einer Warnung ignoriert.", r: [1, 0, 1] },
    { nr: 458, v: 22, b: "werkzeuge", name: "Mehrere Quelldateien starten", titel: "Launch Multi-File Source-Code Programs",
      worum: "`java Haupt.java` darf weitere Quelldateien im selben Ordner nutzen.",
      warum: "Kleine Programme wachsen über eine Datei hinaus, ohne Build.",
      betrifft: "Du Skripte in Java schreibst.",
      risiko: 0, risikoText: "Keins.", r: [0, 1, 0] },
    { nr: 467, v: 23, b: "werkzeuge", name: "Javadoc in Markdown", titel: "Markdown Documentation Comments",
      worum: "Javadoc-Kommentare mit `///` in Markdown statt HTML.",
      warum: "Lesbare Dokumentation im Quelltext.",
      betrifft: "Du Javadoc schreibst.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0] },
    { nr: 486, v: 24, b: "entfernt", name: "Security Manager abgeschaltet", titel: "Permanently Disable the Security Manager",
      worum: "Ein Security Manager lässt sich nicht mehr einschalten; `-Djava.security.manager=allow` hilft nicht mehr.",
      warum: "Das Ende einer Ära – auch für Server, die ihn genutzt haben.",
      betrifft: "Eure Anwendung `System.setSecurityManager` aufruft.",
      risiko: 2, risikoText: "`UnsupportedOperationException` zur Laufzeit (Modul `security-manager`).", r: [0, 1, 2] },
    { nr: 498, v: 24, b: "entfernt", name: "Warnung bei Unsafe", titel: "Warn upon Use of Memory-Access Methods in sun.misc.Unsafe", kette: [[471, 23, "Abkündigung"]],
      worum: "Die Speicherzugriffe von `sun.misc.Unsafe` lösen eine Warnung aus – sie werden entfernt.",
      warum: "Viele Bibliotheken nutzen sie noch; Maven selbst warnt auf 25.",
      betrifft: "Beim Start eine Warnung zu `sun.misc.Unsafe` erscheint.",
      risiko: 1, risikoText: "Heute Warnungen, künftig Fehler – Bibliotheken aktuell halten.", r: [1, 1, 1] },
    { nr: 472, v: 24, b: "entfernt", name: "JNI eingeschränkt", titel: "Prepare to Restrict the Use of JNI",
      worum: "Das Laden nativer Bibliotheken per JNI warnt; erlauben mit `--enable-native-access`.",
      warum: "Wie bei der Kapselung: erst warnen, dann verbieten.",
      betrifft: "Ihr oder eine Bibliothek native Bibliotheken ladet.",
      risiko: 1, risikoText: "Warnungen, künftig Fehler ohne Erlaubnis.", r: [0, 1, 1] }
  ];

  const sprünge = [
    { id: "11", titel: "8 → 11", unter: "Java 9–11 · LTS 2018", bis: 11 },
    { id: "17", titel: "11 → 17", unter: "Java 12–17 · LTS 2021", bis: 17 },
    { id: "21", titel: "17 → 21", unter: "Java 18–21 · LTS 2023", bis: 21 },
    { id: "25", titel: "21 → 25", unter: "Java 22–25 · LTS 2025", bis: 25 }
  ];
  const bereiche = [
    { id: "sprache", titel: "Sprache (JLS)" },
    { id: "api", titel: "API" },
    { id: "jvm", titel: "JVM und Laufzeit" },
    { id: "werkzeuge", titel: "Werkzeuge" },
    { id: "entfernt", titel: "Entfernt und verschärft" }
  ];
  const arten = [
    { id: "rest", titel: "REST-Microservice" },
    { id: "batch", titel: "Batch-Programm" },
    { id: "server", titel: "Server-Anwendung" }
  ];
  const stufen = ["gering", "mittel", "hoch"];

  function sprungVon(jep) {
    for (const s of sprünge) if (jep.v <= s.bis) return s.id;
    return "25";
  }
  function vorabzahl(jep) {
    return (jep.kette || []).length;
  }

  // ---------------------------------------------------------------------------
  // ZUSTAND – eine Wahrheit, eine Funktion macht ihn sichtbar (zeichnen).
  // ---------------------------------------------------------------------------
  const stand = { art: "", lts: "", bereich: "", jep: "" };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  // `code` → <code>code</code>, nach dem Maskieren.
  function text(s) {
    return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function finde(nr) {
    return jeps.find(function (j) { return String(j.nr) === String(nr); });
  }

  function aufbauen() {
    const karte = document.getElementById("jl-karte");
    let html = '<div aria-hidden="true"></div>';
    sprünge.forEach(function (s) {
      html += '<div class="jl-kopf" data-lts="' + s.id + '"><b>' + esc(s.titel) + "</b><span>" + esc(s.unter) + "</span></div>";
    });
    bereiche.forEach(function (b) {
      html += '<div class="jl-zeilenkopf" data-bereich="' + b.id + '">' + esc(b.titel) + "</div>";
      sprünge.forEach(function (s) {
        const drin = jeps.filter(function (j) { return j.b === b.id && sprungVon(j) === s.id; })
                         .sort(function (x, y) { return x.v - y.v || x.nr - y.nr; });
        html += '<div class="jl-zelle">';
        drin.forEach(function (j) {
          let meta = "JEP " + j.nr + " · " + (j.zurückgezogen ? "Preview 21 · zurückgezogen" : "Java " + j.v);
          if (vorabzahl(j) && !j.zurückgezogen) meta += " · " + vorabzahl(j) + "× vorab";
          html += '<button type="button" class="jl-chip' + (j.zurückgezogen ? " is-zurueckgezogen" : "")
               + '" data-nr="' + j.nr + '"><span class="jl-chip__name">' + esc(j.name)
               + '</span><span class="jl-chip__meta">' + esc(meta) + "</span></button>";
        });
        html += "</div>";
      });
    });
    karte.innerHTML = html;
    karte.addEventListener("click", function (e) {
      const chip = e.target.closest(".jl-chip");
      if (!chip) return;
      stand.jep = chip.dataset.nr;
      zeichnen();
      melden();
    });

    knöpfe("jl-knoepfe-art", "art", [{ id: "", titel: "Alle" }].concat(arten));
    knöpfe("jl-knoepfe-lts", "lts", [{ id: "", titel: "Alle" }].concat(sprünge));
    knöpfe("jl-knoepfe-bereich", "bereich", [{ id: "", titel: "Alle" }].concat(bereiche));

    druckfassung();

    const dialog = document.getElementById("jl-dialog");
    document.getElementById("jl-d-zu").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("close", function () {
      if (stand.jep) { stand.jep = ""; melden(); }
    });
  }

  function knöpfe(ziel, schlüssel, liste) {
    const box = document.getElementById(ziel);
    box.innerHTML = liste.map(function (x) {
      return '<button type="button" class="jl-knopf" data-schluessel="' + schlüssel + '" data-wert="' + x.id + '">' + esc(x.titel) + "</button>";
    }).join("");
    box.addEventListener("click", function (e) {
      const k = e.target.closest(".jl-knopf");
      if (!k) return;
      stand[schlüssel] = k.dataset.wert;
      zeichnen();
      melden();
    });
  }

  function zeichnen() {
    document.querySelectorAll(".jl-knopf").forEach(function (k) {
      k.setAttribute("aria-pressed", String(stand[k.dataset.schluessel] === k.dataset.wert));
    });
    document.querySelectorAll(".jl-kopf").forEach(function (k) {
      k.classList.toggle("is-gewaehlt", stand.lts === k.dataset.lts);
    });
    document.querySelectorAll(".jl-zeilenkopf").forEach(function (k) {
      k.classList.toggle("is-gewaehlt", stand.bereich === k.dataset.bereich);
    });
    const artIndex = arten.findIndex(function (a) { return a.id === stand.art; });
    document.querySelectorAll(".jl-chip").forEach(function (chip) {
      const j = finde(chip.dataset.nr);
      const leise = (stand.lts && sprungVon(j) !== stand.lts)
                 || (stand.bereich && j.b !== stand.bereich)
                 || (artIndex >= 0 && j.r[artIndex] === 0);
      chip.classList.toggle("is-leise", Boolean(leise));
      chip.classList.toggle("is-wichtig", !leise && artIndex >= 0 && j.r[artIndex] === 2);
    });

    const dialog = document.getElementById("jl-dialog");
    const j = stand.jep ? finde(stand.jep) : null;
    if (j) {
      füllen(j);
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }

  function weg(j) {
    if (j.weg) return j.weg;
    return (j.kette || []).map(function (k) { return [k[0], k[1], k[2] || "Preview"]; }).concat([[j.nr, j.v, "final"]]);
  }

  function füllen(j) {
    document.getElementById("jl-d-titel").textContent = j.name;
    const sprung = sprünge.find(function (s) { return s.id === sprungVon(j); });
    document.getElementById("jl-d-unter").innerHTML = "JEP " + j.nr + " · „" + esc(j.titel) + "“ · "
      + (j.zurückgezogen ? "Preview in Java 21, zurückgezogen" : "final in Java " + j.v + " · <b>LTS " + sprung.id + "</b>");
    let html = "<h3>Worum es geht</h3><p>" + text(j.worum) + "</p>"
      + "<h3>Warum das wichtig ist</h3><p>" + text(j.warum) + "</p>"
      + "<h3>Betrifft Dich, wenn …</h3><p>… " + text(j.betrifft) + "</p>"
      + '<h3>Kompatibilitätsrisiko</h3><p><span class="jl-marke jl-marke--' + j.risiko + '">' + stufen[j.risiko] + "</span>" + text(j.risikoText) + "</p>"
      + '<h3>Relevanz je Anwendungsart</h3><div class="jl-relevanz">';
    arten.forEach(function (a, i) {
      html += "<span>" + esc(a.titel) + '</span><span><span class="jl-marke">' + stufen[j.r[i]] + "</span></span>";
    });
    html += "</div>";
    const w = weg(j);
    if (w.length > 1) {
      html += '<h3>Weg zur finalen Fassung</h3><p class="jl-weg">' + w.map(function (s) {
        return '<span class="jl-schritt' + (s[2] === "final" ? " is-final" : "") + '">JEP ' + s[0] + " · " + esc(s[2]) + " in " + s[1] + "</span>";
      }).join('<span class="jl-pfeil" aria-hidden="true">→</span>') + "</p>";
    }
    html += '<p style="margin-top:1rem"><a href="https://openjdk.org/jeps/' + j.nr + '" rel="noopener">JEP ' + j.nr + " auf openjdk.org</a></p>";
    document.getElementById("jl-d-inhalt").innerHTML = html;
  }

  function druckfassung() {
    let html = "<h2>Alle JEPs im Einzelnen</h2>";
    sprünge.forEach(function (s) {
      html += "<h2>" + esc(s.titel) + "</h2>";
      jeps.filter(function (j) { return sprungVon(j) === s.id; })
          .sort(function (x, y) { return x.v - y.v || x.nr - y.nr; })
          .forEach(function (j) {
            html += "<section><h3>JEP " + j.nr + " · " + esc(j.name) + " (Java " + j.v + ")</h3><p>" + text(j.worum)
                 + "</p><p><b>Betrifft Dich, wenn</b> " + text(j.betrifft) + "</p><p><b>Risiko " + stufen[j.risiko] + ":</b> " + text(j.risikoText) + "</p></section>";
          });
    });
    document.getElementById("jl-druck").innerHTML = html;
  }

  // ---------------------------------------------------------------------------
  // ADRESSE – über skr.state des Themes, nie selbst ins Fragment schreiben.
  // Unbekannte Werte führen still in den Ausgangszustand.
  // ---------------------------------------------------------------------------
  function melden() {
    if (window.skr.state) window.skr.state.update();
  }
  function gültig(schlüssel, wert) {
    if (!wert) return "";
    const listen = { art: arten, lts: sprünge, bereich: bereiche };
    if (schlüssel === "jep") return finde(wert) ? String(wert) : "";
    return listen[schlüssel].some(function (x) { return x.id === wert; }) ? wert : "";
  }
  function anmelden() {
    if (!window.skr.state) return;
    ["art", "lts", "bereich", "jep"].forEach(function (schlüssel) {
      window.skr.state.register({
        key: schlüssel,
        read: function () { return stand[schlüssel]; },
        apply: function (wert) { stand[schlüssel] = gültig(schlüssel, wert); zeichnen(); }
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
