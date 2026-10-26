(function () {
  // Gemessen 2026-10-23 auf JDK 25 und JDK 28 Early Access (28-ea+20) mit
  // Wertbasiert.java, Wertklassen.java (schwerpunkte/valhalla) und kleinen Proben.

  // ---- 1 · Identität ----
  const objekte = [
    { id: "identitaet", knopf: "Heute: mit Identität" },
    { id: "wert", knopf: "Wertobjekt (Preview in 28)" }
  ];
  const vorgänge = [
    { was: "a == b", erklärung: "zwei Objekte mit gleichem Inhalt",
      identitaet: [null, "false – zwei Objekte, zwei Identitäten. Bei Integer nur außerhalb von −128 bis 127, darunter liefert der Cache dasselbe Objekt."],
      wert: [null, "true – gleicher Inhalt heißt gleicher Wert. Für Integer gilt das dann für jeden Wert."] },
    { was: "a.equals(b)", erklärung: "Inhalt vergleichen",
      identitaet: [true, "true"],
      wert: [true, "true – equals bleibt der richtige Vergleich."] },
    { was: "synchronized (a)", erklärung: "auf dem Objekt sperren",
      identitaet: [true, "geht – sperrt auf a; wer auf b sperrt, wartet nicht, obwohl der Inhalt gleich ist. Der Compiler warnt nur bei den wertbasierten Klassen des JDK wie Integer oder LocalDate (JEP 390), nicht bei eigenen Records."],
      wert: [false, "übersetzt nicht („required: identity class“); über eine Variable vom Typ Object: IdentityException zur Laufzeit."] },
    { was: "new WeakReference<>(a)", erklärung: "schwache Referenz, WeakHashMap",
      identitaet: [true, "geht – hält a, nicht b: Ist a sonst nirgends mehr erreichbar, räumt der GC es ab, auch wenn b mit gleichem Inhalt weiterlebt. JDK 25 warnt nur bei den wertbasierten Klassen des JDK wie Integer oder LocalDate, nicht bei eigenen Records."],
      wert: [false, "IdentityException: „… is not an identity class“."] },
    { was: "System.identityHashCode(a)", erklärung: "Hash der Identität, IdentityHashMap",
      identitaet: [true, "je Objekt verschieden – eine IdentityHashMap zählt gleiche Werte mehrfach."],
      wert: [true, "aus dem Inhalt berechnet – gleiche Werte, gleicher Hash."] },
    { was: "a = null", erklärung: "Variable ohne Objekt",
      identitaet: [true, "geht."],
      wert: [true, "geht weiterhin – Wertobjekte sind Referenzen. Ausschließen soll null erst ein Entwurf, JEP 8303099 (null-restricted Typen, für alle Referenztypen): Betrag! ist nie null, Betrag? darf null sein, Betrag ohne Zeichen bleibt unbestimmt wie heute. Betrag! b = null übersetzt dann nicht; fließt ein null aus einem unbestimmten Typ hinein, warnt der Compiler, und zur Laufzeit wirft genau diese Zuweisung eine NullPointerException. Felder mit ! müssen im Konstruktor vor super(…) gesetzt sein, Arrays mit ! brauchen beim Anlegen für jedes Element einen Wert. Ein zweiter Entwurf nutzt das für den Speicher: Eine Wertklasse mit implicit-Konstruktor bekommt statt null eine Null-Instanz mit lauter Vorgabewerten und liegt dann ohne Markierung flach im Array. Beide Entwürfe haben noch kein Release."] }
  ];

  // ---- 3 · Abhängigkeiten ----
  const kette = [
    { id: "390", nr: 390, jep: "JEP 390", name: "Warnungen für wertbasierte Klassen", stand: "seit 16 · LTS 17", status: "fertig",
      text: "Integer, LocalDate, Optional und andere sind als wertbasiert markiert. Der Compiler warnt beim synchronized auf ihnen, ihre Konstruktoren wie new Integer(…) sind zur Entfernung abgekündigt. Die Vorbereitung darauf, dass diese Klassen ihre Identität verlieren." },
    { id: "513", nr: 513, jep: "JEP 513", name: "Flexible Konstruktoren", stand: "seit 25 · LTS 25", status: "fertig",
      text: "Anweisungen vor super(…). Ein Wertobjekt setzt alle Felder, bevor es fertig ist – genau in diesem Teil des Konstruktors." },
    { id: "401", nr: 401, jep: "JEP 401", name: "Value Objects", stand: "Preview in 28", status: "preview",
      text: "value class und value record: Objekte ohne Identität, == vergleicht den Inhalt. Mit --enable-preview werden Integer, Long, Optional, LocalDate, Instant und weitere zu Wertklassen; String bleibt eine Klasse mit Identität. Nur mit javac --release 28 --enable-preview." },
    { id: "539", nr: 539, jep: "JEP 539", name: "Strikte Feldinitialisierung", stand: "Preview in 28", status: "preview",
      text: "Die JVM garantiert, dass ein Feld nie mit seinem Vorgabewert gelesen wird. Darauf verlassen sich die Wertobjekte: Ein Wert darf nie halb fertig sichtbar werden." },
    { id: "nullfrei", nr: 8303099, jep: "Entwurf", name: "Null-restricted Typen", stand: "ohne Release", status: "entwurf",
      text: "Heute darf jede Referenz null sein; auffallen tut das erst, wenn eine NullPointerException fliegt – oft weit weg von der Stelle, an der das null hineinkam. Der Entwurf schreibt es an den Typ: Betrag! ist nie null, Betrag? darf null sein, Betrag ohne Zeichen bleibt unbestimmt wie heute. Der Compiler meldet, wo null oder ein unbestimmter Wert in einen Betrag! fließt, und zur Laufzeit wird genau dort geprüft – nicht erst beim ersten Zugriff. Felder und Arrays mit ! müssen gefüllt sein, bevor jemand sie liest; darauf baut JEP 539. Für Valhalla zählt: Ohne null braucht die JVM keine Markierung, und auch größere Werte passen flach ins Array. Noch ein Entwurf ohne Release – Syntax und Umfang können sich ändern." },
    { id: "402", nr: 402, jep: "JEP 402", name: "Primitive als Objekte", stand: "Entwurf", status: "entwurf",
      text: "int und Integer rücken zusammen: Methoden auf primitiven Werten, primitive Typen dort, wo heute nur Klassen stehen dürfen. Setzt voraus, dass Integer ein Wert ist." },
    { id: "218", nr: 218, jep: "JEP 218", name: "Generics über primitive Typen", stand: "Kandidat", status: "entwurf",
      text: "List<int> ohne Boxing – das Fernziel, an dem Valhalla seit 2014 arbeitet." },
    { id: "vector", nr: 338, jep: "JEP 338 ff.", name: "Vector API", stand: "Incubator seit 16", status: "wartet",
      text: "Rechnen auf SIMD-Befehlen des Prozessors. Bleibt im Incubator, bis die Vektoren Wertklassen sein können – ein Vektor ist ein Wert, kein Objekt mit Identität." },
    { id: "519", nr: 519, jep: "JEP 519", name: "Kompakte Objekt-Header", stand: "seit 25 · LTS 25", status: "fertig",
      text: "Kein Teil von Valhalla, aber dasselbe Ziel: weniger Speicher je Objekt. Kompakte Header verkleinern jedes Objekt; Wertobjekte sparen den Header im Array ganz." }
  ];
  const statusText = { fertig: "im JDK", preview: "Preview", entwurf: "Entwurf", wartet: "wartet auf Valhalla" };

  const zustand = { objekt: "identitaet", jep: "401" };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Jeder JEP führt zur JEP-Landkarte. Ihre Adresse nimmt das Skript von einem Verweis in
  // der Seite, den das Skriptorium schon aufgelöst hat.
  function landkarte() {
    const verweis = document.querySelector('a[href*="jep-landkarte"]');
    return verweis ? verweis.getAttribute("href").split("#")[0] : "";
  }
  function jepVerweis(nr, text) {
    const ziel = landkarte();
    return ziel ? '<a href="' + esc(ziel + "#/?jep=" + nr) + '">' + esc(text) + "</a>" : esc(text);
  }
  // Maskiert einen Text und verlinkt darin jedes „JEP 390“.
  function mitJeps(text) {
    return esc(text).replace(/JEP (\d+)/g, function (ganz, nr) { return jepVerweis(nr, ganz); });
  }

  // Neu eingesetzte Tabellen meldet die Seite dem Skriptorium (`skr-content-added`):
  // Läuft einer waagerecht über, gibt es ihm einen Haltepunkt in der Tabulatorreihenfolge.
  function inhaltMelden(id) {
    document.getElementById(id).dispatchEvent(new CustomEvent("skr-content-added", { bubbles: true }));
  }

  function knöpfe(behälterId, liste, gewählt, wählen) {
    const behälter = document.getElementById(behälterId);
    behälter.innerHTML = "";
    liste.forEach(function (e) {
      const k = document.createElement("button");
      k.type = "button";
      k.className = "vh-knopf";
      k.dataset.id = e.id;
      k.textContent = e.knopf;
      k.setAttribute("aria-pressed", gewählt === e.id ? "true" : "false");
      k.addEventListener("click", function () { wählen(e.id); });
      behälter.appendChild(k);
    });
  }

  function identitätZeichnen() {
    knöpfe("vh-objekte", objekte, zustand.objekt, function (id) { setzen("objekt", id); });
    document.querySelectorAll(".vh-code").forEach(function (c) { c.hidden = c.dataset.objekt !== zustand.objekt; });
    let html = '<table><thead><tr><th scope="col">Vorgang</th><th scope="col">Ergebnis</th></tr></thead><tbody>';
    vorgänge.forEach(function (v) {
      const e = v[zustand.objekt];
      const art = e[0] === null ? ["vh-anders", "→", "Ergebnis"] : e[0] ? ["vh-geht", "✓", "geht"] : ["vh-geht-nicht", "✗", "bricht"];
      html += '<tr><th scope="row"><code>' + esc(v.was) + '</code><small>' + esc(v.erklärung) + "</small></th>" +
        '<td class="' + art[0] + '"><span class="vh-zeichen" aria-hidden="true">' + art[1] + '</span><span class="skr-visually-hidden">' + art[2] + ": </span> " + mitJeps(e[1]) + "</td></tr>";
    });
    document.getElementById("vh-identitaet").innerHTML = html + "</tbody></table>";
    inhaltMelden("vh-identitaet");
  }

  function ketteZeichnen() {
    const liste = document.getElementById("vh-kette");
    liste.innerHTML = "";
    kette.forEach(function (s) {
      const li = document.createElement("li");
      const k = document.createElement("button");
      k.type = "button";
      k.className = "vh-schritt vh-schritt--" + s.status;
      k.dataset.id = s.id;
      k.setAttribute("aria-pressed", zustand.jep === s.id ? "true" : "false");
      k.innerHTML = '<span class="vh-schritt__jep">' + esc(s.jep) + '</span><span class="vh-schritt__name">' + esc(s.name) +
        '</span><span class="vh-schritt__stand">' + esc(statusText[s.status]) + "</span>";
      k.addEventListener("click", function () { setzen("jep", s.id); });
      li.appendChild(k);
      liste.appendChild(li);
    });
    const s = kette.find(function (e) { return e.id === zustand.jep; });
    document.getElementById("vh-jep-karte").innerHTML = "<p><b>" + esc(s.jep + " · " + s.name) + '</b> <span class="skr-badge">' + esc(s.stand) + "</span></p><p>" + mitJeps(s.text) + "</p>" +
      "<p>" + jepVerweis(s.nr, "In der JEP-Landkarte →") + "</p>";
  }

  function zeichnen() {
    identitätZeichnen();
    ketteZeichnen();
  }

  function setzen(schlüssel, wert) {
    zustand[schlüssel] = wert;
    const aktiv = document.activeElement;
    const fokus = aktiv && aktiv.dataset && aktiv.dataset.id
      ? { box: aktiv.closest("[id]").id, id: aktiv.dataset.id } : null;
    zeichnen();
    if (fokus) {
      const k = document.querySelector("#" + fokus.box + ' [data-id="' + fokus.id + '"]');
      if (k) k.focus();
    }
    if (window.skr && window.skr.state) window.skr.state.update();
  }

  function gültig(liste, wert, vorgabe) {
    return liste.some(function (e) { return e.id === wert; }) ? wert : vorgabe;
  }

  function anmelden() {
    if (!(window.skr && window.skr.state)) return;
    const st = window.skr.state;
    [["objekt", objekte, "identitaet"], ["jep", kette, "401"]].forEach(function (e) {
      st.register({ key: e[0],
        read: function () { return zustand[e[0]]; },
        apply: function (w) { zustand[e[0]] = gültig(e[1], w, e[2]); zeichnen(); } });
    });
  }

  function start() {
    zeichnen();
    anmelden();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
