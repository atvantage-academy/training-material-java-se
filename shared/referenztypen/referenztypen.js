(function () {
  "use strict";

  var sim = window.skr.ext.didaktikon.simulation;

  var stackBox = document.getElementById("speicher-stack");
  var heapBox  = document.getElementById("speicher-heap");
  var svg      = document.getElementById("speicher-pfeile");
  var bühne   = document.querySelector(".speicher");

  /* ---------------------------------------------------------------------------
     1) AUSGANGSLAGE + ZEICHNEN
     Der Zustand ist reine Datenhaltung: Was steht im Stack, was liegt im Heap,
     welche Codezeile ist dran. `render` übersetzt ihn ins Bild – und NUR hier
     wird das DOM angefasst.
  --------------------------------------------------------------------------- */
  sim.setup({
    state: function () {
      return { zeile: -1, stack: [], heap: [], liest: null, fehler: false, gc: false, final: false };
    },

    render: function (s, ctx) {
      // Codezeile hervorheben – der Balken liegt hinter dem Text, damit die
      // Syntaxfarben von highlight.js unangetastet bleiben.
      var kid = ctx.scenario;
      zeigeZeile(kid, s.zeile);

      // Stack – Abgleich über den Variablennamen, damit eine bestehende Variable
      // beim Wertwechsel NICHT neu entsteht (sonst gäbe es keinen Übergang).
      sim.list(stackBox, s.stack, {
        animated: ctx.animated,
        key: function (v) { return v.name; },
        create: function () {
          var el = document.createElement("div");
          el.className = "skr-didaktikon-simulation-cell";
          el.innerHTML =
            '<div><span class="skr-didaktikon-simulation-cell__label"></span>' +
            '<span class="skr-didaktikon-simulation-cell__name"></span></div>' +
            '<span class="skr-didaktikon-simulation-cell__value"></span>';
          return el;
        },
        update: function (el, v) {
          el.querySelector(".skr-didaktikon-simulation-cell__label").textContent = v.typ;
          el.querySelector(".skr-didaktikon-simulation-cell__name").textContent = v.name;
          var wert = el.querySelector(".skr-didaktikon-simulation-cell__value");
          // Ein deklariertes, noch nicht zugewiesenes Fach ist nicht „0“ und nicht
          // „null“ – es ist LEER. Genau diese Unterscheidung ist der Grund, warum
          // Deklaration und Zuweisung hier zwei Schritte sind.
          wert.textContent = v.leer ? "–" : v.wert;
          wert.className = "skr-didaktikon-simulation-cell__value" +
            (v.leer ? " speicher__unbelegt"
                    : v.wert === "null" ? " speicher__null"
                    : v.ref ? " speicher__adresse" : "");
          // Der Fehlerzustand BEBT (siehe `.is-error.is-pulse`) – aber nur in dem
          // Schritt, in dem er eintritt, nicht bei jedem erneuten Zeichnen.
          var warFehler = el.classList.contains("is-error");
          var istFehler = s.fehler && v.name === "k1";
          el.classList.toggle("is-error", istFehler);
          if (istFehler && !warFehler && ctx.animated) sim.pulse(el);
          el.classList.toggle("is-active", s.liest === v.name);
          el.id = "speicher-var-" + v.name;
        }
      });

      // Heap
      sim.list(heapBox, s.heap, {
        animated: ctx.animated,
        key: function (o) { return o.id; },
        create: function () {
          var el = document.createElement("div");
          el.className = "speicher__objekt";
          el.innerHTML =
            '<div class="speicher__objekt-kopf"></div>' +
            '<div class="speicher__objekt-attr"><span>standInCent =</span><b></b></div>';
          return el;
        },
        update: function (el, o) {
          el.querySelector(".speicher__objekt-kopf").textContent = o.adresse + " : Konto";
          var wert = el.querySelector(".speicher__objekt-attr b");
          var alt = wert.textContent;
          wert.textContent = String(o.standInCent);
          el.id = "speicher-obj-" + o.id;
          el.classList.toggle("is-unerreichbar", !!o.unerreichbar);
          el.classList.toggle("is-gekehrt", !!o.gekehrt);
          // Der WERTWECHSEL pulsiert – und das Lesen über k1 ebenfalls, denn
          // genau dort ist der Lernmoment: dieselbe Zelle, anderer Weg.
          var anlass = (alt && alt !== wert.textContent) || s.liest;
          if (anlass && ctx.animated) sim.pulse(el);
        }
      });

      document.getElementById("speicher-stack-leer").hidden = s.stack.length > 0;
      document.getElementById("speicher-heap-leer").hidden = s.heap.length > 0;

      // Der Reinigungsmann wird bei jedem Betreten des Schrittes NEU eingehängt –
      // sonst liefe seine Animation beim Zurück- und Wiedervorgehen nicht erneut.
      document.getElementById("speicher-final").hidden = !s.final;

      var gc = document.getElementById("speicher-gc");
      gc.hidden = !s.gc;
      if (s.gc && ctx.animated) {
        gc.style.animation = "none";
        void gc.offsetWidth;
        gc.style.animation = "";
      }

      // Pfeile zuletzt – sie brauchen die Maße der eben gesetzten Kästen.
      // Kein `requestAnimationFrame` nötig: `getBoundingClientRect()` erzwingt
      // das Layout selbst. Über rAF gezeichnet bliebe der Pfeil stehen, wenn der
      // Browser gerade keine Frames liefert (Hintergrund-Tab, Aufzeichnung).
      pfeile(s, ctx.animated);
    }
  });

  /* ---------------------------------------------------------------------------
     2) PFEILE – Stack-Variable zeigt auf Heap-Objekt
     Sie liegen als eigene SVG-Fläche über der Bühne und werden nach jedem Schritt
     sowie bei jeder Größenänderung neu berechnet.
  --------------------------------------------------------------------------- */
  var letzterStand = null;

  function pfeile(s, animiert) {
    letzterStand = s;
    svg.querySelectorAll(".speicher__pfeil").forEach(function (p) { p.remove(); });
    var rahmen = bühne.getBoundingClientRect();
    var spur = 0;   // je Pfeil eine eigene Höhe für das Zwischenstück

    s.stack.forEach(function (v) {
      if (!v.ziel) return;
      var von = document.getElementById("speicher-var-" + v.name);
      var nach = document.getElementById("speicher-obj-" + v.ziel);
      if (!von || !nach) return;

      var a = von.getBoundingClientRect();
      var b = nach.getBoundingClientRect();
      var tafel = von.closest(".skr-didaktikon-simulation-panel").getBoundingClientRect();

      // Der Pfeil verlässt die Zelle LINKS und läuft in einer Gasse NEBEN der
      // Tafel hinunter – nicht durch sie hindurch. Innen käme er quer über die
      // Variablen, die zwischen Start und Heap liegen.
      var x1 = a.left - rahmen.left;
      var y1 = a.top + a.height / 2 - rahmen.top;
      // Eigene Gasse je Pfeil, sonst lägen k1 und k2 exakt übereinander.
      var gasse = tafel.left - rahmen.left - 14 - spur * 20;
      // Eintritt links am Objekt, auf verschiedenen Höhen – zwei Wegweiser auf
      // dasselbe Objekt sollen beide sichtbar ankommen.
      var x2 = b.left - rahmen.left - 5;
      var y2 = b.top - rahmen.top + b.height * (0.3 + spur * 0.42);

      var pfad = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pfad.setAttribute("d", eckig([[x1, y1], [gasse, y1], [gasse, y2], [x2, y2]], 10));
            pfad.setAttribute("class", "speicher__pfeil" + (animiert ? " is-new" : ""));
      svg.appendChild(pfad);
    });
  }

  /* Rechtwinklige Route mit abgerundeten Ecken.
     BEWUSST keine einzelne Bézierkurve: Die käme schräg am Ziel an, während die
     Pfeilspitze immer in Richtung der ENDTANGENTE steht – genau daraus entsteht
     der Eindruck, die Linie komme neben der Spitze an. Ein gerades Schlussstück
     löst das. */
  function eckig(punkte, radius) {
    var d = "M " + punkte[0][0] + " " + punkte[0][1];
    for (var i = 1; i < punkte.length - 1; i++) {
      var vor = punkte[i - 1], ecke = punkte[i], nach = punkte[i + 1];
      var r = Math.min(radius, länge(vor, ecke) / 2, länge(ecke, nach) / 2);
      var a = weg(ecke, vor, r);      // r weit von der Ecke Richtung Vorgänger
      var b = weg(ecke, nach, r);     // r weit von der Ecke Richtung Nachfolger
      d += " L " + a[0] + " " + a[1] +
           " Q " + ecke[0] + " " + ecke[1] + ", " + b[0] + " " + b[1];
    }
    var letzter = punkte[punkte.length - 1];
    return d + " L " + letzter[0] + " " + letzter[1];
  }

  function länge(p, q) { return Math.hypot(q[0] - p[0], q[1] - p[1]); }

  function weg(von, zu, r) {
    var l = länge(von, zu) || 1;
    return [von[0] + (zu[0] - von[0]) / l * r, von[1] + (zu[1] - von[1]) / l * r];
  }

  window.addEventListener("resize", function () {
    if (letzterStand) pfeile(letzterStand, false);
  });

  /* ---------------------------------------------------------------------------
     3) DIE SCHRITTE
     Jedes `apply` beschreibt NUR den Zustand – es läuft beim Zurückspringen
     erneut und darf deshalb nichts anderes tun.
  --------------------------------------------------------------------------- */
  sim.registerScenario({
    id: "abgrenzung",
    title: "Abgrenzung zu primitiven Datentypen",
    description: "Was beim Kopieren passiert – bei einem <code>int</code> und bei einem Objekt. " +
                  "Bis hin zur NullPointerException und dem Garbage Collector.",
    steps: [
    {
      title: "Zwei Lager",
      text: "<p>Java verwahrt Daten an <b>zwei</b> Orten. Im <b>Thread Stack</b> liegen die " +
            "Variablen selbst – ein Fach je Name. Im <b>Heap</b> darunter liegen die Objekte.</p>" +
            "<p><b>Jeder Thread hat seinen eigenen Stack</b> – die blassen Kästen oben sind die " +
            "der anderen. Der Heap dagegen gehört ihnen allen gemeinsam. Genau daher rührt " +
            "später die halbe Nebenläufigkeits-Problematik.</p>" +
            "<p>Wir gehen den Quelltext links Zeile für Zeile durch – im Thread „main“.</p>",
      apply: function () { /* Ausgangslage */ }
    },

    /* --- Primitive Typen --------------------------------------------------- */
    {
      title: "int kontostand;",
      text: "<p>Die <b>Deklaration</b> schafft nur das <b>Fach</b>: ein Platz im Stack, " +
            "beschriftet mit <code>kontostand</code>, groß genug für ein <code>int</code>.</p>" +
            "<p>Drin ist noch nichts. Nicht <code>0</code>, nicht <code>null</code> – " +
            "<b>nichts</b>. Java lässt Dich aus so einem Fach auch nicht lesen.</p>",
      apply: function (s) {
        s.zeile = 0;
        s.stack.push({ name: "kontostand", typ: "int", wert: "", leer: true });
      }
    },
    {
      title: "kontostand = 10;",
      text: "<p>Jetzt die <b>Zuweisung</b>: Der Wert <code>10</code> landet <b>direkt im Fach</b>. " +
            "Kein Objekt, kein Umweg.</p>" +
            "<p>Zwei Zeilen, zwei Vorgänge – meist schreibt man sie zusammen, aber es " +
            "bleiben zwei.</p>",
      apply: function (s) {
        s.zeile = 1;
        finde(s.stack, "kontostand").wert = "10";
        finde(s.stack, "kontostand").leer = false;
      }
    },
    {
      title: "int kopie;",
      text: "<p>Ein <b>eigenes, zweites Fach</b> entsteht – wieder leer. Mit " +
            "<code>kontostand</code> hat es bis hierher nichts zu tun.</p>",
      apply: function (s) {
        s.zeile = 2;
        s.stack.push({ name: "kopie", typ: "int", wert: "", leer: true });
      }
    },
    {
      title: "kopie = kontostand;",
      text: "<p>Rechts steht ein Fach – gelesen wird sein <b>Inhalt</b>, also <code>10</code>. " +
            "Diese <code>10</code> wird ins linke Fach <b>kopiert</b>.</p>" +
            "<p>Zwei Fächer, zwei Zehnen. Keine Verbindung.</p>",
      apply: function (s) {
        s.zeile = 3;
        finde(s.stack, "kopie").wert = "10";
        finde(s.stack, "kopie").leer = false;
      }
    },
    {
      title: "kopie = 20;",
      text: "<p>Nur <code>kopie</code> ändert sich. <code>kontostand</code> bleibt bei <code>10</code>.</p>" +
            "<p><b>Merke:</b> Bei primitiven Typen wird der Wert kopiert – nichts bleibt verbunden.</p>",
      apply: function (s) {
        s.zeile = 4;
        finde(s.stack, "kopie").wert = "20";
      }
    },

    /* --- Referenztypen ----------------------------------------------------- */
    {
      title: "Konto k1;",
      text: "<p>Auch hier zuerst nur das <b>Fach</b> – und zwar eines im Stack, nicht im Heap. " +
            "Es ist nicht groß genug für ein Konto, sondern nur für eine <b>Adresse</b>.</p>" +
            "<p><code>new</code> stand hier noch nirgends: Es gibt <b>kein Objekt</b>.</p>",
      apply: function (s) {
        s.zeile = 5;
        s.stack.push({ name: "k1", typ: "Konto", wert: "", leer: true, ref: true });
      }
    },
    {
      title: "k1 = new Konto(100);",
      text: "<p>Zwei Dinge auf einmal: <code>new</code> legt das <b>Objekt im Heap</b> an – " +
            "und liefert dessen <b>Adresse</b> <code>#A1</code> zurück. Die wird ins Fach " +
            "von <code>k1</code> geschrieben.</p>" +
            "<p>Das Konto liegt unten. Oben steht nur der Wegweiser.</p>",
      apply: function (s) {
        s.zeile = 6;
        s.heap.push({ id: "h1", adresse: "#A1", standInCent: 100 });
        var k1 = finde(s.stack, "k1");
        k1.wert = "#A1"; k1.leer = false; k1.ziel = "h1";
      }
    },
    {
      title: "Konto k2;",
      text: "<p>Ein zweites Adressfach – leer. Noch zeigt es nirgendwohin.</p>",
      apply: function (s) {
        s.zeile = 7;
        s.stack.push({ name: "k2", typ: "Konto", wert: "", leer: true, ref: true });
      }
    },
    {
      title: "k2 = k1;",
      text: "<p>Dieselbe Regel wie oben: Kopiert wird der <b>Inhalt des Fachs</b> – und der ist " +
            "hier eine Adresse.</p>" +
            "<p>Es entsteht <b>kein zweites Konto</b>. Zwei Wegweiser, ein Ziel.</p>",
      apply: function (s) {
        s.zeile = 8;
        var k2 = finde(s.stack, "k2");
        k2.wert = "#A1"; k2.leer = false; k2.ziel = "h1";
      }
    },
    {
      title: "k2.standInCent = 500;",
      text: "<p>Der Punkt folgt dem Wegweiser nach unten in den Heap und ändert <b>dort</b> " +
            "den Wert.</p>" +
            "<p>Und <code>k1</code>? Zeigt auf dasselbe Objekt – sieht die 500 also auch. " +
            "Das ist der Unterschied, der in echtem Code Fehler kostet.</p>",
      apply: function (s) {
        s.zeile = 9;
        s.heap.filter(function (o) { return o.id === "h1"; })[0].standInCent = 500;
      }
    },
    {
      title: "print(k1.standInCent);",
      text: "<p>Gelesen wird über <code>k1</code> – und heraus kommt <b>500</b>, nicht 100.</p>" +
            "<p><code>k1</code> wurde nie angefasst. Geändert hat jemand über <code>k2</code>. " +
            "Beide Wege führen zu <b>demselben</b> Objekt, und ein Objekt hat nur einen " +
            "Zustand.</p>" +
            "<p>Genau hier entstehen die Fehler, die man beim Lesen des Codes nicht sieht: " +
            "Die Änderung steht woanders.</p>",
      apply: function (s) {
        s.zeile = 10;
        s.liest = "k1";
      },
      duration: 4000
    },
    {
      title: "k1 = null;",
      text: "<p>Nur der <b>Wegweiser</b> wird gelöscht, nicht das Objekt. Es lebt weiter, " +
            "solange <code>k2</code> darauf zeigt.</p>" +
            "<p><code>null</code> ist übrigens etwas anderes als das leere Fach vom Anfang: " +
            "Hier steht bewusst „nirgendwohin“ drin.</p>",
      apply: function (s) {
        s.zeile = 11;
        s.liest = null;          // die Hervorhebung des Leseschritts endet hier
        var k1 = finde(s.stack, "k1");
        k1.wert = "null";
        k1.ziel = null;
      }
    },
    {
      title: "k1.standInCent = 1000; 💥",
      text: "<p>Dem Wegweiser folgen, der auf <b>nichts</b> zeigt – das geht nicht: " +
            "<b>NullPointerException</b>.</p>" +
            "<p>Nicht das Objekt ist weg. Der <b>Weg dorthin</b> ist weg.</p>",
      apply: function (s) {
        s.zeile = 12;
        s.fehler = true;
      },
      duration: 4200
    },
    {
      title: "k2 = null;",
      text: "<p>Nehmen wir an, die Exception war abgefangen – das Programm läuft weiter. " +
            "Jetzt wird auch der letzte Wegweiser gelöscht.</p>" +
            "<p>Das Objekt ist noch <b>da</b> – aber <b>unerreichbar</b>: Kein Fach in " +
            "keinem Stack enthält seine Adresse mehr. Niemand kommt je wieder hin.</p>",
      apply: function (s) {
        s.zeile = 13;
        s.fehler = false;
        finde(s.stack, "k2").wert = "null";
        finde(s.stack, "k2").ziel = null;
        s.heap[0].unerreichbar = true;
      }
    },
    {
      title: "Irgendwann kommt der Garbage Collector",
      text: "<p>Speicher freigeben musst Du in Java nicht. Das erledigt der " +
            "<b>Garbage Collector</b>: Er sucht, was nicht mehr erreichbar ist, und " +
            "kehrt es weg.</p>" +
            "<p><b>Im Hintergrund und irgendwann</b> – nicht in dem Moment, in dem die " +
            "letzte Referenz fällt. Zwischen „unerreichbar“ und „weg“ liegt eine " +
            "unbestimmte Zeit, auf die Du keinen Einfluss hast.</p>" +
            "<p>Deshalb: <code>null</code> zu setzen gibt nichts frei. Es nimmt nur " +
            "den letzten Weg zum Objekt weg – den Rest macht er.</p>",
      apply: function (s) {
        s.zeile = 13;
        s.gc = true;
        s.heap[0].unerreichbar = true;
        s.heap[0].gekehrt = true;
      },
      duration: 6000
    },
    {
      title: "Zum Mitnehmen",
      text: "<p>Bei primitiven Typen ist der Inhalt des Fachs der <b>Wert</b> – die " +
            "Kopie ist eigenständig. Bei Objekten ist es die <b>Adresse</b> – die " +
            "Kopie führt zum selben Objekt.</p>" +
            "<p>Und ein Objekt lebt genau so lange, wie noch <b>irgendein</b> Fach " +
            "seine Adresse kennt.</p>",
      apply: function (s) {
        s.zeile = 13;
        s.heap.length = 0;      // aufgeräumt
        s.gc = false;           // der Reinigungsmann ist wieder weg
        s.final = true;         // die Merksätze treten nach vorn
      }
    }
    ]
  });

  /* ===========================================================================
     GEMEINSAMES FÜR DIE SZENARIEN 2–4
     Alle drei zeigen dasselbe Bild: Quelltext, ein Thread Stack, ein Heap mit
     Objektkarten und Pfeilen dazwischen. Deshalb EIN Zeichner statt drei –
     unterschieden wird nur über die Kennung des Szenarios (`ctx.scenario`).
     =========================================================================== */
  function el(id) { return document.getElementById(id); }

  /* Die laufende Codezeile. Ein Szenario kann MEHRERE Codeblöcke haben (etwa
     „Primitive Typen“ und „Referenztypen“ untereinander); die Schrittnummer zählt
     durchgehend über alle. Deshalb wird sie hier auf den passenden Block und
     dessen eigene Zeilennummer heruntergerechnet. */
  function zeigeZeile(kid, n) {
    // `data-kontext` markiert Blöcke, die NICHT durchlaufen werden – etwa eine
    // Klassendefinition, die als Kulisse danebensteht. Sie zählen auch nicht mit,
    // sonst verschöbe sich die Nummerierung des Ablaufs.
    var blöcke = document.querySelectorAll(
      '[data-skr-didaktikon-simulation-scene="' + kid + '"] .skr-didaktikon-simulation-code:not([data-kontext])');
    var rest = (n === null || n === undefined || n < 0) ? -1 : n;
    Array.prototype.forEach.call(blöcke, function (block) {
      var code = block.querySelector("code");
      var anzahl = code ? code.textContent.replace(/\n$/, "").split("\n").length : 0;
      if (rest >= 0 && rest < anzahl) {
        sim.codeLine(block, rest);
        rest = -1;              // verbraucht – die übrigen Blöcke bleiben leer
      } else {
        sim.codeLine(block, null);
        if (rest >= 0) rest -= anzahl;
      }
    });
  }

  /* Eine Objektkarte im Objektdiagramm-Stil: „#A1 : Konto“, darunter je Attribut
     eine Zeile. Attribute, die auf ein anderes Objekt zeigen, bekommen eine
     eigene id – daran hängt später der Pfeil. */
  function objektKarte() {
    var k = document.createElement("div");
    k.className = "speicher__objekt";
    k.innerHTML = '<div class="speicher__objekt-kopf"></div><div class="speicher__objekt-felder"></div>';
    return k;
  }

  function objektFüllen(k, o, kid) {
    k.querySelector(".speicher__objekt-kopf").textContent = o.adresse + " : " + o.klasse;
    var felder = k.querySelector(".speicher__objekt-felder");
    var alt = felder.textContent;
    felder.textContent = "";
    (o.felder || []).forEach(function (f) {
      var z = document.createElement("div");
      z.className = "speicher__objekt-attr";
      z.id = kid + "-attr-" + o.id + "-" + f.name;
      var name = document.createElement("span");
      name.textContent = f.name + " =";
      var wert = document.createElement("b");
      wert.textContent = f.wert;
      if (f.ref) wert.className = "speicher__adresse";
      if (f.wert === "null") wert.className = "speicher__null";
      z.appendChild(name);
      z.appendChild(wert);
      felder.appendChild(z);
    });
    k.id = kid + "-obj-" + o.id;
    // NUR eine echte Änderung meldet „geändert“. Bei einer frisch entstandenen
    // Karte war `alt` leer – die meldete sonst ebenfalls eine Änderung und
    // pulsierte zusätzlich zu ihrer Einblend-Animation: zwei Anstöße
    // hintereinander, die wie ein Ruckeln aussehen.
    return alt !== "" && alt !== felder.textContent;
  }

  /* Pfeile einer Szene neu zeichnen. `verbindungen` sind Paare von Element-IDs;
     die Route läuft links an den Tafeln vorbei (siehe Szenario 1). */
  function pfeileZeichnen(kid, verbindungen, animiert) {
    var svg = el(kid + "-pfeile");
    var bühne = svg && svg.parentNode;
    if (!svg || !bühne) return;
    svg.querySelectorAll(".speicher__pfeil").forEach(function (p) { p.remove(); });
    var rahmen = bühne.getBoundingClientRect();
    verbindungen.forEach(function (v, spur) {
      var von = el(v.von), nach = el(v.nach);
      if (!von || !nach) return;
      var a = von.getBoundingClientRect();
      var b = nach.getBoundingClientRect();
      var tafelVon  = von.closest(".skr-didaktikon-simulation-panel").getBoundingClientRect();
      var tafelNach = nach.closest(".skr-didaktikon-simulation-panel").getBoundingClientRect();
      var y1 = a.top + a.height / 2 - rahmen.top;

      var x1, gasse, x2, y2;
      var gleicheTafel = tafelVon.left === tafelNach.left && tafelVon.top === tafelNach.top;

      if (gleicheTafel) {
        /* Beide in DERSELBEN Tafel – etwa zwei Objekte im Heap nebeneinander.
           Dann läuft der Pfeil durch die Lücke ZWISCHEN ihnen und kommt auf der
           Seite an, die dem Start zugewandt ist. Träte er stur links ein, liefe
           er quer durch das Zielobjekt hindurch. */
        var linksHin = b.left < a.left;
        x1 = (linksHin ? a.left : a.right) - rahmen.left;
        x2 = (linksHin ? b.right + 5 : b.left - 5) - rahmen.left;
        // Die Gasse liegt mittig zwischen den beiden Kästen.
        var innen = linksHin ? (b.right + a.left) / 2 : (a.right + b.left) / 2;
        gasse = innen - rahmen.left + spur * 10;
        y2 = b.top - rahmen.top + b.height * (0.3 + spur * 0.25);
        var pfadQuer = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pfadQuer.setAttribute("d", eckig([[x1, y1], [gasse, y1], [gasse, y2], [x2, y2]], 10));
        pfadQuer.setAttribute("class", "speicher__pfeil" + (animiert ? " is-new" : ""));
        svg.appendChild(pfadQuer);
        return;
      }

      /* Verschiedene Tafeln (Stack oben, Heap unten): NEBEN der Quelltafel
         hinunter, oberhalb der Zieltafel herüber und von OBEN ins Objekt.
         Von links einzutreten hieße, quer durch alle Objekte zu laufen, die
         weiter links im Heap stehen. */
      x1 = a.left - rahmen.left;
      gasse = tafelVon.left - rahmen.left - 14 - spur * 20;
      var quer = tafelNach.top - rahmen.top - 14 - spur * 12;
      x2 = b.left + b.width / 2 - rahmen.left;
      y2 = b.top - rahmen.top - 4;

      var pfad = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pfad.setAttribute("d", eckig([[x1, y1], [gasse, y1], [gasse, quer], [x2, quer], [x2, y2]], 10));
      pfad.setAttribute("class", "speicher__pfeil" + (animiert ? " is-new" : ""));
      svg.appendChild(pfad);
    });
  }

  /* Der gemeinsame Zeichner. Der Zustand ist überall gleich aufgebaut:
     { zeile, stack: [], heap: [], pfeile: [], ergebnis: null }. */
  function zeichneSzene(s, ctx) {
    var kid = ctx.scenario;

    zeigeZeile(kid, s.zeile);

    sim.list(el(kid + "-stack"), s.stack, {
      animated: ctx.animated,
      key: function (v) { return v.name; },
      create: function () {
        var c = document.createElement("div");
        c.className = "skr-didaktikon-simulation-cell";
        c.innerHTML = '<div><span class="skr-didaktikon-simulation-cell__label"></span>' +
                      '<span class="skr-didaktikon-simulation-cell__name"></span></div>' +
                      '<span class="skr-didaktikon-simulation-cell__value"></span>';
        return c;
      },
      update: function (c, v) {
        c.querySelector(".skr-didaktikon-simulation-cell__label").textContent = v.typ;
        c.querySelector(".skr-didaktikon-simulation-cell__name").textContent = v.name;
        var w = c.querySelector(".skr-didaktikon-simulation-cell__value");
        w.textContent = v.leer ? "–" : v.wert;
        w.className = "skr-didaktikon-simulation-cell__value" +
          (v.leer ? " speicher__unbelegt" : v.ref ? " speicher__adresse" : "");
        c.classList.toggle("is-active", s.betont === v.name);
        c.id = kid + "-var-" + v.name;
      }
    });

    sim.list(el(kid + "-heap"), s.heap, {
      animated: ctx.animated,
      key: function (o) { return o.id; },
      create: objektKarte,
      update: function (k, o) {
        var geändert = objektFüllen(k, o, kid);
        k.classList.toggle("is-active", s.betont === o.id);
        if (o.spalte !== undefined) k.style.order = o.spalte;
        if (geändert && ctx.animated) sim.pulse(k);
      }
    });

    // Metaspace – nur „this und static“ hat diese Tafel.
    var metaBox = el(kid + "-meta");
    if (metaBox) {
      sim.list(metaBox, s.meta || [], {
        animated: ctx.animated,
        key: function (k) { return k.id; },
        create: function () {
          var n = document.createElement("div");
          n.className = "speicher__objekt is-klasse";
          n.innerHTML = '<div class="speicher__objekt-kopf"></div><div class="speicher__objekt-felder"></div>';
          return n;
        },
        update: function (n, k) {
          n.querySelector(".speicher__objekt-kopf").textContent = "class " + k.name;
          var felder = n.querySelector(".speicher__objekt-felder");
          felder.textContent = "";
          (k.member || []).forEach(function (m) {
            var z = document.createElement("div");
            z.className = "speicher__objekt-attr";
            var a = document.createElement("span");
            a.textContent = m;
            z.appendChild(a);
            felder.appendChild(z);
          });
          n.id = kid + "-klasse-" + k.id;
          n.classList.toggle("is-active", s.betont === "klasse:" + k.id);
        }
      });
    }

    // Schlussbild mit den Merksätzen – wie in Szenario 1.
    var fin = el(kid + "-final");
    if (fin) fin.hidden = !s.final;

    el(kid + "-stack-leer").hidden = s.stack.length > 0;
    el(kid + "-heap-leer").hidden = s.heap.length > 0;

    var erg = el(kid + "-ergebnis");
    if (erg) {
      erg.textContent = "";
      // Das Ergebnis gehört an den CODE, nicht in den Heap: Es ist die Antwort auf
      // die Zeile, die gerade läuft – kein Objekt im Speicher.
      erg.hidden = !(s.ergebnis && s.ergebnis.length);
      (s.ergebnis || []).forEach(function (e) {
        var d = document.createElement("div");
        // Wahrheitswerte werden eingefärbt (grün/rot), alles andere bleibt neutral –
        // eine Zahl ist weder richtig noch falsch.
        var boolesch = typeof e.wert === "boolean";
        d.className = "szene__ergebnis" + (boolesch ? (e.wert ? " is-wahr" : " is-falsch") : "");
        d.innerHTML = "<span></span><b></b>";
        d.querySelector("span").textContent = e.ausdruck;
        d.querySelector("b").textContent = boolesch ? (e.wert ? "true" : "false") : String(e.wert);
        erg.appendChild(d);
        if (ctx.animated) d.classList.add("is-new");
      });
    }

    pfeileZeichnen(kid, s.pfeile || [], ctx.animated);
  }

  function leereSzene() {
    return { zeile: -1, stack: [], heap: [], meta: [], pfeile: [], ergebnis: [],
             betont: null, final: false };
  }

  /* ---------------------------------------------------------------------------
     SZENARIO 2 – Objektgeflecht
     Ein Schritt = genau EINE Codezeile. Zwei Zeilen auf einmal lassen die
     Lernenden raten, welche von beiden den Effekt hatte.
     --------------------------------------------------------------------------- */
  sim.registerScenario({
    id: "objektgeflecht",
    title: "Objektgeflecht",
    description: "Zwei Konten, eine Kundin: Aus dem Klassendiagramm (Baupläne) wird " +
                  "zur Laufzeit ein Geflecht aus konkreten Objekten.",
    state: leereSzene,
    render: zeichneSzene,
    steps: [
      {
        title: "Baupläne und Dinge",
        text: "<p>Das Klassendiagramm zeigt <b>Baupläne</b>: eine Klasse <code>Konto</code>, " +
              "eine Klasse <code>Kunde</code>, dazwischen eine Linie.</p>" +
              "<p>Zur Laufzeit entsteht daraus etwas anderes: <b>konkrete Objekte</b>, " +
              "und aus der Linie werden Pfeile. Sehen wir zu.</p>",
        apply: function () {}
      },
      {
        title: "Kunde anna = new Kunde();",
        text: "<p>Ein Kundenobjekt entsteht im Heap. Die Felder sind noch leer – " +
              "<code>null</code>, weil es Referenzen auf <code>String</code>-Objekte sind.</p>",
        apply: function (s) {
          s.zeile = 0;
          s.heap.push({ id: "anna", adresse: "#K1", klasse: "Kunde", spalte: 0,
                        felder: [{ name: "name", wert: "null" }, { name: "wohnort", wert: "null" }] });
          s.stack.push({ name: "anna", typ: "Kunde", wert: "#K1", ref: true });
        }
      },
      {
        title: "anna.name = \"Anna Berger\";",
        text: "<p>Der Punkt folgt dem Wegweiser: Geschrieben wird <b>im Heap</b>, am Objekt.</p>",
        apply: function (s) {
          s.zeile = 1;
          s.heap[0].felder[0] = { name: "name", wert: "\"Anna Berger\"" };
        }
      },
      {
        title: "anna.wohnort = \"Bremen\";",
        text: "<p>Dasselbe für das zweite Feld. Im Stack steht weiterhin nur die " +
              "Adresse – dort ändert sich nichts.</p>",
        apply: function (s) {
          s.zeile = 2;
          s.heap[0].felder[0] = { name: "name", wert: "\"Anna Berger\"" };
          s.heap[0].felder[1] = { name: "wohnort", wert: "\"Bremen\"" };
        }
      },
      {
        title: "Konto giro = new Konto();",
        text: "<p>Ein Konto entsteht – noch ohne Inhaberin. Das Feld <code>inhaber</code> " +
              "ist <code>null</code>: Es <b>zeigt auf nichts</b>.</p>",
        apply: function (s) {
          s.zeile = 3;
          s.heap[0].felder[0] = { name: "name", wert: "\"Anna Berger\"" };
          s.heap[0].felder[1] = { name: "wohnort", wert: "\"Bremen\"" };
          s.heap.push({ id: "giro", adresse: "#A1", klasse: "Konto", spalte: -1,
                        felder: [{ name: "standInCent", wert: "0" }, { name: "inhaber", wert: "null" }] });
          s.stack.push({ name: "giro", typ: "Konto", wert: "#A1", ref: true });
        }
      },
      {
        title: "giro.inhaber = anna;",
        text: "<p>Jetzt die Linie aus dem Klassendiagramm – als <b>Pfeil zwischen zwei " +
              "Objekten</b>. Das Konto hält kein Wort, sondern das Kundenobjekt selbst.</p>",
        apply: function (s) {
          s.zeile = 4;
          s.heap[1].felder[1] = { name: "inhaber", wert: "#K1", ref: true };
          s.pfeile.push({ von: "objektgeflecht-attr-giro-inhaber", nach: "objektgeflecht-obj-anna" });
        }
      },
      {
        title: "Konto spar = new Konto();",
        text: "<p>Ein zweites Konto – wieder ohne Inhaberin.</p>",
        apply: function (s) {
          s.zeile = 5;
          s.heap.push({ id: "spar", adresse: "#A2", klasse: "Konto", spalte: 1,
                        felder: [{ name: "standInCent", wert: "0" }, { name: "inhaber", wert: "null" }] });
          s.stack.push({ name: "spar", typ: "Konto", wert: "#A2", ref: true });
        }
      },
      {
        title: "spar.inhaber = anna;",
        text: "<p>Dasselbe Objekt ein zweites Mal – <b>kein weiteres <code>new Kunde()</code></b>. " +
              "Es gibt genau eine Anna, und zwei Konten führen zu ihr.</p>",
        apply: function (s) {
          s.zeile = 6;
          s.heap[2].felder[1] = { name: "inhaber", wert: "#K1", ref: true };
          s.pfeile.push({ von: "objektgeflecht-attr-spar-inhaber", nach: "objektgeflecht-obj-anna" });
        }
      },
      {
        title: "anna.wohnort = \"Hamburg\";",
        text: "<p>Anna zieht um. Geändert wird <b>ein</b> Objekt – und <b>beide</b> Konten " +
              "sehen den neuen Wohnort, weil beide Pfeile dorthin führen.</p>" +
              "<p>Ein kopierter Name wäre jetzt an einer Stelle veraltet. Genau davor " +
              "schützt die Referenz.</p>",
        apply: function (s) {
          s.zeile = 7;
          s.heap[0].felder[1] = { name: "wohnort", wert: "\"Hamburg\"" };
          s.betont = "anna";
        },
        duration: 4200
      },
      {
        title: "print(spar.inhaber.wohnort);",
        text: "<p>Der Punkt läuft <b>am Pfeil entlang</b>: <code>spar</code> führt zum " +
              "Kontoobjekt, <code>.inhaber</code> von dort zum Kundenobjekt, " +
              "<code>.wohnort</code> liest dessen Feld.</p>" +
              "<p>Zwei Punkte, zwei Schritte durch den Heap – <b>Chaining</b>. Nichts " +
              "davon ist eine Kopie; jeder Punkt ist ein Weg.</p>" +
              "<p>Heraus kommt <b>Hamburg</b>, obwohl <code>spar</code> nie etwas von " +
              "einem Umzug erfahren hat.</p>",
        apply: function (s) {
          s.zeile = 8;
          s.heap[0].felder[1] = { name: "wohnort", wert: "\"Hamburg\"" };
          s.betont = "anna";
          s.ergebnis = [{ ausdruck: "spar.inhaber.wohnort", wert: "\"Hamburg\"" }];
        },
        duration: 4600
      },
      {
        title: "Der Merksatz",
        text: "<p><b>Eine Referenz ist kein Abzug, sondern der Weg zum Original.</b></p>" +
              "<p>Genau dafür steht die Linie im Klassendiagramm – und deshalb lässt " +
              "sie sich mit dem Punkt entlanglaufen.</p>",
        apply: function (s) {
          s.zeile = 8;
          s.heap[0].felder[1] = { name: "wohnort", wert: "\"Hamburg\"" };
          s.ergebnis = [{ ausdruck: "spar.inhaber.wohnort", wert: "\"Hamburg\"" }];
          s.final = true;
        }
      }
    ]
  });

  /* ---------------------------------------------------------------------------
     SZENARIO 3 – Das Gleiche oder dasselbe
     --------------------------------------------------------------------------- */
  sim.registerScenario({
    id: "identitaet",
    title: "Das Gleiche oder dasselbe",
    description: "Zwei Objekte mit gleichem Inhalt sind noch lange nicht dasselbe " +
                  "Objekt. <code>==</code> fragt nach der Identität, <code>equals</code> " +
                  "nach der logischen Gleichheit – die jede Klasse selbst festlegt.",
    state: leereSzene,
    render: zeichneSzene,
    steps: [
      {
        title: "Das gleiche Auto – oder dasselbe?",
        text: "<p>Peter und Claudia haben beide ein grünes Auto. Sie fahren " +
              "<b>das gleiche</b> Auto.</p>" +
              "<p>Peter und Claudia haben ein Auto. Oder haben Peter und Claudia " +
              "<b>EIN</b> Auto? Dann fahren sie <b>dasselbe</b> … 😵‍💫</p>" +
              "<p>Zwei Fragen, die im Alltag munter durcheinandergehen. Java trennt sie " +
              "sauber – mit <code>==</code> und <code>equals</code>.</p>",
        apply: function () {}
      },
      {
        title: "Kunde a = new Kunde();",
        text: "<p>Ein Objekt im Heap, ein Wegweiser im Stack. Nichts Neues.</p>",
        apply: function (s) {
          s.zeile = 0;
          s.heap.push({ id: "a", adresse: "#K1", klasse: "Kunde",
                        felder: [{ name: "name", wert: "null" }] });
          s.stack.push({ name: "a", typ: "Kunde", wert: "#K1", ref: true });
        }
      },
      {
        title: "a.name = \"Anna Berger\";",
        text: "<p>Das Feld wird gefüllt – im Heap, am Objekt.</p>",
        apply: function (s) {
          s.zeile = 1;
          s.heap[0].felder[0] = { name: "name", wert: "\"Anna Berger\"" };
        }
      },
      {
        title: "Kunde b = new Kunde();",
        text: "<p>Ein <b>zweites <code>new</code></b> – und jedes <code>new</code> legt " +
              "ein eigenes Objekt an, an einer eigenen Adresse.</p>",
        apply: function (s) {
          s.zeile = 2;
          s.heap.push({ id: "b", adresse: "#K2", klasse: "Kunde",
                        felder: [{ name: "name", wert: "null" }] });
          s.stack.push({ name: "b", typ: "Kunde", wert: "#K2", ref: true });
        }
      },
      {
        title: "b.name = \"Anna Berger\";",
        text: "<p>Gleicher Name, zweites Objekt. Zwei Kästen im Heap mit demselben Inhalt " +
              "– aber an zwei Adressen.</p>",
        apply: function (s) {
          s.zeile = 3;
          s.heap[1].felder[0] = { name: "name", wert: "\"Anna Berger\"" };
        }
      },
      {
        title: "print(a == b);",
        text: "<p><code>==</code> vergleicht, was <b>in den Fächern steht</b> – also die " +
              "Adressen: <code>#K1</code> gegen <code>#K2</code>.</p>" +
              "<p><b>false.</b> Die Frage war „dasselbe Objekt?“, und die Antwort ist nein.</p>",
        apply: function (s) {
          s.zeile = 4;
          s.ergebnis = [{ ausdruck: "a == b", wert: false }];
        }
      },
      {
        title: "print(a.equals(b));",
        text: "<p><b>true</b> – hier geht es nicht mehr um die Adresse, sondern um den " +
              "<b>Inhalt</b>: Beide Objekte tragen denselben Namen.</p>" +
              "<p>Das nennt man <b>logische Gleichheit</b>, und was sie bedeutet, legt " +
              "<b>jede Klasse selbst fest</b>: Bei <code>Kunde</code> mag der Name " +
              "genügen, bei einem Konto wäre es die Kontonummer, bei einer Adresse " +
              "vielleicht Straße und Ort.</p>" +
              "<p>Und genau deshalb: <b>Diese Antwort gibt es nicht geschenkt.</b> " +
              "<code>equals</code> muss in <code>Kunde</code> geschrieben sein – sonst " +
              "beantwortet der Aufruf dieselbe Frage wie <code>==</code>.</p>",
        apply: function (s) {
          s.zeile = 5;
          s.ergebnis = [{ ausdruck: "a == b", wert: false },
                        { ausdruck: "a.equals(b)", wert: true }];
        },
        duration: 4600
      },
      {
        title: "Der Merksatz",
        text: "<p><b><code>==</code> fragt nach dem Objekt, <code>equals</code> nach dem " +
              "Inhalt.</b></p>" +
              "<p>Bei Objekten willst Du fast immer <code>equals</code> – und musst es in " +
              "Deinen eigenen Klassen schreiben, denn nur Du weißt, wann zwei davon als " +
              "gleich gelten sollen.</p>" +
              "<p>Bei primitiven Typen gibt es die Frage gar nicht – dort steht der Wert " +
              "ja selbst im Fach.</p>" +
              "<p><b>Und das betrifft mehr, als man denkt:</b> Auch <code>String</code> " +
              "und Arrays sind Objekte. Für sie gilt alles von dieser Bühne – " +
              "Wegweiser statt Wert, <code>==</code> gegen <code>equals</code>, geteilte " +
              "Objekte.</p>",
        apply: function (s) {
          s.zeile = 5;
          s.final = true;
        }
      }
    ]
  });

  /* ---------------------------------------------------------------------------
     SZENARIO 4 – this und static
     Die Klassendefinition ist KULISSE (eigener Block, `data-kontext`) – sie wird
     nicht Zeile für Zeile ausgeführt. Gelaufen wird nur der Aufruf-Block.
     --------------------------------------------------------------------------- */
  sim.registerScenario({
    id: "this-static",
    title: "this und static",
    description: "Eine Methode läuft <em>auf</em> einem Objekt – <code>this</code> ist " +
                  "der Wegweiser dorthin. Statische Methoden kommen ohne Objekt aus.",
    state: leereSzene,
    render: zeichneSzene,
    steps: [
      {
        title: "Eine Methode, viele Objekte",
        text: "<p>Zwei Konten liegen im <b>Heap</b>. Den Code von <code>einzahlen</code> " +
              "gibt es aber nur <b>einmal</b> – er steht in der <b>Klasse</b>, nicht im " +
              "Objekt.</p>" +
              "<p>Und die Klasse liegt woanders: im <b>Metaspace</b>, einem Bereich " +
              "außerhalb des Heaps. Dorthin lädt die JVM jede Klasse einmal, samt ihrem " +
              "Code.</p>" +
              "<p>Wie weiß die Methode dann, welchen Kontostand sie erhöhen soll?</p>",
        apply: function (s) {
          s.heap.push({ id: "giro", adresse: "#A1", klasse: "Konto",
                        felder: [{ name: "standInCent", wert: "0" }] });
          s.heap.push({ id: "spar", adresse: "#A2", klasse: "Konto",
                        felder: [{ name: "standInCent", wert: "0" }] });
          s.stack.push({ name: "giro", typ: "Konto", wert: "#A1", ref: true });
          s.stack.push({ name: "spar", typ: "Konto", wert: "#A2", ref: true });
          s.meta.push({ id: "Konto", name: "Konto", member: ["long standInCent;", "void einzahlen(long)"] });
          // Die Wegweiser stehen von Anfang an – sie sind hier nicht die Neuigkeit.
          // In den Aufrufen ändert sich nur der Kontostand; tauchten die Linien
          // erst dort auf, sähe es aus, als entstünden sie durch den Aufruf.
          s.pfeile.push({ von: "this-static-var-giro", nach: "this-static-obj-giro" });
          s.pfeile.push({ von: "this-static-var-spar", nach: "this-static-obj-spar" });
        }
      },
      {
        title: "giro.einzahlen(50);",
        text: "<p>Der Aufruf steht <b>an einem Objekt</b>. Genau dieses Objekt bekommt die " +
              "Methode als <code>this</code> mitgeliefert – unsichtbar, aber es ist da.</p>" +
              "<p><code>this.standInCent += 50</code> trifft deshalb <code>#A1</code>.</p>",
        apply: function (s) {
          s.zeile = 0;
          s.heap[0].felder = [{ name: "standInCent", wert: "50" }];
          s.betont = "giro";
        }
      },
      {
        title: "spar.einzahlen(20);",
        text: "<p><b>Derselbe Code</b>, anderes Objekt. <code>this</code> zeigt jetzt auf " +
              "<code>#A2</code>, und dort steigt der Stand.</p>" +
              "<p>Deshalb genügt <b>eine</b> Methode für alle Objekte einer Klasse. " +
              "Meist darf <code>this</code> wegbleiben – Java ergänzt es. Nötig wird es, " +
              "wenn ein Parameter genauso heißt wie das Feld.</p>",
        apply: function (s) {
          s.zeile = 1;
          s.heap[1].felder = [{ name: "standInCent", wert: "20" }];
          s.betont = "spar";
        },
        duration: 4200
      },
      {
        title: "int größer = Math.max(3, 7);",
        text: "<p>Der Gegenpol: Vor dem Punkt steht ein <b>Klassenname</b>, kein Objekt. " +
              "<code>Math</code> wird in den <b>Metaspace</b> geladen – im Heap entsteht " +
              "nichts.</p>" +
              "<p>Die Methode ist <code>static</code>: Es gibt nichts, worauf " +
              "<code>this</code> zeigen könnte, und deshalb gibt es <code>this</code> " +
              "dort auch nicht.</p>" +
              "<p><b>Und daher ist <code>main</code> static:</b> Beim Programmstart " +
              "existiert noch kein Objekt. Deshalb musst Du dort erst mit <code>new</code> " +
              "etwas erzeugen – und <code>this</code> gibt in <code>main</code> einen " +
              "Compilerfehler.</p>",
        apply: function (s) {
          s.zeile = 2;
          s.betont = "klasse:Math";
          s.meta.push({ id: "Math", name: "Math", member: ["static int max(int, int)"] });
          s.stack.push({ name: "größer", typ: "int", wert: "7" });
          s.ergebnis = [{ ausdruck: "Math.max(3, 7)", wert: 7 }];
        },
        duration: 5000
      },
      {
        title: "Zum Mitnehmen",
        text: "<p>Eine Methode gehört zur <b>Klasse</b> – geladen einmal, im Metaspace. " +
              "Laufen tut sie auf einem <b>Objekt</b> im Heap, und <code>this</code> ist " +
              "der Wegweiser dorthin.</p>" +
              "<p><code>static</code> lässt genau diesen Wegweiser weg.</p>",
        apply: function (s) {
          s.zeile = 2;
          s.final = true;
        }
      }
    ]
  });

  // Kleine Hilfe, weil jeder Schritt sein Fach im Stack wiederfinden muss.
  function finde(liste, name) {
    return liste.filter(function (v) { return v.name === name; })[0];
  }
})();
