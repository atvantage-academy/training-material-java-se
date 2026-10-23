(function () {
  // ---------------------------------------------------------------------------
  // DATEN – eine Zeile der Gantt-Ansicht je JEP oder JEP-Kette.
  //   nr       Kennung der Zeile: der finale JEP, bei offenen Ketten der erste.
  //   v        Release, in dem der JEP final wurde (fehlt bei offenen Ketten).
  //   kette    Vorabfassungen [nr, release, art] – art fehlt = Preview.
  //   ziel     Art der finalen Station, wenn sie nicht „final“ heißt (entfernt …).
  //   danach   Stationen nach der finalen Fassung (Standard, Ausbau, entfernt).
  //   weg      ganzer Weg, wenn die Kette (noch) nicht final ist; release null =
  //            ohne Release, art „Entwurf“ oder „Kandidat“.
  //   umsetzung, beispiel [sprache, zeilen], bezug [[nr, text]] – Reiter 2 bis 4.
  //   risiko und r (Relevanz [REST, Batch, Server]) jeweils 0/1/2.
  // Stand: openjdk.org/jeps/0 und openjdk.org/projects/jdk/26 … 28, geprüft am
  // 2026-10-22. „Gemessen“ heißt: Temurin 21 und 25 in Docker (Übungsprojekt).   durable-ok
  // ---------------------------------------------------------------------------
  const jeps = [
    // ===== Sprache =====
    { nr: 261, v: 9, b: "sprache", projekt: "Jigsaw", name: "Modulsystem", titel: "Module System",
      worum: "`module-info.java` beschreibt, was ein Modul braucht (`requires`) und zeigt (`exports`); das JDK selbst besteht seither aus Modulen.",
      warum: "Die Grundlage der starken Kapselung – auch wer keine eigenen Module schreibt, lebt mit ihren Folgen.",
      betrifft: "Deine Anwendung oder eine Bibliothek per Reflection in JDK-Interna greift.",
      risiko: 1, risikoText: "Eigene Module sind freiwillig, der Klassenpfad funktioniert weiter. Die Brüche kommen über die Kapselung (JEP 260, 396, 403).", r: [0, 0, 0],
      umsetzung: "Ein Modul ist ein JAR mit `module-info.class`. Neben dem Klassenpfad gibt es den Modulpfad (`--module-path`); Code auf dem Klassenpfad liegt im unbenannten Modul und sieht alle exportierten Pakete. `requires transitive`, `requires static`, qualifizierte `exports … to`, `opens` für Reflection und `uses`/`provides` für den `ServiceLoader` verfeinern den Vertrag.",
      beispiel: ["java", [
        "// src/bestellung.domaene/module-info.java",
        "module bestellung.domaene {",
        "    requires java.logging;",
        "    exports bestellung.domaene;          // öffentliche API",
        "    opens bestellung.domaene.intern;     // nur für Reflection",
        "    uses bestellung.domaene.Zahlart;     // Erweiterungspunkt",
        "}"]],
      bezug: [[200, "das JDK in Modulen"], [282, "jlink baut darauf auf"], [260, "Kapselung der Interna"], [511, "Modul-Importe (25)"]] },
    { nr: 213, v: 9, b: "sprache", projekt: "Coin", name: "Project Coin, Feinschliff", titel: "Milling Project Coin",
      worum: "Kleine Korrekturen: private Methoden in Interfaces, effektiv finale Variablen in try-with-resources, Diamant bei anonymen Klassen – und `_` ist kein Bezeichner mehr.",
      warum: "Private Interface-Methoden räumen Default-Methoden auf; der Rest spart Zeilen.",
      betrifft: "Du Default-Methoden mit gemeinsamer Logik schreibst – oder eine Variable `_` heißt.",
      risiko: 1, risikoText: "`_` als Bezeichner übersetzt ab Release 9 nicht mehr (im Übungsprojekt: Modul `unterstrich`).", r: [1, 1, 1],
      umsetzung: "Fünf Änderungen an der Sprache, ohne neue Schlüsselwörter: `private` (auch `private static`) in Interfaces, `try (eingabe)` mit einer schon deklarierten, effektiv finalen Variable, `<>` bei anonymen Klassen, `@SafeVarargs` an privaten Methoden – und `_` wird reserviert (Java 8 warnte nur).",
      beispiel: ["java", [
        "interface Gebühr {",
        "    default long brutto(long netto) { return runde(netto * 119); }",
        "    default long ermäßigt(long netto) { return runde(netto * 107); }",
        "",
        "    private long runde(long wert) {      // ab Java 9 erlaubt",
        "        return Math.round(wert / 100.0);",
        "    }",
        "}"]],
      bezug: [[456, "`_` wird mit 22 zum Sprachmittel"]] },
    { nr: 286, v: 10, b: "sprache", projekt: "Amber", name: "var", titel: "Local-Variable Type Inference",
      worum: "Lokale Variablen mit `var` – der Typ wird aus der rechten Seite abgeleitet und bleibt statisch.",
      warum: "Weniger Wiederholung bei langen generischen Typen.",
      betrifft: "Du lokale Variablen mit langen Typen deklarierst.",
      risiko: 0, risikoText: "`var` ist ein eingeschränkter Typname: Eine Klasse namens `var` übersetzt nicht mehr – praktisch nie der Fall.", r: [1, 1, 1],
      umsetzung: "`var` ist kein Schlüsselwort, sondern ein reservierter Typname: als Variablenname bleibt es erlaubt. Es gilt nur für lokale Variablen mit Initialisierung, in `for`-Schleifen und try-with-resources – nicht für Felder, Parameter oder Rückgabetypen, nicht mit `null` oder einem Array-Initialisierer.",
      beispiel: ["java", [
        "var positionen = new HashMap<String, List<Position>>();   // statt den Typ doppelt",
        "for (var eintrag : positionen.entrySet()) {",
        "    var artikel = eintrag.getKey();                     // String",
        "}",
        "// var leer = null;      // Fehler: Typ nicht ableitbar"]],
      bezug: [[323, "var in Lambda-Parametern (11)"]] },
    { nr: 323, v: 11, b: "sprache", projekt: "Amber", name: "var in Lambdas", titel: "Local-Variable Syntax for Lambda Parameters",
      worum: "`var` auch für Lambda-Parameter – vor allem, um Annotationen anzubringen: `(@NonNull var s) -> …`.",
      warum: "Annotationen an Lambda-Parametern ohne ausgeschriebenen Typ.",
      betrifft: "Du Lambda-Parameter annotierst.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0],
      umsetzung: "Alle Parameter eines Lambdas tragen `var` oder keiner; gemischt mit ausgeschriebenen Typen oder impliziten Parametern übersetzt es nicht.",
      beispiel: ["java", [
        "BiFunction<String, Integer, String> wiederhole =",
        "    (@NonNull var text, var anzahl) -> text.repeat(anzahl);",
        "// (var text, anzahl) -> …   // Fehler: gemischt"]],
      bezug: [[286, "var für lokale Variablen (10)"]] },
    { nr: 361, v: 14, b: "sprache", projekt: "Amber", name: "Switch-Expressions", titel: "Switch Expressions", kette: [[325, 12], [354, 13]],
      worum: "`switch` als Ausdruck mit `case … ->`, ohne Durchfallen, mit `yield` für Blöcke.",
      warum: "Kürzere, sichere Fallunterscheidungen; über Enums prüft der Compiler die Vollständigkeit.",
      betrifft: "Du Fallunterscheidungen über Enums oder Konstanten schreibst.",
      risiko: 1, risikoText: "`yield` ist eingeschränkt: Ein unqualifizierter Aufruf einer eigenen Methode `yield()` übersetzt nicht mehr (Modul `eingeschraenkte-bezeichner`).", r: [2, 2, 1],
      umsetzung: "Neue Form `case A, B -> ausdruck;` ohne `break`; mehrere Konstanten je `case`. Ein Block liefert sein Ergebnis mit `yield`. Als Ausdruck muss der `switch` vollständig sein – bei Enums genügen alle Konstanten, sonst braucht es `default`.",
      beispiel: ["java", [
        "int tage = switch (zahlart) {",
        "    case RECHNUNG -> 14;",
        "    case LASTSCHRIFT, KREDITKARTE -> 0;",
        "    case VORKASSE -> {",
        "        log(\"wartet auf Zahlung\");",
        "        yield -1;",
        "    }",
        "};"]],
      bezug: [[441, "Muster im switch (21)"]] },
    { nr: 378, v: 15, b: "sprache", projekt: "Amber", name: "Text-Blöcke", titel: "Text Blocks", kette: [[355, 13], [368, 14]],
      worum: "Mehrzeilige Zeichenketten zwischen `\"\"\"` – ohne `\\n` und Verkettung.",
      warum: "SQL, JSON und Berichte lesbar im Code.",
      betrifft: "Du mehrzeilige Texte im Code hast.",
      risiko: 0, risikoText: "Keins; beim Umbau auf Einrückung und Zeilenende achten.", r: [2, 2, 2],
      umsetzung: "Nach `\"\"\"` folgt ein Zeilenumbruch. Der Compiler entfernt die gemeinsame Einrückung (die schließenden `\"\"\"` zählen mit) und Leerzeichen am Zeilenende. `\\` am Zeilenende verbindet Zeilen, `\\s` erhält ein Leerzeichen; `formatted(…)` setzt Werte ein.",
      beispiel: ["java", [
        "String abfrage = \"\"\"",
        "    SELECT nummer, summe",
        "      FROM bestellung",
        "     WHERE kunde = ?",
        "    \"\"\";",
        "String gruß = \"\"\"",
        "    Hallo %s, \\",
        "    Deine Bestellung ist da.\"\"\".formatted(name);"]],
      bezug: [[430, "String Templates sollten darauf aufbauen"]] },
    { nr: 394, v: 16, b: "sprache", projekt: "Amber", name: "Muster mit instanceof", titel: "Pattern Matching for instanceof", kette: [[305, 14], [375, 15]],
      worum: "`if (o instanceof Kunde k)` – prüfen und binden in einem Schritt, ohne Cast.",
      warum: "Der erste Schritt zu Mustern im `switch`.",
      betrifft: "Dein Code `instanceof` mit Cast enthält.",
      risiko: 0, risikoText: "Keins.", r: [1, 1, 2],
      umsetzung: "Ein Typmuster bindet eine Variable, die nur dort gilt, wo der Test sicher wahr ist – auch im Rest einer `&&`-Kette und nach einem `if (!(o instanceof …)) return;`.",
      beispiel: ["java", [
        "if (zahlart instanceof Kreditkarte k && k.gültigBis().isAfter(heute)) {",
        "    return k.maskiert();",
        "}",
        "if (!(o instanceof Bestellung b)) return false;",
        "return nummer.equals(b.nummer());"]],
      bezug: [[441, "Muster im switch (21)"], [440, "Record-Patterns (21)"]] },
    { nr: 395, v: 16, b: "sprache", projekt: "Amber", name: "Records", titel: "Records", kette: [[359, 14], [384, 15]],
      worum: "`record Position(String artikel, int menge)` – Konstruktor, Zugriffsmethoden, `equals`, `hashCode` und `toString` vom Compiler.",
      warum: "Unveränderliche Datenträger ohne Boilerplate.",
      betrifft: "Du DTOs, Werte oder Ereignisse modellierst.",
      risiko: 1, risikoText: "`toString` zeigt alle Komponenten, auch sensible; Frameworks, die JavaBeans-Getter erwarten, kennen `artikel()` nicht.", r: [2, 2, 1],
      umsetzung: "Ein Record ist eine finale Klasse mit finalen Feldern je Komponente. Der kompakte Konstruktor prüft Argumente, ohne sie zuzuweisen; eigene Methoden, statische Felder und Interfaces sind erlaubt, weitere Instanzfelder und Vererbung nicht.",
      beispiel: ["java", [
        "record Position(String artikel, int menge) {",
        "    Position {                               // kompakter Konstruktor",
        "        if (menge <= 0) throw new IllegalArgumentException(\"menge\");",
        "    }",
        "}",
        "var p = new Position(\"Tasse\", 2);",
        "p.menge();                 // 2 – ohne get",
        "p.equals(new Position(\"Tasse\", 2));   // true"]],
      bezug: [[440, "Record-Patterns zerlegen sie (21)"], [401, "Value Objects – Werte ohne Identität"]] },
    { nr: 409, v: 17, b: "sprache", projekt: "Amber", name: "Versiegelte Klassen", titel: "Sealed Classes", kette: [[360, 15], [397, 16]],
      worum: "`sealed interface Zahlart permits Rechnung, Lastschrift, …` legt fest, wer erben darf.",
      warum: "Der Compiler kennt alle Fälle – die Grundlage für vollständige `switch`.",
      betrifft: "Du eine feste Menge von Varianten modellierst.",
      risiko: 0, risikoText: "Keins.", r: [2, 2, 1],
      umsetzung: "Jede erlaubte Unterklasse ist `final`, `sealed` oder `non-sealed` und liegt im selben Modul (ohne Module im selben Paket). Stehen alle in derselben Datei, darf `permits` fehlen. Records und Enums sind implizit final.",
      beispiel: ["java", [
        "sealed interface Zahlart permits Rechnung, Lastschrift, Kreditkarte {}",
        "record Rechnung(int tage) implements Zahlart {}",
        "record Lastschrift(String iban) implements Zahlart {}",
        "non-sealed class Kreditkarte implements Zahlart {}"]],
      bezug: [[441, "vollständiger switch ohne default (21)"]] },
    { nr: 441, v: 21, b: "sprache", projekt: "Amber", name: "Muster im switch", titel: "Pattern Matching for switch", kette: [[406, 17], [420, 18], [427, 19], [433, 20]],
      worum: "`switch` über Typen mit Mustern, `when`-Wächtern und `case null`; über versiegelte Typen vollständig ohne `default`.",
      warum: "Fallunterscheidungen, deren Vollständigkeit der Compiler prüft.",
      betrifft: "Du Typen unterscheidest oder einen Visitor pflegst.",
      risiko: 0, risikoText: "Keins.", r: [2, 2, 1],
      umsetzung: "`case` nimmt Typmuster und Record-Patterns, `when` schränkt sie ein. Der Compiler prüft die Reihenfolge (ein allgemeineres Muster darf kein späteres verdecken) und über versiegelte Typen die Vollständigkeit. Ohne `case null` wirft `null` wie bisher eine `NullPointerException`.",
      beispiel: ["java", [
        "String text = switch (zahlart) {",
        "    case Rechnung r when r.tage() == 0 -> \"sofort fällig\";",
        "    case Rechnung r      -> \"in \" + r.tage() + \" Tagen\";",
        "    case Lastschrift l   -> \"Einzug von \" + l.iban();",
        "    case Kreditkarte k   -> \"Karte \" + k.maskiert();",
        "};   // kein default: Zahlart ist sealed"]],
      bezug: [[409, "versiegelte Typen (17)"], [440, "Record-Patterns (21)"], [455, "primitive Typen im Muster (Preview)"]] },
    { nr: 440, v: 21, b: "sprache", projekt: "Amber", name: "Record-Patterns", titel: "Record Patterns", kette: [[405, 19], [432, 20]],
      worum: "Records im Muster zerlegen: `case Rechnung(var tage) -> …`.",
      warum: "Daten und Fallunterscheidung passen zusammen – der Visitor wird überflüssig.",
      betrifft: "Du Records nach ihrem Inhalt unterscheidest.",
      risiko: 0, risikoText: "Keins.", r: [2, 2, 1],
      umsetzung: "Ein Record-Pattern nennt den Record und je Komponente ein Muster – verschachtelt bis in die Tiefe, mit `var` oder ausgeschriebenem Typ. Es funktioniert in `instanceof` und `switch`.",
      beispiel: ["java", [
        "record Adresse(String ort, String plz) {}",
        "record Kunde(String name, Adresse adresse) {}",
        "",
        "if (o instanceof Kunde(var name, Adresse(var ort, var plz))) {",
        "    IO.println(name + \" aus \" + ort);",
        "}"]],
      bezug: [[395, "Records (16)"], [441, "Muster im switch (21)"], [456, "`_` für ungenutzte Teile (22)"]] },
    { nr: 430, v: 21, b: "sprache", projekt: "Amber", name: "String Templates", titel: "String Templates (Preview)", zurückgezogen: true,
      weg: [[430, 21, "Preview"], [459, 22, "Preview"], [465, 23, "zurückgezogen"]],
      worum: "`STR.\"Hallo \\{name}\"` – Text mit eingebetteten Ausdrücken und Prozessoren, etwa für sicheres SQL.",
      warum: "Das Lehrbeispiel für Preview: zweimal ausgeliefert, vor 23 zurückgezogen. Wer es nutzte, musste zurückbauen.",
      betrifft: "Du Preview-Features in Produktion nutzen willst.",
      risiko: 2, risikoText: "Preview-Code bricht beim nächsten Release – hier sogar ganz.", r: [0, 0, 0],
      umsetzung: "Ein Template-Prozessor (`STR`, `FMT`, eigene über `StringTemplate.Processor`) bekam Textteile und Werte getrennt und durfte daraus beliebige Objekte bauen. Nur mit `--enable-preview`; JDK 23 lieferte es nicht mehr aus. Heute: Verkettung, `formatted(…)`, `String.format`.",
      beispiel: ["java", [
        "// nur JDK 21/22 mit --enable-preview – übersetzt heute nicht mehr",
        "String gruß = STR.\"Hallo \\{kunde.name()}, Summe \\{summe} €\";",
        "",
        "// heute",
        "String gruß = \"Hallo %s, Summe %s €\".formatted(kunde.name(), summe);"]],
      bezug: [[378, "Text-Blöcke (15)"]] },
    { nr: 456, v: 22, b: "sprache", projekt: "Amber", name: "Unbenannte Variablen _", titel: "Unnamed Variables & Patterns", kette: [[443, 21]],
      worum: "`_` für Variablen und Musterteile, die man nicht braucht: `catch (Exception _)`, `case Rechnung _`.",
      warum: "Zeigt im Code, was bewusst ungenutzt bleibt.",
      betrifft: "Du ungenutzte Variablen oder Musterteile hast.",
      risiko: 0, risikoText: "Keins – `_` war seit 9 kein Bezeichner mehr.", r: [1, 1, 0],
      umsetzung: "`_` deklariert, liest aber nichts: in lokalen Variablen, `catch`, Lambda-Parametern, `for`-Schleifen und Mustern. Mehrere `_` im selben Gültigkeitsbereich sind erlaubt; ein Zugriff auf `_` übersetzt nicht.",
      beispiel: ["java", [
        "try { Integer.parseInt(text); } catch (NumberFormatException _) { return 0; }",
        "map.forEach((_, wert) -> summe += wert);",
        "if (o instanceof Kunde(var name, _)) { … }"]],
      bezug: [[213, "`_` ab 9 kein Bezeichner"], [440, "Record-Patterns (21)"]] },
    { nr: 513, v: 25, b: "sprache", projekt: "Amber", name: "Flexible Konstruktoren", titel: "Flexible Constructor Bodies", kette: [[447, 22], [482, 23], [492, 24]],
      worum: "Code vor `super(…)` und `this(…)`: Argumente prüfen und berechnen, bevor die Oberklasse läuft.",
      warum: "Kein Umweg über statische Hilfsmethoden mehr für die Prüfung im Konstruktor.",
      betrifft: "Du Konstruktorargumente prüfst, bevor Du sie weiterreichst.",
      risiko: 0, risikoText: "Keins.", r: [1, 1, 1],
      umsetzung: "Vor dem expliziten Konstruktoraufruf steht der Prolog: Er darf rechnen, prüfen und eigene Felder zuweisen, aber `this` nicht lesen und keine Instanzmethoden aufrufen.",
      beispiel: ["java", [
        "class Expressbestellung extends Bestellung {",
        "    Expressbestellung(String nummer, LocalDate termin) {",
        "        if (termin.isBefore(LocalDate.now()))",
        "            throw new IllegalArgumentException(\"Termin liegt in der Vergangenheit\");",
        "        super(nummer);                  // ab Java 25 nicht mehr die erste Anweisung",
        "    }",
        "}"]],
      bezug: [[401, "Value Objects nutzen den Prolog"]] },
    { nr: 512, v: 25, b: "sprache", projekt: "Amber", name: "Kompakte Quelldateien", titel: "Compact Source Files and Instance Main Methods", kette: [[445, 21], [463, 22], [477, 23], [495, 24]],
      worum: "`void main() { … }` ohne Klasse und ohne `static`; `IO.println` für Ausgaben.",
      warum: "Kleine Programme ohne Zeremonie – für Skripte und den Einstieg.",
      betrifft: "Du kleine Werkzeuge in Java schreibst.",
      risiko: 0, risikoText: "Keins.", r: [0, 1, 0],
      umsetzung: "Eine Quelldatei ohne Klassendeklaration bekommt eine implizite Klasse; sie importiert `java.base` als Modul. `main` darf eine Instanzmethode ohne Parameter sein. `java.lang.IO` bietet `println`, `print` und `readln`.",
      beispiel: ["java", [
        "// Hallo.java – starten mit: java Hallo.java",
        "void main() {",
        "    String name = IO.readln(\"Name? \");",
        "    IO.println(\"Hallo \" + name);",
        "}"]],
      bezug: [[330, "java Datei.java (11)"], [458, "mehrere Quelldateien (22)"], [511, "Modul-Importe (25)"]] },
    { nr: 511, v: 25, b: "sprache", projekt: "Amber", name: "Modul-Importe", titel: "Module Import Declarations", kette: [[476, 23], [494, 24]],
      worum: "`import module java.base;` importiert alle exportierten Pakete eines Moduls.",
      warum: "Kurze Importe für Skripte und kleine Programme.",
      betrifft: "Du kleine Programme oder Skripte schreibst.",
      risiko: 1, risikoText: "Mehrdeutige Namen (`List` aus `java.util` und `java.awt`) brauchen einen Einzelimport.", r: [0, 0, 0],
      umsetzung: "`import module M;` wirkt wie Stern-Importe aller Pakete, die `M` exportiert – auch transitiv benötigter Module. Der eigene Code muss dafür kein Modul sein. Einzelimporte gewinnen bei Mehrdeutigkeit.",
      beispiel: ["java", [
        "import module java.base;      // java.util, java.io, java.time …",
        "import module java.sql;",
        "import java.util.List;        // löst den Konflikt mit java.awt.List"]],
      bezug: [[261, "Modulsystem (9)"], [512, "kompakte Quelldateien importieren java.base"]] },
    { nr: 455, b: "sprache", projekt: "Amber", name: "Primitive Typen im Muster", titel: "Primitive Types in Patterns, instanceof, and switch", offen: true,
      weg: [[455, 23, "Preview"], [488, 24, "Preview"], [507, 25, "Preview"], [530, 26, "Preview"], [532, 27, "Preview"], [8393282, 28, "Entwurf"]],
      worum: "Muster, `instanceof` und `switch` auch über `int`, `long`, `double`, `boolean` – mit Prüfung, ob eine Umwandlung verlustfrei ist.",
      warum: "Schließt die letzte Lücke im Pattern Matching; `switch` über `long` oder `double` wird möglich.",
      betrifft: "Du Zahlen sicher in kleinere Typen umwandelst oder über `long` verzweigst.",
      risiko: 2, risikoText: "Preview seit 23 – in Produktion nicht nutzen. Der Entwurf für die sechste Runde zielt auf 28.", r: [0, 1, 0],
      umsetzung: "`x instanceof byte b` prüft, ob der Wert ohne Verlust in `byte` passt, und bindet ihn. Typmuster mit primitiven Typen gehen auch in Record-Patterns und im `switch`. Nur mit `--enable-preview`.",
      beispiel: ["java", [
        "// JDK 27: javac --release 27 --enable-preview …",
        "int menge = 300;",
        "if (menge instanceof byte b) { … }    // false – 300 passt nicht in byte",
        "",
        "String stufe = switch (rabatt) {        // rabatt ist ein double",
        "    case 0.0 -> \"kein Rabatt\";",
        "    case double d when d < 0.1 -> \"klein\";",
        "    case double d -> \"groß\";",
        "};"]],
      bezug: [[441, "Muster im switch (21)"], [401, "Valhalla vereinheitlicht primitive Typen und Klassen"]] },
    { nr: 401, b: "sprache", projekt: "Valhalla", name: "Value Objects", titel: "Value Objects (Preview)", offen: true,
      weg: [[401, 28, "Preview"]],
      worum: "Objekte ohne Identität: `value class` und `value record` unterscheiden sich nur über ihre Felder; `==` vergleicht den Inhalt.",
      warum: "Die JVM darf Werte flach in Felder und Arrays legen statt über Zeiger – weniger Speicher, bessere Cache-Lokalität. `Integer`, `LocalDate` und `Optional` werden in der Preview selbst zu Value-Klassen.",
      betrifft: "Du Werte wie Geldbeträge, Koordinaten oder Zeitpunkte modellierst – oder auf `Integer` und Co. synchronisierst.",
      risiko: 2, risikoText: "Preview, für JDK 28 integriert (Early Access). Mit Preview scheitert `synchronized` auf `LocalDate` mit `IdentityException`, `==` auf `Integer` vergleicht den Wert.", r: [1, 2, 1],
      umsetzung: "Das Schlüsselwort `value` vor `class` oder `record`: Felder sind implizit `final`, die Klasse hat keine Identität (`Objects.hasIdentity` liefert `false`), `synchronized` und Identitäts-Hash gibt es nicht. Felder werden im Prolog des Konstruktors gesetzt (JEP 513, JEP 539). Nur mit `--enable-preview --release 28`.",
      beispiel: ["java", [
        "// JDK 28 Early Access: java --enable-preview --source 28 Wert.java",
        "value record Betrag(long cent, String währung) {}",
        "",
        "void main() {",
        "    var a = new Betrag(1999, \"EUR\");",
        "    IO.println(a == new Betrag(1999, \"EUR\"));   // true – gleicher Inhalt",
        "    IO.println(Objects.hasIdentity(a));         // false",
        "}"]],
      bezug: [[390, "Vorbereitung: Warnungen für wertbasierte Klassen (16)"], [539, "strikte Feldinitialisierung in der JVM"], [8303099, "null-restricted Typen erlauben flache Ablage"], [338, "die Vector API wartet darauf"], [519, "kompakte Objekt-Header"]] },
    { nr: 8303099, b: "sprache", projekt: "Valhalla", name: "Null-restricted Typen", titel: "Null-Restricted and Nullable Types (Preview)", offen: true,
      weg: [[8303099, null, "Entwurf"], [8316779, null, "Entwurf"]],
      worum: "`String!` schließt `null` aus, `String?` erlaubt es ausdrücklich; für Value-Klassen (`Punkt!`) braucht die JVM dann kein Bit für `null`.",
      warum: "Erst ohne `null` kann die JVM Value Objects vollständig flach in Felder und Arrays legen. Nebenbei findet der Compiler unerwartete `null`-Werte.",
      betrifft: "Du mit `@NonNull`-Annotationen oder `Optional` gegen `null` kämpfst.",
      risiko: 2, risikoText: "Zwei Entwürfe, kein Release, keine Early-Access-Builds im JDK – Syntax und Umfang können sich noch ändern.", r: [1, 1, 1],
      umsetzung: "Marker am Typ: `!` = nie `null`, `?` = darf `null` sein, ohne Marker = unbestimmt wie heute. Felder und Arrays mit `!` müssen initialisiert sein, bevor sie gelesen werden. Der zweite Entwurf beschränkt `!` auf Value-Klassen mit implizitem Konstruktor.",
      beispiel: ["java", [
        "// Entwurf – übersetzt mit keinem JDK",
        "String! name = kunde.name();          // nie null",
        "String? zweitname = kunde.zweitname(); // darf null sein",
        "Punkt![] pfad = new Punkt![1000];     // flach im Speicher, ohne Zeiger"]],
      bezug: [[401, "Value Objects (Preview in 28)"]] },
    { nr: 402, b: "sprache", projekt: "Valhalla", name: "Primitive als Objekte", titel: "Enhanced Primitive Boxing (Preview)", offen: true,
      weg: [[402, null, "Entwurf"]],
      worum: "`int` und `Integer` rücken zusammen: Methoden auf primitiven Werten aufrufen, `List<int>`-ähnliche Schreibweisen über Boxing.",
      warum: "Der erste Schritt, primitive Typen und Klassen zu vereinheitlichen – ohne die Kosten heutiger Wrapper, sobald `Integer` eine Value-Klasse ist.",
      betrifft: "Du zwischen `int` und `Integer` umwandelst oder Collections von Zahlen hältst.",
      risiko: 2, risikoText: "Entwurf ohne Release.", r: [0, 1, 0],
      umsetzung: "Primitive Werte werden dort automatisch zu ihrer Klasse, wo heute ein Fehler steht: Methodenaufrufe (`42.toString()`) und Typargumente. Setzt Value Objects voraus.",
      beispiel: ["java", [
        "// Entwurf – übersetzt mit keinem JDK",
        "int menge = 3;",
        "String text = menge.toString();",
        "List<int> mengen = List.of(1, 2, 3);"]],
      bezug: [[401, "Value Objects"], [218, "Generics über primitive Typen"]] },
    { nr: 218, b: "sprache", projekt: "Valhalla", name: "Generics über primitive Typen", titel: "Generics over Primitive Types", offen: true,
      weg: [[218, null, "Kandidat"]],
      worum: "`ArrayList<int>` ohne Boxing – generischer Code, der für primitive Typen spezialisiert wird.",
      warum: "Das Fernziel von Valhalla seit 2014: Collections von Zahlen ohne Wrapper-Objekte.",
      betrifft: "Du große Mengen von Zahlen in Collections hältst.",
      risiko: 2, risikoText: "Kandidat ohne Release; der Weg führt über Value Objects und spezialisierte Generics in der JVM.", r: [0, 1, 0],
      umsetzung: "Noch nicht festgelegt. Valhalla plant es in Schritten: Value Objects, null-restricted Typen, Boxing für primitive Typen, schließlich eine „parametrische JVM“, die Generics zur Laufzeit spezialisiert.",
      beispiel: ["java", [
        "// Kandidat – übersetzt mit keinem JDK",
        "List<int> mengen = new ArrayList<>();",
        "mengen.add(3);                 // kein Integer im Heap"]],
      bezug: [[402, "Boxing für primitive Typen"], [401, "Value Objects"]] },

    // ===== API =====
    { nr: 269, v: 9, b: "api", name: "List.of, Set.of, Map.of", titel: "Convenience Factory Methods for Collections",
      worum: "Unveränderliche Collections in einer Zeile: `List.of(…)`, `Set.of(…)`, `Map.of(…)`.",
      warum: "Ersetzt `Arrays.asList` und `Collections.unmodifiable…` – und verbietet `null`.",
      betrifft: "Du Konstanten, Testdaten oder Rückgabewerte als Collection baust.",
      risiko: 1, risikoText: "Still: `add` wirft `UnsupportedOperationException`, `contains(null)` eine `NullPointerException` – erst zur Laufzeit.", r: [2, 2, 2],
      umsetzung: "Statische Fabrikmethoden an `List`, `Set` und `Map` (bis zehn Paare, darüber `Map.ofEntries`). Die Ergebnisse sind unveränderlich, lehnen `null` ab, `Set.of` und `Map.of` lehnen Duplikate ab und garantieren keine Reihenfolge. Mit 10 kamen `List.copyOf` und `Collectors.toUnmodifiableList` dazu.",
      beispiel: ["java", [
        "List<String> zahlarten = List.of(\"Rechnung\", \"Lastschrift\");",
        "Map<String, Integer> fristen = Map.of(\"Rechnung\", 14, \"Lastschrift\", 0);",
        "zahlarten.add(\"Vorkasse\");     // UnsupportedOperationException",
        "Set.of(\"a\", \"a\");               // IllegalArgumentException: duplicate element"]],
      bezug: [[431, "Sequenced Collections (21)"]] },
    { nr: 266, v: 9, b: "api", name: "CompletableFuture mit Zeitlimit", titel: "More Concurrency Updates",
      worum: "`orTimeout`, `completeOnTimeout` und `delayedExecutor` für `CompletableFuture`, dazu die Reactive-Streams-Schnittstellen in `Flow`.",
      warum: "Zeitlimits für asynchrone Aufrufe ohne eigenen Scheduler.",
      betrifft: "Du andere Systeme asynchron aufrufst.",
      risiko: 0, risikoText: "Keins.", r: [2, 1, 1],
      umsetzung: "Neue Methoden an `CompletableFuture` und die Klasse `java.util.concurrent.Flow` mit `Publisher`, `Subscriber`, `Subscription` und `Processor` – dieselben Verträge wie Reactive Streams.",
      beispiel: ["java", [
        "CompletableFuture.supplyAsync(() -> lager.bestand(artikel))",
        "    .completeOnTimeout(0, 2, TimeUnit.SECONDS)   // Ersatzwert nach 2 s",
        "    .thenAccept(bestand -> anzeigen(bestand));"]],
      bezug: [[444, "Virtual Threads – blockierend statt asynchron (21)"]] },
    { nr: 102, v: 9, b: "api", name: "ProcessHandle", titel: "Process API Updates",
      worum: "`ProcessHandle` liefert PID, Elternprozess und Kinder und meldet das Ende eines Prozesses.",
      warum: "Prozesse steuern ohne plattformabhängige Kniffe.",
      betrifft: "Dein Programm andere Programme startet oder überwacht.",
      risiko: 0, risikoText: "Keins.", r: [0, 2, 0],
      umsetzung: "`ProcessHandle.current()`, `Process.toHandle()`, `children()`, `descendants()`, `info()` (Befehl, Startzeit, CPU-Zeit) und `onExit()` als `CompletableFuture`.",
      beispiel: ["java", [
        "Process p = new ProcessBuilder(\"sort\", \"bestellungen.csv\").start();",
        "IO.println(\"PID \" + p.pid());",
        "p.toHandle().onExit().thenRun(() -> IO.println(\"fertig\"));"]] },
    { nr: 259, v: 9, b: "api", name: "StackWalker", titel: "Stack-Walking API",
      worum: "`StackWalker` durchläuft den Aufrufstapel gezielt und günstig, statt eine Exception zu erzeugen.",
      warum: "Für Logging und Frameworks, die den Aufrufer kennen müssen.",
      betrifft: "Du den Aufrufer einer Methode ermittelst.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0],
      umsetzung: "`StackWalker.getInstance(…)` liefert die Rahmen als Stream, faul und nur so weit, wie gelesen wird; mit `RETAIN_CLASS_REFERENCE` auch die Klassen.",
      beispiel: ["java", [
        "String aufrufer = StackWalker.getInstance()",
        "    .walk(rahmen -> rahmen.skip(1).findFirst())",
        "    .map(StackWalker.StackFrame::getMethodName)",
        "    .orElse(\"?\");"]] },
    { nr: 321, v: 11, b: "api", name: "HttpClient", titel: "HTTP Client (Standard)", kette: [[110, 9, "Incubator"]], danach: [[517, 26, "Ausbau"]],
      worum: "Ein HTTP-Client im JDK – synchron und asynchron, mit HTTP/2 und WebSockets; seit 26 auch HTTP/3.",
      warum: "Ersetzt `HttpURLConnection` und oft eine Bibliothek.",
      betrifft: "Dein Code andere Systeme per HTTP aufruft.",
      risiko: 0, risikoText: "Keins; `HttpURLConnection` bleibt erhalten.", r: [2, 1, 1],
      umsetzung: "`java.net.http`: `HttpClient` (unveränderlich, wiederverwendbar), `HttpRequest` per Builder, `HttpResponse.BodyHandlers` für Text, Datei oder Stream; `send` blockiert, `sendAsync` liefert ein `CompletableFuture`. In 9 und 10 als Incubator `jdk.incubator.http`. HTTP/3 (JEP 517) schaltet man mit `version(HttpClient.Version.HTTP_3)` ein.",
      beispiel: ["java", [
        "var client = HttpClient.newHttpClient();",
        "var anfrage = HttpRequest.newBuilder(URI.create(\"http://localhost:8080/bestellungen\")).build();",
        "HttpResponse<String> antwort = client.send(anfrage, HttpResponse.BodyHandlers.ofString());",
        "IO.println(antwort.statusCode() + \" \" + antwort.body());"]] },
    { nr: 380, v: 16, b: "api", name: "Unix-Domain-Sockets", titel: "Unix-Domain Socket Channels",
      worum: "`SocketChannel` und `ServerSocketChannel` auch über Unix-Domain-Sockets.",
      warum: "Schnelle Verbindungen zwischen Prozessen auf demselben Rechner, etwa zu einem Sidecar.",
      betrifft: "Prozesse auf demselben Rechner miteinander sprechen.",
      risiko: 0, risikoText: "Keins.", r: [1, 0, 0],
      umsetzung: "`UnixDomainSocketAddress.of(pfad)` und `StandardProtocolFamily.UNIX` beim Öffnen des Kanals – sonst dieselbe API wie bei TCP; auch unter Windows 10 und neuer.",
      beispiel: ["java", [
        "var adresse = UnixDomainSocketAddress.of(\"/tmp/bestellung.sock\");",
        "try (var kanal = SocketChannel.open(StandardProtocolFamily.UNIX)) {",
        "    kanal.connect(adresse);",
        "}"]] },
    { nr: 356, v: 17, b: "api", name: "Zufallszahlen", titel: "Enhanced Pseudo-Random Number Generators",
      worum: "`RandomGenerator` als gemeinsame Schnittstelle und neue Algorithmen, auch für Streams und parallele Arbeit.",
      warum: "Austauschbare, bessere Zufallszahlen.",
      betrifft: "Du Zufallszahlen für Simulationen oder Tests brauchst.",
      risiko: 0, risikoText: "Keins.", r: [0, 1, 0],
      umsetzung: "`java.util.random.RandomGenerator` mit Unterschnittstellen für teilbare und springende Generatoren; `Random`, `SplittableRandom` und `ThreadLocalRandom` implementieren sie. Algorithmen wählt man per Name.",
      beispiel: ["java", [
        "RandomGenerator zufall = RandomGenerator.of(\"L64X128MixRandom\");",
        "int würfel = zufall.nextInt(1, 7);"]] },
    { nr: 444, v: 21, b: "api", projekt: "Loom", name: "Virtual Threads", titel: "Virtual Threads", kette: [[425, 19], [436, 20]],
      worum: "Leichte Threads, die beim Blockieren ihren Träger freigeben – Hunderttausende sind möglich.",
      warum: "Blockierender Code skaliert, ohne ihn reaktiv umzuschreiben. Gemessen: Batch-Import 1329 → 71 ms auf JDK 25.",
      betrifft: "Deine Anwendung viel auf andere Systeme wartet.",
      risiko: 1, risikoText: "Pinning bei `synchronized` bis 23 (behoben mit JEP 491); `ThreadLocal`-Caches vervielfachen sich.", r: [2, 2, 1],
      umsetzung: "Ein virtueller Thread läuft auf einem Trägerthread aus einem `ForkJoinPool`. Blockiert er in I/O oder `Lock`, legt die JVM seinen Stapel in den Heap und gibt den Träger frei. Erzeugt mit `Thread.ofVirtual()` oder `Executors.newVirtualThreadPerTaskExecutor()`; nicht poolen.",
      beispiel: ["java", [
        "try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {",
        "    for (Bestellung b : bestellungen) {",
        "        executor.submit(() -> versand.melde(b));   // blockiert, kostet aber keinen Plattform-Thread",
        "    }",
        "}   // close() wartet auf alle"]],
      bezug: [[491, "kein Pinning bei synchronized (24)"], [506, "Scoped Values (25)"], [543, "Structured Concurrency (28)"]] },
    { nr: 431, v: 21, b: "api", name: "Sequenced Collections", titel: "Sequenced Collections",
      worum: "`getFirst()`, `getLast()` und `reversed()` für Listen, Deques sowie sortierte Mengen und Maps.",
      warum: "Ein gemeinsamer Zugriff auf Anfang und Ende.",
      betrifft: "Du erste oder letzte Elemente liest – oder eigene Collections mit solchen Methoden hast.",
      risiko: 1, risikoText: "Eigene Methoden `getFirst()` mit anderem Rückgabetyp übersetzen nicht mehr (Modul `sequenced`).", r: [1, 1, 1],
      umsetzung: "Drei neue Interfaces in der Hierarchie: `SequencedCollection` (über `List`, `Deque`, `LinkedHashSet`, `SortedSet`), `SequencedSet` und `SequencedMap` (mit `firstEntry`, `pollLastEntry`, `putFirst`). `reversed()` liefert eine Sicht, keine Kopie.",
      beispiel: ["java", [
        "List<Bestellung> liste = repository.alle();",
        "Bestellung neueste = liste.getLast();       // statt liste.get(liste.size() - 1)",
        "for (var b : liste.reversed()) { … }"]],
      bezug: [[269, "List.of und Co. (9)"]] },
    { nr: 454, v: 22, b: "api", projekt: "Panama", name: "Foreign Function & Memory", titel: "Foreign Function & Memory API", kette: [[412, 17, "Incubator"], [419, 18, "Incubator"], [424, 19], [434, 20], [442, 21]],
      worum: "Native Bibliotheken aufrufen und Speicher außerhalb des Heaps verwalten – ohne JNI.",
      warum: "Der Nachfolger von JNI und den Speicherzugriffen in `sun.misc.Unsafe`.",
      betrifft: "Ihr native Bibliotheken anbindet.",
      risiko: 0, risikoText: "Keins.", r: [0, 1, 0],
      umsetzung: "`Linker` findet native Funktionen und erzeugt `MethodHandle`s, `MemorySegment` und `Arena` verwalten Speicher mit klarer Lebensdauer. `jextract` erzeugt die Bindungen aus C-Headern. Native Zugriffe warnen ohne `--enable-native-access`.",
      beispiel: ["java", [
        "Linker linker = Linker.nativeLinker();",
        "MethodHandle strlen = linker.downcallHandle(",
        "    linker.defaultLookup().find(\"strlen\").orElseThrow(),",
        "    FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS));",
        "try (Arena arena = Arena.ofConfined()) {",
        "    long länge = (long) strlen.invokeExact(arena.allocateFrom(\"Bestellung\"));",
        "}"]],
      bezug: [[472, "JNI wird eingeschränkt (24)"], [498, "Unsafe warnt (24)"]] },
    { nr: 485, v: 24, b: "api", name: "Stream Gatherers", titel: "Stream Gatherers", kette: [[461, 22], [473, 23]],
      worum: "Eigene Zwischenoperationen für Streams: `gather(Gatherers.windowFixed(100))` für Pakete, gleitende Fenster, Abbruch.",
      warum: "Was mit Collectors nicht ging: Gruppen in der Reihenfolge des Streams.",
      betrifft: "Du Daten in Paketen oder Fenstern verarbeitest.",
      risiko: 0, risikoText: "Keins.", r: [1, 2, 0],
      umsetzung: "`Stream.gather(Gatherer)` ist das Gegenstück zu `collect` mitten im Stream. Fertig in `Gatherers`: `windowFixed`, `windowSliding`, `fold`, `scan`, `mapConcurrent`; eigene über `Gatherer.of(…)`.",
      beispiel: ["java", [
        "zeilen.stream()",
        "    .gather(Gatherers.windowFixed(100))        // Listen zu je 100 Zeilen",
        "    .forEach(paket -> datenbank.speichereAlle(paket));"]] },
    { nr: 484, v: 24, b: "api", name: "Class-File API", titel: "Class-File API", kette: [[457, 22], [466, 23]],
      worum: "Klassendateien lesen, erzeugen und umbauen – mit dem JDK statt mit ASM.",
      warum: "Frameworks und Werkzeuge hängen nicht mehr am Release einer Bytecode-Bibliothek.",
      betrifft: "Du Bytecode erzeugst oder analysierst.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0],
      umsetzung: "`java.lang.classfile`: `ClassFile.of().parse(bytes)` liefert ein unveränderliches Modell, `build` und `transformClass` erzeugen neue Klassen. Sie kennt immer das Format des eigenen JDK.",
      beispiel: ["java", [
        "ClassModel klasse = ClassFile.of().parse(Path.of(\"Bestellung.class\"));",
        "for (MethodModel m : klasse.methods()) {",
        "    IO.println(m.methodName().stringValue());",
        "}"]] },
    { nr: 506, v: 25, b: "api", projekt: "Loom", name: "Scoped Values", titel: "Scoped Values", kette: [[429, 20, "Incubator"], [446, 21], [464, 22], [481, 23], [487, 24]],
      worum: "Ein Wert, der für einen Aufruf und alles darin gilt – unveränderlich und ohne Aufräumen.",
      warum: "Der Nachfolger von `ThreadLocal` für Kontext wie Korrelations-IDs, passend zu virtuellen Threads.",
      betrifft: "Ihr Kontext per `ThreadLocal` weiterreicht.",
      risiko: 0, risikoText: "Keins.", r: [2, 1, 1],
      umsetzung: "`ScopedValue.newInstance()` als Konstante, `ScopedValue.where(wert, x).run(…)` bindet für die Dauer des Aufrufs, `get()` liest. Ohne `set` und `remove`: Die Bindung endet mit dem Block; Kindaufgaben einer `StructuredTaskScope` erben sie.",
      beispiel: ["java", [
        "static final ScopedValue<String> KORRELATION = ScopedValue.newInstance();",
        "",
        "void bearbeite(Anfrage a) {",
        "    ScopedValue.where(KORRELATION, a.id()).run(() -> service.bestelle(a));",
        "}",
        "// tief im Service:",
        "log.info(KORRELATION.get() + \": bestellt\");"]],
      bezug: [[444, "Virtual Threads (21)"], [543, "Structured Concurrency (28)"]] },
    { nr: 543, v: 28, b: "api", projekt: "Loom", name: "Structured Concurrency", titel: "Structured Concurrency",
      kette: [[428, 19, "Incubator"], [437, 20, "Incubator"], [453, 21], [462, 22], [480, 23], [499, 24], [505, 25], [525, 26], [533, 27]],
      worum: "Zusammengehörige Teilaufgaben in einem Block starten, gemeinsam abwarten und bei einem Fehler gemeinsam abbrechen.",
      warum: "Nebenläufigkeit mit der Struktur eines Methodenaufrufs: keine verwaisten Threads, klare Fehlerbehandlung, lesbare Thread-Dumps.",
      betrifft: "Du mehrere Systeme parallel abfragst und ihre Ergebnisse zusammenführst.",
      risiko: 1, risikoText: "Final erst in 28 (integriert). Die Previews haben die API mehrfach geändert – Code aus 21 bis 27 übersetzt nicht unverändert.", r: [2, 1, 1],
      umsetzung: "`StructuredTaskScope.open()` in try-with-resources, `fork` startet Teilaufgaben in virtuellen Threads, `join` wartet und wirft beim ersten Fehler; ein `Joiner` legt andere Regeln fest (alle, erste erfolgreiche).",
      beispiel: ["java", [
        "// JDK 28",
        "try (var scope = StructuredTaskScope.open()) {",
        "    Subtask<Kunde> kunde = scope.fork(() -> crm.kunde(id));",
        "    Subtask<Integer> bestand = scope.fork(() -> lager.bestand(artikel));",
        "    scope.join();                 // wirft, wenn eine scheitert – die andere wird abgebrochen",
        "    return new Angebot(kunde.get(), bestand.get());",
        "}"]],
      bezug: [[444, "Virtual Threads (21)"], [506, "Scoped Values werden vererbt"]] },
    { nr: 502, b: "api", name: "Lazy Constants", titel: "Lazy Constants (Preview)", offen: true,
      weg: [[502, 25, "Preview"], [526, 26, "Preview"], [531, 27, "Preview"], [547, null, "Kandidat"]],
      worum: "Ein Wert, der erst beim ersten Zugriff berechnet wird und danach als echte Konstante gilt.",
      warum: "Schnellerer Start ohne doppelt geprüftes Sperren: Teures wird erst gebaut, wenn es gebraucht wird, und die JVM optimiert es wie ein `final`-Feld.",
      betrifft: "Du Logger, Verbindungen oder Konfiguration faul initialisierst.",
      risiko: 2, risikoText: "Preview – in 25 als „Stable Values“, seit 26 umbenannt; die vierte Runde ist Kandidat.", r: [1, 1, 1],
      umsetzung: "`LazyConstant.of(lieferant)` speichert den Lieferanten; `get()` ruft ihn genau einmal auf, auch bei Nebenläufigkeit. Dazu faule Listen und Maps. Nur mit `--enable-preview`.",
      beispiel: ["java", [
        "// JDK 27 mit --enable-preview",
        "private final LazyConstant<Logger> log =",
        "    LazyConstant.of(() -> Logger.getLogger(\"bestellung\"));",
        "",
        "void bestelle() { log.get().info(\"bestellt\"); }"]] },
    { nr: 542, v: 28, b: "api", name: "PEM-Kodierung", titel: "PEM Encodings of Cryptographic Objects", kette: [[470, 25], [524, 26], [538, 27]],
      worum: "Schlüssel und Zertifikate aus PEM-Text lesen und als PEM schreiben – mit `PEMDecoder` und `PEMEncoder`.",
      warum: "Bisher brauchte das eigenes Base64-Parsen oder Bouncy Castle.",
      betrifft: "Ihr TLS-Schlüssel oder Zertifikate aus Dateien oder Secrets ladet.",
      risiko: 0, risikoText: "Keins; final erst in 28.", r: [2, 0, 1],
      umsetzung: "`PEMDecoder.of().decode(text)` liefert ein `BinaryEncodable` (`PublicKey`, `PrivateKey`, `X509Certificate` …), das sich per Pattern Matching unterscheiden lässt; `withDecryption(passwort)` für verschlüsselte Schlüssel.",
      beispiel: ["java", [
        "// JDK 28",
        "switch (PEMDecoder.of().decode(Files.readString(Path.of(\"tls.pem\")))) {",
        "    case PrivateKey schlüssel -> konfiguriere(schlüssel);",
        "    case X509Certificate zertifikat -> vertraue(zertifikat);",
        "    default -> throw new IllegalArgumentException(\"unbekannt\");",
        "}"]] },
    { nr: 540, b: "api", name: "JSON-API", titel: "Simple JSON API (Incubator)", offen: true,
      weg: [[540, 28, "Incubator"]],
      worum: "JSON lesen und schreiben mit dem JDK: `Json.parse(text)` und ein kleines Objektmodell.",
      warum: "Für kleine Werkzeuge und Skripte ohne Jackson oder JSON-B.",
      betrifft: "Du JSON verarbeitest, ohne eine Bibliothek mitzuliefern.",
      risiko: 2, risikoText: "Incubator in 28 – Modul `jdk.incubator.json`, die API ändert sich noch. Für Server-Anwendungen bleibt JSON-B, für Quarkus Jackson.", r: [1, 1, 0],
      umsetzung: "`Json.parse` liefert einen `JsonValue`; `JsonObject`, `JsonArray`, `JsonString`, `JsonNumber` lassen sich mit Record-Patterns zerlegen. Kein Binden an eigene Klassen. Nur mit `--add-modules jdk.incubator.json`.",
      beispiel: ["java", [
        "// JDK 28: --add-modules jdk.incubator.json",
        "JsonValue json = Json.parse(antwort.body());",
        "int menge = json.get(\"menge\").asInt();"]] },
    { nr: 338, b: "api", projekt: "Panama", name: "Vector API", titel: "Vector API (Incubator)", offen: true,
      weg: [[338, 16, "Incubator"], [414, 17, "Incubator"], [417, 18, "Incubator"], [426, 19, "Incubator"], [438, 20, "Incubator"], [448, 21, "Incubator"], [460, 22, "Incubator"], [469, 23, "Incubator"], [489, 24, "Incubator"], [508, 25, "Incubator"], [529, 26, "Incubator"], [537, 27, "Incubator"]],
      worum: "Rechnen mit Vektoren, die die JVM auf SIMD-Befehle der CPU abbildet – viele Zahlen in einem Schritt.",
      warum: "Für Numerik, Bildverarbeitung, Suche und KI-nahe Rechnungen. Sie bleibt Incubator, bis Valhalla die Vektoren als Value-Klassen ermöglicht.",
      betrifft: "Du große Zahlenreihen verarbeitest und jede Millisekunde zählt.",
      risiko: 2, risikoText: "Zwölfmal Incubator (16 bis 27) – Modul `jdk.incubator.vector`, keine stabile API.", r: [0, 1, 0],
      umsetzung: "`IntVector`, `FloatVector` und Co. mit einer `VectorSpecies`, die die Breite der Hardware wählt; Operationen wie `add`, `mul`, `reduceLanes`. Fällt ohne passende Hardware auf skalaren Code zurück. Nur mit `--add-modules jdk.incubator.vector`.",
      beispiel: ["java", [
        "// --add-modules jdk.incubator.vector",
        "static final VectorSpecies<Float> ART = FloatVector.SPECIES_PREFERRED;",
        "",
        "for (int i = 0; i < ART.loopBound(preise.length); i += ART.length()) {",
        "    FloatVector.fromArray(ART, preise, i).mul(1.19f).intoArray(brutto, i);",
        "}"]],
      bezug: [[401, "wartet auf Value Objects"], [454, "Foreign Function & Memory"]] },

    // ===== JVM und Laufzeit =====
    { nr: 200, v: 9, b: "jvm", projekt: "Jigsaw", name: "Das JDK in Modulen", titel: "The Modular JDK",
      worum: "Das JDK ist in rund 70 Module geteilt: `java.base`, `java.sql`, `java.xml`, `jdk.httpserver` …",
      warum: "Die Voraussetzung für schlanke Laufzeiten mit `jlink` und für die Kapselung der Interna.",
      betrifft: "Du wissen willst, welche Teile des JDK Deine Anwendung braucht.",
      risiko: 0, risikoText: "Keins für sich; die Folgen tragen JEP 220 und 260.", r: [1, 0, 0],
      umsetzung: "Standardmodule heißen `java.*` und gehören zur Java SE, JDK-eigene `jdk.*`. `java --list-modules` zeigt sie, `jdeps` ermittelt, welche eine Anwendung nutzt.",
      beispiel: ["bash", [
        "java --list-modules",
        "jdeps --print-module-deps --ignore-missing-deps target/bestellung-rest.jar"]],
      bezug: [[201, "Quelltext in Modulen"], [220, "Laufzeit-Images"], [261, "Modulsystem"], [282, "jlink"]] },
    { nr: 201, v: 9, b: "jvm", projekt: "Jigsaw", name: "JDK-Quelltext in Modulen", titel: "Modular Source Code",
      worum: "Der Quelltext des JDK ist nach Modulen geordnet: `src/java.base/share/classes/…`.",
      warum: "Wer im JDK-Quelltext nachliest, findet Klassen jetzt unter ihrem Modul – auch in der IDE und auf GitHub.",
      betrifft: "Du im Quelltext des JDK nachschlägst.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0],
      umsetzung: "Je Modul ein Verzeichnis mit `share/classes` und plattformspezifischen Teilen; `src.zip` im JDK folgt derselben Ordnung.",
      beispiel: ["bash", [
        "unzip -l \"$JAVA_HOME/lib/src.zip\" 'java.base/java/util/List.java'"]],
      bezug: [[200, "das JDK in Modulen"]] },
    { nr: 248, v: 9, b: "jvm", name: "G1 als Standard", titel: "Make G1 the Default Garbage Collector", danach: [[523, 27, "Standard"]],
      worum: "G1 löst den Parallel GC als Standard ab – kürzere Pausen bei fast gleichem Durchsatz. Seit 27 auch im kleinen Container.",
      warum: "Wer keinen GC wählt, bekommt G1 – bis 26 außer im kleinen Container: Mit einem Kern oder unter knapp 1,8 GB wählt die JVM Serial. Mit 27 entfällt die Ausnahme (JEP 523).",
      betrifft: "Deine Anwendung ohne GC-Option startet.",
      risiko: 1, risikoText: "Andere Pausen und etwas weniger Durchsatz als Parallel – messen, nicht raten. Gemessen: Im Container mit einem Kern und 1 GB wählt 27 G1 statt Serial.", r: [2, 1, 2],
      umsetzung: "Die Ergonomie wählt den Collector beim Start. G1 teilt den Heap in Regionen und räumt die mit dem meisten Müll zuerst; Pausenziel `-XX:MaxGCPauseMillis` (Standard 200 ms). Welcher Collector läuft, zeigt `-Xlog:gc`.",
      beispiel: ["bash", [
        "java -Xlog:gc -version",
        "docker run --rm --cpus=1 --memory=1g eclipse-temurin:25 java -Xlog:gc -version"]],
      bezug: [[307, "paralleler Full GC (10)"], [346, "Speicher zurückgeben (12)"]] },
    { nr: 254, v: 9, b: "jvm", name: "Kompakte Strings", titel: "Compact Strings",
      worum: "Strings mit nur Latin-1-Zeichen belegen ein Byte je Zeichen statt zwei.",
      warum: "Weniger Heap ohne Codeänderung.",
      betrifft: "Deine Anwendung viele Texte im Speicher hält.",
      risiko: 0, risikoText: "Keins.", r: [1, 2, 1],
      umsetzung: "`String` speichert ein `byte[]` und eine Kennung für die Kodierung (Latin-1 oder UTF-16) statt eines `char[]`. Abschalten mit `-XX:-CompactStrings`.",
      beispiel: ["bash", [
        "jcmd $(pgrep -f RestAnwendung) GC.class_histogram | grep -E 'java.lang.String|\\[B'"]] },
    { nr: 310, v: 10, b: "jvm", projekt: "Leyden", name: "AppCDS", titel: "Application Class-Data Sharing",
      worum: "Auch Anwendungsklassen kommen ins Klassen-Archiv – der Start wird schneller.",
      warum: "Der Vorläufer des AOT-Cache.",
      betrifft: "Startzeit für Dich zählt.",
      risiko: 0, risikoText: "Keins.", r: [2, 1, 0],
      umsetzung: "Drei Schritte: Klassenliste aufzeichnen (`-XX:DumpLoadedClassList`), Archiv schreiben (`-Xshare:dump -XX:SharedArchiveFile`), mit dem Archiv starten. Seit 13 geht es mit dem dynamischen Archiv in einem Schritt.",
      beispiel: ["bash", [
        "java -XX:DumpLoadedClassList=klassen.lst -jar target/bestellung-rest.jar",
        "java -Xshare:dump -XX:SharedClassListFile=klassen.lst -XX:SharedArchiveFile=rest.jsa -jar target/bestellung-rest.jar",
        "java -XX:SharedArchiveFile=rest.jsa -jar target/bestellung-rest.jar"]],
      bezug: [[341, "Standardarchiv (12)"], [350, "dynamisches Archiv (13)"], [483, "AOT-Cache (24)"]] },
    { nr: 307, v: 10, b: "jvm", name: "Paralleler Full GC für G1", titel: "Parallel Full GC for G1",
      worum: "Muss G1 doch einmal den ganzen Heap aufräumen, nutzt er dafür alle Kerne.",
      warum: "Der schlimmste Fall von G1 wird deutlich kürzer.",
      betrifft: "Deine Anwendung G1 nutzt und der Heap knapp wird.",
      risiko: 0, risikoText: "Keins.", r: [1, 1, 1],
      umsetzung: "Der Full GC von G1 markiert, verdichtet und passt Verweise parallel an, mit so vielen Threads wie die jungen Sammlungen (`-XX:ParallelGCThreads`). Keine Option nötig.",
      beispiel: ["bash", [
        "java -Xmx64m -Xlog:gc -jar target/bestellung-batch.jar   # „Pause Full“ im Log"]] },
    { nr: 328, v: 11, b: "jvm", name: "Flight Recorder", titel: "Flight Recorder",
      worum: "JFR zeichnet Ereignisse aus JVM und Anwendung auf – sparsam genug für den Dauerbetrieb.",
      warum: "Messen statt raten, auch in Produktion; vorher ein kommerzielles Feature von Oracle.",
      betrifft: "Du Leistung, GC-Pausen oder Pinning untersuchst.",
      risiko: 0, risikoText: "Keins.", r: [2, 2, 2],
      umsetzung: "Start mit `-XX:StartFlightRecording` oder zur Laufzeit per `jcmd … JFR.start`; Auswertung mit `jfr print`, `jfr view` (seit 21) oder JDK Mission Control. Eigene Ereignisse erben von `jdk.jfr.Event`.",
      beispiel: ["bash", [
        "java -XX:StartFlightRecording=filename=last.jfr,settings=profile -jar target/bestellung-rest.jar",
        "jfr view gc-pauses last.jfr"]],
      bezug: [[349, "JFR-Streaming (14)"]] },
    { nr: 377, v: 15, b: "jvm", name: "ZGC", titel: "ZGC: A Scalable Low-Latency Garbage Collector (Production)", kette: [[333, 11, "Experimentell"]],
      worum: "Ein Collector mit Pausen unter einer Millisekunde, auch bei großen Heaps.",
      warum: "Für Dienste mit engen Antwortzeiten. Gemessen am Übungsprojekt: längste Pause 0,04 ms statt 8,5 ms mit G1.",
      betrifft: "Eure Antwortzeiten unter GC-Pausen leiden.",
      risiko: 0, risikoText: "Keins; kostet mehr CPU und Speicher.", r: [2, 0, 1],
      umsetzung: "ZGC verschiebt Objekte, während die Anwendung läuft; farbige Zeiger und Lesebarrieren halten Verweise aktuell. Einschalten mit `-XX:+UseZGC`; in 11 bis 14 zusätzlich `-XX:+UnlockExperimentalVMOptions`.",
      beispiel: ["bash", [
        "java -XX:+UseZGC -Xlog:gc -jar target/bestellung-rest.jar"]],
      bezug: [[439, "Generational ZGC (21)"], [474, "nur noch generational (23/24)"]] },
    { nr: 379, v: 15, b: "jvm", name: "Shenandoah", titel: "Shenandoah: A Low-Pause-Time Garbage Collector (Production)", kette: [[189, 12, "Experimentell"]],
      worum: "Ein weiterer Collector mit kurzen Pausen.",
      warum: "Eine Alternative zu ZGC – nicht in jeder Distribution enthalten.",
      betrifft: "Eure Distribution ihn mitliefert und ZGC nicht passt.",
      risiko: 0, risikoText: "Keins.", r: [1, 0, 0],
      umsetzung: "Verdichtet nebenläufig mit Weiterleitungszeigern. `-XX:+UseShenandoahGC`; Temurin, Red Hat und Amazon liefern ihn, Oracles JDK nicht.",
      beispiel: ["bash", [
        "java -XX:+UseShenandoahGC -Xlog:gc -version"]],
      bezug: [[521, "Generational Shenandoah (25)"]] },
    { nr: 341, v: 12, b: "jvm", projekt: "Leyden", name: "CDS-Standardarchiv", titel: "Default CDS Archives",
      worum: "Das JDK bringt ein Archiv seiner eigenen Klassen mit – jeder Start profitiert.",
      warum: "Schnellerer Start ohne eine einzige Option.",
      betrifft: "Startzeit zählt.",
      risiko: 0, risikoText: "Keins.", r: [1, 1, 0],
      umsetzung: "Der Build des JDK erzeugt `lib/server/classes.jsa`; die JVM bildet es beim Start in den Speicher ab. `-Xshare:off` schaltet es zum Vergleich ab.",
      beispiel: ["bash", [
        "java -Xshare:off -Xlog:startuptime -version",
        "java -Xlog:cds -version"]] },
    { nr: 346, v: 12, b: "jvm", name: "G1 gibt Speicher zurück", titel: "Promptly Return Unused Committed Memory from G1",
      worum: "G1 gibt ungenutzten Heap auch im Leerlauf an das Betriebssystem zurück.",
      warum: "Im Container und in der Cloud zählt belegter, nicht genutzter Speicher.",
      betrifft: "Eure Anwendung lange Leerlaufphasen hat.",
      risiko: 0, risikoText: "Keins.", r: [2, 1, 1],
      umsetzung: "Mit `-XX:G1PeriodicGCInterval=«ms»` startet G1 im Leerlauf eine nebenläufige Sammlung und verkleinert danach den Heap. Ohne die Option geschieht es nur nach einer Sammlung.",
      beispiel: ["bash", [
        "java -XX:G1PeriodicGCInterval=60000 -jar target/bestellung-rest.jar"]] },
    { nr: 350, v: 13, b: "jvm", projekt: "Leyden", name: "Dynamisches CDS-Archiv", titel: "Dynamic CDS Archives",
      worum: "`-XX:ArchiveClassesAtExit` schreibt nach einem Lauf ein Archiv der Anwendungsklassen.",
      warum: "AppCDS in einem Schritt. Gemessen: REST-Schnittstelle 311 → 218 ms Startzeit auf JDK 21.",
      betrifft: "Startzeit zählt und Ihr noch auf 21 seid.",
      risiko: 0, risikoText: "Keins.", r: [2, 1, 0],
      umsetzung: "Das dynamische Archiv setzt auf dem Standardarchiv auf und enthält, was der Lauf geladen hat. Seit 19 erzeugt `-XX:+AutoCreateSharedArchive` es bei Bedarf selbst.",
      beispiel: ["bash", [
        "java -XX:ArchiveClassesAtExit=rest.jsa -jar target/bestellung-rest.jar",
        "java -XX:SharedArchiveFile=rest.jsa -jar target/bestellung-rest.jar"]],
      bezug: [[483, "AOT-Cache (24)"]] },
    { nr: 349, v: 14, b: "jvm", name: "JFR-Streaming", titel: "JFR Event Streaming",
      worum: "JFR-Ereignisse laufend lesen, statt erst eine Aufzeichnung auszuwerten.",
      warum: "Überwachung im laufenden Betrieb.",
      betrifft: "Ihr eigene Überwachung baut.",
      risiko: 0, risikoText: "Keins.", r: [1, 0, 1],
      umsetzung: "`jdk.jfr.consumer.RecordingStream` abonniert Ereignisse im eigenen Prozess, `EventStream.openRepository` liest die einer anderen JVM.",
      beispiel: ["java", [
        "try (var strom = new RecordingStream()) {",
        "    strom.enable(\"jdk.GarbageCollection\");",
        "    strom.onEvent(\"jdk.GarbageCollection\", e -> IO.println(e.getDuration()));",
        "    strom.start();",
        "}"]] },
    { nr: 358, v: 14, b: "jvm", name: "Hilfreiche NullPointerExceptions", titel: "Helpful NullPointerExceptions",
      worum: "Die Meldung nennt, was `null` war: „because the return value of …getKunde() is null“.",
      warum: "Fehler in Produktion schneller finden – ohne Codeänderung.",
      betrifft: "Du jemals eine NullPointerException gesucht hast.",
      risiko: 0, risikoText: "Keins; Tests, die auf den genauen Meldungstext prüfen, ändern sich.", r: [2, 2, 2],
      umsetzung: "Die JVM rekonstruiert aus dem Bytecode, welcher Ausdruck `null` war. Ab 15 standardmäßig an (`-XX:+ShowCodeDetailsInExceptionMessages`); lokale Namen nur, wenn mit `-g` übersetzt.",
      beispiel: ["text", [
        "Exception in thread \"main\" java.lang.NullPointerException:",
        "  Cannot invoke \"Kunde.name()\" because the return value of \"Bestellung.kunde()\" is null"]] },
    { nr: 439, v: 21, b: "jvm", name: "Generational ZGC", titel: "Generational ZGC",
      worum: "ZGC trennt junge und alte Objekte und räumt die jungen häufiger auf.",
      warum: "Weniger CPU und Speicher für dieselben kurzen Pausen; ab 23 der Standard-Modus (JEP 474).",
      betrifft: "Ihr ZGC nutzt.",
      risiko: 0, risikoText: "Keins.", r: [2, 0, 1],
      umsetzung: "In 21 mit `-XX:+UseZGC -XX:+ZGenerational` einzuschalten; ab 23 Standard, ab 24 die einzige Form.",
      beispiel: ["bash", [
        "java -XX:+UseZGC -XX:+ZGenerational -Xlog:gc -jar target/bestellung-rest.jar   # JDK 21"]],
      bezug: [[474, "Standard ab 23"]] },
    { nr: 474, v: 23, b: "jvm", name: "ZGC nur generational", titel: "ZGC: Generational Mode by Default", danach: [[490, 24, "entfernt"]],
      worum: "Generational ZGC wird Standard; mit 24 entfällt der alte Modus (JEP 490).",
      warum: "Wer ZGC einschaltet, bekommt die bessere Variante.",
      betrifft: "Eure Startskripte `-XX:-ZGenerational` setzen.",
      risiko: 1, risikoText: "Gemessen auf 25: Die Option wird mit einer Warnung ignoriert.", r: [1, 0, 1],
      umsetzung: "23 kehrt den Standard von `ZGenerational` um und kündigt die Option ab; 24 entfernt den nicht-generationalen Code.",
      beispiel: ["bash", [
        "java -XX:+UseZGC -XX:-ZGenerational -version   # JDK 25: Warnung, Option ignoriert"]],
      bezug: [[439, "Generational ZGC (21)"]] },
    { nr: 491, v: 24, b: "jvm", projekt: "Loom", name: "Kein Pinning bei synchronized", titel: "Synchronize Virtual Threads without Pinning",
      worum: "Ein virtueller Thread, der in `synchronized` blockiert, gibt seinen Träger frei.",
      warum: "Der größte Vorbehalt gegen virtuelle Threads unter 21 entfällt. Gemessen: Batch-Import 893 ms auf 21, 71 ms auf 25.",
      betrifft: "Ihr virtuelle Threads mit altem Code oder alten Treibern nutzt.",
      risiko: 0, risikoText: "Keins.", r: [2, 2, 1],
      umsetzung: "Die JVM verwaltet Monitore jetzt unabhängig vom Trägerthread. Pinning bleibt nur bei nativen Aufrufen; JFR meldet es als `jdk.VirtualThreadPinned`.",
      beispiel: ["bash", [
        "java -XX:StartFlightRecording=filename=pinning.jfr -jar target/bestellung-batch.jar",
        "jfr print --events jdk.VirtualThreadPinned pinning.jfr"]],
      bezug: [[444, "Virtual Threads (21)"]] },
    { nr: 483, v: 24, b: "jvm", projekt: "Leyden", name: "AOT-Cache", titel: "Ahead-of-Time Class Loading & Linking",
      worum: "Ein Trainingslauf schreibt geladene und gelinkte Klassen in einen Cache; die nächsten Starts lesen ihn.",
      warum: "Gemessen: REST-Schnittstelle 311 → 194 ms Startzeit.",
      betrifft: "Startzeit zählt.",
      risiko: 0, risikoText: "Keins; der Cache passt nur zu gleichem JDK und Klassenpfad.", r: [2, 1, 0],
      umsetzung: "In 24 drei Schritte: `-XX:AOTMode=record` mit `-XX:AOTConfiguration`, dann `-XX:AOTMode=create`, dann Start mit `-XX:AOTCache`. Der Klassenpfad muss aus JARs bestehen.",
      beispiel: ["bash", [
        "java -XX:AOTMode=record -XX:AOTConfiguration=rest.aotconf -jar target/bestellung-rest.jar",
        "java -XX:AOTMode=create -XX:AOTConfiguration=rest.aotconf -XX:AOTCache=rest.aot -jar target/bestellung-rest.jar",
        "java -XX:AOTCache=rest.aot -jar target/bestellung-rest.jar"]],
      bezug: [[350, "dynamisches CDS-Archiv (13)"], [514, "in einem Schritt (25)"], [515, "mit Profilen (25)"], [516, "mit jedem GC (26)"], [544, "mit nativem Code (28)"]] },
    { nr: 514, v: 25, b: "jvm", projekt: "Leyden", name: "AOT in einem Schritt", titel: "Ahead-of-Time Command-Line Ergonomics",
      worum: "`-XX:AOTCacheOutput` erzeugt den Cache in einem Lauf statt in zwei.",
      warum: "Der AOT-Cache wird alltagstauglich.",
      betrifft: "Ihr den AOT-Cache im Build erzeugt.",
      risiko: 0, risikoText: "Keins.", r: [2, 1, 0],
      umsetzung: "`-XX:AOTCacheOutput=datei` führt Aufzeichnen und Erzeugen nacheinander aus; `JDK_AOT_VM_OPTIONS` trennt Optionen für den Erzeugungsschritt.",
      beispiel: ["bash", [
        "java -XX:AOTCacheOutput=rest.aot -jar target/bestellung-rest.jar",
        "java -XX:AOTCache=rest.aot -jar target/bestellung-rest.jar"]],
      bezug: [[483, "AOT-Cache (24)"]] },
    { nr: 515, v: 25, b: "jvm", projekt: "Leyden", name: "AOT-Profile", titel: "Ahead-of-Time Method Profiling",
      worum: "Der Cache enthält auch Profile aus dem Trainingslauf – der JIT optimiert früher.",
      warum: "Schneller auf voller Leistung nach dem Start.",
      betrifft: "Eure Dienste kurz nach dem Start Last tragen müssen.",
      risiko: 0, risikoText: "Keins.", r: [2, 0, 0],
      umsetzung: "Ohne neue Option: Wer einen AOT-Cache erzeugt, bekommt die Methodenprofile mit. Der Trainingslauf sollte deshalb typische Last erzeugen.",
      beispiel: ["bash", [
        "java -XX:AOTCacheOutput=rest.aot -cp target/bestellung-rest.jar bestellung.rest.Lasttest 1000"]],
      bezug: [[483, "AOT-Cache (24)"], [544, "AOT-Code (28)"]] },
    { nr: 519, v: 25, b: "jvm", projekt: "Lilliput", name: "Kompakte Objekt-Header", titel: "Compact Object Headers", kette: [[450, 24, "Experimentell"]], danach: [[534, 27, "Standard"]],
      worum: "Objekt-Header schrumpfen auf 8 Byte; in 25 einschalten mit `-XX:+UseCompactObjectHeaders`, ab 27 Standard (JEP 534).",
      warum: "Weniger Heap bei vielen kleinen Objekten.",
      betrifft: "Eure Anwendung viele kleine Objekte hält.",
      risiko: 0, risikoText: "Keins.", r: [1, 2, 1],
      umsetzung: "Klassenzeiger und Markwort teilen sich 64 statt 96 Bit. In 24 experimentell, in 25 Produktfeature mit Option, in 27 Standard; abschalten mit `-XX:-UseCompactObjectHeaders`.",
      beispiel: ["bash", [
        "java -XX:+UseCompactObjectHeaders -Xlog:gc+heap+exit -jar target/bestellung-batch.jar"]],
      bezug: [[401, "Valhalla – Objekte ganz ohne Header im Feld"]] },
    { nr: 521, v: 25, b: "jvm", name: "Generational Shenandoah", titel: "Generational Shenandoah", kette: [[404, 24, "Experimentell"]], danach: [[535, 28, "Standard"]],
      worum: "Shenandoah trennt junge und alte Objekte – wie Generational ZGC.",
      warum: "Weniger Aufwand für dieselben kurzen Pausen; mit 28 der Standard-Modus (JEP 535).",
      betrifft: "Ihr Shenandoah nutzt.",
      risiko: 0, risikoText: "Keins.", r: [1, 0, 0],
      umsetzung: "In 25 mit `-XX:+UseShenandoahGC -XX:ShenandoahGCMode=generational`; in 24 nur mit `-XX:+UnlockExperimentalVMOptions`.",
      beispiel: ["bash", [
        "java -XX:+UseShenandoahGC -XX:ShenandoahGCMode=generational -Xlog:gc -version"]],
      bezug: [[379, "Shenandoah (15)"]] },
    { nr: 516, v: 26, b: "jvm", projekt: "Leyden", name: "AOT-Cache mit jedem GC", titel: "Ahead-of-Time Object Caching with Any GC",
      worum: "Der AOT-Cache enthält vorab erzeugte Objekte in einem neutralen Format – nutzbar auch mit ZGC.",
      warum: "Bisher konnte nur G1 die zwischengespeicherten Objekte direkt einblenden; jetzt profitieren auch ZGC-Dienste vom schnellen Start.",
      betrifft: "Ihr ZGC und den AOT-Cache zusammen nutzen wollt.",
      risiko: 0, risikoText: "Keins.", r: [1, 0, 0],
      umsetzung: "Objekte werden beim Start der Reihe nach aus dem Cache geladen statt in den Speicher abgebildet. Keine neue Option.",
      beispiel: ["bash", [
        "java -XX:+UseZGC -XX:AOTCacheOutput=rest.aot -jar target/bestellung-rest.jar   # ab JDK 26"]],
      bezug: [[483, "AOT-Cache (24)"]] },
    { nr: 539, b: "jvm", projekt: "Valhalla", name: "Strikte Feldinitialisierung", titel: "Strict Field Initialization in the JVM (Preview)", offen: true,
      weg: [[539, 28, "Preview"]],
      worum: "Die JVM garantiert für markierte Felder, dass nie ihr Vorgabewert (`0`, `null`) gelesen wird.",
      warum: "Die Grundlage für Value Objects: Ein Wert ohne Identität darf nicht halb initialisiert sichtbar werden.",
      betrifft: "Du Bytecode erzeugst – für Java-Code erledigt es der Compiler bei Value-Klassen.",
      risiko: 2, risikoText: "Preview-Funktion der JVM, für 28 integriert.", r: [0, 0, 0],
      umsetzung: "Ein Feld mit dem Flag `ACC_STRICT_INIT` muss gesetzt sein, bevor der Konstruktor `super()` aufruft; finale strikte Felder zeigen immer denselben Wert. `javac` setzt das Flag für Felder von Value-Klassen.",
      beispiel: ["bash", [
        "javap -v --enable-preview Betrag.class | grep -i strict   # JDK 28 Early Access"]],
      bezug: [[401, "Value Objects"], [513, "flexible Konstruktoren"]] },
    { nr: 544, v: 28, b: "jvm", projekt: "Leyden", name: "AOT-Code", titel: "Ahead-of-Time Code Compilation",
      worum: "Der AOT-Cache enthält auch nativen Code aus dem Trainingslauf – die Anwendung startet gleich optimiert.",
      warum: "Kein Warten auf den JIT nach dem Start, ohne auf ihn zu verzichten: Ändert sich die Last, übersetzt er neu.",
      betrifft: "Eure Dienste skalieren oft neu und müssen sofort Last tragen.",
      risiko: 0, risikoText: "Keins; integriert für 28.", r: [2, 0, 0],
      umsetzung: "Dieselben Optionen wie bisher (`-XX:AOTCacheOutput`, `-XX:AOTCache`); der Trainingslauf übersetzt heiße Methoden und legt den Code in den Cache.",
      beispiel: ["bash", [
        "java -XX:AOTCacheOutput=rest.aot -jar target/bestellung-rest.jar   # JDK 28",
        "java -XX:AOTCache=rest.aot -jar target/bestellung-rest.jar"]],
      bezug: [[483, "AOT-Cache (24)"], [515, "AOT-Profile (25)"]] },
    { nr: 545, v: 28, b: "jvm", name: "ZGC schneller warm", titel: "Faster Startup and Warmup with ZGC",
      worum: "ZGC startet mit kleinem Heap und wächst in der Aufwärmphase zügig.",
      warum: "Kürzere Start- und Aufwärmzeit mit ZGC, ohne Heap-Optionen.",
      betrifft: "Ihr ZGC für kurzlebige oder oft neu startende Dienste nutzt.",
      risiko: 0, risikoText: "Keins; für 28 geplant.", r: [1, 0, 0],
      umsetzung: "Die JVM beginnt mit 2 MB Heap und verwaltet Speicher in 2-MB-Einheiten; mit adaptiver Heap-Größe (JEP 546) entfallen `-Xms`, `-Xmx` und `AlwaysPreTouch`.",
      beispiel: ["bash", [
        "java -XX:+UseZGC -Xlog:gc+heap -jar target/bestellung-rest.jar   # JDK 28"]],
      bezug: [[377, "ZGC (15)"]] },

    // ===== Werkzeuge =====
    { nr: 222, v: 9, b: "werkzeuge", name: "jshell", titel: "jshell: The Java Shell (Read-Eval-Print Loop)",
      worum: "Java-Ausdrücke und Schnipsel interaktiv ausprobieren.",
      warum: "Eine API ausprobieren, ohne ein Projekt anzulegen.",
      betrifft: "Du schnell etwas ausprobieren willst.",
      risiko: 0, risikoText: "Keins.", r: [1, 1, 1],
      umsetzung: "Ausdrücke, Deklarationen und Importe ohne Klasse und `main`; `/vars`, `/methods`, `/open`, `--class-path` für eigene JARs und `--enable-preview`.",
      beispiel: ["bash", [
        "jshell --class-path altbestand/bestellung-domaene/target/classes"]] },
    { nr: 247, v: 9, b: "werkzeuge", name: "--release", titel: "Compile for Older Platform Versions",
      worum: "`javac --release 8` übersetzt für ein älteres Release – und prüft, dass nur dessen API benutzt wird.",
      warum: "Ein neues JDK im Build, ohne den Zielbetrieb zu ändern – der erste Schritt jeder Migration.",
      betrifft: "Ihr das JDK im Build wechselt.",
      risiko: 0, risikoText: "Keins – im Gegenteil: `-source` und `-target` prüfen die API nicht.", r: [2, 2, 2],
      umsetzung: "Das JDK bringt Signaturen der älteren Releases mit (`lib/ct.sym`). In Maven über die Property `maven.compiler.release`.",
      beispiel: ["bash", [
        "javac --release 8 -d out src/Bestellung.java"]] },
    { nr: 158, v: 9, b: "werkzeuge", name: "-Xlog", titel: "Unified JVM Logging",
      worum: "Ein gemeinsames Logging für alle Bereiche der JVM: `-Xlog:gc`, `-Xlog:class+load` …",
      warum: "Ersetzt die alten GC-Log-Optionen.",
      betrifft: "Eure Startskripte GC-Logs schreiben.",
      risiko: 2, risikoText: "Gemessen auf 21 und 25: `-XX:+PrintGCDetails` und `-Xloggc` warnen nur, `-XX:+PrintGCDateStamps` verhindert den Start („Unrecognized VM option“).", r: [1, 1, 2],
      umsetzung: "`-Xlog:«tags»=«stufe»:«ziel»:«dekoration»`, etwa `-Xlog:gc*:file=gc.log:time,uptime`. `-Xlog:help` listet alles; die GC-Optionen folgten mit JEP 271.",
      beispiel: ["bash", [
        "java -Xlog:gc*:file=gc.log:time,uptime -jar target/bestellung-batch.jar"]] },
    { nr: 238, v: 9, b: "werkzeuge", name: "Multi-Release-JARs", titel: "Multi-Release JAR Files",
      worum: "Ein JAR kann je Java-Release eigene Klassen mitbringen (`META-INF/versions/…`).",
      warum: "Bibliotheken unterstützen alte und neue JDKs zugleich.",
      betrifft: "Du Bibliotheken für mehrere Releases baust.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0],
      umsetzung: "Im Manifest `Multi-Release: true`; die JVM nimmt die Klasse aus dem höchsten passenden `META-INF/versions/N`, sonst aus der Wurzel.",
      beispiel: ["bash", [
        "jar --create --file bib.jar -C klassen8 . --release 17 -C klassen17 ."]] },
    { nr: 277, v: 9, b: "werkzeuge", name: "jdeprscan", titel: "Enhanced Deprecation",
      worum: "`@Deprecated(forRemoval = true, since = …)` kündigt Entfernungen an; `jdeprscan` findet ihre Nutzung im eigenen Code.",
      warum: "Was entfernt wird, wird vorher angekündigt – wer sucht, wird nicht überrascht.",
      betrifft: "Ihr eine Migration plant.",
      risiko: 0, risikoText: "Keins.", r: [2, 2, 2],
      umsetzung: "Zwei neue Elemente an `@Deprecated`; `javac` warnt bei `forRemoval` auch ohne `-Xlint`. `jdeprscan --release N` prüft JARs gegen ein Ziel-Release.",
      beispiel: ["bash", [
        "jdeprscan --release 25 --for-removal target/bestellung-rest.jar"]] },
    { nr: 282, v: 9, b: "werkzeuge", projekt: "Jigsaw", name: "jlink", titel: "jlink: The Java Linker",
      worum: "Baut eine schlanke Laufzeitumgebung aus genau den Modulen, die eine Anwendung braucht.",
      warum: "Kleinere Container-Images.",
      betrifft: "Ihr Container-Images baut und jedes Megabyte zählt.",
      risiko: 0, risikoText: "Keins.", r: [1, 0, 0],
      umsetzung: "`jlink --add-modules … --output …` erzeugt ein Laufzeit-Image; eigene Anwendungen müssen dafür durchgehend explizite Module sein, sonst nimmt man nur JDK-Module (ermittelt mit `jdeps`).",
      beispiel: ["bash", [
        "jlink --add-modules java.base,java.logging,jdk.httpserver --strip-debug --no-header-files --output laufzeit"]],
      bezug: [[261, "Modulsystem"], [220, "Laufzeit-Images"], [493, "jlink ohne jmods (24)"]] },
    { nr: 493, v: 24, b: "werkzeuge", name: "jlink ohne jmods", titel: "Linking Run-Time Images without JMODs",
      worum: "Ein JDK darf ohne seine `jmods` ausgeliefert werden; `jlink` baut Images dann aus dem laufenden JDK.",
      warum: "Das JDK wird rund ein Viertel kleiner – manche Distributionen, etwa Temurin 25, nutzen das.",
      betrifft: "Ihr mit `jlink` eigene Laufzeit-Images baut und die JDK-Distribution wechselt.",
      risiko: 1, risikoText: "Ein solches JDK kann das Modul `jdk.jlink` nicht ins Image nehmen – daran scheitert auch `--bind-services`.", r: [1, 1, 0],
      umsetzung: "Eine Option beim Bauen des JDK (`--enable-linkable-runtime`), standardmäßig aus; ob eine Distribution sie nutzt, entscheidet der Anbieter. Erkennbar am fehlenden Ordner `jmods`.",
      beispiel: ["bash", [
        "ls \"$JAVA_HOME/jmods\"   # fehlt der Ordner, linkt jlink aus dem laufenden JDK",
        "jlink --add-modules java.base --output laufzeit"]],
      bezug: [[282, "jlink"]] },
    { nr: 330, v: 11, b: "werkzeuge", name: "java Datei.java", titel: "Launch Single-File Source-Code Programs",
      worum: "`java Datei.java` übersetzt und startet ein Programm in einem Schritt.",
      warum: "Skripte und Spielwiesen in Java, ohne Build.",
      betrifft: "Du kleine Werkzeuge oder Versuche schreibst.",
      risiko: 0, risikoText: "Keins.", r: [1, 1, 0],
      umsetzung: "Der Launcher übersetzt die Datei im Speicher und startet die erste Klasse; Optionen wie `--source` und `--enable-preview` gelten. Unter Unix auch mit Shebang `#!/usr/bin/java --source 25`.",
      beispiel: ["bash", [
        "java spielwiese/Versionsinfo.java"]],
      bezug: [[458, "mehrere Dateien (22)"], [512, "kompakte Quelldateien (25)"]] },
    { nr: 392, v: 16, b: "werkzeuge", name: "jpackage", titel: "Packaging Tool", kette: [[343, 14, "Incubator"]],
      worum: "Baut installierbare Pakete (`.msi`, `.dmg`, `.deb`) samt Laufzeit.",
      warum: "Für Desktop-Anwendungen.",
      betrifft: "Du Anwendungen zum Installieren auslieferst.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0],
      umsetzung: "`jpackage` ruft `jlink` auf und verpackt Image und Anwendung im Format des Betriebssystems – gebaut wird je Plattform auf dieser Plattform.",
      beispiel: ["bash", [
        "jpackage --name Bestellung --input target --main-jar bestellung-batch.jar --type deb"]] },
    { nr: 408, v: 18, b: "werkzeuge", name: "jwebserver", titel: "Simple Web Server",
      worum: "`jwebserver` liefert ein Verzeichnis statischer Dateien aus.",
      warum: "Zum Testen und Ausprobieren, nicht für Produktion.",
      betrifft: "Du schnell Dateien per HTTP bereitstellen willst.",
      risiko: 0, risikoText: "Keins.", r: [1, 0, 0],
      umsetzung: "Ein Werkzeug auf Basis von `jdk.httpserver`, nur HTTP/1.1 und nur lesend; programmatisch über `SimpleFileServer`.",
      beispiel: ["bash", [
        "jwebserver --port 8000 --directory \"$PWD/target/site\""]] },
    { nr: 413, v: 18, b: "werkzeuge", name: "@snippet in Javadoc", titel: "Code Snippets in Java API Documentation",
      worum: "`{@snippet …}` bindet geprüfte Code-Beispiele in Javadoc ein.",
      warum: "Beispiele, die nicht veralten.",
      betrifft: "Du Bibliotheken dokumentierst.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0],
      umsetzung: "Inline im Kommentar oder aus einer Datei (`file=…`, `region=…`); Markierungen wie `@highlight` im Beispiel.",
      beispiel: ["java", [
        "/**",
        " * Legt eine Bestellung an:",
        " * {@snippet :",
        " * var b = new Bestellung(\"B-1\"); // @highlight substring=\"new\"",
        " * }",
        " */"]],
      bezug: [[467, "Markdown-Javadoc (23)"]] },
    { nr: 458, v: 22, b: "werkzeuge", name: "Mehrere Quelldateien starten", titel: "Launch Multi-File Source-Code Programs",
      worum: "`java Haupt.java` darf weitere Quelldateien im selben Ordner nutzen.",
      warum: "Kleine Programme wachsen über eine Datei hinaus, ohne Build.",
      betrifft: "Du Skripte in Java schreibst.",
      risiko: 0, risikoText: "Keins.", r: [0, 1, 0],
      umsetzung: "Der Launcher übersetzt bei Bedarf weitere `.java`-Dateien aus dem Verzeichnisbaum; JARs kommen über `--class-path`.",
      beispiel: ["bash", [
        "java Haupt.java   # Haupt nutzt Hilfe.java im selben Ordner"]],
      bezug: [[330, "eine Quelldatei (11)"], [512, "kompakte Quelldateien (25)"]] },
    { nr: 467, v: 23, b: "werkzeuge", name: "Javadoc in Markdown", titel: "Markdown Documentation Comments",
      worum: "Javadoc-Kommentare mit `///` in Markdown statt HTML.",
      warum: "Lesbare Dokumentation im Quelltext.",
      betrifft: "Du Javadoc schreibst.",
      risiko: 0, risikoText: "Keins.", r: [0, 0, 0],
      umsetzung: "Jede Zeile beginnt mit `///`; CommonMark mit Tabellen, Verweise als `[Klasse#methode()]`, Block-Tags wie `@param` bleiben.",
      beispiel: ["java", [
        "/// Berechnet die **Bruttosumme** einer Bestellung.",
        "///",
        "/// @param netto Summe in Cent",
        "/// @return Summe mit Steuer, siehe [Gebühr#brutto(long)]",
        "long brutto(long netto) { … }"]],
      bezug: [[413, "@snippet (18)"]] },

    // ===== Entfernt und verschärft =====
    { nr: 220, v: 9, b: "entfernt", projekt: "Jigsaw", name: "rt.jar und tools.jar entfernt", titel: "Modular Run-Time Images",
      worum: "Das JDK hat kein `rt.jar` und kein `tools.jar` mehr; Klassen liegen im Image `lib/modules`, erreichbar über `jrt:/`.",
      warum: "Werkzeuge und Skripte, die `rt.jar` oder `tools.jar` suchen, brechen.",
      betrifft: "Euer Build, ein Plugin oder ein Werkzeug Pfade im JDK erwartet.",
      risiko: 1, risikoText: "Fehler beim Bauen oder Starten alter Werkzeuge; die Abhilfe ist meist ein aktuelles Plugin.", r: [1, 1, 1],
      umsetzung: "Auch JRE und JDK sind nicht mehr verschachtelt; `java.home` zeigt auf das Image. Inhalte liest man mit dem Dateisystem `jrt:/`.",
      beispiel: ["java", [
        "FileSystem jrt = FileSystems.getFileSystem(URI.create(\"jrt:/\"));",
        "Files.list(jrt.getPath(\"/modules\")).limit(5).forEach(IO::println);"]],
      bezug: [[200, "das JDK in Modulen"], [282, "jlink"]] },
    { nr: 260, v: 9, b: "entfernt", projekt: "Jigsaw", name: "Interna gekapselt", titel: "Encapsulate Most Internal APIs",
      worum: "Die meisten `sun.*`- und `com.sun.*`-Interna sind nicht mehr zugänglich; kritische wie `sun.misc.Unsafe` bleiben vorerst.",
      warum: "Der Anfang der starken Kapselung.",
      betrifft: "Dein Code oder eine Bibliothek Klassen aus `sun.*` importiert.",
      risiko: 1, risikoText: "Fehler beim Übersetzen, vorher zu finden mit `jdeps --jdk-internals`.", r: [1, 1, 1],
      umsetzung: "Interne Pakete werden nicht exportiert; zur Laufzeit erlaubte 9 bis 15 den Zugriff noch mit Warnung (`--illegal-access=permit`). Kritische Klassen liegen im Modul `jdk.unsupported`.",
      beispiel: ["bash", [
        "jdeps --jdk-internals target/bestellung-rest.jar"]],
      bezug: [[261, "Modulsystem"], [396, "Kapselung als Standard (16)"], [403, "ohne Ausweg (17)"]] },
    { nr: 252, v: 9, b: "entfernt", name: "CLDR als Standard", titel: "Use CLDR Locale Data by Default",
      worum: "Datums- und Zahlformate kommen aus dem Unicode-CLDR statt aus den JDK-eigenen Daten.",
      warum: "Still geänderte Ausgaben: „Mo., 14. Sept. 2026“ statt „Mo, 14. Sep 2026“, ein geschütztes Leerzeichen vor dem €.",
      betrifft: "Ihr formatierte Daten oder Beträge in Dateien oder Schnittstellen schreibt.",
      risiko: 2, risikoText: "Still – kein Fehler, nur andere Zeichen (Modul `datumsformat`). `-Djava.locale.providers=COMPAT` half bis 22; heute das Format im Code festlegen.", r: [1, 2, 1],
      umsetzung: "Die Reihenfolge der Quellen steht in `java.locale.providers`; Standard ist `CLDR,COMPAT`, ab 23 gibt es `COMPAT` nicht mehr. `DateTimeFormatter.ofPattern` mit festem Muster ist unabhängig davon.",
      beispiel: ["java", [
        "var datum = LocalDate.of(2026, 9, 14);",
        "DateTimeFormatter.ofPattern(\"EEE, d. MMM yyyy\", Locale.GERMANY).format(datum);",
        "// Java 8: \"Mo, 14. Sep 2026\"   ab Java 9: \"Mo., 14. Sept. 2026\""]] },
    { nr: 363, v: 14, b: "entfernt", name: "CMS entfernt", titel: "Remove the Concurrent Mark Sweep (CMS) Garbage Collector", ziel: "entfernt", kette: [[291, 9, "Abkündigung"]],
      worum: "Der CMS-Collector ist nicht mehr im JDK – abgekündigt mit 9 (JEP 291), entfernt mit 14.",
      warum: "Alte Startskripte brechen – ein Bruch, der in keinem Quelltext steht. Die Ankündigung haben viele überlesen.",
      betrifft: "`-XX:+UseConcMarkSweepGC` in Startskript oder Dockerfile steht.",
      risiko: 2, risikoText: "Bis 13 eine Warnung. Gemessen auf 21 und 25: „Unrecognized VM option“ – die JVM startet nicht.", r: [1, 1, 2],
      umsetzung: "9 bis 13 warnen bei der Option, 14 entfernt den Collector samt Optionen. Ersatz ist G1, für kurze Pausen ZGC.",
      beispiel: ["bash", [
        "java -XX:+UseConcMarkSweepGC -version   # JDK 21: Unrecognized VM option"]],
      bezug: [[248, "G1 als Standard (9)"]] },
    { nr: 320, v: 11, b: "entfernt", name: "Java EE und CORBA entfernt", titel: "Remove the Java EE and CORBA Modules",
      worum: "JAXB, JAX-WS, JAF, `javax.annotation` und CORBA sind nicht mehr im JDK.",
      warum: "Der häufigste Bruch beim Sprung von 8 auf 11.",
      betrifft: "Ihr XML mit JAXB bindet oder SOAP-Dienste nutzt.",
      risiko: 2, risikoText: "Bricht beim Übersetzen und zur Laufzeit (Modul `jaxb`). Abhilfe: die Jakarta-Bibliotheken als Abhängigkeit; in Server-Anwendungen bringt sie der Server mit.", r: [1, 2, 1],
      umsetzung: "In 9 und 10 waren die Module abgekündigt und nur mit `--add-modules java.xml.bind` erreichbar; 11 entfernt sie. Die Nachfolger heißen `jakarta.xml.bind` und liegen bei der Eclipse Foundation.",
      beispiel: ["xml", [
        "<dependency>",
        "  <groupId>jakarta.xml.bind</groupId>",
        "  <artifactId>jakarta.xml.bind-api</artifactId>",
        "  <version>4.0.2</version>",
        "</dependency>"]] },
    { nr: 372, v: 15, b: "entfernt", name: "Nashorn entfernt", titel: "Remove the Nashorn JavaScript Engine", ziel: "entfernt", kette: [[335, 11, "Abkündigung"]],
      worum: "Die JavaScript-Engine ist aus dem JDK entfernt – abgekündigt mit 11 (JEP 335).",
      warum: "Skripte brauchen eine eigene Engine, etwa GraalJS oder Nashorn als Bibliothek.",
      betrifft: "Ihr per `ScriptEngine` JavaScript ausführt.",
      risiko: 2, risikoText: "Bis 14 eine Warnung, ab 15 liefert `getEngineByName(\"nashorn\")` `null` – erst zur Laufzeit.", r: [0, 1, 1],
      umsetzung: "11 bis 14 warnen, 15 entfernt die Module `jdk.scripting.nashorn`. Nashorn lebt als eigenständige Bibliothek `org.openjdk.nashorn` weiter.",
      beispiel: ["java", [
        "ScriptEngine engine = new ScriptEngineManager().getEngineByName(\"nashorn\");",
        "// ab JDK 15: null"]] },
    { nr: 390, v: 16, b: "entfernt", projekt: "Valhalla", name: "Warnung bei Wertklassen", titel: "Warnings for Value-Based Classes",
      worum: "Der Compiler warnt, wenn auf `Integer`, `LocalDate` und anderen wertbasierten Klassen synchronisiert wird; ihre Konstruktoren wie `new Integer(…)` sind zur Entfernung abgekündigt.",
      warum: "Die Vorbereitung auf Valhalla: Diese Klassen werden Value-Klassen ohne Identität.",
      betrifft: "Du `new Integer(…)` schreibst oder auf solchen Objekten synchronisierst.",
      risiko: 1, risikoText: "Heute Warnungen; mit Value Objects (Preview in 28) scheitert `synchronized` mit `IdentityException`.", r: [1, 1, 1],
      umsetzung: "Die Annotation `@jdk.internal.ValueBased` markiert die Klassen; `javac -Xlint:synchronization` warnt, `-XX:DiagnoseSyncOnValueBasedClasses` meldet es zur Laufzeit.",
      beispiel: ["java", [
        "Integer sperre = 42;",
        "synchronized (sperre) { … }   // warning: [synchronization] attempt to synchronize on an instance of a value-based class",
        "Integer alt = new Integer(42); // warning: [removal]"]],
      bezug: [[401, "Value Objects (Preview in 28)"]] },
    { nr: 396, v: 16, b: "entfernt", projekt: "Jigsaw", name: "Kapselung als Standard", titel: "Strongly Encapsulate JDK Internals by Default",
      worum: "`--illegal-access=deny` wird Standard: Deep Reflection auf JDK-Interna scheitert zur Laufzeit.",
      warum: "Der Bruch, der den Sprung von 8 auf 17 für viele Bibliotheken schmerzhaft machte.",
      betrifft: "Dein Code oder eine Bibliothek per `setAccessible(true)` in JDK-Klassen greift.",
      risiko: 2, risikoText: "`InaccessibleObjectException` zur Laufzeit; Notlösung `--add-opens` (Modul `reflection`).", r: [1, 1, 2],
      umsetzung: "Nicht geöffnete Pakete der JDK-Module verweigern Deep Reflection; `--add-opens java.base/java.util=ALL-UNNAMED` öffnet gezielt.",
      beispiel: ["bash", [
        "java --add-opens java.base/java.util=ALL-UNNAMED -jar target/altbestand.jar"]],
      bezug: [[260, "Interna gekapselt (9)"], [403, "ohne Ausweg (17)"], [500, "final heißt final (26)"]] },
    { nr: 403, v: 17, b: "entfernt", projekt: "Jigsaw", name: "Kapselung ohne Ausweg", titel: "Strongly Encapsulate JDK Internals",
      worum: "`--illegal-access` ist wirkungslos; nur noch `--add-opens` öffnet einzelne Pakete.",
      warum: "Ab 17 gibt es keinen Schalter mehr, der alles wieder öffnet.",
      betrifft: "Ihr bisher mit `--illegal-access=permit` gestartet habt.",
      risiko: 2, risikoText: "Startskripte und Bibliotheken müssen nachziehen.", r: [1, 1, 2],
      umsetzung: "Die Option wird mit einer Warnung ignoriert. Für JARs gibt es `Add-Opens` im Manifest.",
      beispiel: ["bash", [
        "java --illegal-access=permit -version   # JDK 17: Warnung, Option ignoriert"]],
      bezug: [[396, "Kapselung als Standard (16)"]] },
    { nr: 486, v: 24, b: "entfernt", name: "Security Manager abgeschaltet", titel: "Permanently Disable the Security Manager", ziel: "abgeschaltet", kette: [[411, 17, "Abkündigung"]],
      worum: "Ein Security Manager lässt sich nicht mehr einschalten – abgekündigt mit 17 (JEP 411); `-Djava.security.manager=allow` hilft ab 24 nicht mehr.",
      warum: "Das Ende einer Ära – auch für Server, die ihn genutzt haben. Wer damit Plugins oder fremden Code einsperrt, braucht ein anderes Konzept.",
      betrifft: "Eure Anwendung oder Euer Server `System.setSecurityManager` aufruft.",
      risiko: 2, risikoText: "Ab 18 eine Warnung, ab 24 `UnsupportedOperationException` zur Laufzeit (Modul `security-manager`).", r: [0, 1, 2],
      umsetzung: "17 kündigt die API ab, 18 bis 23 verlangen `-Djava.security.manager=allow` und warnen, 24 wirft bei jedem Versuch. Die API bleibt als Hülle, damit Code übersetzt.",
      beispiel: ["java", [
        "System.setSecurityManager(new SecurityManager());",
        "// JDK 21 ohne -Djava.security.manager=allow: UnsupportedOperationException",
        "// JDK 25: immer UnsupportedOperationException"]] },
    { nr: 504, v: 26, b: "entfernt", name: "Applet-API entfernt", titel: "Remove the Applet API", ziel: "entfernt", kette: [[398, 17, "Abkündigung"]],
      worum: "`java.applet` und `javax.swing.JApplet` sind entfernt – abgekündigt mit 17 (JEP 398).",
      warum: "Historisch; Browser führen seit Jahren keine Applets mehr aus.",
      betrifft: "Noch Applet-Klassen im Code liegen.",
      risiko: 0, risikoText: "Praktisch keins: Fehler beim Übersetzen, wo noch `Applet` steht.", r: [0, 0, 0],
      umsetzung: "17 markiert die API mit `forRemoval`, 26 entfernt sie.",
      beispiel: ["bash", [
        "jdeprscan --release 25 --for-removal target/altbestand.jar"]] },
    { nr: 400, v: 18, b: "entfernt", name: "UTF-8 als Standard", titel: "UTF-8 by Default",
      worum: "Der Standard-Zeichensatz ist überall UTF-8, nicht mehr der des Betriebssystems.",
      warum: "Unter Windows lesen und schreiben `FileReader` und Co. plötzlich anders.",
      betrifft: "Ihr Dateien ohne ausdrücklichen Zeichensatz lest oder schreibt.",
      risiko: 2, risikoText: "Still – Umlaute werden falsch, kein Fehler (Modul `zeichensatz`). Notlösung `-Dfile.encoding=COMPAT`; besser den Zeichensatz im Code nennen.", r: [1, 2, 1],
      umsetzung: "`Charset.defaultCharset()` liefert UTF-8; der Zeichensatz des Systems steht in `native.encoding`. Konsole und Dateinamen sind nicht betroffen.",
      beispiel: ["java", [
        "new FileReader(datei);                              // ab 18 UTF-8, vorher Systemzeichensatz",
        "Files.newBufferedReader(datei, StandardCharsets.UTF_8);   // eindeutig"]] },
    { nr: 421, v: 18, b: "entfernt", name: "Finalisierung abgekündigt", titel: "Deprecate Finalization for Removal", ziel: "Abkündigung",
      worum: "`finalize()` ist zur Entfernung abgekündigt; mit `--finalization=disabled` lässt sich ihr Fehlen schon testen.",
      warum: "Aufräumen gehört in try-with-resources oder einen `Cleaner`.",
      betrifft: "Eure Klassen oder alte Bibliotheken `finalize()` überschreiben.",
      risiko: 1, risikoText: "Heute Warnungen; ist es entfernt, werden Ressourcen still nicht mehr freigegeben.", r: [1, 1, 1],
      umsetzung: "`Object.finalize` trägt `forRemoval`; `--finalization=disabled` schaltet sie ab, JFR meldet Klassen mit Finalizer (`jdk.FinalizerStatistics`).",
      beispiel: ["bash", [
        "java --finalization=disabled -jar target/bestellung-batch.jar"]] },
    { nr: 451, v: 21, b: "entfernt", name: "Agenten nur noch beim Start", titel: "Prepare to Disallow the Dynamic Loading of Agents", ziel: "Warnung",
      worum: "Lädt sich ein Agent zur Laufzeit in eine JVM, gibt es eine Warnung; künftig braucht er `-XX:+EnableDynamicAgentLoading`.",
      warum: "Betrifft Mocking-Bibliotheken und Überwachungswerkzeuge.",
      betrifft: "Ihr Mockito, Byte Buddy oder einen APM-Agenten dynamisch ladet.",
      risiko: 1, risikoText: "Warnungen in Testläufen; Agenten besser beim Start mit `-javaagent` laden.", r: [1, 1, 1],
      umsetzung: "Ein Agent über die Attach-API löst eine Warnung aus; `-XX:+EnableDynamicAgentLoading` erlaubt es still. Mockito empfiehlt den Agenten über Surefire `argLine`.",
      beispiel: ["bash", [
        "java -javaagent:mockito-core.jar -jar tests.jar"]] },
    { nr: 498, v: 24, b: "entfernt", name: "Warnung bei Unsafe", titel: "Warn upon Use of Memory-Access Methods in sun.misc.Unsafe", ziel: "Warnung", kette: [[471, 23, "Abkündigung"]],
      worum: "Die Speicherzugriffe von `sun.misc.Unsafe` lösen eine Warnung aus – sie werden entfernt.",
      warum: "Viele Bibliotheken nutzen sie noch; Maven bis 3.9.11 warnt selbst auf 24 und neuer.",
      betrifft: "Beim Start eine Warnung zu `sun.misc.Unsafe` erscheint.",
      risiko: 1, risikoText: "Heute Warnungen, künftig Fehler – Bibliotheken aktuell halten.", r: [1, 1, 1],
      umsetzung: "23 kündigt die Methoden ab, 24 warnt beim ersten Aufruf. `--sun-misc-unsafe-memory-access=allow|warn|debug|deny` steuert das Verhalten; Ersatz sind `VarHandle` und die FFM-API.",
      beispiel: ["bash", [
        "java --sun-misc-unsafe-memory-access=deny -jar target/bestellung-rest.jar   # testet die Zukunft"]],
      bezug: [[454, "Foreign Function & Memory (22)"]] },
    { nr: 472, v: 24, b: "entfernt", name: "JNI eingeschränkt", titel: "Prepare to Restrict the Use of JNI", ziel: "Warnung",
      worum: "Das Laden nativer Bibliotheken per JNI warnt; erlauben mit `--enable-native-access`.",
      warum: "Wie bei der Kapselung: erst warnen, dann verbieten.",
      betrifft: "Ihr oder eine Bibliothek native Bibliotheken ladet.",
      risiko: 1, risikoText: "Warnungen, künftig Fehler ohne Erlaubnis.", r: [0, 1, 1],
      umsetzung: "`System.loadLibrary` und FFM-Aufrufe ohne Erlaubnis warnen; `--enable-native-access=ALL-UNNAMED` oder `Enable-Native-Access` im Manifest erlaubt sie.",
      beispiel: ["bash", [
        "java --enable-native-access=ALL-UNNAMED -jar target/anwendung.jar"]],
      bezug: [[454, "Foreign Function & Memory (22)"]] },
    { nr: 500, v: 26, b: "entfernt", name: "Final heißt final", titel: "Prepare to Make Final Mean Final", ziel: "Warnung",
      worum: "Wer per Reflection ein `final`-Feld ändert, bekommt eine Warnung; künftig scheitert es.",
      warum: "Integrität und Optimierung: Die JVM soll sich auf `final` verlassen können. Betrifft Serialisierung, Mocking und Dependency Injection in Felder.",
      betrifft: "Eure Bibliotheken `final`-Felder per `Field.set` setzen.",
      risiko: 1, risikoText: "Gemessen: still auf 25, Warnung ab 26, `IllegalAccessException` mit `--illegal-final-field-mutation=deny` (Demo `FinalesFeld` in der Spielwiese).", r: [1, 1, 2],
      umsetzung: "`Field.setAccessible(true)` plus `set` auf ein finales Feld warnt; `--enable-final-field-mutation=ALL-UNNAMED` erlaubt es still, `--illegal-final-field-mutation=deny` verbietet es schon heute.",
      beispiel: ["bash", [
        "java spielwiese/FinalesFeld.java",
        "java --illegal-final-field-mutation=deny spielwiese/FinalesFeld.java"]],
      bezug: [[396, "Kapselung als Standard (16)"]] },
    { nr: 541, v: 28, b: "entfernt", name: "macOS/x64 abgekündigt", titel: "Deprecate the macOS/x64 Port for Removal", ziel: "Abkündigung",
      worum: "Das JDK für Macs mit Intel-Prozessor wird abgekündigt; entfernt wird es in einem späteren Release.",
      warum: "Wer auf einem Intel-Mac entwickelt oder baut, braucht mittelfristig Apple Silicon oder Linux.",
      betrifft: "Ihr auf Intel-Macs entwickelt oder dort Builds laufen lasst.",
      risiko: 1, risikoText: "Für 28 umgesetzt: Der Build des Ports warnt; das Entfernen folgt später.", r: [1, 1, 1],
      umsetzung: "Betrifft nur den Port, nicht die Sprache: Ab dem Entfernen gibt es keine offiziellen Builds für macOS/x64 mehr.",
      beispiel: ["bash", [
        "uname -m   # x86_64 = betroffen, arm64 = nicht"]] }
  ];

  // Wann der erste JEP einer Zeile angelegt wurde („Created“ auf openjdk.org).
  const vorgeschlagen = {
    261: "2014-10", 213: "2014-05", 286: "2016-03", 323: "2017-12", 361: "2017-12", 378: "2019-04", 394: "2017-05",
    395: "2019-04", 409: "2019-07", 441: "2018-10", 440: "2021-01", 430: "2021-09", 456: "2022-09", 513: "2023-01",
    512: "2023-02", 511: "2023-08", 455: "2022-06", 401: "2020-08", 8303099: "2023-02", 402: "2021-01", 218: "2014-06",
    269: "2014-06", 266: "2015-08", 102: "2011-09", 259: "2014-05", 321: "2014-05", 380: "2020-02", 356: "2017-12",
    444: "2021-11", 431: "2022-01", 454: "2021-04", 485: "2023-10", 484: "2022-01", 506: "2021-03", 543: "2021-11",
    502: "2023-07", 542: "2023-01", 540: "2024-11", 338: "2018-04",
    200: "2014-07", 201: "2014-07", 248: "2015-02", 254: "2014-08", 310: "2017-08", 307: "2017-01", 328: "2017-12",
    377: "2018-02", 379: "2014-01", 341: "2018-06", 346: "2018-05", 350: "2018-12", 349: "2017-07", 358: "2019-03",
    439: "2021-08", 474: "2024-02", 491: "2024-07", 483: "2023-09", 514: "2025-02", 515: "2024-02", 519: "2022-10",
    521: "2021-02", 516: "2024-02", 539: "2025-02", 544: "2024-06", 545: "2024-04",
    222: "2014-05", 247: "2014-09", 158: "2012-02", 238: "2014-06", 277: "2014-11", 282: "2015-07", 493: "2024-06", 330: "2017-12",
    392: "2018-04", 408: "2021-01", 413: "2018-04", 458: "2023-03", 467: "2023-09",
    220: "2014-10", 260: "2015-08", 252: "2014-05", 363: "2015-11", 320: "2017-10", 372: "2018-05", 390: "2020-07",
    396: "2020-10", 403: "2021-03", 486: "2021-04", 504: "2020-11", 400: "2017-08", 421: "2021-09", 451: "2023-04",
    498: "2024-01", 472: "2023-05", 500: "2025-02", 541: "2026-06"
  };

  // Releases als Spalten. ga = Datum der Freigabe (28 und 29 geplant).
  const releases = [
    { v: 8, ga: "2014-03" }, { v: 9, ga: "2017-09" }, { v: 10, ga: "2018-03" }, { v: 11, ga: "2018-09" },
    { v: 12, ga: "2019-03" }, { v: 13, ga: "2019-09" }, { v: 14, ga: "2020-03" }, { v: 15, ga: "2020-09" },
    { v: 16, ga: "2021-03" }, { v: 17, ga: "2021-09" }, { v: 18, ga: "2022-03" }, { v: 19, ga: "2022-09" },
    { v: 20, ga: "2023-03" }, { v: 21, ga: "2023-09" }, { v: 22, ga: "2024-03" }, { v: 23, ga: "2024-09" },
    { v: 24, ga: "2025-03" }, { v: 25, ga: "2025-09" }, { v: 26, ga: "2026-03" }, { v: 27, ga: "2026-09" },
    { v: 28, ga: "2027-03" }, { v: 29, ga: "2027-09" }
  ];
  const aktuell = 27;            // zuletzt erschienen (Stand 2026-10-22); danach Ausblick – durable-ok
  const ltsReleases = [8, 11, 17, 21, 25, 29];
  const erstes = releases[0].v, letztes = releases[releases.length - 1].v;

  const sprünge = [
    { id: "11", titel: "8 → 11", unter: "Java 9–11 · LTS 2018", von: 9, bis: 11 },
    { id: "17", titel: "11 → 17", unter: "Java 12–17 · LTS 2021", von: 12, bis: 17 },
    { id: "21", titel: "17 → 21", unter: "Java 18–21 · LTS 2023", von: 18, bis: 21 },
    { id: "25", titel: "21 → 25", unter: "Java 22–25 · LTS 2025", von: 22, bis: 25 },
    { id: "29", titel: "25 → 29", unter: "Java 26–29 · Ausblick", von: 26, bis: 29 }
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
  const reiter = [
    { id: "worum", titel: "Worum geht es?" },
    { id: "umsetzung", titel: "Umsetzung" },
    { id: "beispiel", titel: "Beispiel" },
    { id: "evolution", titel: "Evolution" }
  ];
  const stufen = ["gering", "mittel", "hoch"];
  // Stationen: Kürzel im Balken (die Art ist nie nur an der Farbe zu erkennen).
  const stationsarten = {
    "vorgeschlagen": { kürzel: "V", klasse: "vorschlag" },
    "Entwurf": { kürzel: "?", klasse: "entwurf" },
    "Kandidat": { kürzel: "?", klasse: "entwurf" },
    "Incubator": { kürzel: "I", klasse: "vorab" },
    "Experimentell": { kürzel: "E", klasse: "vorab" },
    "Preview": { kürzel: "P", klasse: "vorab" },
    "Abkündigung": { kürzel: "A", klasse: "vorab" },
    "Warnung": { kürzel: "W", klasse: "final" },
    "final": { kürzel: "F", klasse: "final" },
    "entfernt": { kürzel: "X", klasse: "final" },
    "abgeschaltet": { kürzel: "X", klasse: "final" },
    "Standard": { kürzel: "S", klasse: "danach" },
    "Ausbau": { kürzel: "+", klasse: "danach" },
    "zurückgezogen": { kürzel: "Z", klasse: "zurueck" }
  };

  // ---------------------------------------------------------------------------
  // ABGELEITETES – Weg, Spalten und Sprung einer Zeile.
  // ---------------------------------------------------------------------------
  function weg(j) {
    if (j.weg) return j.weg;
    return (j.kette || []).map(function (k) { return [k[0], k[1], k[2] || "Preview"]; })
      .concat([[j.nr, j.v, j.ziel || "final"]])
      .concat(j.danach || []);
  }
  // Das Release, das gerade entstand, als der JEP angelegt wurde.
  function inArbeit(monat) {
    for (const r of releases) if (monat < r.ga) return r.v;
    return letztes;
  }
  function beginn(j) {
    const v = vorgeschlagen[j.nr] ? inArbeit(vorgeschlagen[j.nr]) : erstes;
    const erste = weg(j).find(function (s) { return s[1]; });
    return Math.max(erstes, Math.min(v, erste ? erste[1] : letztes));
  }
  function ende(j) {
    if (j.offen) return letztes;
    return weg(j).reduce(function (m, s) { return s[1] ? Math.max(m, s[1]) : m; }, erstes);
  }
  function sprungVon(j) {
    if (j.offen) return "29";
    for (const s of sprünge) if (j.v <= s.bis) return s.id;
    return "29";
  }
  function istAusblick(v) { return v > aktuell; }
  function vorabzahl(j) {
    return weg(j).filter(function (s) { return ["Incubator", "Experimentell", "Preview"].indexOf(s[2]) >= 0; }).length;
  }
  function stand_(j) {
    if (j.zurückgezogen) return "zurückgezogen";
    if (j.offen) {
      const w = weg(j), letzte = w[w.length - 1];
      return letzte[1] ? letzte[2] + " in " + letzte[1] + (istAusblick(letzte[1]) ? " (geplant)" : "") : letzte[2] + ", ohne Release";
    }
    return (j.ziel || "final") + " in Java " + j.v + (istAusblick(j.v) ? " (geplant)" : "");
  }
  function monatsname(monat) {
    const namen = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const teile = monat.split("-");
    return namen[Number(teile[1]) - 1] + " " + teile[0];
  }

  // ---------------------------------------------------------------------------
  // ZUSTAND – eine Wahrheit, eine Funktion macht ihn sichtbar (zeichnen).
  // ---------------------------------------------------------------------------
  const stand = { art: "", lts: "", bereich: "", jep: "", reiter: "" };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  // `code` → <code>code</code>, nach dem Maskieren.
  function text(s) {
    return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  // Eine Zeile findet man über jeden JEP ihres Wegs.
  function finde(nr) {
    const n = Number(nr);
    return jeps.find(function (j) { return j.nr === n; })
        || jeps.find(function (j) { return weg(j).some(function (s) { return s[0] === n; }); });
  }

  function spalte(v) { return v - erstes + 2; }

  function kopfzeile() {
    let html = '<div class="jl-zeile jl-zeile--kopf" aria-hidden="true"><span class="jl-zeile__name">JEP</span>';
    releases.forEach(function (r) {
      const sprung = sprünge.find(function (s) { return r.v >= s.von && r.v <= s.bis; });
      html += '<span class="jl-spalte' + (ltsReleases.indexOf(r.v) >= 0 ? " is-lts" : "") + (istAusblick(r.v) ? " is-ausblick" : "")
           + (r.v === aktuell ? " is-aktuell" : "") + '" data-lts="' + (sprung ? sprung.id : "") + '" style="grid-column:' + spalte(r.v) + '">'
           + "<b>" + r.v + "</b>" + (ltsReleases.indexOf(r.v) >= 0 ? "<small>LTS</small>" : "") + (r.v === aktuell ? "<small>heute</small>" : "") + "</span>";
    });
    return html + "</div>";
  }

  function balken(j) {
    const a = beginn(j), z = ende(j);
    let html = "";
    // Hintergrund je Spalte: LTS-Streifen und Ausblick.
    releases.forEach(function (r) {
      html += '<span class="jl-feld' + (ltsReleases.indexOf(r.v) >= 0 ? " is-lts" : "") + (istAusblick(r.v) ? " is-ausblick" : "")
           + '" style="grid-column:' + spalte(r.v) + '"></span>';
    });
    // Kräftig bis zur finalen Fassung, danach dünn bis zu den Folgestationen.
    const f = j.v && !j.offen && !j.zurückgezogen ? j.v : z;
    const bisHeute = Math.min(f, aktuell);
    if (a <= bisHeute) html += '<span class="jl-balken' + (j.zurückgezogen ? " is-zurueckgezogen" : "") + '" style="grid-column:' + spalte(a) + " / " + (spalte(bisHeute) + 1) + '"></span>';
    if (f > aktuell) html += '<span class="jl-balken is-ausblick" style="grid-column:' + spalte(Math.max(a, aktuell + 1)) + " / " + (spalte(f) + 1) + '"></span>';
    if (z > f) html += '<span class="jl-balken is-danach' + (z > aktuell ? " is-ausblick" : "") + '" style="grid-column:' + spalte(f) + " / " + (spalte(z) + 1) + '"></span>';
    // Stationen je Spalte gesammelt; der Vorschlag nur, wenn er vor der ersten Station liegt.
    const jeSpalte = {};
    const w = weg(j);
    const ersteMitRelease = w.find(function (s) { return s[1]; });
    if (vorgeschlagen[j.nr] && (!ersteMitRelease || a < ersteMitRelease[1])) jeSpalte[a] = [["vorgeschlagen"]];
    w.forEach(function (s) {
      const v = s[1] || letztes;
      (jeSpalte[v] = jeSpalte[v] || []).push([s[2]]);
    });
    Object.keys(jeSpalte).forEach(function (v) {
      html += '<span class="jl-stationen" style="grid-column:' + spalte(Number(v)) + '">';
      jeSpalte[v].forEach(function (s) {
        const art = stationsarten[s[0]] || stationsarten.final;
        html += '<span class="jl-station jl-station--' + art.klasse + (istAusblick(Number(v)) ? " is-ausblick" : "") + '">' + esc(art.kürzel) + "</span>";
      });
      html += "</span>";
    });
    return html;
  }

  function beschriftung(j) {
    const teile = weg(j).map(function (s) { return s[2] + (s[1] ? " " + s[1] : " ohne Release"); });
    return "JEP " + j.nr + ", " + j.name + ": " + teile.join(", ") + (j.projekt ? ", Projekt " + j.projekt : "");
  }

  function aufbauen() {
    const karte = document.getElementById("jl-karte");
    let html = kopfzeile();
    bereiche.forEach(function (b) {
      const drin = jeps.filter(function (j) { return j.b === b.id; })
                       .sort(function (x, y) { return beginn(x) - beginn(y) || ende(x) - ende(y) || x.nr - y.nr; });
      html += '<section class="jl-gruppe" data-bereich="' + b.id + '" aria-labelledby="jl-g-' + b.id + '">'
           + '<h2 class="jl-gruppe__titel" id="jl-g-' + b.id + '">' + esc(b.titel) + " <small>" + drin.length + " JEPs</small></h2><ul class=\"jl-liste\">";
      drin.forEach(function (j) {
        html += '<li><button type="button" class="jl-zeile jl-eintrag' + (j.zurückgezogen ? " is-zurueckgezogen" : "") + (j.offen ? " is-offen" : "")
             + '" data-nr="' + j.nr + '" aria-label="' + esc(beschriftung(j)) + '" aria-haspopup="dialog">'
             + '<span class="jl-zeile__name" aria-hidden="true"><span class="jl-zeile__titel">' + esc(j.name) + "</span>"
             + '<span class="jl-zeile__meta">JEP ' + j.nr + (j.projekt ? " · " + esc(j.projekt) : "") + "</span></span>"
             + '<span class="jl-zeile__spur" aria-hidden="true">' + balken(j) + "</span></button></li>";
      });
      html += "</ul></section>";
    });
    karte.innerHTML = html;
    karte.addEventListener("click", function (e) {
      const zeile = e.target.closest(".jl-eintrag");
      if (!zeile) return;
      stand.jep = zeile.dataset.nr;
      stand.reiter = "";
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
      const nr = stand.jep;
      if (stand.jep) { stand.jep = ""; stand.reiter = ""; melden(); }
      const zeile = nr && karte.querySelector('.jl-eintrag[data-nr="' + nr + '"]');
      if (zeile) zeile.focus();
    });
    const leiste = document.getElementById("jl-d-reiter");
    leiste.innerHTML = reiter.map(function (r, i) {
      return '<button type="button" role="tab" class="jl-reiter" id="jl-r-' + r.id + '" data-reiter="' + r.id
           + '" aria-controls="jl-d-inhalt" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(r.titel) + "</button>";
    }).join("");
    leiste.addEventListener("click", function (e) {
      const r = e.target.closest(".jl-reiter");
      if (!r) return;
      wähleReiter(r.dataset.reiter);
    });
    leiste.addEventListener("keydown", function (e) {
      const i = reiter.findIndex(function (r) { return r.id === aktiverReiter(); });
      let neu = -1;
      if (e.key === "ArrowRight") neu = (i + 1) % reiter.length;
      else if (e.key === "ArrowLeft") neu = (i - 1 + reiter.length) % reiter.length;
      else if (e.key === "Home") neu = 0;
      else if (e.key === "End") neu = reiter.length - 1;
      if (neu < 0) return;
      e.preventDefault();
      wähleReiter(reiter[neu].id);
      document.getElementById("jl-r-" + reiter[neu].id).focus();
    });
    // Verweise im Reiter „Evolution“ öffnen die Nachbarzeile.
    document.getElementById("jl-d-inhalt").addEventListener("click", function (e) {
      const v = e.target.closest("[data-gehe]");
      if (!v) return;
      e.preventDefault();
      stand.jep = v.dataset.gehe;
      stand.reiter = "evolution";
      zeichnen();
      melden();
    });
  }

  function aktiverReiter() { return stand.reiter || reiter[0].id; }
  function wähleReiter(id) {
    stand.reiter = id === reiter[0].id ? "" : id;
    zeichnen();
    melden();
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
    document.querySelectorAll(".jl-spalte").forEach(function (k) {
      k.classList.toggle("is-gewaehlt", Boolean(stand.lts) && stand.lts === k.dataset.lts);
    });
    document.querySelectorAll(".jl-gruppe").forEach(function (g) {
      g.classList.toggle("is-gewaehlt", stand.bereich === g.dataset.bereich);
    });
    const artIndex = arten.findIndex(function (a) { return a.id === stand.art; });
    document.querySelectorAll(".jl-eintrag").forEach(function (zeile) {
      const j = finde(zeile.dataset.nr);
      const leise = (stand.lts && sprungVon(j) !== stand.lts)
                 || (stand.bereich && j.b !== stand.bereich)
                 || (artIndex >= 0 && j.r[artIndex] === 0);
      const wichtig = !leise && artIndex >= 0 && j.r[artIndex] === 2;
      zeile.classList.toggle("is-leise", Boolean(leise));
      zeile.classList.toggle("is-wichtig", wichtig);
      zeile.setAttribute("aria-label", beschriftung(j) + (wichtig ? " – wichtig für " + arten[artIndex].titel : "") + (leise ? " – ausgeblendet" : ""));
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

  function verweis(nr) {
    const ziel = finde(nr);
    if (ziel) return '<a href="#" data-gehe="' + ziel.nr + '">JEP ' + nr + "</a>";
    return "JEP " + nr;
  }

  function füllen(j) {
    document.getElementById("jl-d-titel").textContent = j.name;
    const sprung = sprünge.find(function (s) { return s.id === sprungVon(j); });
    document.getElementById("jl-d-unter").innerHTML = "JEP " + j.nr + " · „" + esc(j.titel) + "“ · " + esc(stand_(j))
      + (j.zurückgezogen ? "" : " · <b>" + (sprung.id === "29" ? "Ausblick" : "LTS " + sprung.id) + "</b>");
    const aktiv = aktiverReiter();
    document.querySelectorAll(".jl-reiter").forEach(function (r) {
      const an = r.dataset.reiter === aktiv;
      r.setAttribute("aria-selected", String(an));
      r.tabIndex = an ? 0 : -1;
    });
    const inhalt = document.getElementById("jl-d-inhalt");
    inhalt.setAttribute("aria-labelledby", "jl-r-" + aktiv);
    let html = "";
    if (aktiv === "worum") {
      html = "<h3>Worum es geht</h3><p>" + text(j.worum) + "</p>"
        + "<h3>Warum das wichtig ist</h3><p>" + text(j.warum) + "</p>"
        + "<h3>Betrifft Dich, wenn …</h3><p>… " + text(j.betrifft) + "</p>"
        + '<h3>Relevanz je Anwendungsart</h3><div class="jl-relevanz">';
      arten.forEach(function (a, i) {
        html += "<span>" + esc(a.titel) + '</span><span><span class="jl-marke">' + stufen[j.r[i]] + "</span></span>";
      });
      html += "</div>";
    } else if (aktiv === "umsetzung") {
      html = "<h3>Wie es umgesetzt ist</h3><p>" + text(j.umsetzung) + "</p>"
        + '<h3>Kompatibilitätsrisiko</h3><p><span class="jl-marke jl-marke--' + j.risiko + '">' + stufen[j.risiko] + "</span>" + text(j.risikoText) + "</p>";
    } else if (aktiv === "beispiel") {
      const sprache = j.beispiel[0];
      html = '<h3>' + (sprache === "bash" ? "Auf der Kommandozeile" : sprache === "text" ? "Ausgabe" : "Im Code") + "</h3>"
        + '<pre><code class="language-' + sprache + '">' + esc(j.beispiel[1].join("\n")) + "</code></pre>";
    } else {
      html = '<h3>Stationen</h3><ol class="jl-weg">';
      if (vorgeschlagen[j.nr]) {
        html += '<li><span class="jl-station jl-station--vorschlag" aria-hidden="true">V</span><span>vorgeschlagen im ' + monatsname(vorgeschlagen[j.nr])
             + " – in Arbeit war Java " + inArbeit(vorgeschlagen[j.nr]) + "</span></li>";
      }
      weg(j).forEach(function (s) {
        const art = stationsarten[s[2]] || stationsarten.final;
        html += '<li><span class="jl-station jl-station--' + art.klasse + '" aria-hidden="true">' + esc(art.kürzel) + "</span><span>"
             + (s[0] === j.nr ? "JEP " + s[0] : verweisAufStation(s[0])) + " · " + esc(s[2])
             + (s[1] ? " in Java " + s[1] + (istAusblick(s[1]) ? " (geplant)" : "") : " (ohne Release)") + "</span></li>";
      });
      html += "</ol>";
      if (j.bezug && j.bezug.length) {
        html += "<h3>Bezüge</h3><ul class=\"jl-bezuege\">" + j.bezug.map(function (b) {
          return "<li>" + verweis(b[0]) + " – " + text(b[1]) + "</li>";
        }).join("") + "</ul>";
      }
      if (j.projekt) html += "<h3>Projekt</h3><p>OpenJDK-Projekt " + esc(j.projekt) + "</p>";
    }
    html += '<p class="jl-quelle"><a href="https://openjdk.org/jeps/' + j.nr + '" rel="noopener">JEP ' + j.nr + " auf openjdk.org</a></p>";
    inhalt.innerHTML = html;
    if (aktiv === "beispiel") färben(inhalt);
  }
  function verweisAufStation(nr) {
    return '<a href="https://openjdk.org/jeps/' + nr + '" rel="noopener">JEP ' + nr + "</a>";
  }

  // Code färbt die Hervorhebung des Skriptoriums – sobald sie bereitsteht.
  function färben(element) {
    const skr = window.skr;
    if (skr && skr.highlight && skr.highlight.apply) skr.highlight.apply(element);
    else document.addEventListener("skr-highlight-ready", function () { window.skr.highlight.apply(element); }, { once: true });
  }

  function druckfassung() {
    let html = "<h2>Alle JEPs im Einzelnen</h2>";
    bereiche.forEach(function (b) {
      html += "<h2>" + esc(b.titel) + "</h2>";
      jeps.filter(function (j) { return j.b === b.id; })
          .sort(function (x, y) { return beginn(x) - beginn(y) || x.nr - y.nr; })
          .forEach(function (j) {
            html += "<section><h3>JEP " + j.nr + " · " + esc(j.name) + " (" + esc(stand_(j)) + ")</h3><p>" + text(j.worum)
                 + "</p><p><b>Umsetzung:</b> " + text(j.umsetzung)
                 + "</p><p><b>Betrifft Dich, wenn</b> " + text(j.betrifft) + "</p><p><b>Risiko " + stufen[j.risiko] + ":</b> " + text(j.risikoText)
                 + "</p><p><b>Weg:</b> " + esc(weg(j).map(function (s) { return "JEP " + s[0] + " " + s[2] + (s[1] ? " " + s[1] : ""); }).join(" → ")) + "</p></section>";
          });
    });
    document.getElementById("jl-druck").innerHTML = html;
  }

  // ---------------------------------------------------------------------------
  // ADRESSE – über skr.state des Themes, nie selbst ins Fragment schreiben.
  // Unbekannte Werte führen still in den Ausgangszustand.
  // ---------------------------------------------------------------------------
  function melden() {
    if (window.skr && window.skr.state) window.skr.state.update();
  }
  function gültig(schlüssel, wert) {
    if (!wert) return "";
    if (schlüssel === "jep") { const j = finde(wert); return j ? String(j.nr) : ""; }
    const listen = { art: arten, lts: sprünge, bereich: bereiche, reiter: reiter.slice(1) };
    return listen[schlüssel].some(function (x) { return x.id === wert; }) ? wert : "";
  }
  function anmelden() {
    if (!window.skr || !window.skr.state) return;
    ["art", "lts", "bereich", "jep", "reiter"].forEach(function (schlüssel) {
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
