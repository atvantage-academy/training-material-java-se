
        const javaVersions = [
            {
                ver: "1.0", date: "23. Januar 1996", year: 1996, features: [
                    { title: "Basis-Syntax", desc: "Die Geburtsstunde von Java. Einführung der objektorientierten Struktur mit Klassen, Attributen und Methoden.", code: "public class Grundlagen {\n    private String msg = \"Atvantage Training\";\n    \n    public void sagHallo() {\n        // Objektorientierte Kapselung\n        System.out.println(this.msg);\n    }\n    \n    public static void main(String[] args) {\n        new Grundlagen().sagHallo();\n    }\n}" },
                    { title: "Applets", desc: "Client-seitige Java-Programme, die direkt im Webbrowser ausgeführt wurden (heute historisch).", code: "import java.applet.Applet;\nimport java.awt.Graphics;\n\npublic class MeinApplet extends Applet {\n    public void paint(Graphics g) {\n        // Grafische Ausgabe im Browserfenster\n        g.drawString(\"Java Applet läuft\", 20, 20);\n    }\n}" },
                    { title: "AWT", desc: "Das Abstract Window Toolkit war das erste Grafik-Framework für native Benutzeroberflächen.", code: "import java.awt.*;\n\npublic void initUI() {\n    Frame f = new Frame(\"Java 1.0\");\n    Button b = new Button(\"Absenden\");\n    f.add(b);\n    f.setSize(300, 200);\n    f.setVisible(true);\n}" }
                ]
            },
            {
                ver: "1.1", date: "19. Februar 1997", year: 1997, features: [
                    { title: "Calendar API", desc: "API für komplexe Datumsberechnungen und Zeitzonen-Management.", code: "import java.util.*;\n\npublic void checkDate() {\n    Calendar cal = Calendar.getInstance();\n    cal.set(2026, Calendar.JANUARY, 20);\n    Date d = cal.getTime();\n    System.out.println(\"Zieldatum: \" + d);\n}" },
                    { title: "Inner Classes", desc: "Klassen innerhalb von Klassen für eine bessere Datenkapselung und Event-Handling.", code: "public class Outer {\n    private String secret = \"123\";\n    \n    class Inner {\n        void print() {\n            // Zugriff auf private Member der Outer-Class\n            System.out.println(\"Geheimnis: \" + secret);\n        }\n    }\n}" },
                    { title: "JDBC", desc: "Standardisierte Schnittstelle für die Verbindung zu SQL-Datenbanken.", code: "public void connect() throws SQLException {\n    String url = \"jdbc:mysql://localhost/db\";\n    Connection c = DriverManager.getConnection(url, \"user\", \"pass\");\n    Statement s = c.createStatement();\n    s.execute(\"SELECT * FROM kunden\");\n}" }
                ]
            },
            {
                ver: "1.2", date: "08. Dezember 1998", year: 1998, features: [
                    { title: "Collections", desc: "Standard-Datenstrukturen wie ArrayList, HashMap und HashSet für effizientes Daten-Handling.", code: "import java.util.*;\n\npublic void demo() {\n    List<String> l = new ArrayList<>();\n    l.add(\"Java Evolution\");\n    l.add(\"LTS Roadmap\");\n    for (String s : l) {\n        System.out.println(s);\n    }\n}" },
                    { title: "Swing UI", desc: "Modernes, plattformunabhängiges UI-Framework (JFC) mit 'Pluggable Look and Feel'.", code: "import javax.swing.*;\n\npublic void showFrame() {\n    JFrame f = new JFrame(\"Swing App\");\n    JButton b = new JButton(\"Klick mich\");\n    f.add(b);\n    f.pack();\n    f.setVisible(true);\n}" },
                    { title: "JIT Compiler", desc: "Just-in-Time Compiler für native Performance durch Laufzeit-Optimierung des Bytecodes.", code: "// Automatische Optimierung im Hintergrund:\n// 1. HotSpot-Erkennung\n// 2. Inlining von Methoden\n// 3. Loop Unrolling\n// 4. Dead Code Elimination" }
                ]
            },
            {
                ver: "1.3", date: "08. Mai 2000", year: 2000, features: [
                    { title: "HotSpot JVM", desc: "Adaptive Optimierung zur Laufzeit durch Profiling und Just-In-Time-Kompilierung.", code: "// JVM Performance Engine\n// - Profiling des laufenden Codes\n// - Identifikation von 'Hot Spots'\n// - Maschinencode-Generierung\n// - Inlining von Methoden" },
                    { title: "JNDI", desc: "Java Naming and Directory Interface zum Zugriff auf Verzeichnisdienste wie LDAP.", code: "public void lookup(String name) throws NamingException {\n    Context ctx = new InitialContext();\n    DataSource ds = (DataSource) ctx.lookup(name);\n    System.out.println(\"Gefunden: \" + ds);\n}" }
                ]
            },
            {
                ver: "1.4", date: "06. Februar 2002", year: 2002, features: [
                    { title: "assert", desc: "Prüfung von Programm-Annahmen zur Qualitätssicherung während der Entwicklung.", code: "public void checkValue(int v) {\n    // Nur aktiv mit -ea Flag\n    assert v > 0 : \"Wert muss positiv sein\";\n    this.value = v;\n    System.out.println(\"Wert ok: \" + v);\n}" },
                    { title: "NIO", desc: "New I/O System für schnellen, blockierungsfreien Dateizugriff über Buffer und Channels.", code: "FileInputStream fis = new FileInputStream(\"file.txt\");\nFileChannel ch = fis.getChannel();\nByteBuffer buf = ByteBuffer.allocate(1024);\nch.read(buf);\nbuf.flip();" },
                    { title: "Util Logging", desc: "Das Standard-Logging-Framework von Java – kein externer Logger nötig.", code: "import java.util.logging.*;\n\npublic void log() {\n    Logger logger = Logger.getLogger(\"MyApp\");\n    logger.info(\"Anwendung gestartet\");\n    logger.warning(\"Achtung: Low Memory\");\n}" }
                ]
            },
            {
                ver: "1.5 (5)", date: "30. September 2004", year: 2004, features: [
                    { title: "Generics", desc: "Typsicherheit für Container-Klassen zur Vermeidung von Casts und Laufzeitfehlern.", code: "public void generics() {\n    List<Integer> zahlen = new ArrayList<>();\n    zahlen.add(42);\n    // Typsicheres Auslesen ohne Cast\n    int x = zahlen.get(0);\n    System.out.println(\"Ergebnis: \" + x);\n}" },
                    { title: "Annotations", desc: "Metadaten im Code, die Frameworks wie Spring, Hibernate und JUnit erst möglich machen.", code: "@interface Info {\n    String author();\n}\n\n@Info(author = \"JavaDev\")\npublic class Demo {\n    @Override\n    public String toString() { return \"Demo\"; }\n}" },
                    { title: "Varargs", desc: "Methoden-Definition mit variabler Anzahl an Argumenten desselben Typs.", code: "public void log(String level, String... msgs) {\n    System.out.print(level + \": \");\n    for (String s : msgs) {\n        System.out.print(s + \" \");\n    }\n    System.out.println();\n}" },
                    { title: "Enums", desc: "Typsichere Aufzählungsklassen statt statischer Konstanten.", code: "public enum Status { START, RUNNING, STOPPED }\n\nStatus s = Status.START;\nif(s == Status.START) { /* ... */ }" }
                ]
            },
            {
                ver: "1.6 (6)", date: "11. Dezember 2006", year: 2006, features: [
                    { title: "Scripting API", desc: "Integration von Skriptsprachen wie JavaScript (Rhino) in Java-Anwendungen.", code: "import javax.script.*;\n\npublic void runJS() throws Exception {\n    ScriptEngineManager m = new ScriptEngineManager();\n    ScriptEngine e = m.getEngineByName(\"JavaScript\");\n    e.eval(\"print('Skripting in Java!')\");\n}" },
                    { title: "WebServices", desc: "Integrierte Unterstützung für SOAP-Webservices (JAX-WS) und XML-Binding (JAXB).", code: "@WebService\npublic class MeinService {\n    @WebMethod\n    public String sagHallo(String name) {\n        return \"Hallo \" + name;\n    }\n}" }
                ]
            },
            {
                ver: "1.7 (7)", date: "28. Juli 2011", year: 2011, features: [
                    { title: "try-with-resources", desc: "Sicheres Ressourcen-Management: Dateien werden am Ende des Blocks automatisch geschlossen.", code: "public void read(File f) throws IOException {\n    try (FileReader reader = new FileReader(f)) {\n        int data = reader.read();\n        System.out.println(\"Content: \" + data);\n    } // reader wird hier automatisch geschlossen\n}" },
                    { title: "NIO.2 (Files)", desc: "Moderne Datei-Operationen mit Path und Files – mächtiger und einfacher als java.io.File.", code: "public void copy(Path src, Path dest) throws IOException {\n    // Einzeiler für Kopier-Vorgänge\n    Files.copy(src, dest, StandardCopyOption.REPLACE_EXISTING);\n    // Alle Zeilen lesen\n    List<String> lines = Files.readAllLines(src);\n}" },
                    { title: "Diamond Op.", desc: "Kürzere Schreibweise bei der Deklaration von Generics durch Typ-Inferenz.", code: "public void diamond() {\n    // Typ auf rechter Seite wird automatisch erkannt\n    Map<String, List<Integer>> map = new HashMap<>();\n    map.put(\"Key\", new ArrayList<>());\n    System.out.println(\"Map init\");\n}" }
                ]
            },
            {
                ver: "1.8 (8)", date: "18. März 2014", year: 2014, features: [
                    { title: "Lambdas", jeps: [126], desc: "Funktionaler Programmierstil durch Code-Blöcke, die als Parameter übergeben werden.", code: "public void sort(List<String> l) {\n    // Kompakte Sortier-Logik\n    l.sort((a, b) -> a.length() - b.length());\n    l.forEach(s -> System.out.println(s));\n}" },
                    { title: "Streams API", jeps: [107], desc: "Deklarative Verarbeitung von Datenmenge in Pipelines (Filter, Map, Reduce).", code: "public void process(List<Integer> list) {\n    long result = list.stream()\n        .filter(x -> x > 10)\n        .map(x -> x * 2)\n        .count();\n    System.out.println(\"Gezählt: \" + result);\n}" },
                    { title: "Date/Time API", jeps: [150], desc: "Moderne, unveränderliche Datums-Klassen (java.time) lösen Date und Calendar ab.", code: "public void time() {\n    LocalDate heute = LocalDate.now();\n    LocalDate nextWeek = heute.plusWeeks(1);\n    System.out.println(\"Nächste Woche: \" + nextWeek);\n}" },
                    { title: "Optional", desc: "Container-Objekt zur Vermeidung von NullPointerExceptions und für saubere APIs.", code: "public void printUser(User u) {\n    String name = Optional.ofNullable(u)\n        .map(User::getName)\n        .orElse(\"Unbekannt\");\n    System.out.println(\"User: \" + name);\n}" },
                    { title: "Default Methods", jeps: [126], desc: "Methoden in Interfaces mit Standard-Implementierung, um Rückwärtskompatibilität zu wahren (z.B. in Collection-Interfaces für Streams).", code: "interface Vehicle {\n    // Implementierung im Interface\n    default void honk() {\n        System.out.println(\"Beep!\");\n    }\n}\n\nclass Car implements Vehicle { }\nnew Car().honk(); // Nutzt Default-Methode" }
                ]
            },
            {
                ver: "11", date: "25. September 2018", year: 2018, features: [
                    { title: "var", jeps: [286, 323], desc: "Lokale Typ-Inferenz für weniger Schreibarbeit bei eindeutigen Zuweisungen.", code: "public void varDemo() {\n    var message = \"Java 11\";\n    var liste = new ArrayList<String>();\n    liste.add(message);\n    System.out.println(liste.get(0));\n}" },
                    { title: "Collection Factories", jeps: [269], desc: "Kompakte Erzeugung von unveränderlichen Listen, Sets und Maps (seit Java 9).", code: "public void init() {\n    // Unveränderliche Liste\n    List<String> list = List.of(\"A\", \"B\", \"C\");\n    // Unveränderliche Map\n    Map<String, Integer> map = Map.of(\"K1\", 1, \"K2\", 2);\n}" },
                    { title: "Private Interface Methods", jeps: [213], desc: "Private Methoden in Interfaces teilen Code zwischen Default-Methoden, ohne ihn zur öffentlichen API zu machen (seit Java 9).", code: "interface Preisrechner {\n    default double brutto(double netto) {\n        return runde(netto * 1.19);\n    }\n\n    default double rabattiert(double netto) {\n        return runde(netto * 0.9);\n    }\n\n    // Hilfsmethode – nicht Teil der öffentlichen API\n    private double runde(double wert) {\n        return Math.round(wert * 100) / 100.0;\n    }\n}" },
                    { title: "HTTP Client", jeps: [321], desc: "Moderner, nicht-blockierender HTTP Client mit Support für HTTP/2 und WebSockets.", code: "public void fetch() throws Exception {\n    HttpClient client = HttpClient.newHttpClient();\n    HttpRequest req = HttpRequest.newBuilder()\n        .uri(URI.create(\"https://api.test.com\"))\n        .build();\n    var resp = client.send(req, BodyHandlers.ofString());\n    System.out.println(resp.body());\n}" },
                    { title: "Modules", jeps: [200, 261], desc: "Project Jigsaw: Modularisierung des JDKs und eigener Anwendungen (module-info.java).", code: "// module-info.java\nmodule com.myapp {\n    requires java.sql;\n    exports com.myapp.api;\n}" },
                    { title: "Single-File Launch", jeps: [330], desc: "Ein Programm aus einer einzelnen Quelldatei direkt mit java starten – ohne vorheriges javac.", code: "// Hallo.java – ohne javac starten: java Hallo.java Welt\npublic class Hallo {\n    public static void main(String[] args) {\n        System.out.println(\"Hallo, \" + args[0]);\n    }\n}" }
                ]
            },
            {
                ver: "17", date: "14. September 2021", year: 2021, features: [
                    { title: "Records", jeps: [395], desc: "Unveränderliche Datenklassen, die automatisch Konstruktor, Getter und Co. generieren.", code: "public record User(int id, String name) {\n    // Einzeiler für Daten-Container\n}\n\nUser u = new User(1, \"Tom\");\nSystem.out.println(u.name());" },
                    { title: "Text Blocks", jeps: [378], desc: "Mehrzeilige Strings ohne Concatenation-Chaos – ideal für JSON, SQL oder HTML (seit Java 15).", code: 'String html = """\n    <html>\n        <body>\n            <h1>Hallo Welt</h1>\n        </body>\n    </html>\n    """;' },
                    { title: "Switch Expr.", jeps: [361], desc: "Switch als Ausdruck, der einen Wert zurückgibt (kein break nötig, exhaustiveness check).", code: "var result = switch(day) {\n    case MONDAY, FRIDAY -> \"Homeoffice\";\n    case TUESDAY        -> \"Büro\";\n    default             -> \"Frei\";\n};\nSystem.out.println(result);" },
                    { title: "Pattern Matching", jeps: [394], desc: "instanceof mit direkter Variablen-Zuweisung erspart unsichere Casts (seit Java 16).", code: "public void check(Object obj) {\n    // Variable 's' ist direkt nutzbar\n    if (obj instanceof String s && s.length() > 5) {\n        System.out.println(s.toUpperCase());\n    }\n}" },
                    { title: "Sealed Classes", jeps: [409], desc: "Präzise Steuerung der Vererbungshierarchie durch explizite Freigabe von Unterklassen.", code: "public sealed class Form permits Kreis, Eck {\n    // Nur definierte Klassen dürfen erben\n}\n\nfinal class Kreis extends Form { }" }
                ]
            },
            {
                ver: "21", date: "19. September 2023", year: 2023, features: [
                    { title: "Virtual Threads", jeps: [444], desc: "Leichtgewichtige Threads (Project Loom) für massive Skalierbarkeit bei minimalem Overhead.", code: "public void runAsync() {\n    try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {\n        exec.submit(() -> {\n            System.out.println(\"Running in Virtual Thread\");\n        });\n    }\n}" },
                    { title: "Sequenced Collections", jeps: [431], desc: "Einheitlicher Zugriff auf erstes und letztes Element (List, Deque, SortedSet).", code: "public void firstLast(List<String> list) {\n    // Einheitlicher Zugriff\n    System.out.println(list.getFirst());\n    System.out.println(list.getLast());\n    // Rückwärts\n    for (var s : list.reversed()) { /* ... */ }\n}" },
                    { title: "Switch Patterns", jeps: [441], desc: "Fallunterscheidung basierend auf dem Datentyp direkt im Switch.", code: "return switch (obj) {\n    case Integer i -> \"Zahl: \" + i;\n    case String s  -> \"Text: \" + s;\n    default        -> \"Andere\";\n};" },
                    { title: "Record Patterns", jeps: [440], desc: "Records direkt in instanceof und switch in ihre Komponenten zerlegen – auch verschachtelt.", code: "record Punkt(int x, int y) { }\n\nstatic String beschreibe(Object obj) {\n    return switch (obj) {\n        // Zerlegt den Record direkt in seine Komponenten\n        case Punkt(int x, int y) when x == y -> \"Diagonale bei \" + x;\n        case Punkt(int x, int y)             -> \"Punkt \" + x + \"/\" + y;\n        default                              -> \"Kein Punkt\";\n    };\n}" }
                ]
            },
            {
                ver: "25", date: "16. September 2025", year: 2025, features: [
                    { title: "Stream Gather.", jeps: [485], desc: "Benutzerdefinierte Zwischenoperationen für komplexe Transformationen in Streams.", code: "public void groups() {\n    var res = Stream.of(1,2,3,4,5)\n        .gather(Gatherers.windowFixed(3))\n        .toList();\n    // Result: [[1,2,3], [4,5]]\n}" },
                    { title: "Class File API", jeps: [484], desc: "Standardisierte API zum Parsen, Generieren und Transformieren von Java Class-Files.", code: "public void parse(byte[] bytes) {\n    ClassFile cf = ClassFile.of();\n    ClassModel cm = cf.parse(bytes);\n    System.out.println(\"Class: \" + cm.thisClass().asSymbol());\n}" },
                    { title: "Flexible Constr.", jeps: [513], desc: "Erlaubt Code-Ausführung im Konstruktor *vor* dem super()-Aufruf.", code: "public class Sub extends Base {\n    public Sub(int value) {\n        // Validierung VOR super() möglich\n        if (value < 0) throw new IllegalArgumentException();\n        super(value);\n    }\n}" },
                    { title: "Unnamed Variables", jeps: [456], desc: "Der Unterstrich _ markiert Variablen und Muster, die nicht gebraucht werden (seit Java 22). Bis Java 8 ein gewöhnlicher Bezeichner, ab Java 9 verboten.", code: "int anzahl = 0;\nfor (String _ : zeilen) {   // Variable wird nicht gebraucht\n    anzahl++;\n}\n\ntry {\n    Integer.parseInt(eingabe);\n} catch (NumberFormatException _) {\n    System.out.println(\"Keine Zahl: \" + eingabe);\n}\n\n// Unbenanntes Muster: y interessiert hier nicht\nif (obj instanceof Punkt(int x, _)) {\n    System.out.println(\"x = \" + x);\n}" },
                    { title: "Multi-File Launch", jeps: [458], desc: "Der Quelltext-Start von java findet weitere Quelldateien im selben Verzeichnis – ein Programm aus mehreren Dateien ohne Build-Werkzeug (seit Java 22).", code: "// Start.java – nutzt Hilfe.java im selben Ordner: java Start.java\npublic class Start {\n    public static void main(String[] args) {\n        System.out.println(Hilfe.gruß());\n    }\n}\n\n// Hilfe.java\nclass Hilfe {\n    static String gruß() {\n        return \"Hallo aus der zweiten Datei\";\n    }\n}" },
                    { title: "Markdown Javadoc", jeps: [467], desc: "Dokumentationskommentare in Markdown mit /// statt HTML in /** … */ (seit Java 23).", code: "/// Berechnet den **Bruttopreis** mit 19 % Umsatzsteuer.\n///\n/// - Rundet auf zwei Nachkommastellen\n/// - Siehe auch [Math#round(double)]\n///\n/// @param netto Nettopreis in Euro\n/// @return Bruttopreis in Euro\npublic double brutto(double netto) {\n    return Math.round(netto * 119) / 100.0;\n}" },
                    { title: "Scoped Values", jeps: [506], desc: "Unveränderliche Werte für einen begrenzten Aufrufbereich teilen – leichter und sicherer als ThreadLocal, besonders mit Virtual Threads.", code: "static final ScopedValue<String> BENUTZER = ScopedValue.newInstance();\n\nvoid bearbeite(String name) {\n    ScopedValue.where(BENUTZER, name).run(() -> protokolliere());\n}\n\nvoid protokolliere() {\n    // Nur innerhalb von run() gebunden, unveränderlich\n    System.out.println(\"Angemeldet: \" + BENUTZER.get());\n}" },
                    { title: "Compact Source Files", jeps: [512], desc: "Kleine Programme ohne Klassengerüst: eine Instanz-Methode main() genügt, IO liest und schreibt die Konsole (Previews seit Java 21).", code: "// Hallo.java – ohne Klasse und ohne static: java Hallo.java\nvoid main() {\n    String name = IO.readln(\"Wie heißt Du? \");\n    IO.println(\"Hallo, \" + name);\n}" }
                ]
            }
        ];

        const JEV_START = 1996, JEV_END = 2026, JEV_YH = 120;
        const JEV_LTS = [8, 11, 17, 21, 25];
        let jevTimeline, jevModal, jevOpenVersion = null;

        // Die Codeblöcke dieser Seite entstehen erst per JavaScript (Zeitleiste, Modal).
        // Gefärbt werden sie über die Hervorhebung des Skriptoriums (`skr.highlight`):
        // Sie färbt jedes `pre code.language-java` unter dem Element, das noch nicht
        // gefärbt ist. Steht sie noch nicht bereit, meldet sie sich mit
        // `skr-highlight-ready`; ohne sie bleibt der Code schlicht ungefärbt.
        function jevHighlight(selector){
            var färben = function(){
                var wurzel = document.querySelector(selector);
                if (wurzel) window.skr.highlight.apply(wurzel);
            };
            if (window.skr && window.skr.highlight) { färben(); return; }
            document.addEventListener('skr-highlight-ready', färben, { once: true });
        }

        function jevEsc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
        // JEP-Nummern eines Features als Marke (Badge des Skriptoriums), je mit Verweis
        // auf die Quelle bei openjdk.org. Features vor Java 8 haben keinen JEP. Ohne
        // Linkmarke (`skr-linkmark--none`): Das Symbol säße auf dem Rand des Badges.
        function jevJepMarken(f){
            if (!f.jeps || !f.jeps.length) return '';
            return '<p class="jev-jeps"><span class="skr-visually-hidden">JEPs: </span>' + f.jeps.map(function(nr){
                return '<a class="skr-badge skr-linkmark--none jev-jep" href="https://openjdk.org/jeps/' + nr + '">JEP ' + nr + '<span class="skr-visually-hidden"> bei openjdk.org</span></a>';
            }).join(' ') + '</p>';
        }
        function jevSlug(ver){ return 'java-' + ver.toLowerCase().replace(/[^0-9a-z]+/g, '-').replace(/^-+|-+$/g, ''); }
        // Wert in der Adresse (`#/?version=21`): die Hauptversion, wo es eine gibt, sonst die
        // Version selbst („1.4“).
        function jevKey(ver){ var m = ver.match(/\((\d+)\)/); return m ? m[1] : ver; }
        // ASCII-ID für Sprungziele und die Adresse (`open=java-21-records`).
        function jevId(s){
            return s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
                .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }
        function jevMajor(ver){ var m = ver.match(/\((\d+)\)/); if (m) return +m[1]; var m2 = ver.match(/^1\.(\d+)/); if (m2) return +m2[1]; var m3 = ver.match(/^(\d+)$/); return m3 ? +m3[1] : 0; }
        function jevIsLts(ver){ return JEV_LTS.indexOf(jevMajor(ver)) !== -1; }

        function jevInit(){
            jevTimeline = document.getElementById('jev-timeline');
            jevModal = document.getElementById('jev-modal');
            var toc = document.getElementById('jev-toc-list');
            for (var y = JEV_START; y <= JEV_END; y++){
                var mk = document.createElement('div');
                mk.className = 'jev-year';
                mk.style.top = ((y - JEV_START) * JEV_YH) + 'px';
                mk.textContent = y;
                jevTimeline.appendChild(mk);
            }
            jevTimeline.style.height = ((JEV_END - JEV_START) * JEV_YH) + 'px';
            javaVersions.forEach(function(v, i){
                var lts = jevIsLts(v.ver);
                var n = document.createElement('div');
                n.className = 'jev-node ' + (i % 2 === 0 ? 'left' : 'right');
                n.style.top = ((v.year - JEV_START) * JEV_YH) + 'px';
                n.id = jevSlug(v.ver);
                if (toc){
                    var li = document.createElement('li');
                    li.innerHTML = '<span>Java ' + jevEsc(v.ver) + (lts ? ' (LTS)' : '') + ' &ndash; ' + jevEsc(v.date) + '</span><span>' + v.year + '</span>';
                    toc.appendChild(li);
                }
                var pf = '';
                v.features.forEach(function(f){
                    pf += '<div class="jev-print-item"><h4>' + jevEsc(f.title) + '</h4>' + jevJepMarken(f) + '<p>' + jevEsc(f.desc) + '</p><pre><code class="language-java">' + jevEsc(f.code) + '</code></pre></div>';
                });
                n.innerHTML = '<div class="jev-card"><div class="jev-connector"></div>'
                    + '<div class="jev-date">' + jevEsc(v.date) + '</div>'
                    + '<h3>Java ' + jevEsc(v.ver) + (lts ? ' <span class="jev-lts-tag">LTS</span>' : '') + '</h3>'
                    + '<div class="jev-print-features">' + pf + '</div></div>';
                n.addEventListener('click', function(){ jevShow(v); });
                jevTimeline.appendChild(n);
            });
            jevBuildTabs();
            jevHighlight('#jev-timeline');
            jevHighlight('#jev-modal-body');
            jevRegisterState();
        }

        // JE VERSION EIN REITER-BAUSTEIN DES SKRIPTORIUMS (`skr-tabs`), je Feature ein
        // Reiter. Gebaut wird beim Laden, VOR dem Aufbau des Skriptoriums: Nur Reiter, die
        // dann im Dokument stehen, macht es zur Leiste und merkt sich den gewählten in der
        // Adresse (`#/?version=21&open=java-21-records`). Das Modal blendet je Version
        // ihren Baustein ein.
        function jevBuildTabs(){
            var body = document.getElementById('jev-modal-body');
            body.innerHTML = javaVersions.map(function(v){
                var gruppe = jevSlug(v.ver);
                return '<div class="skr-tabs jev-version-tabs" data-jev-version="' + jevEsc(jevKey(v.ver)) + '" hidden>'
                    + v.features.map(function(f, i){
                        return '<details class="skr-tabs__panel" name="' + gruppe + '" id="' + gruppe + '-' + jevId(f.title) + '"' + (i === 0 ? ' open' : '') + '>'
                            + '<summary>' + jevEsc(f.title) + '</summary>'
                            + jevJepMarken(f)
                            + '<p class="jev-feature-desc">' + jevEsc(f.desc) + '</p>'
                            + '<pre><code class="language-java">' + jevEsc(f.code) + '</code></pre>'
                            + '</details>';
                    }).join('')
                    + '</div>';
            }).join('');
        }

        // Eine Version, die nicht zu sehen ist, steht wieder auf ihrem ersten Reiter – sonst
        // bliebe ihre Wahl in der Adresse stehen, auch wenn längst eine andere offen ist.
        function jevResetTabs(box){
            var erster = box.querySelector('details.skr-tabs__panel');
            if (erster && !erster.open) erster.open = true;
        }

        function jevShow(v, updateHash){
            if (updateHash === undefined) updateHash = true;
            jevOpenVersion = v;
            document.getElementById('jev-modal-title').textContent = 'Java ' + v.ver;
            document.getElementById('jev-badge').innerHTML = jevIsLts(v.ver) ? '<span class="jev-badge-lts">LTS Release</span>' : '';
            // Verknüpfung mit der JEP-Landkarte: nur für die LTS-Releases, die dort eine
            // Spalte haben (8→11 … 21→25). Keine Tabs hier – die Landkarte ist eine
            // eigene Seite (Konzept: java-update/AGENTS.md).
            var jevMaj = jevMajor(v.ver);
            // Die Adresse kommt aus dem Markup (vom Bau aufgelöst), das Skript hängt nur
            // den Zustand an.
            document.getElementById('jev-modal-date').textContent = v.date;
            var jevJep = document.getElementById('jev-jep');
            var jevJepLink = document.getElementById('jev-jep-link');
            var jevJepBase = jevJepLink.getAttribute('href').split('#')[0];
            jevJep.hidden = [11, 17, 21, 25].indexOf(jevMaj) === -1;
            jevJepLink.setAttribute('href', jevJepBase + '#/?lts=' + jevMaj);
            var aktiv = null;
            document.querySelectorAll('#jev-modal-body .jev-version-tabs').forEach(function(box){
                box.hidden = box.dataset.jevVersion !== jevKey(v.ver);
                if (box.hidden) jevResetTabs(box); else aktiv = box;
            });
            // Erst jetzt sichtbar: Codeblöcke dem Skriptorium melden (`skr-content-added`) –
            // läuft einer waagerecht über, bekommt er einen Haltepunkt in der Tabulatorreihenfolge.
            if (aktiv) aktiv.dispatchEvent(new CustomEvent('skr-content-added', { bubbles: true }));
            document.body.classList.add('jev-modal-open');
            jevModal.classList.add('open');
            jevModal.setAttribute('aria-hidden', 'false');
            jevModal.removeAttribute('inert');
            if (updateHash) jevUpdateState();
        }

        function jevCloseModal(updateHash){
            if (updateHash === undefined) updateHash = true;
            jevOpenVersion = null;
            document.querySelectorAll('#jev-modal-body .jev-version-tabs').forEach(jevResetTabs);
            var y = window.scrollY;
            jevModal.classList.remove('open');
            jevModal.setAttribute('aria-hidden', 'true');
            // `inert` ZUSÄTZLICH zu aria-hidden: Das Fenster bleibt im Dokument
            // stehen (nur durchsichtig und ohne Zeigerereignisse), seine Knöpfe
            // und Verweise blieben damit in der Tabulatorreihenfolge – der Fokus
            // wanderte in etwas, das niemand sieht und keine Vorlesehilfe ansagt.
            jevModal.setAttribute('inert', '');
            document.body.classList.remove('jev-modal-open');
            if (updateHash) jevUpdateState();
            window.scrollTo(0, y);
        }

        function jevCloseOnExternal(e){ if (e.target === jevModal) jevCloseModal(); }

        // ADRESSE – über skr.state des Skriptoriums, nie selbst ins Fragment schreiben:
        // Sonst überschreiben sich zwei Schreiber (Erweiterung Didaktikon 1.1.0).
        function jevUpdateState(){ if (window.skr && window.skr.state) window.skr.state.update(); }
        function jevRegisterState(){
            if (!window.skr || !window.skr.state) return;
            window.skr.state.register({
                key: 'version',
                read: function(){ return jevOpenVersion ? jevKey(jevOpenVersion.ver) : ''; },
                apply: function(wert){
                    var v = null;
                    for (var i = 0; i < javaVersions.length; i++){ if (jevKey(javaVersions[i].ver) === wert){ v = javaVersions[i]; break; } }
                    if (!v){ if (jevOpenVersion) jevCloseModal(false); return; }
                    jevShow(v, false);
                    var el = document.getElementById(jevSlug(v.ver));
                    if (el) setTimeout(function(){ el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
                }
            });
        }

        document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && jevModal && jevModal.classList.contains('open')) jevCloseModal(); });
        // Bedienung über Ereignisse, nicht über onclick-Attribute im Markup – so läuft die
        // Seite unter einer strengen Content Security Policy.
        function jevBind(){
            document.getElementById('jev-modal').addEventListener('click', jevCloseOnExternal);
            document.querySelector('#jev-modal .jev-close').addEventListener('click', jevCloseModal);
        }
        function jevStart(){ jevBind(); jevInit(); }
        if (document.readyState !== 'loading') jevStart(); else document.addEventListener('DOMContentLoaded', jevStart);
