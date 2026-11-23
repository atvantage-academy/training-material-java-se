(function () {
  // ---------------------------------------------------------------------------
  // DATEN – je Schritt und Projektart: ij (IntelliJ, nummerierte Schritte),
  // hinweis (optional, unter der Anleitung), eclipse und vscode (der gewohnte Weg).
  // Ein Schritt mit „alle“ gilt für jede Projektart. Auszeichnung im Text:
  // *kursiv* für Menüs und Dialoge, `code`, [[Strg+Alt+S]] für Kürzel.
  // ---------------------------------------------------------------------------
  const arten = [
    { id: "liberty", knopf: "Jakarta EE auf Open Liberty" },
    { id: "angular", knopf: "Angular mit npm" }
  ];
  const vergleiche = [
    { id: "eclipse", knopf: "Eclipse", name: "Eclipse" },
    { id: "vscode", knopf: "VS Code", name: "VS Code" }
  ];

  const begriffe = {
    eclipse: [
      ["Workspace", "*Project* – ein Fenster ist ein Project"],
      ["Projekt im Workspace", "*Module*"],
      ["*Window | Preferences*", "*Settings* [[Strg+Alt+S]]"],
      ["*Project | Properties*", "*Project Structure* [[Strg+Alt+Umschalt+S]], am Modul *Module Settings* [[F4]]"],
      ["*Launch Configurations* (*Run* und *Debug*)", "*Run/Debug Configurations* – eine Konfiguration für beides"],
      ["*Import | Existing Maven Projects*", "*File | Open* auf die `pom.xml`"],
      ["*Maven | Update Project* [[Alt+F5]]", "Maven-Änderungen laden [[Strg+Umschalt+O]]"],
      ["Perspektiven (*Java*, *Debug*)", "keine – Werkzeugfenster gehen auf und zu"]
    ],
    vscode: [
      ["Ordner bzw. Workspace", "*Project*"],
      ["Einstellungen [[Strg+,]], `settings.json`", "*Settings* [[Strg+Alt+S]], durchsuchbar"],
      ["`launch.json`", "*Run/Debug Configurations* – entstehen beim ersten Start von selbst"],
      ["Befehlspalette [[Strg+Umschalt+P]]", "*Search Everywhere* [[2× Umschalt]]"],
      ["Erweiterung (*Extension*)", "*Plugin* – vieles ist in Ultimate schon dabei"],
      ["Explorer-Bereiche *Maven*, *NPM Scripts*", "Werkzeugfenster *Maven*, *npm*"]
    ]
  };

  const schritte = [
    { id: "anlegen", titel: "Anlegen",
      liberty: {
        ij: [
          "*File | New | Project*, links unter *Generators* *Jakarta EE*.",
          "*Template: Web application* oder *REST service*, *Build system: Maven*, *Group*, *Artifact*, *JDK*.",
          "*Application server: <No application server>* – Open Liberty steht hier nicht zur Wahl, gestartet wird über Maven.",
          "*Next*: die Jakarta-EE-Version und unter *Dependencies* *Contexts and Dependency Injection (CDI)*; *Create*.",
          "In die `pom.xml` das `liberty-maven-plugin` eintragen, `src/main/liberty/config/server.xml` anlegen und die Maven-Änderungen laden [[Strg+Umschalt+O]]."
        ],
        hinweis: "Das Plugin *Liberty Tools* bringt einen eigenen Assistenten und ein Werkzeugfenster mit. Es kommt aus dem Marketplace – ohne Internet nur, wenn es vorher installiert wurde.",
        eclipse: ["Mit *Liberty Tools*: Assistent *New Liberty Project*.", "Sonst *File | New | Maven Project* mit einem Jakarta-EE-Archetyp und das Plugin von Hand eintragen."],
        vscode: ["Mit *Liberty Tools*: *Liberty: Create a Liberty project*.", "Sonst *Maven: Generate from Maven Archetype*."]
      },
      angular: {
        ij: [
          "*File | New | Project*, links *Angular CLI*.",
          "*Node runtime* wählen; bei *Angular CLI* `npx --package @angular/cli ng` – das holt die CLI über die npm-Registry – oder eine installierte CLI.",
          "*Create*. IntelliJ führt `ng new` aus und installiert die Abhängigkeiten."
        ],
        eclipse: ["Kein Assistent: im Terminal `ng new «name»`, danach den Ordner als Projekt importieren."],
        vscode: ["Kein Assistent: im Terminal `ng new «name»`, danach *File | Open Folder*."]
      }
    },
    { id: "klonen", titel: "Klonen",
      alle: {
        ij: [
          "Auf dem Willkommensbildschirm *Clone Repository*; ist schon ein Projekt offen, *Git | Clone* (oder *File | New | Project from Version Control*).",
          "URL eintragen, Zielordner prüfen, *Clone*.",
          "Die Frage nach dem Vertrauen mit *Trust Project* beantworten. Im *Safe Mode* lädt IntelliJ weder Maven noch npm.",
          "IntelliJ erkennt `pom.xml` bzw. `package.json` und lädt die Abhängigkeiten; unten rechts läuft die Indizierung."
        ],
        hinweis: "Ein Schritt statt zwei: Klonen und Öffnen sind in IntelliJ derselbe Vorgang.",
        eclipse: ["Ansicht *Git Repositories* → *Clone a Git Repository* (oder *File | Import | Git | Projects from Git | Clone URI*).", "Danach *File | Import | Maven | Existing Maven Projects*."],
        vscode: ["Befehlspalette *Git: Clone* oder *Clone Repository* in der Ansicht *Source Control*; danach den Ordner öffnen und *Trust*."]
      }
    },
    { id: "oeffnen", titel: "Öffnen",
      liberty: {
        ij: [
          "*File | Open* (auf dem Willkommensbildschirm *Open*), die `pom.xml` oder ihren Ordner wählen.",
          "*Open as Project*, dann *Trust Project*.",
          "Das Fenster ist das *Project*. Die Maven-Module darin sind, was in Eclipse die Projekte im Workspace waren."
        ],
        hinweis: "Backend und Frontend liegen in einem Repository, sind aber eigenständig: jedes in einem eigenen Fenster öffnen – oder den Repository-Ordner öffnen, dann meldet IntelliJ *Maven build scripts found* → *Load*, und beide stehen in einem Fenster.",
        eclipse: ["*File | Import | Maven | Existing Maven Projects* in den Workspace."],
        vscode: ["*File | Open Folder*, *Trust*; die Java-Erweiterung erkennt die `pom.xml`."]
      },
      angular: {
        ij: [
          "*File | Open*, den Ordner mit der `package.json` wählen, *Trust Project*.",
          "Fehlen die `node_modules`, im Kontextmenü der `package.json` *Run 'npm install'*."
        ],
        hinweis: "Backend und Frontend liegen in einem Repository, sind aber eigenständig: jedes in einem eigenen Fenster öffnen – oder den Repository-Ordner öffnen, dann meldet IntelliJ *Maven build scripts found* → *Load*, und beide stehen in einem Fenster.",
        eclipse: ["Ordner als Projekt importieren; `npm install` im Terminal."],
        vscode: ["*File | Open Folder*, *Trust*; `npm install` im Terminal."]
      }
    },
    { id: "einrichten", titel: "Einrichten",
      liberty: {
        ij: [
          "*Settings* [[Strg+Alt+S]] – den Dialog durchsuchen, nicht durchklicken: „maven“ tippen.",
          "*Build, Execution, Deployment | Build Tools | Maven*: *Maven home path* und – mit *Override* – das *User settings file*, also die `settings.xml` mit dem internen Spiegel.",
          "*Project Structure* [[Strg+Alt+Umschalt+S]], Seite *Project*: *SDK* und *Language level*. *Module Settings*: im Projektbaum das Modul markieren und [[F4]] – derselbe Dialog, am Modul.",
          "Einen Server richtest Du in IntelliJ **nicht** ein: Das `liberty-maven-plugin` holt die Open-Liberty-Laufzeit beim ersten Start aus dem Maven-Spiegel.",
          "Die Server-Konfiguration liegt im Projekt: `src/main/liberty/config/server.xml`."
        ],
        hinweis: "Bei Maven ist die `pom.xml` die Wahrheit: Was Du in *Project Structure* von Hand änderst, überschreibt der nächste Maven-Abgleich.",
        eclipse: ["*Window | Preferences*: *Maven | User Settings*, *Java | Installed JREs*.", "*Project | Properties*: *Java Build Path*, *Project Facets*; mit *Liberty Tools* kein eigener Server-Eintrag."],
        vscode: ["Einstellungen [[Strg+,]]: `maven.settingsFile`, `java.configuration.runtimes`; *Liberty Tools* braucht selbst ein Java 21."]
      },
      angular: {
        ij: [
          "*Settings* [[Strg+Alt+S]] → *Languages & Frameworks | JavaScript Runtime*.",
          "*Node runtime* und *Package manager* (npm) prüfen.",
          "Die Registry kommt aus der `.npmrc` – dafür hat IntelliJ keine eigene Einstellung."
        ],
        eclipse: ["Keine zentrale Einstellung; Node.js aus dem `PATH`, die Registry aus der `.npmrc`."],
        vscode: ["Node.js aus dem `PATH`, die Registry aus der `.npmrc`."]
      }
    },
    { id: "starten", titel: "Starten",
      liberty: {
        ij: [
          "Werkzeugfenster *Maven* → *Plugins | liberty* → `liberty:dev` per Rechtsklick *Run* – oder [[2× Strg]] und `mvn liberty:dev`.",
          "Der Dev-Modus startet den Server und übernimmt Änderungen am Code ohne Neustart.",
          "*Modify Run Configuration* speichert den Lauf als dauerhafte Run-Konfiguration.",
          "Beenden mit *Stop* [[Strg+F2]] oder `q` und Enter in der Konsole.",
          "Tests ohne Server: grünes Dreieck am Zeilenrand neben der Testklasse → *Run*. Daraus entsteht eine Run-Konfiguration; [[Umschalt+F10]] startet sie erneut, *Run | Edit Configurations* zeigt alle – die *Run/Debug Configurations* sind Eclipses *Launch Configurations*."
        ],
        hinweis: "Mit dem Plugin *Liberty Tools*: Werkzeugfenster *Liberty* → *Start*.",
        eclipse: ["Mit *Liberty Tools*: Ansicht *Liberty Tools* → *Start*, oder *Run As | Liberty Start*.", "Sonst *Run As | Maven build…* mit dem Goal `liberty:dev`; Tests mit *Run As | JUnit Test*, alles unter *Run | Run Configurations*."],
        vscode: ["Mit *Liberty Tools*: *Start* im *Liberty Dashboard*.", "Sonst im Terminal `mvn liberty:dev`."]
      },
      angular: {
        ij: [
          "In der `package.json` das grüne Dreieck neben dem Skript `start` → *Run 'start'*.",
          "Oder Kontextmenü der `package.json` → *Show npm Scripts*: Das Werkzeugfenster *npm* listet alle Skripte, Doppelklick startet.",
          "IntelliJ legt dazu eine npm-Run-Konfiguration an (*Angular CLI Server*)."
        ],
        eclipse: ["Im Terminal `npm start`."],
        vscode: ["Ansicht *NPM Scripts* im Explorer, oder im Terminal `npm start`."]
      }
    },
    { id: "debuggen", titel: "Debuggen",
      liberty: {
        ij: [
          "Haltepunkt per Klick in den Zeilenrand oder [[Strg+F8]].",
          "Einen Test debuggen: am grünen Dreieck *Debug* – oder [[Umschalt+F9]] für die gewählte Konfiguration.",
          "Den Server debuggen: Der Dev-Modus öffnet einen Debug-Port, voreingestellt **7777**.",
          "*Run | Edit Configurations* → *+* → *Remote JVM Debug*; *Port* auf 7777 setzen (voreingestellt ist 5005), Name zum Beispiel „Liberty“.",
          "`liberty:dev` starten, dann diese Konfiguration mit *Debug*. Haltepunkte im Servercode greifen bei der nächsten Anfrage."
        ],
        hinweis: "Jede Run-Konfiguration ist zugleich eine Debug-Konfiguration. Eine Debug-Perspektive gibt es nicht: Das Fenster *Debug* geht unten auf. Mit dem Plugin *Liberty Tools* startet *Debug* im Werkzeugfenster *Liberty* den Server und hängt den Debugger selbst an.",
        eclipse: ["*Run | Debug Configurations* → *Remote Java Application*, Port 7777.", "Mit *Liberty Tools*: *Debug* in der Ansicht *Liberty Tools* oder *Connect Liberty Debugger*."],
        vscode: ["Mit *Liberty Tools*: *Liberty: Start in debug mode* oder *Liberty: Attach debugger*.", "Sonst `launch.json` mit `\"request\": \"attach\"` auf Port 7777."]
      },
      angular: {
        ij: [
          "Die Anwendung mit `start` laufen lassen.",
          "Im Run-Fenster [[Strg+Umschalt]] gedrückt halten und auf `http://localhost:4200` klicken: Das startet die Debug-Konfiguration *Angular Application* (*JavaScript Debug*) in Chrome oder einem anderen Chromium-Browser.",
          "Haltepunkte direkt in den `.ts`-Dateien setzen."
        ],
        eclipse: ["In den Entwicklerwerkzeugen des Browsers."],
        vscode: ["`launch.json` mit `\"type\": \"chrome\"` oder `\"msedge\"` und der `url` `http://localhost:4200`."]
      }
    },
    { id: "werkzeuge", titel: "Das Projekt im Blick",
      liberty: {
        ij: [
          "Werkzeugfenster *Beans* ([[2× Umschalt]] und „Beans“): die CDI-Beans des Projekts. Nutzt das Projekt nur CDI, heißt das Fenster *CDI*.",
          "Am `@Inject` zeigt der Zeilenrand ein Symbol: Klick springt zur passenden Bean – und von der Bean zurück zu ihren Injektionspunkten.",
          "Werkzeugfenster *Endpoints*: die REST-Endpunkte der Anwendung.",
          "Werkzeugfenster *Maven* (rechte Seitenleiste): *Lifecycle*, *Plugins* und *Dependencies* – der Baum der Abhängigkeiten.",
          "Oben im Fenster *Maven*: alle Maven-Projekte neu laden, *Execute Maven Goal*, *Toggle Offline Mode*, *Analyze Dependencies* (Konflikte), *Show Dependencies* (als Diagramm)."
        ],
        eclipse: ["Keine Übersicht der CDI-Beans im Lieferumfang.", "POM-Editor, Reiter *Dependency Hierarchy*; *Maven | Update Project* [[Alt+F5]]."],
        vscode: ["Keine Übersicht der CDI-Beans; *Liberty Tools* bringt Sprachunterstützung für Jakarta EE.", "Bereich *Maven* im Explorer, Knoten *Dependencies*."]
      },
      angular: {
        ij: [
          "Werkzeugfenster *npm*: die Skripte der `package.json`, Doppelklick startet.",
          "Den Abhängigkeitsbaum zeigt `npm ls` im Terminal [[Alt+F12]]; `npm ls «paket»` zeigt, wer ein Paket hereinzieht."
        ],
        eclipse: ["Im Terminal `npm ls`."],
        vscode: ["Ansicht *NPM Scripts*; im Terminal `npm ls`."]
      }
    }
  ];

  // ---------------------------------------------------------------------------
  // STAND
  // ---------------------------------------------------------------------------
  const speicherSchlüssel = "intellij-projekte.einstellungen";
  const kürzelSchlüssel = "intellij-tastenkuerzel.einstellungen";
  const einstellung = { art: "liberty", vergleich: "eclipse" };
  const stand = { auf: [] };

  function laden() {
    try {
      const kürzel = JSON.parse(window.localStorage.getItem(kürzelSchlüssel) || "{}");
      if (vergleiche.some(function (v) { return v.id === kürzel.vergleich; })) einstellung.vergleich = kürzel.vergleich;
      const gespeichert = JSON.parse(window.localStorage.getItem(speicherSchlüssel) || "{}");
      if (arten.some(function (a) { return a.id === gespeichert.art; })) einstellung.art = gespeichert.art;
      if (vergleiche.some(function (v) { return v.id === gespeichert.vergleich; })) einstellung.vergleich = gespeichert.vergleich;
    } catch (e) { /* ohne Speicher gilt die Vorgabe */ }
  }
  function speichern() {
    try { window.localStorage.setItem(speicherSchlüssel, JSON.stringify(einstellung)); } catch (e) { /* ohne Speicher nur für diesen Besuch */ }
  }

  // ---------------------------------------------------------------------------
  // TEXT – Auszeichnung in HTML
  // ---------------------------------------------------------------------------
  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function kürzel(k) {
    if (k.indexOf("2× ") === 0) return "2× <kbd>" + esc(k.slice(3)) + "</kbd>";
    return k.split("+").map(function (t) { return "<kbd>" + esc(t) + "</kbd>"; }).join("+");
  }
  function auszeichnen(text) {
    const teile = [];
    // Code zuerst herausnehmen, damit * und [[ darin nichts auszeichnen.
    let t = String(text).replace(/`([^`]+)`/g, function (_, c) { teile.push("<code>" + esc(c) + "</code>"); return "\u0000" + (teile.length - 1) + "\u0000"; });
    t = t.replace(/\[\[([^\]]+)\]\]/g, function (_, k) { teile.push(kürzel(k)); return "\u0000" + (teile.length - 1) + "\u0000"; });
    t = esc(t).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return t.replace(/\u0000(\d+)\u0000/g, function (_, i) { return teile[Number(i)]; });
  }

  function inhalt(schritt) {
    const eintrag = schritt.alle || schritt[einstellung.art];
    return eintrag.gleich ? schritt[eintrag.gleich] : eintrag;
  }
  // Gleicht ein Schritt dem einer anderen Art, zeigt er auch deren Bild.
  function bild(schritt) {
    if (schritt.alle) return "bilder/" + schritt.id + ".png";
    const eintrag = schritt[einstellung.art];
    return "bilder/" + (eintrag.gleich || einstellung.art) + "-" + schritt.id + ".png";
  }
  function name(liste, id) {
    return liste.filter(function (e) { return e.id === id; })[0];
  }

  // ---------------------------------------------------------------------------
  // ZEICHNEN
  // ---------------------------------------------------------------------------
  function knöpfe(boxId, einträge, schlüssel) {
    const box = document.getElementById(boxId);
    box.innerHTML = einträge.map(function (e) {
      return '<button type="button" class="ip-knopf" data-id="' + e.id + '" aria-pressed="' + String(e.id === einstellung[schlüssel]) + '">' + esc(e.knopf) + "</button>";
    }).join("");
  }

  function begriffeZeichnen() {
    const vg = name(vergleiche, einstellung.vergleich).name;
    document.getElementById("ip-begriffe-inhalt").innerHTML =
      '<table class="ip-tabelle"><thead><tr><th scope="col">' + esc(vg) + '</th><th scope="col">IntelliJ IDEA</th></tr></thead><tbody>' +
      begriffe[einstellung.vergleich].map(function (b) {
        return "<tr><td>" + auszeichnen(b[0]) + "</td><td>" + auszeichnen(b[1]) + "</td></tr>";
      }).join("") + "</tbody></table>";
  }

  function schritteZeichnen() {
    const vg = name(vergleiche, einstellung.vergleich);
    const art = name(arten, einstellung.art);
    document.getElementById("ip-titel").textContent = art.knopf + " – neben " + vg.name;
    document.getElementById("ip-schritte").innerHTML = schritte.map(function (s) {
      const i = inhalt(s);
      return '<details class="ip-schritt" id="ip-s-' + s.id + '" data-id="' + s.id + '"' + (stand.auf.indexOf(s.id) !== -1 ? " open" : "") + ">" +
        '<summary class="ip-schritt__kopf"><span class="ip-schritt__titel">' + esc(s.titel) + "</span></summary>" +
        '<div class="ip-schritt__inhalt">' +
          '<div class="ip-ij"><h3 class="ip-spalte__titel">In IntelliJ IDEA</h3><ol class="ip-anleitung">' +
            i.ij.map(function (z) { return "<li>" + auszeichnen(z) + "</li>"; }).join("") + "</ol>" +
            (i.hinweis ? '<p class="ip-hinweis">' + auszeichnen(i.hinweis) + "</p>" : "") +
            '<figure class="ip-bild" hidden><img alt="IntelliJ IDEA: ' + esc(s.titel) + " – " + esc(art.knopf) + '" data-src="' + bild(s) + '"></figure>' +
          "</div>" +
          '<div class="ip-vergleich"><h3 class="ip-spalte__titel">In ' + esc(vg.name) + '</h3><ul class="ip-vergleich__liste">' +
            i[vg.id].map(function (z) { return "<li>" + auszeichnen(z) + "</li>"; }).join("") + "</ul></div>" +
        "</div></details>";
    }).join("");
    stand.auf.forEach(bildLaden);
  }

  // Ein Bild wird erst beim Aufklappen geladen; fehlt die Datei, bleibt der Platz leer.
  function bildLaden(id) {
    const fig = document.querySelector("#ip-s-" + id + " .ip-bild");
    if (!fig) return;
    const img = fig.querySelector("img");
    if (img.getAttribute("src")) return;
    img.addEventListener("load", function () { fig.hidden = false; });
    img.addEventListener("error", function () { fig.hidden = true; });
    img.setAttribute("src", img.dataset.src);
  }

  function zeichnen() {
    knöpfe("ip-art", arten, "art");
    knöpfe("ip-vergleich", vergleiche, "vergleich");
    begriffeZeichnen();
    schritteZeichnen();
  }

  function zustandMelden() {
    if (window.skr && window.skr.state) window.skr.state.update();
  }

  // ---------------------------------------------------------------------------
  // BEDIENUNG
  // ---------------------------------------------------------------------------
  function verdrahten() {
    [["ip-art", "art"], ["ip-vergleich", "vergleich"]].forEach(function (paar) {
      document.getElementById(paar[0]).addEventListener("click", function (ereignis) {
        const k = ereignis.target.closest(".ip-knopf");
        if (!k || einstellung[paar[1]] === k.dataset.id) return;
        einstellung[paar[1]] = k.dataset.id;
        speichern();
        zeichnen();
        zustandMelden();
        const neu = document.querySelector("#" + paar[0] + ' .ip-knopf[data-id="' + k.dataset.id + '"]');
        if (neu) neu.focus();
      });
    });
    document.getElementById("ip-schritte").addEventListener("toggle", function (ereignis) {
      const d = ereignis.target;
      if (!d.classList || !d.classList.contains("ip-schritt")) return;
      const id = d.dataset.id;
      const war = stand.auf.indexOf(id) !== -1;
      if (d.open && !war) stand.auf.push(id);
      if (!d.open && war) stand.auf.splice(stand.auf.indexOf(id), 1);
      if (d.open) bildLaden(id);
      zustandMelden();
    }, true);
    document.getElementById("ip-alle-auf").addEventListener("click", function () { alle(true); });
    document.getElementById("ip-alle-zu").addEventListener("click", function () { alle(false); });
    let offenVorDemDruck = null;
    window.addEventListener("beforeprint", function () {
      offenVorDemDruck = stand.auf.slice();
      document.querySelectorAll(".ip-schritt").forEach(function (d) { d.open = true; });
    });
    window.addEventListener("afterprint", function () {
      if (!offenVorDemDruck) return;
      const auf = offenVorDemDruck;
      document.querySelectorAll(".ip-schritt").forEach(function (d) { d.open = auf.indexOf(d.dataset.id) !== -1; });
      offenVorDemDruck = null;
    });
  }
  function alle(offen) {
    stand.auf = offen ? schritte.map(function (s) { return s.id; }) : [];
    document.querySelectorAll(".ip-schritt").forEach(function (d) { d.open = offen; });
    if (offen) stand.auf.forEach(bildLaden);
    zustandMelden();
  }

  // ---------------------------------------------------------------------------
  // ADRESSE – über skr.state. Die Projektart steht darin, die Vergleichs-IDE nicht:
  // Sie gehört dem Leser, nicht dem Verweis. Angemeldet wird nach dem ersten
  // Zeichnen: Der Stand dann ist der Standard.
  // ---------------------------------------------------------------------------
  function anmelden() {
    if (!window.skr || !window.skr.state) return;
    window.skr.state.register({
      key: "art",
      read: function () { return einstellung.art; },
      apply: function (wert) {
        if (!name(arten, String(wert || ""))) return;
        einstellung.art = String(wert);
        zeichnen();
      }
    });
    window.skr.state.register({
      key: "auf",
      read: function () { return stand.auf.join(","); },
      apply: function (wert) {
        stand.auf = String(wert || "").split(",").filter(function (id) {
          return schritte.some(function (s) { return s.id === id; });
        });
        schritteZeichnen();
        if (stand.auf.length) {
          const ziel = document.getElementById("ip-s-" + stand.auf[0]);
          window.requestAnimationFrame(function () { ziel.scrollIntoView({ block: "start", behavior: "instant" }); });
        }
      }
    });
  }

  function start() {
    laden();
    zeichnen();
    verdrahten();
    anmelden();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
