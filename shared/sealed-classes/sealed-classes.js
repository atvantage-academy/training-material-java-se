(function () {
  // Alle Meldungen gemessen mit javac aus Temurin 17 (switch mit --enable-preview), 21 und 25.
  // Die Hierarchie als Knoten: Name, Kennzeichnung, ob fehlerhaft, Kinder.
  function basis(payPal, extra) {
    return { name: "Zahlart", art: "sealed interface", code: "public sealed interface Zahlart permits Rechnung, Lastschrift, Kreditkarte, PayPal { }", kinder: [
      { name: "Rechnung", art: "record", code: "public record Rechnung(int zahlungszielTage) implements Zahlart { }" },
      { name: "Lastschrift", art: "record", code: "public record Lastschrift(String iban) implements Zahlart { }" },
      { name: "Kreditkarte", art: "sealed", code: "public sealed class Kreditkarte implements Zahlart permits Firmenkarte { }",
        kinder: [{ name: "Firmenkarte", art: "final", code: "public final class Firmenkarte extends Kreditkarte { }" }] },
      payPal
    ].concat(extra || []) };
  }
  // Was gibt Fehler? Je Fall das Diagramm, die eine Zeile Quelltext und das Urteil.
  const fehlerFälle = [
    { id: "korrekt", knopf: "alles korrekt",
      baum: basis({ name: "PayPal", art: "final", code: "public final class PayPal implements Zahlart { }" }),
      wahl: "Zahlart",
      gut: true, text: "Jede erlaubte Unterart hat sich entschieden – `final`, `sealed` oder als Record von sich aus `final` –, und keine fremde erbt." },
    { id: "ohne-modifikator", knopf: "PayPal ohne final/sealed/non-sealed",
      baum: basis({ name: "PayPal", art: "?", fehler: "Modifikator fehlt", code: "public class PayPal implements Zahlart { }" }),
      wahl: "PayPal",
      gut: false, text: "`error: sealed, non-sealed or final modifiers expected` – eine erlaubte Unterart muss sich entscheiden." },
    { id: "ohne-permits", knopf: "Gutschein nicht in permits",
      baum: basis({ name: "PayPal", art: "final", code: "public final class PayPal implements Zahlart { }" }, [{ name: "Gutschein", art: "record", fehler: "nicht in permits", code: "public record Gutschein(int betrag) implements Zahlart { }" }]),
      wahl: "Gutschein",
      gut: false, text: "`error: class is not allowed to extend sealed class: Zahlart (as it is not listed in its 'permits' clause)` – wer nicht in der Liste steht, darf nicht erben." }
  ];
  // Was bedeutet non-sealed? PayPal schließt ab oder öffnet wieder.
  const offenArten = [
    { id: "final", knopf: "final",
      baum: basis({ name: "PayPal", art: "final", code: "public final class PayPal implements Zahlart { }" }),
      wahl: "PayPal",
      text: "Unter `PayPal` ist Schluss – keine Klasse darf davon erben." },
    { id: "non-sealed", knopf: "non-sealed",
      baum: basis({ name: "PayPal", art: "non-sealed", code: "public non-sealed class PayPal implements Zahlart { }", kinder: [{ name: "PayPalPlus", art: "class", code: "public class PayPalPlus extends PayPal { }" }] }),
      wahl: "PayPal",
      text: "Ab `PayPal` ist die Hierarchie wieder **offen** – `PayPalPlus` darf erben, ohne irgendwo zu stehen. Für den `switch` bleibt es trotzdem ein Fall: `case PayPal p` deckt auch `PayPalPlus` ab. Gebraucht wird das etwa, wo ein Framework Klassen per Unterklasse erweitert." }
  ];

  // KLASSENDIAGRAMM als SVG: Wurzel oben, darunter die Unterarten, Generalisierung als
  // Linie mit hohlem Dreieck. Fehlerhafte Klassen gestrichelt und mit ✗ im Text.
  const B = 128, H = 52, LÜCKE = 18, EBENE = 92, RAND = 8;
  function svgEsc(s) { return esc(s).replace(/"/g, "&quot;"); }
  function kasten(k, x, y, gewählt) {
    const klasse = "sk-kasten" + (k.name === gewählt ? " sk-kasten--gewaehlt" : "") + (k.fehler ? " sk-kasten--fehler" : k.art.indexOf("sealed") === 0 ? " sk-kasten--sealed" : k.art === "non-sealed" ? " sk-kasten--offen" : "");
    const art = k.fehler ? "✗ " + k.fehler : "«" + k.art + "»";
    return '<g class="' + klasse + '" data-name="' + svgEsc(k.name) + '" tabindex="0" role="button" aria-pressed="' + String(k.name === gewählt) + '" aria-label="' + svgEsc(k.name + ": Definition zeigen") + '"><rect x="' + x + '" y="' + y + '" width="' + B + '" height="' + H + '" rx="6"/>'
      + '<text class="sk-art" x="' + (x + B / 2) + '" y="' + (y + 20) + '">' + svgEsc(art) + "</text>"
      + '<text class="sk-name" x="' + (x + B / 2) + '" y="' + (y + 40) + '">' + svgEsc(k.name) + "</text></g>";
  }
  function linien(px, py, kinder) {
    // vom Elternkasten (Unterkante px, py) zu den Oberkanten der Kinder
    const bus = py + (EBENE - H) / 2;
    let s = '<path class="sk-linie" d="M' + px + " " + (py + 10) + " V" + bus;
    const xs = kinder.map(function (c) { return c.x + B / 2; });
    s += " M" + Math.min.apply(null, xs.concat([px])) + " " + bus + " H" + Math.max.apply(null, xs.concat([px]));
    kinder.forEach(function (c) { s += " M" + (c.x + B / 2) + " " + bus + " V" + c.y; });
    s += '"/>';
    // hohles Dreieck der Generalisierung an der Unterkante des Elternkastens
    s += '<path class="sk-pfeil" d="M' + px + " " + py + " L" + (px - 7) + " " + (py + 10) + " L" + (px + 7) + " " + (py + 10) + ' Z"/>';
    return s;
  }
  function knoten(baum) {
    return [baum].concat([].concat.apply([], (baum.kinder || []).map(knoten)));
  }
  function diagramm(baum, gewählt) {
    const kinder = baum.kinder;
    const breite = Math.max(kinder.length * B + (kinder.length - 1) * LÜCKE, B) + 2 * RAND;
    const tief = kinder.some(function (k) { return k.kinder; });
    const höhe = H + EBENE + (tief ? EBENE : 0) + 2 * RAND;
    const wx = (breite - B) / 2, wy = RAND;
    let s = kasten(baum, wx, wy, gewählt);
    const plätze = kinder.map(function (k, i) { return { k: k, x: RAND + i * (B + LÜCKE), y: wy + EBENE }; });
    s += linien(wx + B / 2, wy + H, plätze);
    plätze.forEach(function (p) {
      s += kasten(p.k, p.x, p.y, gewählt);
      if (p.k.kinder) {
        const enkel = p.k.kinder.map(function (e) { return { k: e, x: p.x, y: p.y + EBENE }; });
        s += linien(p.x + B / 2, p.y + H, enkel);
        enkel.forEach(function (e) { s += kasten(e.k, e.x, e.y, gewählt); });
      }
    });
    const beschreibung = [baum].concat(kinder).concat([].concat.apply([], kinder.map(function (k) { return k.kinder || []; })))
      .map(function (k) { return k.name + " (" + (k.fehler ? "Fehler: " + k.fehler : k.art) + ")"; }).join(", ");
    return '<svg class="sk-diagramm" viewBox="0 0 ' + breite + " " + höhe + '" role="group" aria-label="Klassendiagramm: ' + svgEsc(beschreibung) + '">' + s + "</svg>";
  }

  const fälle = [
    { id: "r", typ: "Rechnung", zeile: "case Rechnung r -> \"Rechnung, zahlbar in \" + r.zahlungszielTage() + \" Tagen\";" },
    { id: "l", typ: "Lastschrift", zeile: "case Lastschrift l -> \"Lastschrift von \" + l.iban();" },
    { id: "k", typ: "Kreditkarte", zeile: "case Kreditkarte k -> \"Kreditkarte\";" },
    { id: "p", typ: "PayPal", zeile: "case PayPal p -> \"PayPal\";" }
  ];

  const zustand = { fehler: "korrekt", paypal: "final", fälle: "rlkp", mitDefault: false };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function text(s) {
    return esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function färben(zeilen) {
    const roh = zeilen.join("\n");
    if (window.skr && window.skr.highlight) return window.skr.highlight.code(roh, "java");
    return esc(roh);
  }
  function urteil(gut, inhalt) {
    return '<p class="sk-ergebnis sk-ergebnis--' + (gut ? "gut" : "schlecht") + '">' + (gut ? "✓ übersetzt" : "✗ übersetzt nicht") + "</p><p>" + inhalt + "</p>";
  }

  function knöpfe(boxId, einträge, aktiv, wahl) {
    const box = document.getElementById(boxId);
    box.innerHTML = einträge.map(function (e) {
      return '<button type="button" class="sk-knopf" data-id="' + esc(e.id) + '" aria-pressed="' + String(aktiv(e.id)) + '">' + esc(e.knopf) + "</button>";
    }).join("");
    box.onclick = function (ereignis) {
      const k = ereignis.target.closest(".sk-knopf");
      if (k) wahl(k.dataset.id);
    };
  }

  // Die gewählte Klasse je Diagramm; ein anderer Fall setzt sie auf seine Klasse zurück.
  const gewählt = { fehler: null, offen: null };

  function bildZeichnen(teil, fall) {
    const alle = knoten(fall.baum);
    const name = alle.some(function (k) { return k.name === gewählt[teil]; }) ? gewählt[teil] : fall.wahl;
    const k = alle.find(function (x) { return x.name === name; });
    document.getElementById("sk-bild-" + teil).innerHTML = diagramm(fall.baum, name);
    document.getElementById("sk-code-" + teil).innerHTML = färben([k.code]);
  }

  function fehlerZeichnen() {
    const f = fehlerFälle.find(function (a) { return a.id === zustand.fehler; }) || fehlerFälle[0];
    bildZeichnen("fehler", f);
    document.getElementById("sk-urteil-fehler").innerHTML = urteil(f.gut, text(f.text));
    knöpfe("sk-fehler", fehlerFälle, function (id) { return id === f.id; }, function (id) { gewählt.fehler = null; setzen("fehler", id); });
  }

  function offenZeichnen() {
    const a = offenArten.find(function (x) { return x.id === zustand.paypal; }) || offenArten[0];
    bildZeichnen("offen", a);
    document.getElementById("sk-urteil-offen").innerHTML = urteil(true, text(a.text));
    knöpfe("sk-paypal", offenArten, function (id) { return id === a.id; }, function (id) { gewählt.offen = null; setzen("paypal", id); });
  }

  // Klick oder Enter/Leertaste auf eine Klasse zeigt ihre Definition.
  function anklickbar(teil) {
    const box = document.getElementById("sk-bild-" + teil);
    function wählen(ziel) {
      const g = ziel.closest && ziel.closest("[data-name]");
      if (!g) return;
      gewählt[teil] = g.getAttribute("data-name");
      if (teil === "fehler") fehlerZeichnen(); else offenZeichnen();
      const neu = box.querySelector('[data-name="' + gewählt[teil] + '"]');
      if (neu) neu.focus();
    }
    box.addEventListener("click", function (e) { wählen(e.target); });
    box.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); wählen(e.target); }
    });
  }

  function switchZeichnen() {
    const gewählt = fälle.filter(function (f) { return zustand.fälle.indexOf(f.id) !== -1; });
    const zeilen = ["static String beschreibe(Zahlart zahlart) {", "    return switch (zahlart) {"]
      .concat(gewählt.map(function (f) { return "        " + f.zeile; }))
      .concat(zustand.mitDefault ? ["        default -> \"unbekannte Zahlart\";"] : [])
      .concat(["    };", "}"]);
    document.getElementById("sk-code-switch").innerHTML = färben(zeilen);

    const vollständig = gewählt.length === fälle.length;
    let gut, inhalt;
    if (zustand.mitDefault && vollständig) {
      gut = true;
      inhalt = text("Übersetzt – aber der `default` ist überflüssig, und er ist gefährlich: Kommt eine fünfte Zahlart dazu, landet sie **still** im `default`, und der Compiler meldet nichts mehr.");
    } else if (zustand.mitDefault) {
      gut = true;
      inhalt = text("Übersetzt, weil `default` alle übrigen Fälle fängt. Die fehlenden Zahlarten werden „unbekannt“ – zur Laufzeit, ohne Hinweis.");
    } else if (vollständig) {
      gut = true;
      inhalt = text("Übersetzt **ohne** `default`: Der Compiler kennt alle vier Unterarten. Kommt eine fünfte dazu, wird dieser `switch` zum Übersetzungsfehler – genau an der Stelle, die sie behandeln muss.");
    } else {
      gut = false;
      inhalt = text("`error: the switch expression does not cover all possible input values` – es fehlt: " + fälle.filter(function (f) { return gewählt.indexOf(f) === -1; }).map(function (f) { return "`" + f.typ + "`"; }).join(", ") + ".");
    }
    document.getElementById("sk-urteil-switch").innerHTML = urteil(gut, inhalt);

    knöpfe("sk-faelle", fälle.map(function (f) { return { id: f.id, knopf: f.typ }; }),
      function (id) { return zustand.fälle.indexOf(id) !== -1; },
      function (id) {
        const an = zustand.fälle.indexOf(id) !== -1;
        const neu = fälle.map(function (f) { return f.id; }).filter(function (x) { return x === id ? !an : zustand.fälle.indexOf(x) !== -1; }).join("");
        setzen("fälle", neu);
      });
    knöpfe("sk-default", [{ id: "nein", knopf: "ohne default" }, { id: "ja", knopf: "mit default" }],
      function (id) { return (id === "ja") === zustand.mitDefault; },
      function (id) { setzen("mitDefault", id === "ja"); });
  }

  function zeichnen() {
    fehlerZeichnen();
    offenZeichnen();
    switchZeichnen();
  }

  function setzen(schlüssel, wert) {
    zustand[schlüssel] = wert;
    const fokus = document.activeElement && document.activeElement.classList.contains("sk-knopf")
      ? { box: document.activeElement.parentElement.id, id: document.activeElement.dataset.id } : null;
    zeichnen();
    if (fokus) {
      const k = document.querySelector("#" + fokus.box + ' .sk-knopf[data-id="' + fokus.id + '"]');
      if (k) k.focus();
    }
    if (window.skr && window.skr.state) window.skr.state.update();
  }

  function anmelden() {
    if (!(window.skr && window.skr.state)) return;
    const st = window.skr.state;
    st.register({ key: "fehler",
      read: function () { return zustand.fehler; },
      apply: function (w) { zustand.fehler = fehlerFälle.some(function (a) { return a.id === w; }) ? w : "korrekt"; zeichnen(); } });
    st.register({ key: "paypal",
      read: function () { return zustand.paypal; },
      apply: function (w) { zustand.paypal = offenArten.some(function (a) { return a.id === w; }) ? w : "final"; zeichnen(); } });
    st.register({ key: "faelle",
      read: function () { return zustand.fälle; },
      apply: function (w) { zustand.fälle = typeof w === "string" ? w.replace(/[^rlkp]/g, "") : "rlkp"; zeichnen(); } });
    st.register({ key: "default",
      read: function () { return zustand.mitDefault ? "ja" : "nein"; },
      apply: function (w) { zustand.mitDefault = w === "ja"; zeichnen(); } });
  }

  function start() {
    anklickbar("fehler");
    anklickbar("offen");
    zeichnen();
    anmelden();
  }
  if (!(window.skr && window.skr.highlight)) {
    document.addEventListener("skr-highlight-ready", function () { zeichnen(); }, { once: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
