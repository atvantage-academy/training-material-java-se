(function () {
  "use strict";
  var sim = window.skr.ext.didaktikon.simulation;
  var SVG = "http://www.w3.org/2000/svg";

  /* ZUSTAND ------------------------------------------------------------------
     Ein Sequenzdiagramm: Die Lebenslinien (BAHNEN) stehen je Ablauf fest, die Zeit
     läuft nach unten. Jeder Schritt hängt Elemente an:
       balken  – was eine Lebenslinie von `von` bis `bis` tut (art: läuft | blockiert
                 | gepinnt | geparkt | wartet | lager)
       pfeil   – eine Nachricht zum Zeitpunkt `t` (art: aufruf | async | antwort)
       notiz   – ein Text an einer Lebenslinie (art: fertig | frei)
       eintrag – ein Kästchen in der Warteschlange (entnommen: schon abgeholt)
       kurve   – ein Bogen zwischen Warteschlange und Lebenslinie zum Zeitpunkt `t`
                 (art: holen – aus der Schlange in den Thread | einreihen – vom Lager
                 hinten in die Schlange)
     Die Warteschlange ist keine Lebenslinie, sondern eine Reihe von Kästchen über
     den Threads (SCHLANGEN); sie zeigt, was je hineinkam, nicht einen Zeitpunkt.
     Die Zeit ist in Millisekunden; das Lager braucht 100. Die Arbeit davor und
     danach ist zur Lesbarkeit gedehnt (10 und 25) – sie ist in Wirklichkeit kürzer. */
  function ausgangslage() {
    return { elemente: [], zeile: null, jdk: "21", zeilen: [] };
  }

  /* Die Warteschlange über den Threads: eine Reihe von Plätzen ab `von`, vorn der
     Kopf der Schlange. `reihe` nennt, wer auf welchem Platz steht; die übrigen
     Plätze bleiben frei. Breit ist ein Platz `platz`, einer aus `breiter` mehr. */
  var SCHLANGEN = {
    pool: {
      von: 140, platz: 34, plätze: 12, hinweis: "des Pools",
      reihe: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12"]
    },
    reaktiv: {
      von: 100, platz: 34, plätze: 16, hinweis: "Anfragen und Antworten",
      reihe: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12",
              "Antwort A1", "Antwort A5", "Antwort A9"],
      breiter: { "Antwort A1": 62, "Antwort A5": 62, "Antwort A9": 62 }
    }
  };
  var LÜCKE = 6;

  // Mitte und Breite des Platzes, auf dem ein Eintrag steht (oder Platz Nummer i).
  function platzbreite(schlange, i) {
    var name = schlange.reihe[i];
    return (schlange.breiter && schlange.breiter[name]) || schlange.platz;
  }
  function platzVon(schlange, name) {
    var i = typeof name === "number" ? name : schlange.reihe.indexOf(name);
    var links = schlange.von + LÜCKE;
    for (var j = 0; j < i; j++) { links += platzbreite(schlange, j) + LÜCKE; }
    return [links + platzbreite(schlange, i) / 2, platzbreite(schlange, i)];
  }
  function schlangenEnde(schlange) {
    var platz = platzVon(schlange, schlange.plätze - 1);
    return platz[0] + platz[1] / 2 + LÜCKE;
  }

  /* Die Systemgrenze zwischen den Threads und dem Lager; ohne Angabe mittig
     zwischen der letzten Lebenslinie davor und dem Lager. */
  var GRENZE = { pool: 640, reaktiv: 845 };

  /* Lebenslinien. Gearbeitet wird überall auf EINEM Thread des Betriebssystems;
     die weiteren sind nur angedeutet (ausgegraut), damit klar bleibt, dass es sie
     gibt. */
  var BAHNEN = {
    pool: [
      { id: "t1", name: "Thread 1", hinweis: "des Betriebssystems", x: 280 },
      { id: "t2", name: "Thread 2 … 10", hinweis: "weitere des Pools", x: 470, angedeutet: true },
      { id: "lager", name: "Lager", hinweis: "externes System", x: 770 }
    ],
    reaktiv: [
      { id: "e", name: "Thread 1", hinweis: "der Ereignisschleife", x: 200 },
      { id: "e2", name: "Thread 2 … 4", hinweis: "einer je Kern", x: 520, angedeutet: true },
      { id: "lager", name: "Lager", hinweis: "externes System", x: 920 }
    ],
    virtuell: [
      { id: "c", name: "Träger", hinweis: "Plattform-Thread", x: 150 },
      { id: "c2", name: "Träger 2 … n", hinweis: "einer je Kern", x: 295, angedeutet: true },
      { id: "v1", name: "V1", hinweis: "virtuell, für A1", x: 440 },
      { id: "v2", name: "V2", hinweis: "virtuell, für A2", x: 590 },
      { id: "lager", name: "Lager", hinweis: "externes System", x: 770 }
    ],
    pinning: [
      { id: "c", name: "Träger", hinweis: "Plattform-Thread", x: 150 },
      { id: "c2", name: "Träger 2 … n", hinweis: "einer je Kern", x: 295, angedeutet: true },
      { id: "v1", name: "V1", hinweis: "virtuell, für A1", x: 440 },
      { id: "v2", name: "V2", hinweis: "virtuell, für A2", x: 590 },
      { id: "lager", name: "Lager", hinweis: "externes System", x: 770 }
    ]
  };


  /* Das Entscheidungsbild: je Kriterium eine Zeile mit drei Antworten. */
  var KRITERIEN = {
    modell: { name: "Programmiermodell", werte: ["blockierend, von oben nach unten", "Fortsetzungen statt Ablauf", "blockierend, von oben nach unten"] },
    warten: { name: "Wer wartet", werte: ["ein Thread des Betriebssystems", "nur eine Fortsetzung auf dem Heap", "ein virtueller Thread auf dem Heap"] },
    fehler: { name: "Fehlersuche", werte: ["vollständiger Stacktrace", "Stacktrace der Ereignisschleife", "vollständiger Stacktrace"] },
    strom: { name: "Datenströme, Backpressure", werte: ["selbst bauen", "eingebaut", "selbst bauen (Semaphore, Queue)"] },
    quarkus: { name: "In Quarkus", werte: ["Worker-Pool (blockierende Endpunkte)", "Mutiny, Vert.x", "@RunOnVirtualThread"] }
  };

  /* Hilfen für apply – sie ändern nur den Zustand. Jedes Element merkt sich den
     Schritt, in dem es entsteht; render blendet nur die neuen ein. */
  function zeichner(s, info) {
    function neu(element) { element.schritt = info.index; s.elemente.push(element); return element; }
    return {
      balken: function (bahn, von, bis, art, text, mehr) {
        var b = { typ: "balken", bahn: bahn, von: von, bis: bis, art: art, text: text || "" };
        Object.keys(mehr || {}).forEach(function (k) { b[k] = mehr[k]; });
        return neu(b);
      },
      pfeil: function (von, nach, t, art, text, mehr) {
        var p = { typ: "pfeil", von: von, nach: nach, t: t, art: art, text: text || "" };
        Object.keys(mehr || {}).forEach(function (k) { p[k] = mehr[k]; });
        return neu(p);
      },
      notiz: function (bahn, t, text, art, mehr) {
        var n = { typ: "notiz", bahn: bahn, t: t, text: text, art: art || "" };
        Object.keys(mehr || {}).forEach(function (k) { n[k] = mehr[k]; });
        return neu(n);
      },
      // Ein Balken, der schon steht, wächst weiter – etwa ein bereiter virtueller Thread.
      verlängere: function (name, bis) {
        s.elemente.forEach(function (e) { if (e.name === name) { e.bis = bis; } });
      },
      eintrag: function (name) { return neu({ typ: "eintrag", name: name, entnommen: false }); },
      // Aus der Schlange in den Thread: Das Kästchen gilt danach als entnommen.
      holen: function (name, bahn, t, mehr) {
        s.elemente.forEach(function (e) {
          if (e.typ === "eintrag" && e.name === name) { e.entnommen = true; e.entnommenIm = info.index; e.geholtUm = t; }
        });
        var k = { typ: "kurve", art: "holen", eintrag: name, bahn: bahn, t: t };
        Object.keys(mehr || {}).forEach(function (key) { k[key] = mehr[key]; });
        return neu(k);
      },
      // Vom Lager hinten in die Schlange: Das Kästchen entsteht mit dem Bogen.
      einreihen: function (bahn, t, name, versatz) {
        neu({ typ: "eintrag", name: name, entnommen: false });
        return neu({ typ: "kurve", art: "einreihen", eintrag: name, bahn: bahn, t: t, versatz: versatz || 0 });
      }
    };
  }

  /* ZEICHNEN ------------------------------------------------------------------ */
  // Die Breite des Bildes je Ablauf; der reaktive braucht Platz für 16 Plätze.
  var BREITEN = { reaktiv: 1010 }, STANDARDBREITE = 870;
  var BREITE = STANDARDBREITE, KOPF = 46, NULL = 122, SKALA = 1.29, BIS = 285;
  var LINKS = 150, RECHTS = 770, BALKEN = 16, VERSATZ = 11;
  var SCHLANGE_OBEN = 54, KÄSTCHEN_OBEN = 74, KÄSTCHEN_UNTEN = 98;
  var ELLIPSE = 0.552;   // Kontrollpunkte einer Viertelellipse

  function y(t) { return NULL + t * SKALA; }

  function knoten(name, attribute, eltern) {
    var el = document.createElementNS(SVG, name);
    Object.keys(attribute || {}).forEach(function (k) {
      if (attribute[k] !== null && attribute[k] !== undefined) { el.setAttribute(k, attribute[k]); }
    });
    if (eltern) { eltern.appendChild(el); }
    return el;
  }

  // Mehrzeiliger Text: „\n“ trennt die Zeilen.
  function text(eltern, x, yPos, inhalt, klasse, anker) {
    var el = knoten("text", { x: x, y: yPos, "class": klasse, "text-anchor": anker || "middle" }, eltern);
    String(inhalt).split("\n").forEach(function (zeile, i) {
      var span = knoten("tspan", { x: x, dy: i === 0 ? 0 : "1.15em" }, el);
      span.textContent = zeile;
    });
    return el;
  }

  function positionen(bahnen) {
    var abstand = (RECHTS - LINKS) / (bahnen.length - 1);
    var x = {};
    bahnen.forEach(function (b, i) { x[b.id] = b.x !== undefined ? b.x : LINKS + i * abstand; });
    return x;
  }

  function vorlage(svg, szene) {
    var defs = knoten("defs", {}, svg);
    var muster = knoten("pattern", {
      id: "schraffur-" + szene, width: 7, height: 7,
      patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)"
    }, defs);
    knoten("rect", { width: 7, height: 7, "class": "sequenz__schraffur-grund" }, muster);
    knoten("line", { x1: 0, y1: 0, x2: 0, y2: 7, "class": "sequenz__schraffur" }, muster);
    [["voll", "M0,0 L10,5 L0,10 z"], ["offen", "M0,0 L10,5 L0,10"]].forEach(function (spitze) {
      var marker = knoten("marker", {
        id: "spitze-" + spitze[0] + "-" + szene, viewBox: "0 0 10 10", refX: 10, refY: 5,
        markerWidth: 9, markerHeight: 9, orient: "auto-start-reverse"
      }, defs);
      knoten("path", { d: spitze[1], "class": "sequenz__spitze sequenz__spitze--" + spitze[0] }, marker);
    });
  }

  function gerüst(svg, bahnen, x, schlange, szene) {
    // Zeitachse mit Rasterlinien alle 50 ms.
    text(svg, 34, NULL - 14, "ms", "sequenz__achse", "middle");
    for (var t = 0; t <= BIS - 25; t += 50) {
      knoten("line", { x1: 50, y1: y(t), x2: BREITE - 10, y2: y(t), "class": "sequenz__raster" }, svg);
      text(svg, 40, y(t) + 4, t, "sequenz__achse", "end");
    }
    bahnen.forEach(function (b) {
      var angedeutet = b.angedeutet ? " sequenz__angedeutet" : "";
      knoten("line", { x1: x[b.id], y1: KOPF, x2: x[b.id], y2: y(BIS), "class": "sequenz__lebenslinie" + angedeutet }, svg);
      knoten("rect", { x: x[b.id] - 66, y: 4, width: 132, height: KOPF - 4, rx: 6, "class": "sequenz__kopf" + angedeutet }, svg);
      text(svg, x[b.id], 22, b.name, "sequenz__kopf-name" + angedeutet);
      text(svg, x[b.id], 38, b.hinweis, "sequenz__kopf-hinweis" + angedeutet);
    });
    var vorLager = bahnen[bahnen.length - 2].id;
    var grenze = GRENZE[szene] !== undefined ? GRENZE[szene] : (x[vorLager] + x.lager) / 2;
    knoten("line", { x1: grenze, y1: 2, x2: grenze, y2: y(BIS), "class": "sequenz__grenze" }, svg);
    if (schlange) {
      knoten("rect", { x: schlange.von, y: SCHLANGE_OBEN, width: schlangenEnde(schlange) - schlange.von, height: KÄSTCHEN_UNTEN + 6 - SCHLANGE_OBEN, rx: 6, "class": "sequenz__schlange" }, svg);
      for (var i = 0; i < schlange.plätze; i++) {
        var frei = platzVon(schlange, i);
        knoten("rect", { x: frei[0] - frei[1] / 2, y: KÄSTCHEN_OBEN, width: frei[1], height: KÄSTCHEN_UNTEN - KÄSTCHEN_OBEN, rx: 4, "class": "sequenz__platz" }, svg);
      }
      var titel = text(svg, schlange.von + 8, SCHLANGE_OBEN + 14, "Warteschlange", "sequenz__schlange-name", "start");
      var hinweis = knoten("tspan", { "class": "sequenz__kopf-hinweis", dx: 6 }, titel);
      hinweis.textContent = schlange.hinweis;
    }
  }

  function mitte(e, x) { return x[e.bahn] + (e.versatz || 0) * VERSATZ; }

  // Klassen bleiben ASCII wie die des Skriptoriums.
  function klasse(art) { return art === "läuft" ? "laeuft" : art; }

  /* ABLAUF IM SCHRITT -----------------------------------------------------------
     Was ein Schritt neu zeichnet, spielt sich in der Reihenfolge der Zeit ab: Ein
     Pfeil wird gezogen (PFEIL Sekunden), ein Balken wächst von oben nach unten, je
     Millisekunde des Diagramms TAKT Sekunden. Ein Pfeil hält die Uhr an – was zur
     selben Zeit beginnt, wartet, bis er angekommen ist; Pfeile zur selben Zeit
     laufen gemeinsam. */
  var PFEIL = 0.45, TAKT = 0.018;

  function zeitplan(neu) {
    var zeiten = [], pfeile = [];
    neu.forEach(function (e) {
      if (e.typ === "balken") { zeiten.push(e.von); }
      else if (e.typ !== "eintrag") { zeiten.push(e.t); }
      if ((e.typ === "pfeil" || e.typ === "kurve") && pfeile.indexOf(e.t) < 0) { pfeile.push(e.t); }
    });
    var t0 = zeiten.length ? Math.min.apply(null, zeiten) : 0;
    // `danach`: nach den Pfeilen, die genau zu diesem Zeitpunkt abgehen.
    return function (t, danach) {
      var n = pfeile.filter(function (p) { return p < t || (danach && p === t); }).length;
      return Math.max(0, (t - t0) * TAKT) + n * PFEIL;
    };
  }

  function animiere(el, klasseName, start, dauer, mehr) {
    el.classList.add(klasseName);
    el.style.setProperty("--start", start.toFixed(2) + "s");
    if (dauer !== undefined) { el.style.setProperty("--dauer", Math.max(0.12, dauer).toFixed(2) + "s"); }
    Object.keys(mehr || {}).forEach(function (k) { el.style.setProperty(k, mehr[k]); });
  }

  // Ein Pfeil wird gezogen: eine Maske legt ihn vom Anfang zur Spitze frei.
  function ziehe(svg, g, d, start, id) {
    var maske = knoten("mask", { id: id, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: BREITE, height: y(BIS) + 6 }, svg.querySelector("defs"));
    var strich = knoten("path", { d: d, pathLength: 1, "class": "sequenz__maske" }, maske);
    animiere(strich, "sequenz__ziehen", start, PFEIL);
    g.setAttribute("mask", "url(#" + id + ")");
  }

  // Drei Punkte neben dem Lager, solange es arbeitet – sie wandern mit dem Balken.
  function tippe(svg, e, x, start, dauer) {
    var g = knoten("g", { "class": "sequenz__tippen" }, svg);
    var links = x[e.bahn] + 2 * VERSATZ + BALKEN / 2 + 10;
    for (var i = 0; i < 3; i++) {
      knoten("circle", { cx: links + i * 8, cy: y(e.von) + 8, r: 2.6, "class": "sequenz__punkt sequenz__punkt--" + (i + 1) }, g);
    }
    animiere(g, "sequenz__tippen--aktiv", start, dauer, { "--weg": Math.max(0, (e.bis - e.von) * SKALA - 16) + "px" });
  }

  // Ein Kästchen in der Warteschlange; abgeholte bleiben blass stehen.
  function zeichneEintrag(g, e, schlange, ab, plan) {
    var platz = platzVon(schlange, e.name);
    function kästchen(eltern, entnommen) {
      knoten("rect", {
        x: platz[0] - platz[1] / 2, y: KÄSTCHEN_OBEN, width: platz[1], height: KÄSTCHEN_UNTEN - KÄSTCHEN_OBEN, rx: 4,
        "class": "sequenz__eintrag" + (entnommen ? " sequenz__eintrag--entnommen" : "")
      }, eltern);
      text(eltern, platz[0], KÄSTCHEN_OBEN + 16, e.name, "sequenz__text sequenz__text--eintrag");
    }
    kästchen(g, e.entnommen);
    if (ab !== null) { animiere(g, "sequenz__erscheinen", ab); }
    // In diesem Schritt abgeholt: Das volle Kästchen liegt darüber und verblasst.
    if (plan && e.entnommen && e.entnommenIm === plan.index) {
      var voll = knoten("g", {}, g);
      kästchen(voll, false);
      animiere(voll, "sequenz__verblassen", plan.zeit(e.geholtUm, false) + PFEIL / 2);
    }
  }

  /* Ein Bogen als Viertelellipse: beim Holen senkrecht aus dem Kästchen nach unten
     und waagerecht in den Thread, beim Einreihen umgekehrt vom Lager hinauf. Am
     Kästchen setzt das Holen links an, das Einreihen rechts – so treffen sich die
     beiden Bögen eines Kästchens nicht. */
  function zeichneKurve(g, e, x, szene, schlange) {
    var platz = platzVon(schlange, e.eintrag);
    var unten = KÄSTCHEN_UNTEN;
    var yt = y(e.t);
    var d, art;
    if (e.art === "holen") {
      var bx = platz[0] - platz[1] / 6;
      var xe = x[e.bahn] + (bx < x[e.bahn] ? -1 : 1) * (BALKEN / 2 + 1);
      d = "M" + bx + "," + unten + " C" + bx + "," + (unten + ELLIPSE * (yt - unten)) + " " +
          (xe - ELLIPSE * (xe - bx)) + "," + yt + " " + xe + "," + yt;
      art = "aufruf";
    } else {
      var ziel = platz[0] + platz[1] / 6;
      var xs = x[e.bahn] + e.versatz * VERSATZ - BALKEN / 2;
      d = "M" + xs + "," + yt + " C" + (xs - ELLIPSE * (xs - ziel)) + "," + yt + " " +
          ziel + "," + (unten + ELLIPSE * (yt - unten)) + " " + ziel + "," + (unten + 1);
      art = "antwort";
    }
    knoten("path", {
      d: d, "class": "sequenz__pfeil sequenz__pfeil--" + art + " sequenz__kurve",
      "marker-end": "url(#spitze-" + (art === "aufruf" ? "voll" : "offen") + "-" + szene + ")"
    }, g);
    return d;
  }

  function zeichneBalken(g, gText, e, x, szene) {
    var schmal = e.art === "wartet";
    var breite = schmal ? 8 : BALKEN;
    var m = mitte(e, x);
    var rect = knoten("rect", {
      x: m - breite / 2, y: y(e.von), width: breite, height: Math.max(2, (e.bis - e.von) * SKALA),
      "class": "sequenz__balken sequenz__balken--" + klasse(e.art),
      fill: e.art === "blockiert" || e.art === "gepinnt" ? "url(#schraffur-" + szene + ")" : null
    }, g);
    if (e.text) {
      var links = e.seite === "links";
      var tPos = e.textBei !== undefined ? e.textBei : (e.von + e.bis) / 2;
      // Das Lager beschriftet rechts neben allen gleichzeitigen Anfragen.
      var rechts = e.art === "lager" ? x[e.bahn] + 2 * VERSATZ + breite / 2 + 6 : m + breite / 2 + 6;
      text(gText, links ? m - breite / 2 - 6 : rechts, y(tPos) + 4, e.text,
        "sequenz__text sequenz__text--" + klasse(e.art), links ? "end" : "start");
    }
    return rect;
  }

  function zeichnePfeil(g, gText, e, x, szene) {
    var x1 = x[e.von] + (e.vonVersatz || 0) * VERSATZ;
    var x2 = x[e.nach] + (e.nachVersatz || 0) * VERSATZ;
    var richtung = x2 > x1 ? 1 : -1;
    x1 += richtung * BALKEN / 2;
    x2 -= richtung * (BALKEN / 2 + 1);
    var yPos = y(e.t);
    knoten("line", {
      x1: x1, y1: yPos, x2: x2, y2: yPos,
      "class": "sequenz__pfeil sequenz__pfeil--" + e.art,
      "marker-end": "url(#spitze-" + (e.art === "aufruf" ? "voll" : "offen") + "-" + szene + ")"
    }, g);
    if (e.text) {
      var anteil = e.textBei !== undefined ? e.textBei : 0.5;
      text(gText, x1 + (x2 - x1) * anteil, e.unten ? yPos + 15 : yPos - 6, e.text, "sequenz__text sequenz__text--pfeil");
    }
    return "M" + x1 + "," + yPos + " L" + x2 + "," + yPos;
  }

  function zeichneNotiz(g, e, x) {
    var links = e.seite === "links";
    var xPos = e.seite === "mitte" ? x[e.bahn] : x[e.bahn] + (links ? -14 : 14);
    text(g, xPos, y(e.t) + 4, e.text, "sequenz__text sequenz__text--" + (e.art || "notiz"),
      e.seite === "mitte" ? "middle" : (links ? "end" : "start"));
  }

  function zeichneSequenz(s, ctx) {
    var szene = ctx.scenario;
    var bild = document.getElementById(szene + "-sequenz");
    var bahnen = BAHNEN[szene];
    var schlange = SCHLANGEN[szene];
    var x = positionen(bahnen);
    BREITE = BREITEN[szene] || STANDARDBREITE;
    bild.textContent = "";
    var svg = knoten("svg", {
      viewBox: "0 0 " + BREITE + " " + (y(BIS) + 6), "class": "sequenz__svg",
      role: "img", "aria-label": "Sequenzdiagramm: " + bahnen.map(function (b) { return b.name; }).join(", ") + "; die Zeit läuft nach unten."
    }, bild);
    vorlage(svg, szene);
    gerüst(svg, bahnen, x, schlange, szene);

    // Abgespielt wird nur ein Schritt vorwärts; Springen und Zurück zeigen das fertige Bild.
    var neu = ctx.animated ? s.elemente.filter(function (e) { return e.schritt === ctx.index; }) : [];
    var plan = ctx.animated ? { index: ctx.index, zeit: zeitplan(neu) } : null;
    var nr = 0;

    // Erst Kästchen und Balken, dann die Pfeile darüber, zuletzt die Texte.
    ["eintrag", "balken", "kurve", "pfeil", "notiz"].forEach(function (typ) {
      s.elemente.forEach(function (e) {
        if (e.typ !== typ) { return; }
        var istNeu = neu.indexOf(e) >= 0;
        // Was auf den weiteren Threads geschieht, ist nur angedeutet: ausgegraut.
        var grau = e.angedeutet ? "sequenz__angedeutet" : null;
        var g = knoten("g", { "class": grau }, svg);
        var gText = knoten("g", { "class": grau }, svg);
        if (typ === "eintrag") {
          zeichneEintrag(g, e, schlange, istNeu ? 0 : null, plan);
        } else if (typ === "balken") {
          var rect = zeichneBalken(g, gText, e, x, szene);
          if (istNeu) {
            var start = plan.zeit(e.von, true), ende = plan.zeit(e.bis, false);
            animiere(rect, "sequenz__wachsen", start, ende - start);
            animiere(gText, "sequenz__erscheinen", e.art === "lager" ? ende : start);
            if (e.art === "lager") { tippe(svg, e, x, start, ende - start); }
          }
        } else if (typ === "kurve" || typ === "pfeil") {
          var d = typ === "kurve" ? zeichneKurve(g, e, x, szene, schlange) : zeichnePfeil(g, gText, e, x, szene);
          if (istNeu) {
            ziehe(svg, g, d, plan.zeit(e.t, false), "ziehen-" + szene + "-" + (nr++));
            animiere(gText, "sequenz__erscheinen", plan.zeit(e.t, false) + PFEIL);
          }
        } else {
          zeichneNotiz(g, e, x);
          if (istNeu) { animiere(g, "sequenz__erscheinen", plan.zeit(e.t, true)); }
        }
      });
    });

    if (szene === "pinning") {
      document.getElementById("pinning-jdk").textContent = "Java " + s.jdk;
    }
    sim.codeLine(document.querySelector('[data-skr-didaktikon-simulation-scene="' + szene + '"] .skr-didaktikon-simulation-code'), s.zeile);
  }

  var SPALTEN = ["Fester Pool", "Reaktiv", "Virtuelle Threads"];

  function zeichneVergleich(s, ctx) {
    sim.list(document.getElementById("entscheidung-zeilen"), s.zeilen, {
      animated: ctx.animated,
      key: function (k) { return k; },
      create: function () {
        var el = document.createElement("div");
        el.className = "skr-didaktikon-simulation-cell vergleich__zeile";
        return el;
      },
      update: function (el, k) {
        var kriterium = KRITERIEN[k];
        el.textContent = "";
        var name = document.createElement("strong");
        name.textContent = kriterium.name;
        el.appendChild(name);
        kriterium.werte.forEach(function (wert, i) {
          var zelle = document.createElement("span");
          var spalte = document.createElement("span");
          spalte.className = "skr-visually-hidden";
          spalte.textContent = SPALTEN[i] + ": ";
          zelle.appendChild(spalte);
          zelle.appendChild(document.createTextNode(wert));
          el.appendChild(zelle);
        });
        el.classList.toggle("is-active", k === s.zeilen[s.zeilen.length - 1]);
      }
    });
  }

  function zeichne(s, ctx) {
    if (ctx.scenario === "entscheidung") { zeichneVergleich(s, ctx); return; }
    zeichneSequenz(s, ctx);
  }

  sim.setup({ state: ausgangslage, render: zeichne });

  /* SZENARIO 1: FESTER POOL ---------------------------------------------------
     Zehn Threads, zwölf Anfragen; gezeigt wird Thread 1, die übrigen neun sind
     angedeutet und holen nur ihre Anfragen A2–A10 – danach werden sie nicht weiter
     betrachtet. A11 und A12 warten in der Warteschlange; A11 holt Thread 1, sobald er
     vom Lager zurück ist; die Antwort des Lagers geht direkt an den blockierten Thread. */
  var ANDERE = ["A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"];
  var GRAU = { angedeutet: true };

  sim.registerScenario({
    id: "pool",
    title: "Fester Thread-Pool",
    description: "Zehn Threads, zwölf Anfragen: Wer auf das Lager wartet, blockiert seinen Thread – die letzten beiden Anfragen stehen an.",
    state: ausgangslage,
    steps: [
      {
        title: "Ausgangslage",
        text: "<p>Ein Server mit einem <b>festen Pool</b> aus zehn Threads – wie in der Bestellabwicklung des Übungsprojekts (<code>Executors.newFixedThreadPool(10)</code>). Jeder ist ein Thread des Betriebssystems mit eigenem Stack. Gezeigt ist Thread 1, die übrigen neun sind angedeutet.</p><p>Darüber die <b>Warteschlange</b> des Pools, rechts hinter der Systemgrenze das <b>Lager</b>, ein externes System. Die Zeit läuft nach unten.</p>",
        apply: function () {}
      },
      {
        title: "Zwölf Anfragen kommen an",
        text: "<p>Zwölf Bestellungen A1 bis A12 treffen gleichzeitig ein und stellen sich in die <b>Warteschlange</b> des Pools.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          SCHLANGEN.pool.reihe.forEach(function (name) { z.eintrag(name); });
        }
      },
      {
        title: "Der Pool verteilt",
        text: "<p>Thread 1 holt A1 aus der Warteschlange und bereitet die Bestellung vor. A2 bis A10 werden von den anderen Threads geholt und verarbeitet.</p><p>Für <b>A11 und A12</b> ist kein Thread frei – sie bleiben in der Warteschlange.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.holen("A1", "t1", 0);
          z.balken("t1", 0, 10, "läuft");
          ANDERE.forEach(function (name) { z.holen(name, "t2", 2, GRAU); });
        }
      },
      {
        title: "Weiter ans Lager – und warten",
        text: "<p>Thread 1 fragt beim Lager nach, ob die Artikel vorrätig sind. Das dauert <b>100 ms</b>.</p><p>So lange <b>blockiert</b> der Thread: Er tut nichts, bleibt aber belegt und ist für nichts anderes <b>nutzbar</b>. A11 und A12 warten weiter – obwohl der Prozessor frei wäre.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.pfeil("t1", "lager", 10, "aufruf", "istVorrätig(A1)", { textBei: 0.75 });
          z.balken("lager", 10, 110, "lager", "100 ms");
          z.balken("t1", 10, 110, "blockiert", "blockiert –\nnicht nutzbar");
        },
        duration: 4500
      },
      {
        title: "Das Lager antwortet",
        text: "<p>Nach 100 ms kommt die Antwort – direkt an den Thread, der darauf gewartet hat. Er macht weiter und schickt die Antwort an den Aufrufer.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.pfeil("lager", "t1", 110, "antwort", "vorrätig", { textBei: 0.25 });
          z.balken("t1", 110, 135, "läuft");
          z.notiz("t1", 129, "✓ A1", "fertig", { seite: "links" });
        }
      },
      {
        title: "Jetzt erst A11",
        text: "<p>Thread 1 ist frei und holt A11 aus der Warteschlange – und blockiert beim Lager erneut 100 ms.</p><p>A11 ist nach gut <b>270 ms</b> fertig, obwohl sie selbst nur gut 130 ms braucht. Die Hälfte davon hat sie auf einen Thread gewartet.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.holen("A11", "t1", 135);
          z.balken("t1", 135, 145, "läuft");
          z.pfeil("t1", "lager", 145, "aufruf", "istVorrätig(A11)", { textBei: 0.75 });
          z.balken("lager", 145, 245, "lager");
          z.balken("t1", 145, 245, "blockiert", "blockiert –\nnicht nutzbar");
          z.pfeil("lager", "t1", 245, "antwort", "vorrätig", { textBei: 0.25 });
          z.balken("t1", 245, 270, "läuft");
          z.notiz("t1", 264, "✓ A11", "fertig", { seite: "links" });
        },
        duration: 7500
      },
      {
        title: "Merksatz",
        text: "<p><b>Gleichzeitig bearbeitet wird höchstens so viel, wie Threads im Pool sind – und ein wartender Thread zählt mit.</b></p><p>10 Threads und 100 ms Wartezeit heißt: höchstens 100 Anfragen je Sekunde. Gemessen im Übungsprojekt: 200 Bestellungen in gut 2 Sekunden. Mehr Threads helfen – bis Speicher und Betriebssystem nicht mehr mitspielen.</p>",
        apply: function () {},
        duration: 5000
      }
    ]
  });

  /* SZENARIO 2: REAKTIV -------------------------------------------------------
     Vier Threads der Ereignisschleife (einer je Kern), zwölf Anfragen; gezeigt wird
     Thread 1, die übrigen drei sind angedeutet und holen nur ihre Anfragen. Thread 1
     nimmt jede vierte – A1, A5, A9 – und wartet nicht auf das Lager. Die Antworten
     reihen sich hinten in die Warteschlange ein (ab Platz 13) und werden
     abgearbeitet, sobald Thread 1 frei ist. */
  sim.registerScenario({
    id: "reaktiv",
    title: "Reaktiv",
    description: "Vier Threads, die nie warten: Die Antworten des Lagers kommen in die Warteschlange und werden später abgearbeitet. Der Preis ist das Programmiermodell.",
    state: ausgangslage,
    steps: [
      {
        title: "Ausgangslage",
        text: "<p>Die erste Antwort auf das Problem des festen Pools, lange vor Java 21: eine <b>Ereignisschleife</b> mit so wenigen Threads, wie es Kerne gibt – hier vier. Gezeigt ist Thread 1, die übrigen drei sind angedeutet. So arbeiten Vert.x, Netty und damit die reaktive Seite von Quarkus.</p><p>Die Regel dort: <b>Kein Thread der Schleife darf blockieren.</b></p>",
        apply: function () {}
      },
      {
        title: "Zwölf Anfragen kommen an",
        text: "<p>Dieselben zwölf Bestellungen wie beim festen Pool – sie stellen sich in die <b>Warteschlange</b> der Schleife.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          SCHLANGEN.reaktiv.reihe.slice(0, 12).forEach(function (name) { z.eintrag(name); });
        }
      },
      {
        title: "Fragen – und sofort weiter",
        text: "<p>Thread 1 holt A1, schickt die Anfrage ans Lager und wartet <b>nicht</b> auf die Antwort. Er hinterlegt nur, was danach geschehen soll: die <b>Fortsetzung</b> in <code>thenApply</code>. Dann ist er frei.</p><p>A2 bis A4 holen die anderen drei Threads.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.holen("A1", "e", 0);
          z.balken("e", 0, 10, "läuft");
          ["A2", "A3", "A4"].forEach(function (name) { z.holen(name, "e2", 2, GRAU); });
          z.pfeil("e", "lager", 10, "async", "istVorrätigAsync(A1)", { textBei: 0.6 });
          z.balken("lager", 10, 110, "lager", "100 ms");
          s.zeile = 0;
        },
        duration: 4500
      },
      {
        title: "Jede vierte Anfrage",
        text: "<p>Ohne auf das Lager zu warten, holt Thread 1 die nächste Anfrage, die für ihn ansteht – A5, dann A9 –, und schickt sie ebenso ab. Die übrigen holen die anderen Threads.</p><p>Nach kurzer Zeit stehen <b>alle zwölf</b> beim Lager aus – ohne dass ein Thread wartet. Thread 1 ist <b>frei</b> und könnte weitere Anfragen annehmen.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.holen("A5", "e", 20);
          z.balken("e", 20, 30, "läuft");
          ["A6", "A7", "A8"].forEach(function (name) { z.holen(name, "e2", 22, GRAU); });
          z.pfeil("e", "lager", 30, "async", "istVorrätigAsync(A5)", { textBei: 0.6, nachVersatz: 1 });
          z.balken("lager", 30, 130, "lager", "", { versatz: 1 });
          z.holen("A9", "e", 40);
          z.balken("e", 40, 50, "läuft");
          ["A10", "A11", "A12"].forEach(function (name) { z.holen(name, "e2", 42, GRAU); });
          z.pfeil("e", "lager", 50, "async", "istVorrätigAsync(A9)", { textBei: 0.6, nachVersatz: 2 });
          z.balken("lager", 50, 150, "lager", "", { versatz: 2 });
          z.notiz("e", 80, "frei –\nnimmt Neues an", "frei");
        },
        duration: 6000
      },
      {
        title: "Die Antwort reiht sich ein",
        text: "<p>Nach 100 ms antwortet das Lager auf A1. Die Antwort geht <b>nicht an einen Thread</b> – es wartet ja keiner –, sondern stellt sich hinten in die <b>Warteschlange</b>, an Platz 13. Thread 1 holt sie und führt die Fortsetzung für A1 aus.</p><p>Währenddessen kommt die Antwort auf A5. Thread 1 ist beschäftigt: Die Antwort <b>wartet in der Warteschlange</b>.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.einreihen("lager", 110, "Antwort A1");
          z.holen("Antwort A1", "e", 116);
          z.balken("e", 116, 141, "läuft");
          z.einreihen("lager", 130, "Antwort A5", 1);
          s.zeile = 1;
        },
        duration: 4500
      },
      {
        title: "Eins nach dem anderen",
        text: "<p>Ist Thread 1 frei, holt er den nächsten Eintrag aus der Warteschlange: die Antwort auf A5, danach die auf A9.</p><p>Seine drei Anfragen sind nach gut <b>190 ms</b> fertig. Beim Pool hält jede wartende Anfrage einen eigenen Thread fest.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.notiz("e", 136, "✓ A1", "fertig", { seite: "links" });
          z.holen("Antwort A5", "e", 141);
          z.balken("e", 141, 166, "läuft");
          z.notiz("e", 161, "✓ A5", "fertig", { seite: "links" });
          z.einreihen("lager", 150, "Antwort A9", 2);
          z.holen("Antwort A9", "e", 166);
          z.balken("e", 166, 191, "läuft");
          z.notiz("e", 186, "✓ A9", "fertig", { seite: "links" });
          s.zeile = 2;
        },
        duration: 6000
      },
      {
        title: "Der Preis",
        text: "<p>Der Code ist kein Ablauf mehr, sondern eine Kette von <b>Fortsetzungen</b>. Ein Fehler zeigt im Stacktrace die Ereignisschleife, nicht den Aufrufer. Ein <code>try</code>/<code>catch</code> um die Kette fängt nichts. Und ein einziger blockierender Aufruf – ein alter JDBC-Treiber, ein <code>synchronized</code> – legt die <b>ganze Schleife</b> lahm: Dann wartet alles in der Warteschlange.</p>",
        apply: function (s) { s.zeile = null; }
      },
      {
        title: "Merksatz",
        text: "<p><b>Reaktiv löst das Warten – mit einem anderen Programmiermodell.</b></p><p>Seine Stärken jenseits des Wartens: Datenströme, Backpressure, Ereignisse. Für Request/Response war das Warten oft der einzige Grund.</p>",
        apply: function () {},
        duration: 5000
      }
    ]
  });

  /* SZENARIO 3: VIRTUELLE THREADS ---------------------------------------------
     Ein Trägerthread, zwei virtuelle Threads. Der virtuelle Thread wartet wie ein
     Plattform-Thread – aber geparkt auf dem Heap; der Träger ist frei. */
  sim.registerScenario({
    id: "virtuell",
    title: "Virtuelle Threads",
    description: "Jede Anfrage bekommt einen virtuellen Thread. Wer wartet, wird ausgehängt und gibt seinen Trägerthread frei.",
    state: ausgangslage,
    steps: [
      {
        title: "Ausgangslage",
        text: "<p>Ein <b>Trägerthread</b> – ein echter Thread des Betriebssystems; die JVM hält so viele, wie es Kerne gibt, hier einer, wie beim Pool.</p><p>Jede Anfrage bekommt ihren eigenen <b>virtuellen Thread</b> – mit <code>Executors.newVirtualThreadPerTaskExecutor()</code>. Er ist ein Objekt auf dem Heap, kein Thread des Betriebssystems.</p>",
        apply: function () {}
      },
      {
        title: "Einhängen",
        text: "<p>Zum Rechnen braucht ein virtueller Thread einen Träger: V1 wird <b>eingehängt</b> (<em>mount</em>). V2 ist bereit und wartet auf den Träger.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.balken("c", 0, 10, "läuft", "V1", { seite: "links" });
          z.balken("v1", 0, 10, "läuft");
          z.balken("v2", 0, 10, "wartet", "", { name: "v2-bereit" });
        }
      },
      {
        title: "V1 wartet – und wird ausgehängt",
        text: "<p>V1 fragt beim Lager nach. Sein Code <b>blockiert</b> wie gewohnt – aber nicht den Träger: V1 wird <b>ausgehängt</b> (<em>unmount</em>), sein Stack wandert auf den Heap, er ist <b>geparkt</b>. Der Träger ist frei.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.pfeil("v1", "lager", 10, "aufruf", "istVorrätig(A1)", { textBei: 0.75 });
          z.balken("lager", 10, 110, "lager", "100 ms");
          z.balken("v1", 10, 110, "geparkt", "geparkt");
        },
        duration: 4500
      },
      {
        title: "Der freie Träger nimmt V2",
        text: "<p>Auf dem Träger läuft sofort V2 – und wird beim Warten genauso ausgehängt. Jetzt warten <b>beide gleichzeitig</b> auf das Lager.</p><p>Der Träger ist <b>frei</b> – für alles, was rechnen will.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.verlängere("v2-bereit", 12);
          z.balken("c", 12, 22, "läuft", "V2", { seite: "links" });
          z.balken("v2", 12, 22, "läuft");
          z.pfeil("v2", "lager", 22, "aufruf", "istVorrätig(A2)", { textBei: 0.6, unten: true, nachVersatz: 1 });
          z.balken("lager", 22, 122, "lager", "", { versatz: 1 });
          z.balken("v2", 22, 122, "geparkt", "geparkt");
          z.notiz("c", 66, "frei", "frei");
        },
        duration: 4500
      },
      {
        title: "Die Antworten kommen",
        text: "<p>Nach 100 ms antwortet das Lager – an den virtuellen Thread, der gefragt hat. Er ist wieder bereit, wird eingehängt, sobald der Träger frei ist, und macht dort weiter, wo er war.</p><p>Beide sind nach gut <b>160 ms</b> fertig – mit einem Träger. Beim Pool hält jede wartende Anfrage einen eigenen Thread fest.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.pfeil("lager", "v1", 110, "antwort", "vorrätig", { textBei: 0.2 });
          z.balken("c", 110, 135, "läuft", "V1", { seite: "links" });
          z.balken("v1", 110, 135, "läuft");
          z.notiz("v1", 129, "✓ A1", "fertig", { seite: "links" });
          z.pfeil("lager", "v2", 122, "antwort", "vorrätig", { textBei: 0.3, unten: true, vonVersatz: 1 });
          z.balken("v2", 122, 135, "wartet");
          z.balken("c", 135, 160, "läuft", "V2", { seite: "links" });
          z.balken("v2", 135, 160, "läuft");
          z.notiz("v2", 154, "✓ A2", "fertig", { seite: "links" });
        },
        duration: 5000
      },
      {
        title: "Merksatz",
        text: "<p><b>Warten kostet keinen Thread des Betriebssystems mehr.</b></p><p>Der Code bleibt blockierend und lesbar – anders als reaktiv. Nur der Thread ist ein anderer. Gemessen im Übungsprojekt: 200 Bestellungen in gut 0,2 Sekunden statt 2,2.</p>",
        apply: function () {},
        duration: 5000
      }
    ]
  });

  /* SZENARIO 4: PINNING -------------------------------------------------------
     Wie Szenario 3 mit zwei virtuellen Threads – aber das Warten steht in einer
     synchronized-Methode. Unter Java 21 bleibt der Träger blockiert; der Schritt
     „Java 25“ ersetzt das Bild durch den Ablauf ohne Pinning. */
  function ohnePinning(s, info) {
    var z = zeichner(s, info);
    s.elemente = [];
    z.balken("c", 0, 10, "läuft", "V1", { seite: "links" });
    z.balken("v1", 0, 10, "läuft");
    z.pfeil("v1", "lager", 10, "aufruf", "sende(A1)", { textBei: 0.8 });
    z.balken("lager", 10, 110, "lager", "100 ms");
    z.balken("v1", 10, 110, "geparkt", "geparkt –\nhält den Monitor");
    z.balken("v2", 0, 12, "wartet");
    z.balken("c", 12, 22, "läuft", "V2", { seite: "links" });
    z.balken("v2", 12, 22, "läuft");
    z.pfeil("v2", "lager", 22, "aufruf", "sende(A2)", { textBei: 0.6, nachVersatz: 1 });
    z.balken("lager", 22, 122, "lager", "", { versatz: 1 });
    z.balken("v2", 22, 122, "geparkt", "geparkt");
    z.notiz("c", 66, "frei", "frei");
    z.pfeil("lager", "v1", 110, "antwort", "OK", { textBei: 0.2 });
    z.balken("c", 110, 135, "läuft", "V1", { seite: "links" });
    z.balken("v1", 110, 135, "läuft");
    z.notiz("v1", 129, "✓ A1", "fertig", { seite: "links" });
    z.pfeil("lager", "v2", 122, "antwort", "OK", { textBei: 0.3, vonVersatz: 1 });
    z.balken("v2", 122, 135, "wartet");
    z.balken("c", 135, 160, "läuft", "V2", { seite: "links" });
    z.balken("v2", 135, 160, "läuft");
    z.notiz("v2", 154, "✓ A2", "fertig", { seite: "links" });
  }

  sim.registerScenario({
    id: "pinning",
    title: "Pinning in synchronized",
    description: "Wartet ein virtueller Thread in einem synchronized-Block, hält er unter Java 21 seinen Träger fest. Java 25 gibt ihn frei.",
    state: ausgangslage,
    steps: [
      {
        title: "Ausgangslage",
        text: "<p>Derselbe Träger, zwei virtuelle Threads – und diesmal der Code, den sie ausführen: <code>Verbindung.sende</code> aus dem Übungsprojekt, eine <code>synchronized</code>-Methode, wie sie viele Bibliotheken aus der Java-8-Zeit haben.</p>",
        apply: function () {}
      },
      {
        title: "V1 betritt den Monitor",
        text: "<p>V1 wird eingehängt, ruft <code>sende</code> auf und nimmt damit den <b>Monitor</b> dieser Verbindung. Umkämpft ist er nicht – jede Anfrage hat ihre eigene Verbindung.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.balken("c", 0, 10, "läuft", "V1", { seite: "links" });
          z.balken("v1", 0, 10, "läuft");
          z.balken("v2", 0, 10, "wartet", "", { name: "v2-bereit" });
          s.zeile = 0;
        }
      },
      {
        title: "Warten im Monitor: Java 21 pinnt",
        text: "<p>V1 wartet auf das Netz – <b>innerhalb</b> von <code>synchronized</code>. Unter Java 21 kann die JVM ihn dann nicht aushängen: Er ist an seinen Träger <b>gepinnt</b>.</p><p>Der Träger <b>blockiert</b> wie ein Thread im Pool und ist nicht nutzbar. V2 wartet, obwohl der Prozessor nichts tut.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.pfeil("v1", "lager", 10, "aufruf", "sende(A1)", { textBei: 0.8 });
          z.balken("lager", 10, 110, "lager", "100 ms");
          z.balken("v1", 10, 110, "blockiert", "wartet im\nMonitor");
          z.balken("c", 10, 110, "gepinnt", "gepinnt –\nnicht nutzbar", { seite: "links" });
          z.verlängere("v2-bereit", 110);
          s.zeile = 2;
        },
        duration: 4500
      },
      {
        title: "Zurück beim festen Pool",
        text: "<p>Erst wenn V1 fertig ist, kommt V2 dran – und pinnt wieder. Virtuelle Threads verhalten sich hier wie ein Pool <b>mit so vielen Threads wie Kernen</b> – das Bild ist das des festen Pools.</p><p>Gemessen im Batch-Import unter Java 21: 906 ms statt 63 ms.</p>",
        apply: function (s, info) {
          var z = zeichner(s, info);
          z.pfeil("lager", "v1", 110, "antwort", "OK", { textBei: 0.2 });
          z.balken("c", 110, 135, "läuft", "V1", { seite: "links" });
          z.balken("v1", 110, 135, "läuft");
          z.notiz("v1", 129, "✓ A1", "fertig", { seite: "links" });
          z.verlängere("v2-bereit", 135);
          z.balken("c", 135, 145, "läuft", "V2", { seite: "links" });
          z.balken("v2", 135, 145, "läuft");
          z.pfeil("v2", "lager", 145, "aufruf", "sende(A2)", { textBei: 0.6 });
          z.balken("lager", 145, 245, "lager");
          z.balken("v2", 145, 245, "blockiert", "wartet im\nMonitor");
          z.balken("c", 145, 245, "gepinnt", "gepinnt –\nnicht nutzbar", { seite: "links" });
          z.pfeil("lager", "v2", 245, "antwort", "OK", { textBei: 0.3 });
          z.balken("c", 245, 270, "läuft", "V2", { seite: "links" });
          z.balken("v2", 245, 270, "läuft");
          z.notiz("v2", 264, "✓ A2", "fertig", { seite: "links" });
          s.zeile = null;
        },
        duration: 7500
      },
      {
        title: "Dasselbe Programm unter Java 25",
        text: "<p>Seit Java 24 (JEP 491, im Kurs <b>LTS 25</b>) kann ein virtueller Thread auch im Monitor ausgehängt werden – er behält den Monitor, gibt aber den Träger frei.</p><p>Das Bild ist wieder das der virtuellen Threads: beide nach gut 160 ms fertig statt nach 270.</p>",
        apply: function (s, info) {
          s.jdk = "25";
          ohnePinning(s, info);
        }
      },
      {
        title: "Merksatz",
        text: "<p><b>Unter Java 21 gehört kein blockierender Aufruf in <code>synchronized</code> – unter Java 25 darf er.</b></p><p>Wer auf 21 bleibt, nimmt einen <code>ReentrantLock</code> oder eine neuere Bibliothek. Sichtbar wird Pinning mit Java Flight Recorder, Ereignis <code>jdk.VirtualThreadPinned</code>.</p>",
        apply: function () {},
        duration: 5000
      }
    ]
  });
  /* SZENARIO 5: ENTSCHEIDUNGSBILD --------------------------------------------- */
  sim.registerScenario({
    id: "entscheidung",
    title: "Was passt wann?",
    description: "Fester Pool, reaktiv oder virtuelle Threads – Kriterium für Kriterium.",
    state: ausgangslage,
    steps: [
      {
        title: "Ausgangslage",
        text: "<p>Drei Wege, mit Anfragen umzugehen, die auf andere Systeme warten. Kriterium für Kriterium – welcher passt wann?</p>",
        apply: function () {}
      },
      {
        title: "Programmiermodell",
        text: "<p>Fester Pool und virtuelle Threads schreiben denselben Code: <b>blockierend</b>, von oben nach unten. Reaktiv zerlegt ihn in Fortsetzungen.</p>",
        apply: function (s) { s.zeilen.push("modell"); }
      },
      {
        title: "Wer wartet",
        text: "<p>Nur beim festen Pool hält ein <b>Thread des Betriebssystems</b> das Warten aus – deshalb ist er der Engpass.</p>",
        apply: function (s) { s.zeilen.push("warten"); }
      },
      {
        title: "Fehlersuche",
        text: "<p>Ein virtueller Thread hat einen gewöhnlichen Stack: Stacktrace, Debugger und Profiler zeigen den Aufrufer. Reaktiv zeigt der Stacktrace die Ereignisschleife.</p>",
        apply: function (s) { s.zeilen.push("fehler"); }
      },
      {
        title: "Datenströme und Backpressure",
        text: "<p>Hier bleibt reaktiv stark: Ein Strom, dessen Empfänger langsamer ist als der Sender, braucht Backpressure – reaktive Bibliotheken bringen sie mit. Mit virtuellen Threads begrenzt man selbst, etwa mit einer <code>Semaphore</code>.</p>",
        apply: function (s) { s.zeilen.push("strom"); }
      },
      {
        title: "In Quarkus",
        text: "<p>Quarkus bietet alle drei: blockierende Endpunkte auf einem <b>Worker-Pool</b>, reaktive mit <b>Mutiny</b> auf Vert.x – und <code>@RunOnVirtualThread</code>, das einen blockierenden Endpunkt auf einem neuen virtuellen Thread ausführt. Ausdrücklich je Endpunkt, nicht für die ganze Anwendung.</p>",
        apply: function (s) { s.zeilen.push("quarkus"); }
      },
      {
        title: "Merksatz",
        text: "<p><b>Für Request/Response mit viel Warten: virtuelle Threads. Für Datenströme, Backpressure und Ereignisse: reaktiv.</b></p><p>Der feste Pool bleibt, wo kaum gewartet wird – oder wo der Server ihn verwaltet.</p>",
        apply: function () {},
        duration: 5000
      }
    ]
  });
})();
