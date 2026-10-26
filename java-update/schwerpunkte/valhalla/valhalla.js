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
      identitaet: [true, "geht – der Compiler warnt bei wertbasierten Klassen (JEP 390)."],
      wert: [false, "übersetzt nicht („required: identity class“); über eine Variable vom Typ Object: IdentityException zur Laufzeit."] },
    { was: "new WeakReference<>(a)", erklärung: "schwache Referenz, WeakHashMap",
      identitaet: [true, "geht – JDK 25 warnt bei wertbasierten Klassen."],
      wert: [false, "IdentityException: „… is not an identity class“."] },
    { was: "System.identityHashCode(a)", erklärung: "Hash der Identität, IdentityHashMap",
      identitaet: [true, "je Objekt verschieden – eine IdentityHashMap zählt gleiche Werte mehrfach."],
      wert: [true, "aus dem Inhalt berechnet – gleiche Werte, gleicher Hash."] },
    { was: "a = null", erklärung: "Variable ohne Objekt",
      identitaet: [true, "geht."],
      wert: [true, "geht weiterhin – Wertobjekte sind Referenzen. Erst null-restricted Typen (Entwurf) schließen null aus."] }
  ];

  // ---- 2 · Speicher ----
  const layouts = [
    { id: "identitaet", knopf: "Mit Identität", mb: 100, ms: 18,
      titel: "record Platz(int regal, short fach)",
      text: "Das Array hält nur Zeiger. Jedes Objekt liegt für sich im Heap, mit Header, und nach dem Mischen kreuz und quer. Ein Durchlauf springt für jedes Element an eine andere Stelle des Speichers – der Prozessor-Cache hilft kaum." },
    { id: "flach", knopf: "Wert, flach", mb: 41, ms: 2,
      titel: "value record WertPlatz(int regal, short fach)",
      text: "Ohne Identität legt die JVM die Felder direkt ins Array, dazu eine Markierung für null. Kein Zeiger, kein Header: weniger als die Hälfte des Speichers, und ein Durchlauf liest den Speicher am Stück." },
    { id: "gross", knopf: "Wert, zu groß", mb: 145, ms: 32,
      titel: "value record GroßerWertPlatz(int regal, int fach)",
      text: "Zwei int und die Markierung für null passen nicht mehr in 64 Bit, die die JVM in einem Schritt lesen und schreiben kann. Das Array hält wieder Zeiger – und braucht in der Messung sogar mehr Speicher als die Fassung mit Identität." },
    { id: "nullfrei", knopf: "Ohne null (Entwurf)", mb: null, ms: null,
      titel: "GroßerWertPlatz![] – Entwurf, übersetzt mit keinem JDK",
      text: "Null-restricted Typen sollen null ausschließen. Dann braucht die JVM keine Markierung, und auch ein Wert mit zwei int passt flach ins Array. Noch ein Entwurf – Syntax und Umfang können sich ändern." }
  ];

  // ---- 3 · Abhängigkeiten ----
  const kette = [
    { id: "390", jep: "JEP 390", name: "Warnungen für wertbasierte Klassen", stand: "seit 16 · LTS 17", status: "fertig",
      text: "Integer, LocalDate, Optional und andere sind als wertbasiert markiert. Der Compiler warnt beim synchronized auf ihnen, ihre Konstruktoren wie new Integer(…) sind zur Entfernung abgekündigt. Die Vorbereitung darauf, dass diese Klassen ihre Identität verlieren." },
    { id: "513", jep: "JEP 513", name: "Flexible Konstruktoren", stand: "seit 25 · LTS 25", status: "fertig",
      text: "Anweisungen vor super(…). Ein Wertobjekt setzt alle Felder, bevor es fertig ist – genau in diesem Teil des Konstruktors." },
    { id: "401", jep: "JEP 401", name: "Value Objects", stand: "Preview in 28", status: "preview",
      text: "value class und value record: Objekte ohne Identität, == vergleicht den Inhalt. Mit --enable-preview werden Integer, Long, Optional, LocalDate, Instant und weitere zu Wertklassen; String bleibt eine Klasse mit Identität. Nur mit javac --release 28 --enable-preview." },
    { id: "539", jep: "JEP 539", name: "Strikte Feldinitialisierung", stand: "Preview in 28", status: "preview",
      text: "Die JVM garantiert, dass ein Feld nie mit seinem Vorgabewert gelesen wird. Darauf verlassen sich die Wertobjekte: Ein Wert darf nie halb fertig sichtbar werden." },
    { id: "nullfrei", jep: "Entwurf", name: "Null-restricted Typen", stand: "ohne Release", status: "entwurf",
      text: "Platz! schließt null aus, Platz? erlaubt es ausdrücklich. Für die JVM heißt das: keine Markierung für null, also flache Ablage auch für größere Werte. Nebenbei findet der Compiler unerwartete null-Werte." },
    { id: "402", jep: "JEP 402", name: "Primitive als Objekte", stand: "Entwurf", status: "entwurf",
      text: "int und Integer rücken zusammen: Methoden auf primitiven Werten, primitive Typen dort, wo heute nur Klassen stehen dürfen. Setzt voraus, dass Integer ein Wert ist." },
    { id: "218", jep: "JEP 218", name: "Generics über primitive Typen", stand: "Kandidat", status: "entwurf",
      text: "List<int> ohne Boxing – das Fernziel, an dem Valhalla seit 2014 arbeitet." },
    { id: "vector", jep: "JEP 338 ff.", name: "Vector API", stand: "Incubator seit 16", status: "wartet",
      text: "Rechnen auf SIMD-Befehlen des Prozessors. Bleibt im Incubator, bis die Vektoren Wertklassen sein können – ein Vektor ist ein Wert, kein Objekt mit Identität." },
    { id: "519", jep: "JEP 519", name: "Kompakte Objekt-Header", stand: "seit 25 · LTS 25", status: "fertig",
      text: "Kein Teil von Valhalla, aber dasselbe Ziel: weniger Speicher je Objekt. Kompakte Header verkleinern jedes Objekt; Wertobjekte sparen den Header im Array ganz." }
  ];
  const statusText = { fertig: "im JDK", preview: "Preview", entwurf: "Entwurf", wartet: "wartet auf Valhalla" };

  const zustand = { objekt: "identitaet", layout: "identitaet", jep: "401" };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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
    let html = '<table><thead><tr><th scope="col">Vorgang</th><th scope="col">Ergebnis</th></tr></thead><tbody>';
    vorgänge.forEach(function (v) {
      const e = v[zustand.objekt];
      const art = e[0] === null ? ["vh-anders", "→", "Ergebnis"] : e[0] ? ["vh-geht", "✓", "geht"] : ["vh-geht-nicht", "✗", "bricht"];
      html += '<tr><th scope="row"><code>' + esc(v.was) + '</code><small>' + esc(v.erklärung) + "</small></th>" +
        '<td class="' + art[0] + '"><span class="vh-zeichen" aria-hidden="true">' + art[1] + '</span><span class="skr-visually-hidden">' + art[2] + ": </span> " + esc(e[1]) + "</td></tr>";
    });
    document.getElementById("vh-identitaet").innerHTML = html + "</tbody></table>";
  }

  function bildZeichnen(l) {
    const plätze = [["12", "3"], ["7", "1"], ["30", "2"], ["4", "5"]];
    const zeiger = l.id === "identitaet" || l.id === "gross";
    let svg = '<svg viewBox="0 0 1000 ' + (zeiger ? 250 : 145) + '" role="img" aria-label="' + esc(l.knopf + ": " + l.titel) + '">';
    svg += '<text x="20" y="24" class="vh-bild-text">Array mit vier Plätzen</text>';
    const breite = zeiger ? 70 : (l.id === "nullfrei" ? 170 : 150);
    const ziele = [[560, 118], [330, 196], [790, 160], [600, 200]];
    let linien = "";
    plätze.forEach(function (p, i) {
      const x = 20 + i * (breite + 6);
      svg += '<rect class="vh-feld" x="' + x + '" y="36" width="' + breite + '" height="56" rx="4"/>';
      if (zeiger) {
        svg += '<text x="' + (x + breite / 2) + '" y="70" text-anchor="middle" class="vh-bild-text">Zeiger</text>';
        const z = ziele[i];
        linien += '<line class="vh-pfeil" x1="' + (x + breite / 2) + '" y1="92" x2="' + z[0] + '" y2="' + (z[1] + 20) + '"/>';
        svg += '<rect class="vh-objekt" x="' + z[0] + '" y="' + z[1] + '" width="170" height="40" rx="4"/>';
        svg += '<rect class="vh-kopf" x="' + z[0] + '" y="' + z[1] + '" width="56" height="40" rx="4"/>';
        svg += '<text x="' + (z[0] + 28) + '" y="' + (z[1] + 25) + '" text-anchor="middle" class="vh-bild-text vh-bild-text--klein">Header</text>';
        svg += '<text x="' + (z[0] + 113) + '" y="' + (z[1] + 25) + '" text-anchor="middle" class="vh-bild-text vh-bild-text--klein">' + p[0] + " · " + p[1] + "</text>";
      } else {
        const markierung = l.id === "flach";
        svg += '<text x="' + (x + (markierung ? 60 : breite / 2)) + '" y="70" text-anchor="middle" class="vh-bild-text">regal ' + p[0] + " · fach " + p[1] + "</text>";
        if (markierung) {
          svg += '<rect class="vh-kopf" x="' + (x + breite - 34) + '" y="44" width="28" height="40" rx="3"/>';
          svg += '<text x="' + (x + breite - 20) + '" y="69" text-anchor="middle" class="vh-bild-text vh-bild-text--klein">n</text>';
        }
      }
    });
    svg += linien;
    if (l.id === "flach") svg += '<text x="20" y="130" class="vh-bild-text vh-bild-text--klein">n = Markierung für null</text>';
    if (l.id === "nullfrei") svg += '<text x="20" y="130" class="vh-bild-text vh-bild-text--klein">schematisch – Entwurf</text>';
    svg += "</svg>";
    document.getElementById("vh-bild").innerHTML = svg;
  }

  function speicherZeichnen() {
    knöpfe("vh-layouts", layouts, zustand.layout, function (id) { setzen("layout", id); });
    const l = layouts.find(function (e) { return e.id === zustand.layout; });
    bildZeichnen(l);
    const höchstwert = Math.max.apply(null, layouts.filter(function (e) { return e.mb; }).map(function (e) { return e.mb; }));
    let karte = "<p><code>" + esc(l.titel) + "</code></p><p>" + esc(l.text) + "</p>";
    if (l.mb) {
      karte += '<p class="vh-kennzahlen"><span>Speicher <b>' + l.mb + " MB</b></span><span>Durchlauf <b>" + l.ms + " ms</b></span></p>";
      karte += '<div class="vh-balken" aria-hidden="true"><span style="width:' + (100 * l.mb / höchstwert) + '%"></span></div>';
    } else {
      karte += '<p class="vh-kennzahlen"><span>Nicht messbar – noch kein JDK kennt null-restricted Typen.</span></p>';
    }
    document.getElementById("vh-layout-karte").innerHTML = karte;
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
    document.getElementById("vh-jep-karte").innerHTML = "<p><b>" + esc(s.jep + " · " + s.name) + '</b> <span class="skr-badge">' + esc(s.stand) + "</span></p><p>" + esc(s.text) + "</p>";
  }

  function zeichnen() {
    identitätZeichnen();
    speicherZeichnen();
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
    [["objekt", objekte, "identitaet"], ["layout", layouts, "identitaet"], ["jep", kette, "401"]].forEach(function (e) {
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
