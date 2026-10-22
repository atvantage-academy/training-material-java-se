
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
                    { title: "Lambdas", desc: "Funktionaler Programmierstil durch Code-Blöcke, die als Parameter übergeben werden.", code: "public void sort(List<String> l) {\n    // Kompakte Sortier-Logik\n    l.sort((a, b) -> a.length() - b.length());\n    l.forEach(s -> System.out.println(s));\n}" },
                    { title: "Streams API", desc: "Deklarative Verarbeitung von Datenmenge in Pipelines (Filter, Map, Reduce).", code: "public void process(List<Integer> list) {\n    long result = list.stream()\n        .filter(x -> x > 10)\n        .map(x -> x * 2)\n        .count();\n    System.out.println(\"Gezählt: \" + result);\n}" },
                    { title: "Date/Time API", desc: "Moderne, unveränderliche Datums-Klassen (java.time) lösen Date und Calendar ab.", code: "public void time() {\n    LocalDate heute = LocalDate.now();\n    LocalDate nextWeek = heute.plusWeeks(1);\n    System.out.println(\"Nächste Woche: \" + nextWeek);\n}" },
                    { title: "Optional", desc: "Container-Objekt zur Vermeidung von NullPointerExceptions und für saubere APIs.", code: "public void printUser(User u) {\n    String name = Optional.ofNullable(u)\n        .map(User::getName)\n        .orElse(\"Unbekannt\");\n    System.out.println(\"User: \" + name);\n}" },
                    { title: "Default Methods", desc: "Methoden in Interfaces mit Standard-Implementierung, um Rückwärtskompatibilität zu wahren (z.B. in Collection-Interfaces für Streams).", code: "interface Vehicle {\n    // Implementierung im Interface\n    default void honk() {\n        System.out.println(\"Beep!\");\n    }\n}\n\nclass Car implements Vehicle { }\nnew Car().honk(); // Nutzt Default-Methode" }
                ]
            },
            {
                ver: "11", date: "25. September 2018", year: 2018, features: [
                    { title: "var", desc: "Lokale Typ-Inferenz für weniger Schreibarbeit bei eindeutigen Zuweisungen.", code: "public void varDemo() {\n    var message = \"Java 11\";\n    var liste = new ArrayList<String>();\n    liste.add(message);\n    System.out.println(liste.get(0));\n}" },
                    { title: "Collection Factories", desc: "Kompakte Erzeugung von unveränderlichen Listen, Sets und Maps (seit Java 9).", code: "public void init() {\n    // Unveränderliche Liste\n    List<String> list = List.of(\"A\", \"B\", \"C\");\n    // Unveränderliche Map\n    Map<String, Integer> map = Map.of(\"K1\", 1, \"K2\", 2);\n}" },
                    { title: "HTTP Client", desc: "Moderner, nicht-blockierender HTTP Client mit Support für HTTP/2 und WebSockets.", code: "public void fetch() throws Exception {\n    HttpClient client = HttpClient.newHttpClient();\n    HttpRequest req = HttpRequest.newBuilder()\n        .uri(URI.create(\"https://api.test.com\"))\n        .build();\n    var resp = client.send(req, BodyHandlers.ofString());\n    System.out.println(resp.body());\n}" },
                    { title: "Modules", desc: "Project Jigsaw: Modularisierung des JDKs und eigener Anwendungen (module-info.java).", code: "// module-info.java\nmodule com.myapp {\n    requires java.sql;\n    exports com.myapp.api;\n}" }
                ]
            },
            {
                ver: "17", date: "14. September 2021", year: 2021, features: [
                    { title: "Records", desc: "Unveränderliche Datenklassen, die automatisch Konstruktor, Getter und Co. generieren.", code: "public record User(int id, String name) {\n    // Einzeiler für Daten-Container\n}\n\nUser u = new User(1, \"Tom\");\nSystem.out.println(u.name());" },
                    { title: "Text Blocks", desc: "Mehrzeilige Strings ohne Concatenation-Chaos – ideal für JSON, SQL oder HTML (seit Java 15).", code: 'String html = """\n    <html>\n        <body>\n            <h1>Hallo Welt</h1>\n        </body>\n    </html>\n    """;' },
                    { title: "Switch Expr.", desc: "Switch als Ausdruck, der einen Wert zurückgibt (kein break nötig, exhaustiveness check).", code: "var result = switch(day) {\n    case MONDAY, FRIDAY -> \"Homeoffice\";\n    case TUESDAY        -> \"Büro\";\n    default             -> \"Frei\";\n};\nSystem.out.println(result);" },
                    { title: "Pattern Matching", desc: "instanceof mit direkter Variablen-Zuweisung erspart unsichere Casts (seit Java 16).", code: "public void check(Object obj) {\n    // Variable 's' ist direkt nutzbar\n    if (obj instanceof String s && s.length() > 5) {\n        System.out.println(s.toUpperCase());\n    }\n}" },
                    { title: "Sealed Classes", desc: "Präzise Steuerung der Vererbungshierarchie durch explizite Freigabe von Unterklassen.", code: "public sealed class Form permits Kreis, Eck {\n    // Nur definierte Klassen dürfen erben\n}\n\nfinal class Kreis extends Form { }" }
                ]
            },
            {
                ver: "21", date: "19. September 2023", year: 2023, features: [
                    { title: "Virtual Threads", desc: "Leichtgewichtige Threads (Project Loom) für massive Skalierbarkeit bei minimalem Overhead.", code: "public void runAsync() {\n    try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {\n        exec.submit(() -> {\n            System.out.println(\"Running in Virtual Thread\");\n        });\n    }\n}" },
                    { title: "Sequenced Collections", desc: "Einheitlicher Zugriff auf erstes und letztes Element (List, Deque, SortedSet).", code: "public void firstLast(List<String> list) {\n    // Einheitlicher Zugriff\n    System.out.println(list.getFirst());\n    System.out.println(list.getLast());\n    // Rückwärts\n    for (var s : list.reversed()) { /* ... */ }\n}" },
                    { title: "Switch Patterns", desc: "Fallunterscheidung basierend auf dem Datentyp direkt im Switch.", code: "return switch (obj) {\n    case Integer i -> \"Zahl: \" + i;\n    case String s  -> \"Text: \" + s;\n    default        -> \"Andere\";\n};" },
                    { title: "Classless Main", desc: "Vereinfachter Einstieg in Java (JEP 445 Preview): Keine explizite Klasse oder `public static` mehr nötig.", code: "// Kein Klassengerüst nötig\nvoid main() {\n    System.out.println(\"Hello, World!\");\n}" }
                ]
            },
            {
                ver: "25", date: "16. September 2025", year: 2025, features: [
                    { title: "Stream Gather.", desc: "Benutzerdefinierte Zwischenoperationen für komplexe Transformationen in Streams.", code: "public void groups() {\n    var res = Stream.of(1,2,3,4,5)\n        .gather(Gatherers.windowFixed(3))\n        .toList();\n    // Result: [[1,2,3], [4,5]]\n}" },
                    { title: "Class File API", desc: "Standardisierte API zum Parsen, Generieren und Transformieren von Java Class-Files.", code: "public void parse(byte[] bytes) {\n    ClassFile cf = ClassFile.of();\n    ClassModel cm = cf.parse(bytes);\n    System.out.println(\"Class: \" + cm.thisClass().asSymbol());\n}" },
                    { title: "Flexible Constr.", desc: "Erlaubt Code-Ausführung im Konstruktor *vor* dem super()-Aufruf.", code: "public class Sub extends Base {\n    public Sub(int value) {\n        // Validierung VOR super() möglich\n        if (value < 0) throw new IllegalArgumentException();\n        super(value);\n    }\n}" }
                ]
            }
        ];

        const JEV_START = 1996, JEV_END = 2026, JEV_YH = 120;
        const JEV_LTS = [8, 11, 17, 21, 25];
        let jevTimeline, jevModal, jevCurrent = [];

        // Die Codeblöcke dieser Seite entstehen erst per JavaScript (Zeitleiste, Modal).
        // Gefärbt werden sie über die Hervorhebung des Skriptoriums (`skr.highlight`):
        // Sie färbt jedes `pre code.language-java` unter dem Element, das noch nicht
        // gefärbt ist. Steht sie noch nicht bereit, meldet sie sich mit
        // `skr-highlight-ready`; ohne sie bleibt der Code schlicht ungefärbt.
        function jevHighlight(selector){
            var faerben = function(){
                var wurzel = document.querySelector(selector);
                if (wurzel) window.skr.highlight.apply(wurzel);
            };
            if (window.skr && window.skr.highlight) { faerben(); return; }
            document.addEventListener('skr-highlight-ready', faerben, { once: true });
        }

        function jevEsc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
        function jevSlug(ver){ return 'java-' + ver.toLowerCase().replace(/[^0-9a-z]+/g, '-').replace(/^-+|-+$/g, ''); }
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
                    pf += '<div class="jev-print-item"><h4>' + jevEsc(f.title) + '</h4><p>' + jevEsc(f.desc) + '</p><pre><code class="language-java">' + jevEsc(f.code) + '</code></pre></div>';
                });
                n.innerHTML = '<div class="jev-card"><div class="jev-connector"></div>'
                    + '<div class="jev-date">' + jevEsc(v.date) + '</div>'
                    + '<h3>Java ' + jevEsc(v.ver) + (lts ? ' <span class="jev-lts-tag">LTS</span>' : '') + '</h3>'
                    + '<div class="jev-print-features">' + pf + '</div></div>';
                n.addEventListener('click', function(){ jevShow(v); });
                jevTimeline.appendChild(n);
            });
            jevHighlight('#jev-timeline');
            jevCheckHash();
        }

        function jevShow(v, updateHash){
            if (updateHash === undefined) updateHash = true;
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
            document.getElementById('jev-modal-tabs').innerHTML = v.features.map(function(f, i){
                return '<button type="button" class="jev-tab' + (i === 0 ? ' active' : '') + '" data-jev-tab="' + i + '">' + jevEsc(f.title) + '</button>';
            }).join('');
            jevCurrent = v.features;
            jevRender(v.features[0]);
            document.body.classList.add('jev-modal-open');
            jevModal.classList.add('open');
            jevModal.setAttribute('aria-hidden', 'false');
            jevModal.removeAttribute('inert');
            if (updateHash){ try { history.replaceState(null, '', '#' + jevSlug(v.ver)); } catch (e){ location.hash = jevSlug(v.ver); } }
        }

        function jevTab(btn, idx){
            var tabs = document.querySelectorAll('#jev-modal-tabs .jev-tab');
            for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
            btn.classList.add('active');
            jevRender(jevCurrent[idx]);
        }

        function jevRender(f){
            document.getElementById('jev-modal-body').innerHTML =
                '<h3 class="jev-feature-title">' + jevEsc(f.title) + '</h3>'
                + '<p class="jev-feature-desc">' + jevEsc(f.desc) + '</p>'
                + '<pre><code class="language-java">' + jevEsc(f.code) + '</code></pre>';
            jevHighlight('#jev-modal-body');
        }

        function jevCloseModal(){
            var y = window.scrollY;
            jevModal.classList.remove('open');
            jevModal.setAttribute('aria-hidden', 'true');
            // `inert` ZUSAETZLICH zu aria-hidden: Das Fenster bleibt im Dokument
            // stehen (nur durchsichtig und ohne Zeigerereignisse), seine Knoepfe
            // und Verweise blieben damit in der Tabulatorreihenfolge - der Fokus
            // wanderte in etwas, das niemand sieht und keine Vorlesehilfe ansagt.
            jevModal.setAttribute('inert', '');
            document.body.classList.remove('jev-modal-open');
            try { history.replaceState(null, '', location.pathname + location.search); } catch (e){ location.hash = ''; }
            window.scrollTo(0, y);
        }

        function jevCloseOnExternal(e){ if (e.target === jevModal) jevCloseModal(); }

        function jevCheckHash(){
            var h = location.hash.slice(1);
            if (!h) return;
            var v = null;
            for (var i = 0; i < javaVersions.length; i++){ if (jevSlug(javaVersions[i].ver) === h){ v = javaVersions[i]; break; } }
            if (v){
                jevShow(v, false);
                var el = document.getElementById(jevSlug(v.ver));
                if (el) setTimeout(function(){ el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
            }
        }

        document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && jevModal && jevModal.classList.contains('open')) jevCloseModal(); });
        window.addEventListener('hashchange', jevCheckHash);
        // Bedienung über Ereignisse, nicht über onclick-Attribute im Markup – so läuft die
        // Seite unter einer strengen Content Security Policy.
        function jevBind(){
            document.getElementById('jev-modal').addEventListener('click', jevCloseOnExternal);
            document.querySelector('#jev-modal .jev-close').addEventListener('click', jevCloseModal);
            document.getElementById('jev-modal-tabs').addEventListener('click', function(e){
                var b = e.target.closest('[data-jev-tab]');
                if (b) jevTab(b, +b.dataset.jevTab);
            });
        }
        function jevStart(){ jevBind(); jevInit(); }
        if (document.readyState !== 'loading') jevStart(); else document.addEventListener('DOMContentLoaded', jevStart);
