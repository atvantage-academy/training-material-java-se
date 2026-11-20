(function () {
  // ---------------------------------------------------------------------------
  // DATEN – Voreinstellungen der IDEs. Je IDE zwei Belegungen:
  //   ij/ijm  IntelliJ unter Windows und Linux / unter macOS; ijl: unter Linux, wo es abweicht
  //   ec/ecm  Eclipse   unter Windows und Linux / unter macOS
  //   vs/vsm  VS Code   unter Windows / unter macOS; vsl: unter Linux, wo es abweicht
  // Windows/Linux mit Tastennamen und „+“ (Strg+Umschalt+A), macOS mit Symbolen ohne
  // „+“ (⌘⇧A). Alternativen trennt „ / “, eine Folge von Griffen ein Leerzeichen
  // (Strg+K Strg+Q). Leer: In dieser IDE gibt es dafür kein voreingestelltes Kürzel.
  // aktion: der englische Name, unter dem 2× Umschalt die Aktion findet.
  // kern: gehört zu den vier Kürzeln, die man auswendig kann; sie stehen außerdem
  // unter „Die wichtigsten“.
  // wörter: weitere Suchbegriffe, die weder in „was“ noch in „aktion“ stehen.
  // ---------------------------------------------------------------------------
  const kategorien = [
    { id: "navigieren", titel: "Suchen und navigieren", kürzel: [
      { was: "Überall suchen: Klassen, Dateien, Symbole, Aktionen, Einstellungen", aktion: "Search Everywhere", ij: "2× Umschalt", ijm: "2× ⇧", ec: "Strg+3", ecm: "⌘3", vs: "Strg+P", vsm: "⌘P", kern: true, wörter: "quick access quick open finden" },
      { was: "Eine Aktion oder Einstellung über ihren Namen aufrufen", aktion: "Find Action", ij: "Strg+Umschalt+A", ijm: "⌘⇧A", ec: "Strg+3", ecm: "⌘3", vs: "Strg+Umschalt+P", vsm: "⌘⇧P", wörter: "befehl menü quick access command palette" },
      { was: "Klasse öffnen", aktion: "Go to Class", ij: "Strg+N", ijm: "⌘O", ec: "Strg+Umschalt+T", ecm: "⌘⇧T", vs: "Strg+T", vsm: "⌘T", wörter: "typ type öffnen" },
      { was: "Datei öffnen", aktion: "Go to File", ij: "Strg+Umschalt+N", ijm: "⌘⇧O", ec: "Strg+Umschalt+R", ecm: "⌘⇧R", vs: "Strg+P", vsm: "⌘P", wörter: "ressource resource quick open" },
      { was: "Methode oder Feld öffnen", aktion: "Go to Symbol", ij: "Strg+Alt+Umschalt+N", ijm: "⌘⌥O", ec: "", ecm: "", vs: "Strg+T", vsm: "⌘T" },
      { was: "Zuletzt geöffnete Dateien", aktion: "Recent Files", ij: "Strg+E", ijm: "⌘E", ec: "Strg+E", ecm: "⌘E", vs: "Strg+Tab", vsm: "⌃Tab", wörter: "editor wechseln" },
      { was: "Zuletzt bearbeitete Stellen", aktion: "Recent Locations", ij: "Strg+Umschalt+E", ijm: "⌘⇧E", ec: "", ecm: "", vs: "", vsm: "" },
      { was: "Zur Stelle der letzten Änderung", aktion: "Last Edit Location", ij: "Strg+Umschalt+Rück", ijm: "⌘⇧⌫", ec: "Strg+Q", ecm: "⌃Q", vs: "Strg+K Strg+Q", vsm: "⌘K ⌘Q" },
      { was: "Zurück und vor", aktion: "Back / Forward", ij: "Strg+Alt+← / Strg+Alt+→", ijm: "⌘[ / ⌘]", ec: "Alt+← / Alt+→", ecm: "⌘[ / ⌘]", vs: "Alt+← / Alt+→", vsm: "⌃- / ⌃⇧-", vsl: "Strg+Alt+- / Strg+Umschalt+-", wörter: "verlauf historie" },
      { was: "Zur Deklaration springen", aktion: "Go to Declaration or Usages", ij: "Strg+B", ijm: "⌘B", ec: "F3", ecm: "F3", vs: "F12", vsm: "F12", wörter: "definition strg+klick" },
      { was: "Zur Implementierung springen", aktion: "Go to Implementation(s)", ij: "Strg+Alt+B", ijm: "⌘⌥B", ec: "Strg+T", ecm: "⌘T", vs: "Strg+F12", vsm: "⌘F12", wörter: "interface unterklasse" },
      { was: "Zur überschriebenen Methode springen", aktion: "Go to Super Method", ij: "Strg+U", ijm: "⌘U", ec: "", ecm: "", vs: "", vsm: "", wörter: "oberklasse super" },
      { was: "Typhierarchie", aktion: "Type Hierarchy", ij: "Strg+H", ijm: "⌃H", ec: "F4", ecm: "F4", vs: "", vsm: "", wörter: "vererbung" },
      { was: "Aufrufhierarchie", aktion: "Call Hierarchy", ij: "Strg+Alt+H", ijm: "⌃⌥H", ec: "Strg+Alt+H", ecm: "⌃⌥H", vs: "Umschalt+Alt+H", vsm: "⌥⇧H", wörter: "aufrufer" },
      { was: "Gliederung der Datei", aktion: "File Structure", ij: "Strg+F12", ijm: "⌘F12", ec: "Strg+O", ecm: "⌘O", vs: "Strg+Umschalt+O", vsm: "⌘⇧O", wörter: "outline methoden" },
      { was: "Verwendungen suchen", aktion: "Find Usages", ij: "Alt+F7", ijm: "⌥F7", ec: "Strg+Umschalt+G", ecm: "⌘⇧G", vs: "Umschalt+Alt+F12", vsm: "⌥⇧F12", wörter: "referenzen references" },
      { was: "Verwendungen in der Datei hervorheben", aktion: "Highlight Usages in File", ij: "Strg+Umschalt+F7", ijm: "⌘⇧F7", ec: "Alt+Umschalt+O", ecm: "⌥⌘O", vs: "", vsm: "", wörter: "occurrences markieren" },
      { was: "Zur Zeile springen", aktion: "Go to Line:Column", ij: "Strg+G", ijm: "⌘L", ec: "Strg+L", ecm: "⌘L", vs: "Strg+G", vsm: "⌃G" },
      { was: "Zum nächsten / vorigen Fehler", aktion: "Next / Previous Highlighted Error", ij: "F2 / Umschalt+F2", ijm: "F2 / ⇧F2", ec: "Strg+. / Strg+,", ecm: "⌘. / ⌘⇧.", vs: "F8 / Umschalt+F8", vsm: "F8 / ⇧F8", wörter: "problem warnung" },
      { was: "In der Datei suchen / ersetzen", aktion: "Find / Replace", ij: "Strg+F / Strg+R", ijm: "⌘F / ⌘R", ec: "Strg+F", ecm: "⌘F", vs: "Strg+F / Strg+H", vsm: "⌘F / ⌥⌘F" },
      { was: "In allen Dateien suchen", aktion: "Find in Files", ij: "Strg+Umschalt+F", ijm: "⌘⇧F", ec: "Strg+H", ecm: "⌃H", vs: "Strg+Umschalt+F", vsm: "⌘⇧F", wörter: "volltext projekt" },
      { was: "In allen Dateien ersetzen", aktion: "Replace in Files", ij: "Strg+Umschalt+R", ijm: "⌘⇧R", ec: "Strg+H", ecm: "⌃H", vs: "Strg+Umschalt+H", vsm: "⌘⇧H", wörter: "volltext projekt" },
      { was: "Geöffnete Datei im Projektbaum zeigen", aktion: "Select In", ij: "Alt+F1", ijm: "⌥F1", ec: "Alt+Umschalt+W", ecm: "⌥⌘W", vs: "", vsm: "", wörter: "link with editor package explorer reveal" }
    ] },
    { id: "editieren", titel: "Schreiben und bearbeiten", kürzel: [
      { was: "Vervollständigen", aktion: "Basic Code Completion", ij: "Strg+Leer", ijm: "⌃Leer", ec: "Strg+Leer", ecm: "⌃Leer", vs: "Strg+Leer", vsm: "⌃Leer", kern: true, wörter: "autovervollständigung content assist intellisense" },
      { was: "Vervollständigen, nur passende Typen", aktion: "Type-Matching Code Completion", ij: "Strg+Umschalt+Leer", ijm: "⌃⇧Leer", ec: "", ecm: "", vs: "", vsm: "", wörter: "smart completion" },
      { was: "Anweisung vervollständigen (Klammern, Semikolon)", aktion: "Complete Current Statement", ij: "Strg+Umschalt+Enter", ijm: "⌘⇧Enter", ec: "", ecm: "", vs: "", vsm: "" },
      { was: "Schnelle Korrektur und Vorschläge an der Stelle", aktion: "Show Context Actions", ij: "Alt+Enter", ijm: "⌥Enter", ec: "Strg+1", ecm: "⌘1", vs: "Strg+.", vsm: "⌘.", kern: true, wörter: "quick fix intention glühbirne" },
      { was: "Code erzeugen: Konstruktor, Getter, equals …", aktion: "Generate", ij: "Alt+Einfügen", ijm: "⌘N", ec: "Alt+Umschalt+S", ecm: "⌥⌘S", vs: "", vsm: "", kern: true, wörter: "source action getter setter tostring hashcode" },
      { was: "Methode überschreiben / implementieren", aktion: "Override / Implement Methods", ij: "Strg+O / Strg+I", ijm: "⌃O / ⌃I", ec: "", ecm: "", vs: "", vsm: "" },
      { was: "Live Template einfügen", aktion: "Insert Live Template", ij: "Strg+J", ijm: "⌘J", ec: "Strg+Leer", ecm: "⌃Leer", vs: "", vsm: "", wörter: "vorlage snippet sout sysout psvm" },
      { was: "Mit Block umgeben: if, try, for …", aktion: "Surround With", ij: "Strg+Alt+T", ijm: "⌘⌥T", ijl: "Strg+Alt+T / Strg+Alt+Umschalt+B", ec: "Alt+Umschalt+Z", ecm: "⌥⌘Z", vs: "", vsm: "", wörter: "try catch" },
      { was: "Parameter der Methode anzeigen", aktion: "Parameter Info", ij: "Strg+P", ijm: "⌘P", ec: "Strg+Umschalt+Leer", ecm: "⌃⇧Leer", vs: "Strg+Umschalt+Leer", vsm: "⌘⇧Leer" },
      { was: "Dokumentation anzeigen", aktion: "Quick Documentation", ij: "Strg+Q", ijm: "F1", ec: "F2", ecm: "F2", vs: "Strg+K Strg+I", vsm: "⌘K ⌘I", wörter: "javadoc hilfe hover" },
      { was: "Definition im Popup anzeigen", aktion: "Quick Definition", ij: "Strg+Umschalt+I", ijm: "⌥Leer", ec: "", ecm: "", vs: "Alt+F12", vsm: "⌥F12", vsl: "Strg+Umschalt+F10", wörter: "peek" },
      { was: "Auswahl schrittweise erweitern / verkleinern", aktion: "Extend / Shrink Selection", ij: "Strg+W / Strg+Umschalt+W", ijm: "⌥↑ / ⌥↓", ec: "Alt+Umschalt+↑ / Alt+Umschalt+↓", ecm: "⌃⇧⇞ / ⌃⇧⇟", vs: "Umschalt+Alt+→ / Umschalt+Alt+←", vsm: "⌃⇧→ / ⌃⇧←", wörter: "markieren expand" },
      { was: "Zeile duplizieren", aktion: "Duplicate Line or Selection", ij: "Strg+D", ijm: "⌘D", ec: "Strg+Alt+↓", ecm: "⌥⌘↓", vs: "Umschalt+Alt+↓", vsm: "⌥⇧↓", vsl: "Strg+Umschalt+Alt+↓", wörter: "kopieren copy line" },
      { was: "Zeile löschen", aktion: "Delete Line", ij: "Strg+Y", ijm: "⌘⌫", ec: "Strg+D", ecm: "⌘D", vs: "Strg+Umschalt+K", vsm: "⌘⇧K", wörter: "entfernen" },
      { was: "Zeile verschieben", aktion: "Move Line Up / Down", ij: "Alt+Umschalt+↑ / Alt+Umschalt+↓", ijm: "⌥⇧↑ / ⌥⇧↓", ec: "Alt+↑ / Alt+↓", ecm: "⌥↑ / ⌥↓", vs: "Alt+↑ / Alt+↓", vsm: "⌥↑ / ⌥↓" },
      { was: "Anweisung oder Methode verschieben", aktion: "Move Statement Up / Down", ij: "Strg+Umschalt+↑ / Strg+Umschalt+↓", ijm: "⌘⇧↑ / ⌘⇧↓", ec: "", ecm: "", vs: "", vsm: "" },
      { was: "Zeilen verbinden", aktion: "Join Lines", ij: "Strg+Umschalt+J", ijm: "⌃⇧J", ec: "Strg+Alt+J", ecm: "", vs: "", vsm: "⌃J" },
      { was: "Zeile auskommentieren", aktion: "Comment with Line Comment", ij: "Strg+/", ijm: "⌘/", ec: "Strg+/", ecm: "⌘/", vs: "Strg+/", vsm: "⌘/", wörter: "kommentar" },
      { was: "Block auskommentieren", aktion: "Comment with Block Comment", ij: "Strg+Umschalt+/", ijm: "⌘⌥/", ec: "Strg+Umschalt+/", ecm: "⌃⌘/", vs: "Umschalt+Alt+A", vsm: "⌥⇧A", vsl: "Strg+Umschalt+A", wörter: "kommentar" },
      { was: "Nächstes Vorkommen dazu markieren (mehrere Cursor)", aktion: "Add Selection for Next Occurrence", ij: "Alt+J", ijm: "⌃G", ec: "", ecm: "", vs: "Strg+D", vsm: "⌘D", wörter: "multi cursor caret" },
      { was: "Spaltenmarkierung ein und aus", aktion: "Column Selection Mode", ij: "Alt+Umschalt+Einfügen", ijm: "⌘⇧8", ec: "Alt+Umschalt+A", ecm: "⌥⌘A", vs: "", vsm: "", wörter: "block blockauswahl" },
      { was: "Groß-/Kleinschreibung umschalten", aktion: "Toggle Case", ij: "Strg+Umschalt+U", ijm: "⌘⇧U", ec: "Strg+Umschalt+X / Strg+Umschalt+Y", ecm: "⌘⇧X / ⌘⇧Y", vs: "", vsm: "" },
      { was: "Zwischenablage-Verlauf", aktion: "Paste from History", ij: "Strg+Umschalt+V", ijm: "⌘⇧V", ec: "", ecm: "", vs: "", vsm: "", wörter: "einfügen kopieren clipboard" },
      { was: "Code formatieren", aktion: "Reformat Code", ij: "Strg+Alt+L", ijm: "⌘⌥L", ec: "Strg+Umschalt+F", ecm: "⌘⇧F", vs: "Umschalt+Alt+F", vsm: "⌥⇧F", vsl: "Strg+Umschalt+I", wörter: "format einrücken" },
      { was: "Imports aufräumen", aktion: "Optimize Imports", ij: "Strg+Alt+O", ijm: "⌃⌥O", ec: "Strg+Umschalt+O", ecm: "⌘⇧O", vs: "Umschalt+Alt+O", vsm: "⌥⇧O", wörter: "import organize" },
      { was: "Zeilen einrücken", aktion: "Auto-Indent Lines", ij: "Strg+Alt+I", ijm: "⌃⌥I", ec: "Strg+I", ecm: "⌘I", vs: "", vsm: "", wörter: "indent" }
    ] },
    { id: "refactoring", titel: "Umbauen (Refactoring)", kürzel: [
      { was: "Alle Refactorings an dieser Stelle", aktion: "Refactor This", ij: "Strg+Alt+Umschalt+T", ijm: "⌃T", ec: "Alt+Umschalt+T", ecm: "⌥⌘T", vs: "Strg+Umschalt+R", vsm: "⌃⇧R", wörter: "menü" },
      { was: "Umbenennen", aktion: "Rename", ij: "Umschalt+F6", ijm: "⇧F6", ec: "Alt+Umschalt+R", ecm: "⌥⌘R", vs: "F2", vsm: "F2", wörter: "rename" },
      { was: "Signatur ändern", aktion: "Change Signature", ij: "Strg+F6", ijm: "⌘F6", ec: "Alt+Umschalt+C", ecm: "", vs: "", vsm: "", wörter: "parameter" },
      { was: "Variable herausziehen", aktion: "Extract Variable", ij: "Strg+Alt+V", ijm: "⌘⌥V", ec: "Alt+Umschalt+L", ecm: "⌥⌘L", vs: "", vsm: "", wörter: "local lokale" },
      { was: "Methode herausziehen", aktion: "Extract Method", ij: "Strg+Alt+M", ijm: "⌘⌥M", ec: "Alt+Umschalt+M", ecm: "⌥⌘M", vs: "", vsm: "" },
      { was: "Feld herausziehen", aktion: "Introduce Field", ij: "Strg+Alt+F", ijm: "⌘⌥F", ec: "", ecm: "", vs: "", vsm: "", wörter: "attribut extract" },
      { was: "Konstante herausziehen", aktion: "Introduce Constant", ij: "Strg+Alt+C", ijm: "⌘⌥C", ec: "", ecm: "", vs: "", vsm: "", wörter: "static final extract" },
      { was: "Parameter herausziehen", aktion: "Introduce Parameter", ij: "Strg+Alt+P", ijm: "⌘⌥P", ec: "", ecm: "", vs: "", vsm: "", wörter: "extract" },
      { was: "Inline auflösen", aktion: "Inline", ij: "Strg+Alt+N", ijm: "⌘⌥N", ec: "Alt+Umschalt+I", ecm: "⌥⌘I", vs: "", vsm: "", wörter: "einsetzen" },
      { was: "Verschieben", aktion: "Move", ij: "F6", ijm: "F6", ec: "Alt+Umschalt+V", ecm: "⌥⌘V", vs: "", vsm: "", wörter: "paket" },
      { was: "Kopieren", aktion: "Copy", ij: "F5", ijm: "F5", ec: "", ecm: "", vs: "", vsm: "", wörter: "klasse" },
      { was: "Sicher löschen (prüft Verwendungen)", aktion: "Safe Delete", ij: "Alt+Entf", ijm: "⌘⌦", ec: "", ecm: "", vs: "", vsm: "", wörter: "entfernen" }
    ] },
    { id: "debuggen", titel: "Ausführen und debuggen", kürzel: [
      { was: "Starten, was gerade ausgewählt ist", aktion: "Run", ij: "Umschalt+F10", ijm: "⌃R", ec: "Strg+F11", ecm: "⌘⇧F11", vs: "Strg+F5", vsm: "⌃F5", wörter: "ausführen" },
      { was: "Im Debugger starten", aktion: "Debug", ij: "Umschalt+F9", ijm: "⌃D", ec: "F11", ecm: "⌘F11", vs: "F5", vsm: "F5" },
      { was: "Klasse, Test oder Methode am Cursor starten", aktion: "Run Context Configuration", ij: "Strg+Umschalt+F10", ijm: "⌃⇧R", ec: "Alt+Umschalt+X J / Alt+Umschalt+X T", ecm: "⌥⌘X J / ⌥⌘X T", vs: "", vsm: "", wörter: "run as test junit main" },
      { was: "Beliebiges ausführen: Konfiguration, mvn …, npm …", aktion: "Run Anything", ij: "2× Strg", ijm: "2× ⌃", ec: "", ecm: "", vs: "", vsm: "", wörter: "maven npm befehl kommando" },
      { was: "Anhalten", aktion: "Stop", ij: "Strg+F2", ijm: "⌘F2", ec: "Strg+F2", ecm: "⌘F2", vs: "Umschalt+F5", vsm: "⇧F5", wörter: "beenden terminate" },
      { was: "Haltepunkt setzen und entfernen", aktion: "Toggle Line Breakpoint", ij: "Strg+F8", ijm: "⌘F8", ec: "Strg+Umschalt+B", ecm: "⌘⇧B", vs: "F9", vsm: "F9", wörter: "breakpoint" },
      { was: "Alle Haltepunkte", aktion: "View Breakpoints", ij: "Strg+Umschalt+F8", ijm: "⌘⇧F8", ec: "Alt+Umschalt+Q B", ecm: "⌥⌘Q B", vs: "", vsm: "", wörter: "breakpoint bedingung" },
      { was: "Einen Schritt weiter", aktion: "Step Over", ij: "F8", ijm: "F8", ec: "F6", ecm: "F6", vs: "F10", vsm: "F10" },
      { was: "In die Methode hinein", aktion: "Step Into", ij: "F7", ijm: "F7", ec: "F5", ecm: "F5", vs: "F11", vsm: "F11" },
      { was: "In eine bestimmte Methode der Zeile hinein", aktion: "Smart Step Into", ij: "Umschalt+F7", ijm: "⇧F7", ec: "Strg+F5", ecm: "⌥F5", vs: "", vsm: "", wörter: "step into selection" },
      { was: "Aus der Methode heraus", aktion: "Step Out", ij: "Umschalt+F8", ijm: "⇧F8", ec: "F7", ecm: "F7", vs: "Umschalt+F11", vsm: "⇧F11", wörter: "step return" },
      { was: "Bis zum Cursor laufen", aktion: "Run to Cursor", ij: "Alt+F9", ijm: "⌥F9", ijl: "Umschalt+Alt+9", ec: "Strg+R", ecm: "⌘R", vs: "", vsm: "", wörter: "run to line" },
      { was: "Weiterlaufen lassen", aktion: "Resume Program", ij: "F9", ijm: "⌘⌥R", ec: "F8", ecm: "F8", vs: "F5", vsm: "F5", wörter: "fortsetzen continue" },
      { was: "Ausdruck auswerten", aktion: "Evaluate Expression", ij: "Alt+F8", ijm: "⌥F8", ec: "Strg+Umschalt+I", ecm: "⌘⇧I", vs: "", vsm: "", wörter: "inspect display watch" }
    ] },
    { id: "bauen", titel: "Bauen, Maven und Projekt", kürzel: [
      { was: "Projekt bauen", aktion: "Build Project", ij: "Strg+F9", ijm: "⌘F9", ec: "Strg+B", ecm: "⌘B", vs: "Strg+Umschalt+B", vsm: "⌘⇧B", wörter: "kompilieren compile build task" },
      { was: "Maven-Änderungen laden (nach Änderung der pom.xml)", aktion: "Load Maven Changes", ij: "Strg+Umschalt+O", ijm: "⌘⇧I", ec: "Alt+F5", ecm: "⌥F5", vs: "Umschalt+Alt+U", vsm: "⌥⇧U", wörter: "pom update project sync reload abhängigkeiten" },
      { was: "Einstellungen", aktion: "Settings", ij: "Strg+Alt+S", ijm: "⌘,", ec: "", ecm: "⌘,", vs: "Strg+,", vsm: "⌘,", wörter: "preferences optionen konfiguration" },
      { was: "Projektstruktur: JDK, Module, Bibliotheken", aktion: "Project Structure", ij: "Strg+Alt+Umschalt+S", ijm: "⌘;", ec: "", ecm: "", vs: "", vsm: "", wörter: "build path sdk" }
    ] },
    { id: "git", titel: "Git", kürzel: [
      { was: "Git-Aktionen als Auswahl", aktion: "VCS Operations Popup", ij: "Alt+`", ijm: "⌃V", ec: "", ecm: "", vs: "", vsm: "", wörter: "versionsverwaltung vcs" },
      { was: "Committen", aktion: "Commit", ij: "Strg+K", ijm: "⌘K", ec: "Strg+#", ecm: "⌥⌘3", vs: "", vsm: "", wörter: "einchecken" },
      { was: "Pushen", aktion: "Push", ij: "Strg+Umschalt+K", ijm: "⌘⇧K", ec: "", ecm: "", vs: "", vsm: "" },
      { was: "Projekt aktualisieren (Pull)", aktion: "Update Project", ij: "Strg+T", ijm: "⌘T", ec: "", ecm: "", vs: "", vsm: "", wörter: "pull fetch" },
      { was: "Änderungen verwerfen", aktion: "Rollback", ij: "Strg+Alt+Z", ijm: "⌘⌥Z", ec: "", ecm: "", vs: "", vsm: "", wörter: "revert zurücksetzen" },
      { was: "Zur nächsten / vorigen Änderung im Editor", aktion: "Next / Previous Change", ij: "Strg+Alt+Umschalt+↓ / Strg+Alt+Umschalt+↑", ijm: "⌃⌥⇧↓ / ⌃⌥⇧↑", ec: "", ecm: "", vs: "Alt+F5 / Umschalt+Alt+F5", vsm: "⌥F5 / ⌥⇧F5", wörter: "diff" }
    ] },
    { id: "fenster", titel: "Fenster und Ansicht", kürzel: [
      { was: "Projektbaum", aktion: "Project", ij: "Alt+1", ijm: "⌘1", ec: "Alt+Umschalt+Q P", ecm: "⌥⌘Q P", vs: "Strg+Umschalt+E", vsm: "⌘⇧E", wörter: "package explorer werkzeugfenster" },
      { was: "Commit-Fenster", aktion: "Commit", ij: "Alt+0", ijm: "⌘0", ec: "", ecm: "", vs: "Strg+Umschalt+G", vsm: "⌃⇧G", wörter: "werkzeugfenster source control" },
      { was: "Git-Fenster mit Log und Branches", aktion: "Git", ij: "Alt+9", ijm: "⌘9", ec: "", ecm: "", vs: "", vsm: "", wörter: "history werkzeugfenster" },
      { was: "Ausführen-Fenster", aktion: "Run", ij: "Alt+4", ijm: "⌘4", ec: "Alt+Umschalt+Q C", ecm: "⌥⌘Q C", vs: "", vsm: "", wörter: "konsole console werkzeugfenster" },
      { was: "Debug-Fenster", aktion: "Debug", ij: "Alt+5", ijm: "⌘5", ec: "", ecm: "", vs: "Strg+Umschalt+D", vsm: "⌘⇧D", wörter: "werkzeugfenster" },
      { was: "Probleme", aktion: "Problems", ij: "Alt+6", ijm: "⌘6", ec: "Alt+Umschalt+Q X", ecm: "⌥⌘Q X", vs: "Strg+Umschalt+M", vsm: "⌘⇧M", wörter: "fehler warnungen werkzeugfenster" },
      { was: "Services: Server, Datenbanken, Container", aktion: "Services", ij: "Alt+8", ijm: "⌘8", ec: "", ecm: "", vs: "", vsm: "", wörter: "docker werkzeugfenster" },
      { was: "Terminal", aktion: "Terminal", ij: "Alt+F12", ijm: "⌥F12", ec: "Strg+Alt+Umschalt+T", ecm: "⌃⌥⇧T", vs: "Strg+`", vsm: "⌃`", wörter: "kommandozeile shell werkzeugfenster" },
      { was: "Zurück in den Editor", aktion: "Focus Editor", ij: "Esc", ijm: "Esc", ec: "F12", ecm: "⌘F12", vs: "Strg+1", vsm: "⌘1" },
      { was: "Alle Werkzeugfenster aus- und einblenden", aktion: "Hide All Tool Windows", ij: "Strg+Umschalt+F12", ijm: "⌘⇧F12", ec: "Strg+M", ecm: "⌃M", vs: "Strg+B", vsm: "⌘B", wörter: "maximieren vollbild seitenleiste sidebar" },
      { was: "Zwischen Dateien und Fenstern wechseln", aktion: "Switcher", ij: "Strg+Tab", ijm: "⌃Tab", ec: "Strg+F6", ecm: "⌘F6", vs: "Strg+Tab", vsm: "⌃Tab", wörter: "editor reiter" },
      { was: "Reiter schließen", aktion: "Close Tab", ij: "Strg+F4", ijm: "⌘W", ec: "Strg+W", ecm: "⌘W", vs: "Strg+W", vsm: "⌘W", wörter: "editor schließen" }
    ] }
  ];

  // „Die wichtigsten“ steht vorn und holt sich seine Zeilen aus den übrigen Kategorien.
  // Bei einer Suche bleibt es zu: Die Treffer stehen in ihrer eigenen Kategorie.
  kategorien.unshift({ id: "wichtigste", titel: "Die wichtigsten", kürzel: kategorien.flatMap(function (kat) {
    return kat.kürzel.filter(function (k) { return k.kern; });
  }) });

  const systeme = [{ id: "windows", knopf: "Windows" }, { id: "linux", knopf: "Linux" }, { id: "mac", knopf: "macOS" }];
  const vergleiche = [{ id: "eclipse", knopf: "Eclipse", name: "Eclipse" }, { id: "vscode", knopf: "VS Code", name: "VS Code" }];
  const speicherSchlüssel = "intellij-tastenkuerzel.einstellungen";

  const stand = { such: "", tasten: [], auf: ["wichtigste"], kürzel: "" };
  const einstellung = { system: "windows", vergleich: "eclipse" };
  let aufVorDerSuche = null;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function istMac() { return einstellung.system === "mac"; }
  function vergleichsName() { return vergleiche.find(function (v) { return v.id === einstellung.vergleich; }).name; }

  // Das Kürzel einer IDE für das eingestellte System.
  function belegung(k, ide) {
    if (ide === "ij") return istMac() ? k.ijm : einstellung.system === "linux" && k.ijl ? k.ijl : k.ij;
    if (einstellung.vergleich === "eclipse") return istMac() ? k.ecm : k.ec;
    if (istMac()) return k.vsm;
    return einstellung.system === "linux" && k.vsl ? k.vsl : k.vs;
  }

  // ---------------------------------------------------------------------------
  // EINSTELLUNGEN – im localStorage des Browsers; ohne Speicher gilt die Vorgabe.
  // Vorgabe für das System: das, auf dem der Browser läuft.
  // ---------------------------------------------------------------------------
  function systemDesBrowsers() {
    const p = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || "").toLowerCase();
    if (/mac|iphone|ipad/.test(p)) return "mac";
    if (/linux|x11|cros/.test(p)) return "linux";
    return "windows";
  }
  function laden() {
    einstellung.system = systemDesBrowsers();
    try {
      const gespeichert = JSON.parse(window.localStorage.getItem(speicherSchlüssel) || "{}");
      if (systeme.some(function (s) { return s.id === gespeichert.system; })) einstellung.system = gespeichert.system;
      if (vergleiche.some(function (v) { return v.id === gespeichert.vergleich; })) einstellung.vergleich = gespeichert.vergleich;
    } catch (e) { /* ohne Speicher gilt die Vorgabe */ }
  }
  function speichern() {
    try { window.localStorage.setItem(speicherSchlüssel, JSON.stringify(einstellung)); } catch (e) { /* ohne Speicher nur für diesen Besuch */ }
  }

  // ---------------------------------------------------------------------------
  // TASTEN – Anzeige und Vergleich
  // ---------------------------------------------------------------------------
  const macModifikatoren = "⌃⌥⇧⌘";

  // Ein Griff („Strg+Umschalt+A“, „⌘⇧A“) als Liste seiner Tasten.
  function tastenEinesGriffs(griff) {
    const g = griff.trim();
    if (g.indexOf("+") !== -1 && g.length > 1) return g.split("+").map(function (t) { return t.trim(); }).filter(Boolean);
    const tasten = [];
    let i = 0;
    while (i < g.length && macModifikatoren.indexOf(g[i]) !== -1) tasten.push(g[i++]);
    if (i < g.length) tasten.push(g.slice(i));
    return tasten;
  }

  // „Strg+Alt+← / Strg+Alt+→“ → <kbd>…; unter macOS stehen die Tasten ohne „+“ nebeneinander.
  function tasten(kürzel) {
    return kürzel.split(" / ").map(function (alternative) {
      return alternative.split(" ").reduce(function (teile, wort) {
        if (wort === "2×") teile.push("2×");
        else {
          const mac = tastenEinesGriffs(wort).some(function (t) { return macModifikatoren.indexOf(t) !== -1; }) || wort.indexOf("+") === -1;
          teile.push('<span class="tk-griff">' + tastenEinesGriffs(wort).map(function (t) { return "<kbd>" + esc(t) + "</kbd>"; }).join(mac ? "" : "+") + "</span>");
        }
        return teile;
      }, []).join(" ");
    }).join(" / ");
  }

  // Tastennamen auf eine Form: Deutsch, Englisch und macOS-Symbole.
  const tastennamen = {
    strg: "ctrl", ctrl: "ctrl", control: "ctrl", ctl: "ctrl", "⌃": "ctrl",
    umschalt: "shift", shift: "shift", "⇧": "shift",
    alt: "alt", option: "alt", opt: "alt", wahl: "alt", "⌥": "alt",
    cmd: "cmd", command: "cmd", befehl: "cmd", meta: "cmd", "⌘": "cmd",
    leer: "space", leertaste: "space", space: "space",
    einfügen: "insert", einfg: "insert", ins: "insert", insert: "insert",
    entf: "delete", del: "delete", delete: "delete", "⌦": "delete",
    rück: "backspace", rücktaste: "backspace", backspace: "backspace", "⌫": "backspace",
    enter: "enter", eingabe: "enter", return: "enter", "↩": "enter", "⏎": "enter",
    esc: "esc", escape: "esc", tab: "tab", "⇥": "tab"
  };
  const reihenfolge = ["ctrl", "alt", "shift", "cmd"];
  // Die Namen, unter denen die Vorschläge beim Tippen eine Umschalttaste anbieten.
  const tastenWörter = {
    ctrl: ["strg", "ctrl", "control", "steuerung"],
    shift: ["umschalt", "shift", "hochstell"],
    alt: ["alt", "option", "wahl"],
    cmd: ["cmd", "command", "befehl", "meta"]
  };
  function tastenname(t) { const n = t.toLowerCase(); return tastennamen[n] || n; }

  // Ein Griff als Menge seiner Tasten, in fester Reihenfolge.
  function griffMenge(griff) {
    return tastenEinesGriffs(griff).map(tastenname).sort(function (a, b) {
      const ia = reihenfolge.indexOf(a), ib = reihenfolge.indexOf(b);
      return (ia === -1 ? 9 : ia) - (ib === -1 ? 9 : ib) || (a < b ? -1 : a > b ? 1 : 0);
    });
  }
  function griffe(kürzel) {
    if (!kürzel) return [];
    return kürzel.split(" / ").flatMap(function (a) { return a.split(" ").filter(function (w) { return w !== "2×"; }); }).map(griffMenge);
  }
  // Ist das Suchwort ein Griff? Dann enthält es „+“ oder ein macOS-Symbol.
  function istGriff(wort) {
    return wort.length > 1 && (wort.indexOf("+") !== -1 || Array.prototype.some.call(wort, function (z) { return macModifikatoren.indexOf(z) !== -1; }));
  }

  // ---------------------------------------------------------------------------
  // SUCHE – jedes Wort muss passen. Gesucht wird in Tätigkeit und Aktion und in den
  // Kürzeln der IDE, von der man umsteigt – nicht in denen von IntelliJ: Die sucht man
  // ja gerade. Ein Griff passt, wenn ein Kürzel der Vergleichs-IDE (für das
  // eingestellte System) alle seine Tasten hat.
  // ---------------------------------------------------------------------------
  // Die Umschalttasten zum Anklicken – je System in der Reihenfolge, in der man sie liest.
  function tastenZurWahl() {
    return istMac()
      ? [{ id: "cmd", text: "⌘", name: "Befehl" }, { id: "alt", text: "⌥", name: "Wahl" }, { id: "shift", text: "⇧", name: "Umschalt" }, { id: "ctrl", text: "⌃", name: "Control" }]
      : [{ id: "ctrl", text: "Strg", name: "Strg" }, { id: "shift", text: "Umschalt", name: "Umschalt" }, { id: "alt", text: "Alt", name: "Alt" }];
  }

  // Marken und Text ergeben zusammen die Suche: Ein einzelnes Wort hinter den Marken
  // ist die letzte Taste des Griffs („ctrl+shift+r“), mehrere stehen daneben.
  function suchanfrage() {
    const text = stand.such.trim().replace(/\s*\+\s*/g, "+");
    if (!stand.tasten.length) return text;
    const griff = stand.tasten.join("+");
    if (!text) return griff;
    return /\s/.test(text) ? griff + " " + text : griff + "+" + text;
  }
  function sucht() { return suchanfrage() !== ""; }
  function suchwörter() {
    return suchanfrage().toLowerCase().split(/\s+/).filter(Boolean);
  }
  function passt(k, wörter) {
    const text = [k.was, k.aktion, k.wörter || "", belegung(k, "vg") || ""].join(" | ").toLowerCase();
    const alleGriffe = griffe(belegung(k, "vg"));
    return wörter.every(function (w) {
      if (!istGriff(w)) return text.indexOf(w) !== -1 || alleGriffe.some(function (g) { return g.indexOf(tastenname(w)) !== -1; });
      const gesucht = griffMenge(w);
      return alleGriffe.some(function (g) {
        return gesucht.every(function (t) { return g.indexOf(t) !== -1; });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // ZEICHNEN
  // ---------------------------------------------------------------------------
  // Jede Zeile hat eine feste Kennung aus Kategorie und Aktion („debuggen-step-over“);
  // über sie lässt sich ein Kürzel markieren und verlinken.
  function kennung(kat, k) {
    return kat.id + "-" + k.aktion.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function zeileFinden(id) {
    for (const kat of kategorien) {
      for (const k of kat.kürzel) { if (kennung(kat, k) === id) return { kat: kat, k: k }; }
    }
    return null;
  }

  function vergleichsZelle(k) {
    const v = belegung(k, "vg");
    return '<span class="tk-vergleich__name">' + esc(vergleichsName()) + "</span>"
      + (v ? tasten(v) : '–<span class="skr-visually-hidden">kein Kürzel</span>');
  }

  function zeile(kat, k, nr) {
    const id = kennung(kat, k);
    return '<tr id="tk-k-' + id + '" data-nr="' + nr + '" data-kennung="' + id + '" tabindex="0">'
      + '<td class="tk-was">' + esc(k.was) + '<span class="tk-aktion">' + esc(k.aktion) + "</span></td>"
      + '<td class="tk-tasten">' + tasten(belegung(k, "ij")) + "</td>"
      + '<td class="tk-vergleich">' + vergleichsZelle(k) + "</td></tr>";
  }

  function knöpfe(boxId, einträge, aktiv, schlüssel) {
    const box = document.getElementById(boxId);
    box.innerHTML = einträge.map(function (e) {
      return '<button type="button" class="tk-knopf" data-id="' + e.id + '" aria-pressed="' + String(e.id === aktiv) + '">' + esc(e.knopf) + "</button>";
    }).join("");
    box.onclick = function (ereignis) {
      const k = ereignis.target.closest(".tk-knopf");
      if (!k || einstellung[schlüssel] === k.dataset.id) return;
      einstellung[schlüssel] = k.dataset.id;
      speichern();
      aufbauen();
      zeichnen();
      const neu = document.querySelector("#" + boxId + ' .tk-knopf[data-id="' + k.dataset.id + '"]');
      if (neu) neu.focus();
    };
  }

  // Alles, was von System und Vergleichs-IDE abhängt.
  function aufbauen() {
    knöpfe("tk-system", systeme, einstellung.system, "system");
    knöpfe("tk-vergleich", vergleiche, einstellung.vergleich, "vergleich");
    const wählbar = tastenZurWahl().map(function (t) { return t.id; });
    stand.tasten = stand.tasten.filter(function (t) { return wählbar.indexOf(t) !== -1; });
    tastenZeichnen();
    document.getElementById("tk-ueberall").innerHTML = tasten(istMac() ? "2× ⇧" : "2× Umschalt");
    document.getElementById("tk-such").placeholder = "z. B. umbenennen, "
      + (einstellung.vergleich === "eclipse" ? (istMac() ? "⌘1" : "Strg+1") : (istMac() ? "⌘." : "Strg+.")) + ", Debug";

    const offen = {};
    kategorieElemente().forEach(function (el) { offen[el.dataset.id] = el.open; });
    const ziel = document.getElementById("tk-kategorien");
    ziel.innerHTML = kategorien.map(function (kat) {
      return '<details class="tk-kategorie' + (kat.id === "wichtigste" ? " tk-kategorie--wichtigste" : "") + '" id="tk-' + kat.id + '" data-id="' + kat.id + '"' + (offen[kat.id] ? " open" : "") + ">"
        + '<summary class="tk-kategorie__kopf"><span class="tk-kategorie__titel">' + esc(kat.titel) + "</span>"
        + '<span class="tk-kategorie__zahl" data-zahl></span></summary>'
        + '<div class="tk-kategorie__inhalt"><table class="tk-tabelle"><thead><tr><th scope="col">Was</th><th scope="col">IntelliJ</th>'
        + '<th scope="col" class="tk-vergleich">' + esc(vergleichsName()) + "</th></tr></thead><tbody>"
        + kat.kürzel.map(function (k, nr) { return zeile(kat, k, nr); }).join("")
        + "</tbody></table></div></details>";
    }).join("");
    ziel.dispatchEvent(new CustomEvent("skr-content-added", { bubbles: true }));
  }

  // Gewählte Umschalttasten als Marken im Feld, die übrigen zum Anklicken darunter.
  function tastenZeichnen() {
    const alle = tastenZurWahl();
    document.getElementById("tk-marken").innerHTML = stand.tasten.map(function (id) {
      const t = alle.find(function (x) { return x.id === id; });
      return '<span class="tk-marke" title="' + esc(t.name) + '">' + esc(t.text)
        + '<button type="button" class="tk-marke__weg" data-id="' + id + '" aria-label="' + esc(t.name) + ' entfernen">×</button></span>';
    }).join("");
    document.getElementById("tk-tasten-wahl").innerHTML = alle.filter(function (t) {
      return stand.tasten.indexOf(t.id) === -1;
    }).map(function (t) {
      return '<button type="button" class="tk-taste" data-id="' + t.id + '" title="' + esc(t.name) + '" aria-label="' + esc(t.name) + ' dazunehmen">' + esc(t.text) + "</button>";
    }).join("");
  }

  function kategorieElemente() { return Array.prototype.slice.call(document.querySelectorAll(".tk-kategorie")); }

  // Die Suche filtert Zeilen, klappt Kategorien mit Treffern auf und blendet die übrigen
  // aus. Ohne Suche ist die Kategorie des markierten Kürzels immer offen.
  function zeichnen() {
    const wörter = suchwörter();
    const suche = wörter.length > 0;
    const markiert = zeileFinden(stand.kürzel);
    let summe = 0;
    kategorieElemente().forEach(function (el) {
      const kat = kategorien.find(function (k) { return k.id === el.dataset.id; });
      const zählt = !(suche && kat.id === "wichtigste");
      let treffer = 0;
      el.querySelectorAll("tbody tr").forEach(function (tr) {
        const ja = !suche || passt(kat.kürzel[Number(tr.dataset.nr)], wörter);
        const istMarkiert = tr.dataset.kennung === stand.kürzel;
        tr.hidden = !ja;
        tr.classList.toggle("tk-zeile--markiert", istMarkiert);
        tr.setAttribute("aria-selected", String(istMarkiert));
        if (ja) treffer++;
      });
      if (zählt) summe += treffer;
      el.hidden = suche && (!zählt || treffer === 0);
      el.querySelector("[data-zahl]").textContent = suche ? treffer + " von " + kat.kürzel.length : String(kat.kürzel.length);
      el.open = suche ? zählt && treffer > 0 : stand.auf.indexOf(kat.id) !== -1 || (markiert !== null && markiert.kat === kat);
    });
    document.getElementById("tk-treffer").textContent = !suche ? ""
      : summe === 0 ? "Kein Kürzel gefunden. Versuch es mit einem anderen Wort – oder in IntelliJ mit 2× Umschalt."
      : summe === 1 ? "1 Kürzel gefunden." : summe + " Kürzel gefunden.";
  }

  function zumMarkierten() {
    const tr = stand.kürzel && document.getElementById("tk-k-" + stand.kürzel);
    // Ohne Animation: Das Theme scrollt sonst weich, und wer einen Verweis öffnet, soll
    // gleich an der Stelle sein.
    if (tr && !tr.hidden) window.requestAnimationFrame(function () { tr.scrollIntoView({ block: "center", behavior: "instant" }); });
  }

  function melden() {
    if (window.skr && window.skr.state) window.skr.state.update();
  }

  // Jede Änderung an der Suche läuft hierüber: Sie merkt sich, was vor der Suche offen war.
  function suchen(ändern) {
    const vorher = sucht();
    ändern();
    const jetzt = sucht();
    if (jetzt && !vorher) aufVorDerSuche = stand.auf.slice();
    if (!jetzt && vorher && aufVorDerSuche) { stand.auf = aufVorDerSuche; aufVorDerSuche = null; }
    zeichnen();
    melden();
  }

  function verdrahten() {
    const feld = document.getElementById("tk-such");
    feld.addEventListener("input", function () {
      if (!zuMarkeMachen()) suchen(function () { stand.such = feld.value; });
      vorschlagen();
    });
    // Das ✕ des Suchfelds leert auch die Marken.
    feld.addEventListener("search", function () {
      if (feld.value !== "" || !stand.tasten.length) return;
      suchen(function () { stand.such = ""; stand.tasten = []; });
      tastenZeichnen();
      vorschlagen();
    });

    // Umschalttasten dazunehmen und wieder entfernen; danach bleibt der Fokus im Feld.
    // neuerText: der Text, der danach im Feld steht (wenn die Taste aus dem Getippten kommt).
    function tasteÄndern(id, dazu, neuerText) {
      if (neuerText !== undefined) feld.value = neuerText;
      suchen(function () {
        stand.such = feld.value;
        if (dazu) stand.tasten.push(id);
        else stand.tasten.splice(stand.tasten.indexOf(id), 1);
        const reihe = tastenZurWahl().map(function (t) { return t.id; });
        stand.tasten.sort(function (a, b) { return reihe.indexOf(a) - reihe.indexOf(b); });
      });
      tastenZeichnen();
      feld.focus();
    }
    document.getElementById("tk-tasten-wahl").addEventListener("click", function (e) {
      const k = e.target.closest(".tk-taste");
      if (k) tasteÄndern(k.dataset.id, true);
    });
    document.getElementById("tk-marken").addEventListener("click", function (e) {
      const k = e.target.closest(".tk-marke__weg");
      if (k) tasteÄndern(k.dataset.id, false);
    });
    // VORSCHLÄGE beim Tippen: Ein angefangener Tastenname („str“, „umsch“, „cmd“) bietet
    // die passende Umschalttaste an; die Auswahl macht sie zur Marke. Ein Name mit „+“
    // dahinter („strg+“) wird ohne Auswahl zur Marke.
    const vorschlagsliste = document.getElementById("tk-vorschlaege");
    let vorschläge = [];
    let aktiv = -1;
    function angefangen() {
      const m = feld.value.slice(0, feld.selectionStart === null ? feld.value.length : feld.selectionStart).match(/(^|[\s+])([^\s+]*)$/);
      return m ? m[2] : "";
    }
    function wählbareTasten() {
      return tastenZurWahl().filter(function (t) { return stand.tasten.indexOf(t.id) === -1; });
    }
    function vorschlagen() {
      const teil = angefangen().toLowerCase();
      vorschläge = teil.length < 2 ? [] : wählbareTasten().filter(function (t) {
        return (tastenWörter[t.id] || []).some(function (w) { return w.indexOf(teil) === 0; });
      });
      aktiv = vorschläge.length ? 0 : -1;
      vorschlägeZeichnen();
    }
    function vorschlägeZeichnen() {
      if (aktiv >= vorschläge.length) aktiv = vorschläge.length ? 0 : -1;
      vorschlagsliste.innerHTML = vorschläge.map(function (t, i) {
        return '<li role="option" id="tk-vorschlag-' + t.id + '" class="tk-vorschlag" data-id="' + t.id + '" aria-selected="' + String(i === aktiv) + '">'
          + "<kbd>" + esc(t.text) + "</kbd> " + esc(t.text === t.name ? "Taste dazunehmen" : t.name) + "</li>";
      }).join("");
      vorschlagsliste.hidden = !vorschläge.length;
      feld.setAttribute("aria-expanded", String(vorschläge.length > 0));
      if (aktiv >= 0) feld.setAttribute("aria-activedescendant", "tk-vorschlag-" + vorschläge[aktiv].id);
      else feld.removeAttribute("aria-activedescendant");
    }
    function vorschlagNehmen(id) {
      const teil = angefangen();
      const bis = feld.selectionStart === null ? feld.value.length : feld.selectionStart;
      const rest = (feld.value.slice(0, bis - teil.length).replace(/[\s+]+$/, "") + " " + feld.value.slice(bis).replace(/^[\s+]+/, "")).trim();
      vorschläge = [];
      vorschlägeZeichnen();
      tasteÄndern(id, true, rest);
    }
    // „strg+“ getippt: sofort zur Marke. Liefert true, wenn das passiert ist.
    function zuMarkeMachen() {
      const m = feld.value.match(/(^|\s)([^\s+]+)\+$/);
      if (!m) return false;
      const id = tastenname(m[2]);
      if (!wählbareTasten().some(function (t) { return t.id === id; })) return false;
      tasteÄndern(id, true, feld.value.slice(0, feld.value.length - m[2].length - 1).trim());
      return true;
    }
    vorschlagsliste.addEventListener("mousedown", function (e) { e.preventDefault(); });
    vorschlagsliste.addEventListener("click", function (e) {
      const li = e.target.closest(".tk-vorschlag");
      if (li) vorschlagNehmen(li.dataset.id);
    });
    feld.addEventListener("blur", function () { vorschläge = []; vorschlägeZeichnen(); });

    feld.addEventListener("keydown", function (e) {
      if (vorschläge.length) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          aktiv = (aktiv + (e.key === "ArrowDown" ? 1 : -1) + vorschläge.length) % vorschläge.length;
          vorschlägeZeichnen();
          return;
        }
        if ((e.key === "Enter" || e.key === "Tab") && aktiv >= 0) {
          e.preventDefault();
          vorschlagNehmen(vorschläge[aktiv].id);
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          vorschläge = [];
          vorschlägeZeichnen();
          return;
        }
      }
      if (e.key === "Backspace" && feld.selectionStart === 0 && feld.selectionEnd === 0 && stand.tasten.length) {
        e.preventDefault();
        tasteÄndern(stand.tasten[stand.tasten.length - 1], false);
      }
    });
    // Ein Klick ins Feld, neben die Marken, landet in der Eingabe.
    document.getElementById("tk-feld").addEventListener("click", function (e) {
      if (e.target.id === "tk-feld") feld.focus();
    });

    const liste = document.getElementById("tk-kategorien");

    // Auf- und Zuklappen von Hand, nur ohne Suche: Dann ist es der Stand, den die Adresse trägt.
    liste.addEventListener("toggle", function (e) {
      const el = e.target;
      if (!el.classList || !el.classList.contains("tk-kategorie") || sucht()) return;
      const id = el.dataset.id;
      const drin = stand.auf.indexOf(id) !== -1;
      if (el.open && !drin) stand.auf.push(id);
      else if (!el.open && drin) stand.auf.splice(stand.auf.indexOf(id), 1);
      else return;
      melden();
    }, true);

    // Ein Klick auf die Zeile markiert das Kürzel – höchstens eines, eine andere
    // Markierung verschwindet. Ein zweiter Klick hebt sie auf. Mit der Tastatur: Enter.
    function markieren(tr) {
      const id = tr.dataset.kennung;
      stand.kürzel = stand.kürzel === id ? "" : id;
      zeichnen();
      melden();
    }
    liste.addEventListener("click", function (e) {
      const tr = e.target.closest("tbody tr");
      if (tr) markieren(tr);
    });
    liste.addEventListener("keydown", function (e) {
      const tr = e.target.closest("tbody tr");
      if (tr && e.target === tr && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); markieren(tr); }
    });

    function alle(auf) {
      feld.value = "";
      stand.such = "";
      stand.tasten = [];
      tastenZeichnen();
      aufVorDerSuche = null;
      stand.auf = auf ? kategorien.map(function (k) { return k.id; }) : [];
      if (!auf) stand.kürzel = "";
      zeichnen();
      melden();
    }
    document.getElementById("tk-alle-auf").addEventListener("click", function () { alle(true); });
    document.getElementById("tk-alle-zu").addEventListener("click", function () { alle(false); });

    // Gedruckt wird alles, danach gilt wieder der Stand von vorher.
    let offenVorDemDruck = null;
    window.addEventListener("beforeprint", function () {
      offenVorDemDruck = kategorieElemente().map(function (el) { return [el, el.open, el.hidden]; });
      kategorieElemente().forEach(function (el) { el.open = true; el.hidden = false; });
    });
    window.addEventListener("afterprint", function () {
      if (!offenVorDemDruck) return;
      offenVorDemDruck.forEach(function (x) { x[0].open = x[1]; x[0].hidden = x[2]; });
      offenVorDemDruck = null;
    });
  }

  // ---------------------------------------------------------------------------
  // ADRESSE – über skr.state, nie selbst ins Fragment schreiben. System und
  // Vergleichs-IDE stehen nicht darin: Sie gehören dem Leser, nicht dem Verweis.
  // Angemeldet wird nach dem ersten Zeichnen: Der Stand dann ist der Standard.
  // ---------------------------------------------------------------------------
  function anmelden() {
    if (!window.skr || !window.skr.state) return;
    window.skr.state.register({
      key: "such",
      read: function () { return suchanfrage(); },
      apply: function (wert) {
        // Führende Umschalttasten des ersten Worts werden wieder zu Marken.
        const wörter = String(wert || "").slice(0, 40).trim().split(/\s+/);
        const teile = wörter[0] ? wörter[0].split("+") : [];
        const wählbar = tastenZurWahl().map(function (t) { return t.id; });
        stand.tasten = [];
        while (teile.length > 1 || (teile.length === 1 && wörter.length === 1 && istGriff(wörter[0]))) {
          const id = tastenname(teile[0]);
          if (wählbar.indexOf(id) === -1 || stand.tasten.indexOf(id) !== -1) break;
          stand.tasten.push(id);
          teile.shift();
        }
        stand.such = [teile.join("+")].concat(wörter.slice(1)).filter(Boolean).join(" ");
        document.getElementById("tk-such").value = stand.such;
        tastenZeichnen();
        zeichnen();
      }
    });
    window.skr.state.register({
      key: "auf",
      read: function () { return stand.auf.join(","); },
      apply: function (wert) {
        stand.auf = String(wert || "").split(",").filter(function (id) {
          return kategorien.some(function (k) { return k.id === id; });
        });
        zeichnen();
      }
    });
    window.skr.state.register({
      key: "kuerzel",
      read: function () { return stand.kürzel; },
      apply: function (wert) {
        stand.kürzel = zeileFinden(String(wert || "")) ? String(wert) : "";
        zeichnen();
        zumMarkierten();
      }
    });
  }

  function start() {
    laden();
    aufbauen();
    verdrahten();
    zeichnen();
    anmelden();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
