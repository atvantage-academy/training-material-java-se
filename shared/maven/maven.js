(function () {
  "use strict";

  // Ohne Skript ist alles sichtbar: Baum und Liste, alle Befehle mit ihrer Ausgabe. Das
  // Skript macht daraus Auswahlen, schreibt sie über skr.state in die Adresse, lässt die
  // Phasen eines Befehls der Reihe nach aufleuchten und die Konsole synchron mitlaufen.

  function zustand() { return window.skr && window.skr.state; }
  function zustandMelden() { if (zustand()) zustand().update(); }
  function anmelden(key, read, apply) {
    if (zustand()) zustand().register({ key: key, read: read, apply: apply });
  }
  const ruhig = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  function element(tag, klasse, text) {
    const el = document.createElement(tag);
    if (klasse) el.className = klasse;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  // ---------- Auswahl: Knöpfe (data-mv-wert) und Teile (data-mv-id) ----------
  function wahlEinrichten(wahl, beiWahl) {
    const knöpfe = Array.from(wahl.querySelectorAll(".mv-knopf[data-mv-wert]"));
    const teile = Array.from(wahl.querySelectorAll(".mv-panel[data-mv-id]"));
    if (!knöpfe.length || !teile.length) return null;
    const ids = teile.map(function (t) { return t.dataset.mvId; });
    const standard = ids.indexOf(wahl.dataset.mvStandard) >= 0 ? wahl.dataset.mvStandard : ids[0];
    let aktuell = standard;

    function zeigen(wert, durchKlick) {
      if (ids.indexOf(wert) < 0) wert = standard;
      aktuell = wert;
      teile.forEach(function (t) {
        const sichtbar = t.dataset.mvId === wert;
        const war = !t.hidden;
        t.hidden = !sichtbar;
        if (sichtbar && !war) t.dispatchEvent(new CustomEvent("skr-content-added", { bubbles: true }));
      });
      knöpfe.forEach(function (k) { k.setAttribute("aria-pressed", String(k.dataset.mvWert === wert)); });
      if (beiWahl) beiWahl(wert, durchKlick, teile[ids.indexOf(wert)]);
    }

    wahl.addEventListener("click", function (e) {
      const k = e.target.closest(".mv-knopf[data-mv-wert]");
      if (!k || !wahl.contains(k)) return;
      zeigen(k.dataset.mvWert, true);
      zustandMelden();
    });

    zeigen(standard, false);
    anmelden(wahl.dataset.mvKey,
      function () { return aktuell; },
      function (wert) { zeigen(wert || standard, false); });
    return { zeigen: zeigen, aktuell: function () { return aktuell; } };
  }

  // ---------- Auflösung: rechts wählen, links den Pfad sehen ----------
  function aufloesungEinrichten(box) {
    const einträge = Array.from(box.querySelectorAll(".mv-eintrag[data-mv-wert]"));
    const knoten = Array.from(box.querySelectorAll(".mv-knoten[data-mv-bib]"));
    const info = box.querySelector(".mv-aufloesung__info");
    const baum = box.querySelector(".mv-baum");
    if (!einträge.length || !knoten.length || !info || !baum) return;
    const anfang = info.textContent;
    let aktuell = "";

    function name(k) { return k.querySelector(".mv-knoten__name").textContent; }
    function version(k) { const v = k.querySelector(".mv-knoten__version"); return v ? v.textContent : ""; }
    function pfad(k) {
      const weg = [];
      let li = k.closest("li");
      while (li && baum.contains(li)) {
        const kn = li.querySelector(":scope > .mv-knoten");
        if (kn) weg.unshift(kn);
        li = li.parentElement ? li.parentElement.closest("li") : null;
      }
      return weg;
    }

    function zeigen(bib) {
      baum.querySelectorAll(".is-weg").forEach(function (el) { el.classList.remove("is-weg"); });
      knoten.forEach(function (k) { k.classList.remove("is-ziel", "is-verworfen", "is-doppelt"); });
      const gewinner = knoten.find(function (k) {
        return k.dataset.mvBib === bib && !k.classList.contains("mv-knoten--verlierer") &&
          !k.classList.contains("mv-knoten--doppelt");
      });
      aktuell = gewinner ? bib : "";
      einträge.forEach(function (e) { e.setAttribute("aria-pressed", String(e.dataset.mvWert === aktuell)); });
      info.textContent = "";
      if (!gewinner) { info.textContent = anfang; return; }

      const weg = pfad(gewinner);
      weg.forEach(function (k) { k.closest("li").classList.add("is-weg"); });
      gewinner.classList.add("is-ziel");

      const kopf = element("span");
      kopf.append(element("strong", "", name(gewinner) + " " + version(gewinner)), " – Pfad: ");
      weg.forEach(function (k, i) {
        if (i) kopf.append(" → ");
        kopf.append(element("code", "", name(k)));
      });
      kopf.append(" (Tiefe " + (weg.length - 1) + (weg.length === 2 ? ", selbst deklariert)." : ")."));
      info.append(kopf);

      // Dieselbe Version über einen weiteren Pfad: kein Konflikt, Maven nimmt sie einmal.
      knoten.filter(function (k) {
        return k.dataset.mvBib === bib && k.classList.contains("mv-knoten--doppelt");
      }).forEach(function (k) {
        k.classList.add("is-doppelt");
        const w = pfad(k);
        info.append(element("br"), "Ebenfalls über ");
        info.append(element("code", "", name(w[w.length - 2])));
        info.append(" (Tiefe " + (w.length - 1) + ") – gleiche Version, kein Konflikt: Maven nimmt sie einmal.");
      });

      // Eine andere Version über einen weiteren Pfad: ein Konflikt, diese Version verliert.
      knoten.filter(function (k) {
        return k.dataset.mvBib === bib && k.classList.contains("mv-knoten--verlierer");
      }).forEach(function (k) {
        k.classList.add("is-verworfen");
        const w = pfad(k);
        info.append(element("br"), "Konflikt – verworfen: " + version(k) + " über ");
        info.append(element("code", "", name(w[w.length - 2])));
        info.append(" (Tiefe " + (w.length - 1) + ") – " + (k.dataset.mvGrund || "") + ".");
      });
    }

    box.addEventListener("click", function (e) {
      const eintrag = e.target.closest(".mv-eintrag[data-mv-wert]");
      if (!eintrag || !box.contains(eintrag)) return;
      zeigen(eintrag.dataset.mvWert === aktuell ? "" : eintrag.dataset.mvWert);
      zustandMelden();
    });
    anmelden(box.dataset.mvKey || "bibliothek",
      function () { return aktuell; },
      function (wert) { zeigen(wert || ""); });
  }

  // ---------- Kreuzeltabelle der transitiven Scopes ----------
  const GRÜNDE = {
    provided: "B braucht C nur zum Übersetzen und erwartet es von seiner Umgebung. Das gibt Maven nicht weiter – braucht A das C, deklariert A es selbst.",
    test: "C dient nur den Tests von B. Die laufen beim Bau von B, nicht bei A – Maven gibt test nicht weiter.",
    "compile|compile": "C gehört zur Schnittstelle von B, A sieht es schon beim Übersetzen. Die Maven-Doku merkt an: Gedacht wäre runtime – aber erbt eine Klasse aus B von einer aus C, muss C beim Übersetzen da sein.",
    "compile|runtime": "B braucht C erst zur Laufzeit – dann braucht A es auch nicht früher.",
    "provided|compile": "B kommt aus der Umgebung, etwa vom Server. Was B mitbringt, liefert dieselbe Umgebung – also ebenfalls provided.",
    "provided|runtime": "B kommt aus der Umgebung, und mit B auch das, was B zur Laufzeit braucht – provided.",
    "runtime|compile": "A übersetzt nicht gegen B, also auch nicht gegen das, was B mitbringt – runtime.",
    "runtime|runtime": "Beide nur zur Laufzeit – runtime.",
    "test|compile": "B dient nur den Tests von A, und alles, was B mitbringt, ebenso – test.",
    "test|runtime": "B dient nur den Tests von A; was B zur Laufzeit braucht, braucht A beim Testen – test."
  };
  const GEMESSEN = {
    "compile|compile": "Gemessen: jackson-databind (compile) → jackson-core (compile) erscheint als compile.",
    "test|compile": "Gemessen: mockito-core (test) → byte-buddy (compile) erscheint als test.",
    "test|runtime": "Gemessen: junit-jupiter (test) → junit-jupiter-engine (runtime) erscheint als test."
  };
  const SCOPES = ["compile", "provided", "runtime", "test"];

  function kreuzEinrichten(kreuz) {
    const zellen = Array.from(kreuz.querySelectorAll(".mv-zelle[data-mv-x]"));
    const formel = kreuz.querySelector(".mv-kreuz__formel");
    const grund = kreuz.querySelector(".mv-kreuz__grund");
    const köpfe = Array.from(kreuz.querySelectorAll("thead th"));
    if (!zellen.length || !formel || !grund) return;
    const anfang = formel.textContent;
    let x = "";
    let y = "";

    function scopeMarke(wert) { return element("span", "mv-scope mv-scope--" + wert, wert); }

    function zeichnen() {
      kreuz.querySelectorAll(".is-zeile, .is-spalte").forEach(function (el) { el.classList.remove("is-zeile", "is-spalte"); });
      formel.textContent = "";
      grund.textContent = "";
      if (!x && !y) {
        zellen.forEach(function (z) { z.setAttribute("aria-pressed", "false"); });
        formel.textContent = anfang;
        return;
      }
      const zx = x || "compile";
      const zy = y || "compile";
      let gewählt = null;
      zellen.forEach(function (z) {
        const passt = z.dataset.mvX === zx && z.dataset.mvY === zy;
        z.setAttribute("aria-pressed", String(passt));
        if (passt) gewählt = z;
      });
      if (!gewählt) return;
      gewählt.closest("tr").classList.add("is-zeile");
      const spalte = köpfe[SCOPES.indexOf(zy) + 1];
      if (spalte) spalte.classList.add("is-spalte");

      const z = gewählt.dataset.mvZ;
      formel.append("A → B (", scopeMarke(zx), "), B → C (", scopeMarke(zy), ") ⇒ A → C (");
      if (z === "–") formel.append("– nicht weitergegeben");
      else formel.append(scopeMarke(z));
      formel.append(")");

      const schlüssel = zx + "|" + zy;
      grund.textContent = GRÜNDE[schlüssel] || GRÜNDE[zy] || "";
      if (GEMESSEN[schlüssel]) grund.append(" " + GEMESSEN[schlüssel]);
    }

    kreuz.addEventListener("click", function (e) {
      const zelle = e.target.closest(".mv-zelle[data-mv-x]");
      if (!zelle || !kreuz.contains(zelle)) return;
      x = zelle.dataset.mvX;
      y = zelle.dataset.mvY;
      zeichnen();
      zustandMelden();
    });

    function gültig(wert) { return SCOPES.indexOf(wert) >= 0 ? wert : ""; }
    anmelden("x", function () { return x; }, function (wert) { x = gültig(wert); zeichnen(); });
    anmelden("y", function () { return y; }, function (wert) { y = gültig(wert); zeichnen(); });
    zeichnen();
  }

  // ---------- Konsole: Zeilen färben wie im Terminal ----------
  // Je Zeile: Stufe ([INFO] blau, [WARNING] gelb, [ERROR] rot), Goal-Zeilen mit Plugin grün
  // und Projekt cyan, BUILD SUCCESS grün. Alles per textContent, kein HTML aus Daten.
  function zeileFärben(text) {
    const zeile = element("span", "mv-k-zeile");
    const m = /^\[(INFO|WARNING|ERROR)\]( ?)(.*)$/.exec(text);
    if (!m) { zeile.textContent = text; return zeile; }
    const stufe = { INFO: "mv-k-info", WARNING: "mv-k-warn", ERROR: "mv-k-fehler" }[m[1]];
    zeile.append(element("span", stufe, "[" + m[1] + "]"), m[2]);
    const rest = m[3];
    let g;
    if (m[1] !== "INFO") {
      zeile.append(element("span", m[1] === "WARNING" ? "mv-k-gelb" : "mv-k-fehler", rest));
    } else if ((g = /^--- (\S+) (\([^)]+\)) @ (\S+) ---$/.exec(rest))) {
      zeile.append("--- ", element("span", "mv-k-plugin", g[1]), " " + g[2] + " @ ",
        element("span", "mv-k-projekt", g[3]), " ---");
    } else if ((g = /^(-+< )(\S+)( >-+)$/.exec(rest))) {
      zeile.append(element("span", "mv-k-blass", g[1]), element("span", "mv-k-projekt", g[2]),
        element("span", "mv-k-blass", g[3]));
    } else if (/^-+(\[ \w+ \]-+)?$/.test(rest)) {
      zeile.append(element("span", "mv-k-blass", rest));
    } else if (/^BUILD SUCCESS/.test(rest)) {
      zeile.append(element("span", "mv-k-erfolg", rest));
    } else if (/^BUILD FAILURE/.test(rest)) {
      zeile.append(element("span", "mv-k-fehler", rest));
    } else if (/^(Building [\w.-]+ [\w.-]+|\s*T E S T S)$/.test(rest)) {
      zeile.append(element("span", "mv-k-fett", rest));
    } else {
      zeile.append(rest);
    }
    return zeile;
  }

  // Ordnet jede Zeile einer Gruppe zu: „vor“ (Kopf), dem Goal (resources:resources …),
  // dessen Ausgabe sie ist, oder „nach“ (BUILD SUCCESS und Schluss).
  function konsoleBauen(konsole, text) {
    konsole.textContent = "";
    const zeilen = [];
    let gruppe = "vor";
    text.replace(/\n$/, "").split("\n").forEach(function (t) {
      const goal = /--- ([\w-]+):[^:\s]+:([\w-]+) \(/.exec(t);
      if (goal) gruppe = goal[1] + ":" + goal[2];
      if (/BUILD (SUCCESS|FAILURE)/.test(t)) {
        gruppe = "nach";
        const davor = zeilen[zeilen.length - 1];
        if (davor && /^\[INFO\] -+$/.test(davor.text)) davor.gruppe = "nach";
      }
      const el = zeileFärben(t);
      el.hidden = true;
      konsole.appendChild(el);
      zeilen.push({ text: t, gruppe: gruppe, el: el });
    });
    return zeilen;
  }

  // ---------- Befehl → durchlaufene Phasen und Konsole ----------
  function laufEinrichten(lauf) {
    const phasen = Array.from(lauf.querySelectorAll(".mv-phase[data-mv-phase]"));
    const stand = lauf.querySelector(".mv-lauf__stand");
    const abspielen = lauf.querySelector(".mv-abspielen");
    const konsole = lauf.querySelector(".mv-konsole");
    const knöpfe = Array.from(lauf.querySelectorAll(".mv-knopf[data-mv-wert]"));
    if (!phasen.length) return;
    let uhr = null;

    function durchlauf(wert) {
      const knopf = knöpfe.find(function (k) { return k.dataset.mvWert === wert; });
      if (!knopf) return [];
      const liste = [];
      knopf.dataset.mvPhasen.split(" ").forEach(function (ziel) {
        const zielPhase = phasen.find(function (p) { return p.dataset.mvPhase === ziel; });
        if (!zielPhase) return;
        const zyklus = phasen.filter(function (p) { return p.dataset.mvZyklus === zielPhase.dataset.mvZyklus; });
        liste.push.apply(liste, zyklus.slice(0, zyklus.indexOf(zielPhase) + 1));
      });
      return liste;
    }

    function goalVon(phase) {
      const g = phase.querySelector(".mv-phase__goal");
      return g ? g.textContent.trim() : "";
    }

    function bilanz(wert, liste) {
      if (!stand) return;
      const knopf = knöpfe.find(function (k) { return k.dataset.mvWert === wert; });
      const jeZyklus = {};
      let goals = 0;
      liste.forEach(function (p) {
        jeZyklus[p.dataset.mvZyklus] = (jeZyklus[p.dataset.mvZyklus] || 0) + 1;
        if (goalVon(p)) goals++;
      });
      const teile = Object.keys(jeZyklus).map(function (z) {
        return jeZyklus[z] + (jeZyklus[z] === 1 ? " Phase" : " Phasen") + " aus " + z;
      });
      stand.textContent = "";
      stand.append(element("code", "", knopf ? knopf.textContent.trim() : ""),
        " durchläuft " + teile.join(" und ") + " – dabei " +
        (goals === 1 ? "läuft 1 Goal." : "laufen " + goals + " Goals."));
    }

    function zeilenZeigen(zeilen, gruppe, neu) {
      zeilen.forEach(function (z) {
        if (z.gruppe !== gruppe || !z.el.hidden) return;
        z.el.hidden = false;
        if (neu) z.el.classList.add("is-neu");
      });
    }

    function zeigen(wert, durchKlick, teil) {
      if (uhr) { window.clearTimeout(uhr); uhr = null; }
      phasen.forEach(function (p) { p.classList.remove("is-dran", "is-jetzt", "is-ziel"); });
      const liste = durchlauf(wert);
      bilanz(wert, liste);

      let zeilen = [];
      const quelle = teil ? teil.querySelector("pre code") : null;
      if (konsole && quelle) {
        zeilen = konsoleBauen(konsole, quelle.textContent);
        konsole.setAttribute("aria-label", "Konsole: Ausgabe von " + (teil.querySelector(".mv-schritt") || teil).textContent.trim());
      }

      function ende() {
        liste.forEach(function (p) { p.classList.add("is-dran"); });
        if (liste.length) liste[liste.length - 1].classList.add("is-ziel");
        zeilen.forEach(function (z) { z.el.hidden = false; });
        if (konsole) konsole.dispatchEvent(new CustomEvent("skr-content-added", { bubbles: true }));
      }

      if (!durchKlick || ruhig.matches) { ende(); return; }
      zeilenZeigen(zeilen, "vor", true);
      let i = 0;
      (function schritt() {
        if (i > 0) liste[i - 1].classList.remove("is-jetzt");
        if (i >= liste.length) {
          zeilenZeigen(zeilen, "nach", true);
          uhr = null;
          ende();
          return;
        }
        const p = liste[i];
        p.classList.add("is-dran", "is-jetzt");
        const goal = goalVon(p);
        if (goal) zeilenZeigen(zeilen, goal, true);
        i++;
        // Phasen mit Goal verweilen länger: Dort geschieht etwas.
        uhr = window.setTimeout(schritt, goal ? 520 : 150);
      })();
    }

    const wahl = wahlEinrichten(lauf, zeigen);
    if (abspielen && wahl) {
      abspielen.addEventListener("click", function () {
        const teil = lauf.querySelector('.mv-panel[data-mv-id="' + wahl.aktuell() + '"]');
        zeigen(wahl.aktuell(), true, teil);
      });
    }
  }

  function start() {
    document.body.classList.add("mv-aktiv");
    document.querySelectorAll(".mv-wahl[data-mv-key]:not(.mv-lauf)").forEach(function (w) { wahlEinrichten(w); });
    document.querySelectorAll(".mv-lauf[data-mv-key]").forEach(laufEinrichten);
    document.querySelectorAll(".mv-aufloesung").forEach(aufloesungEinrichten);
    document.querySelectorAll(".mv-kreuz").forEach(kreuzEinrichten);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
