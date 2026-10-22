(function () {
  "use strict";
  var sim = window.skr.ext.didaktikon.simulation;

  /* ZUSTAND ------------------------------------------------------------------
     bereit/wartend/fertig: Listen von Anfrage-Kennungen.
     plaetze: die Threads des Pools bzw. die Trägerthreads, je mit Aufgabe und
     Status (frei | läuft | wartet | gepinnt). */
  function platz(id, name) { return { id: id, name: name, aufgabe: null, status: "frei" }; }
  function ausgangslage(plaetze) {
    return function () {
      return { bereit: [], wartend: [], fertig: [], plaetze: plaetze(), zeile: null, jdk: "21" };
    };
  }
  var vierThreads = ausgangslage(function () {
    return [platz("t1", "Thread 1"), platz("t2", "Thread 2"), platz("t3", "Thread 3"), platz("t4", "Thread 4")];
  });
  var zweiTräger = ausgangslage(function () {
    return [platz("c1", "Träger 1"), platz("c2", "Träger 2")];
  });

  /* Hilfen für apply – sie ändern nur den Zustand. */
  function nimm(liste, id) { var i = liste.indexOf(id); if (i >= 0) { liste.splice(i, 1); } }
  function belege(s, platzId, aufgabe, status) {
    s.plaetze.forEach(function (p) {
      if (p.id === platzId) { p.aufgabe = aufgabe; p.status = status; }
    });
    nimm(s.bereit, aufgabe);
    nimm(s.wartend, aufgabe);
  }
  function setzeStatus(s, platzId, status) {
    s.plaetze.forEach(function (p) { if (p.id === platzId) { p.status = status; } });
  }
  function gibFrei(s, platzId) {
    s.plaetze.forEach(function (p) {
      if (p.id === platzId) { p.aufgabe = null; p.status = "frei"; }
    });
  }
  function erledige(s, platzId) {
    s.plaetze.forEach(function (p) {
      if (p.id === platzId && p.aufgabe) { s.fertig.push(p.aufgabe); }
    });
    gibFrei(s, platzId);
  }
  function hängeAus(s, platzId) {
    s.plaetze.forEach(function (p) {
      if (p.id === platzId && p.aufgabe) { s.wartend.push(p.aufgabe); }
    });
    gibFrei(s, platzId);
  }

  /* ZEICHNEN ------------------------------------------------------------------ */
  var STATUS = { "frei": "frei", "läuft": "läuft", "wartet": "wartet – blockiert", "gepinnt": "gepinnt" };

  function anfragen(container, ids, ctx) {
    sim.list(container, ids, {
      animated: ctx.animated,
      key: function (id) { return id; },
      create: function () {
        var el = document.createElement("div");
        el.className = "skr-didaktikon-simulation-cell anfrage";
        return el;
      },
      update: function (el, id) { el.textContent = id; }
    });
  }

  function zeichne(s, ctx) {
    var szene = ctx.scenario;
    anfragen(document.getElementById(szene + "-bereit"), s.bereit, ctx);
    anfragen(document.getElementById(szene + "-wartend"), s.wartend, ctx);
    anfragen(document.getElementById(szene + "-fertig"), s.fertig, ctx);

    sim.list(document.getElementById(szene + "-plaetze"), s.plaetze, {
      animated: ctx.animated,
      key: function (p) { return p.id; },
      create: function () {
        var el = document.createElement("div");
        el.className = "skr-didaktikon-simulation-cell platz";
        el.innerHTML = '<span class="platz__kopf"><span class="skr-didaktikon-simulation-cell__name"></span>' +
                       '<span class="skr-didaktikon-simulation-cell__value"></span></span>' +
                       '<span class="platz__status"></span>';
        return el;
      },
      update: function (el, p) {
        var vorher = el.getAttribute("data-status");
        el.querySelector(".skr-didaktikon-simulation-cell__name").textContent = p.name;
        el.querySelector(".skr-didaktikon-simulation-cell__value").textContent = p.aufgabe || "–";
        el.querySelector(".platz__status").textContent = STATUS[p.status];
        // Nur die eigenen Klassen tauschen – is-new/is-gone gehören list().
        ["frei", "laeuft", "wartet", "gepinnt"].forEach(function (k) { el.classList.remove("platz--" + k); });
        el.classList.add("platz--" + (p.status === "läuft" ? "laeuft" : p.status));
        el.classList.toggle("is-active", p.status === "läuft");
        el.classList.toggle("is-error", p.status === "gepinnt");
        el.setAttribute("data-status", p.status);
        if (ctx.animated && vorher && vorher !== p.status) { sim.pulse(el); }
      }
    });

    if (szene === "pinning") {
      document.getElementById("pinning-jdk").innerHTML = '<span class="jdk">Java ' + s.jdk + "</span>";
      sim.codeLine(document.querySelector('[data-skr-didaktikon-simulation-scene="pinning"] .skr-didaktikon-simulation-code'), s.zeile);
    }
  }

  sim.setup({ state: vierThreads, render: zeichne });

  /* SZENARIO 1: FESTER POOL --------------------------------------------------- */
  sim.registerScenario({
    id: "pool",
    title: "Fester Thread-Pool",
    description: "Vier Threads, sechs Anfragen: Wer auf das Lager wartet, hält seinen Thread fest – die übrigen Anfragen stehen an.",
    state: vierThreads,
    steps: [
      {
        title: "Ausgangslage",
        text: "<p>Ein Server mit einem <b>festen Pool</b> aus vier Threads – so wie der Altbestand mit <code>Executors.newFixedThreadPool(10)</code>. Jeder davon ist ein Thread des Betriebssystems mit eigenem Stack.</p>",
        apply: function () {}
      },
      {
        title: "Sechs Anfragen kommen an",
        text: "<p>Sechs Bestellungen treffen gleichzeitig ein. Noch hat keine einen Thread.</p>",
        apply: function (s) { s.bereit = ["A1", "A2", "A3", "A4", "A5", "A6"]; }
      },
      {
        title: "Der Pool verteilt",
        text: "<p>Vier Anfragen bekommen je einen Thread. <b>A5 und A6 warten</b> in der Warteschlange des Pools.</p>",
        apply: function (s) {
          belege(s, "t1", "A1", "läuft"); belege(s, "t2", "A2", "läuft");
          belege(s, "t3", "A3", "läuft"); belege(s, "t4", "A4", "läuft");
        }
      },
      {
        title: "Alle vier warten auf das Lager",
        text: "<p>Jede Bestellung fragt beim Lager nach – 100 ms Antwortzeit. Der Thread <b>blockiert</b>: Er tut nichts, bleibt aber belegt.</p><p>Der Prozessor hätte Zeit für A5 und A6. Es ist nur <b>kein Thread frei</b>.</p>",
        apply: function (s) {
          ["t1", "t2", "t3", "t4"].forEach(function (t) { setzeStatus(s, t, "wartet"); });
          s.wartend = ["A1", "A2", "A3", "A4"];
        }
      },
      {
        title: "Das Lager antwortet",
        text: "<p>Nach 100 ms kommen die Antworten. Die vier Anfragen sind fertig, ihre Threads wieder frei.</p>",
        apply: function (s) {
          s.wartend = [];
          ["t1", "t2", "t3", "t4"].forEach(function (t) { erledige(s, t); });
        }
      },
      {
        title: "Jetzt erst A5 und A6",
        text: "<p>Die beiden letzten Anfragen kommen dran – <b>100 ms später</b>, als es der Prozessor erlaubt hätte.</p>",
        apply: function (s) { belege(s, "t1", "A5", "läuft"); belege(s, "t2", "A6", "läuft"); }
      },
      {
        title: "Merksatz",
        text: "<p><b>Gleichzeitig bearbeitet wird höchstens so viel, wie Threads im Pool sind.</b></p><p>10 Threads und 100 ms Wartezeit heißt: höchstens 100 Anfragen je Sekunde. Gemessen im Altbestand: 200 Bestellungen in gut 2 Sekunden. Mehr Threads helfen – bis Speicher und Betriebssystem nicht mehr mitspielen.</p>",
        apply: function () {},
        duration: 5000
      }
    ]
  });

  /* SZENARIO 2: VIRTUELLE THREADS -------------------------------------------- */
  sim.registerScenario({
    id: "virtuell",
    title: "Virtuelle Threads",
    description: "Jede Anfrage bekommt einen virtuellen Thread. Wer wartet, wird ausgehängt und gibt seinen Trägerthread frei.",
    state: zweiTräger,
    steps: [
      {
        title: "Ausgangslage",
        text: "<p>Zwei <b>Trägerthreads</b> – echte Threads des Betriebssystems, so viele wie Prozessorkerne. Die JVM verwaltet sie selbst.</p>",
        apply: function () {}
      },
      {
        title: "Je Anfrage ein virtueller Thread",
        text: "<p>Jede der sechs Anfragen bekommt ihren eigenen <b>virtuellen Thread</b> – mit <code>Executors.newVirtualThreadPerTaskExecutor()</code>. Er ist ein Objekt auf dem Heap, kein Thread des Betriebssystems. Eine Million davon ist kein Problem.</p>",
        apply: function (s) { s.bereit = ["V1", "V2", "V3", "V4", "V5", "V6"]; }
      },
      {
        title: "Einhängen",
        text: "<p>Zum Rechnen braucht ein virtueller Thread einen Träger: V1 und V2 werden <b>eingehängt</b> (<em>mount</em>).</p>",
        apply: function (s) { belege(s, "c1", "V1", "läuft"); belege(s, "c2", "V2", "läuft"); }
      },
      {
        title: "V1 wartet – und wird ausgehängt",
        text: "<p>V1 fragt beim Lager nach. Statt den Träger zu blockieren, wird V1 <b>ausgehängt</b> (<em>unmount</em>): Sein Stack wandert auf den Heap, Träger 1 ist frei.</p>",
        apply: function (s) { hängeAus(s, "c1"); }
      },
      {
        title: "Der freie Träger nimmt den nächsten",
        text: "<p>Auf Träger 1 läuft sofort V3.</p>",
        apply: function (s) { belege(s, "c1", "V3", "läuft"); }
      },
      {
        title: "Bis alle warten",
        text: "<p>Das wiederholt sich, bis <b>alle sechs gleichzeitig</b> auf das Lager warten. Die Träger sind frei – für alles, was rechnen will.</p>",
        apply: function (s) {
          hängeAus(s, "c2"); hängeAus(s, "c1");
          s.wartend = ["V1", "V2", "V3", "V4", "V5", "V6"];
          s.bereit = [];
        }
      },
      {
        title: "Die Antworten kommen",
        text: "<p>Nach 100 ms antwortet das Lager. Jeder virtuelle Thread wird wieder eingehängt – auf irgendeinem freien Träger – und macht dort weiter, wo er war.</p>",
        apply: function (s) { belege(s, "c1", "V1", "läuft"); belege(s, "c2", "V2", "läuft"); }
      },
      {
        title: "Alle fertig",
        text: "<p>Die sechs Anfragen sind nach gut 100 ms erledigt – nicht nach 200 ms wie mit dem Pool.</p>",
        apply: function (s) {
          s.fertig = ["V1", "V2", "V3", "V4", "V5", "V6"];
          s.wartend = [];
          gibFrei(s, "c1"); gibFrei(s, "c2");
        }
      },
      {
        title: "Merksatz",
        text: "<p><b>Warten kostet keinen Thread des Betriebssystems mehr.</b></p><p>Der Code bleibt blockierend und lesbar – nur der Thread ist ein anderer. Gemessen im Altbestand: 200 Bestellungen in rund 0,25 Sekunden statt 2,2.</p>",
        apply: function () {},
        duration: 5000
      }
    ]
  });

  /* SZENARIO 3: PINNING ------------------------------------------------------- */
  sim.registerScenario({
    id: "pinning",
    title: "Pinning in synchronized",
    description: "Wartet ein virtueller Thread in einem synchronized-Block, hält er unter Java 21 seinen Träger fest. Java 25 gibt ihn frei.",
    state: zweiTräger,
    steps: [
      {
        title: "Ausgangslage",
        text: "<p>Dieselben zwei Träger, vier virtuelle Threads – und diesmal der Code, den sie ausführen: <code>Verbindung.sende</code> aus dem Altbestand, eine <code>synchronized</code>-Methode, wie sie viele Bibliotheken aus der Java-8-Zeit haben.</p>",
        apply: function (s) { s.bereit = ["V1", "V2", "V3", "V4"]; }
      },
      {
        title: "V1 betritt den Monitor",
        text: "<p>V1 ruft <code>sende</code> auf und nimmt damit den <b>Monitor</b> dieser Verbindung. Umkämpft ist er nicht – jede Anfrage hat ihre eigene Verbindung.</p>",
        apply: function (s) { belege(s, "c1", "V1", "läuft"); s.zeile = 0; }
      },
      {
        title: "Warten im Monitor: Java 21 pinnt",
        text: "<p>V1 wartet auf das Netz – <b>innerhalb</b> von <code>synchronized</code>. Unter Java 21 kann die JVM ihn dann nicht aushängen: Er ist an seinen Träger <b>gepinnt</b>. Träger 1 ist blockiert wie ein Thread im Pool.</p>",
        apply: function (s) { setzeStatus(s, "c1", "gepinnt"); s.zeile = 2; }
      },
      {
        title: "Der zweite Träger auch",
        text: "<p>V2 macht dasselbe auf Träger 2. Jetzt sind <b>alle Träger gepinnt</b> – V3 und V4 warten, obwohl der Prozessor nichts tut.</p>",
        apply: function (s) { belege(s, "c2", "V2", "gepinnt"); }
      },
      {
        title: "Zurück beim festen Pool",
        text: "<p>Erst wenn V1 und V2 fertig sind, kommen V3 und V4 dran – und pinnen wieder. Virtuelle Threads verhalten sich hier wie ein Pool <b>mit so vielen Threads wie Kernen</b>.</p><p>Gemessen im Batch-Import unter Java 21: 893 ms statt 61 ms.</p>",
        apply: function (s) {
          s.fertig = ["V1", "V2"];
          belege(s, "c1", "V3", "gepinnt"); belege(s, "c2", "V4", "gepinnt");
        }
      },
      {
        title: "Dasselbe Programm unter Java 25",
        text: "<p>Seit Java 24 (JEP 491, im Kurs <b>LTS 25</b>) kann ein virtueller Thread auch im Monitor ausgehängt werden – er behält den Monitor, gibt aber den Träger frei. Die Träger sind wieder frei.</p>",
        apply: function (s) {
          s.jdk = "25";
          hängeAus(s, "c1"); hängeAus(s, "c2");
        }
      },
      {
        title: "Merksatz",
        text: "<p><b>Unter Java 21 gehört kein blockierender Aufruf in <code>synchronized</code> – unter Java 25 darf er.</b></p><p>Wer auf 21 bleibt, nimmt einen <code>ReentrantLock</code> oder eine neuere Bibliothek. Sichtbar wird Pinning mit Java Flight Recorder, Ereignis <code>jdk.VirtualThreadPinned</code>.</p>",
        apply: function (s) { s.zeile = null; },
        duration: 5000
      }
    ]
  });
})();
