(function () {
  // Alle Meldungen gemessen mit javac aus Temurin 17 (switch mit --enable-preview), 21 und 25.
  const payPalArten = [
    { id: "final", knopf: "final",
      zeilen: ["public final class PayPal implements Zahlart { }"],
      gut: true, text: "Übersetzt. Unter `PayPal` ist Schluss." },
    { id: "non-sealed", knopf: "non-sealed",
      zeilen: ["public non-sealed class PayPal implements Zahlart { }", "public class PayPalPlus extends PayPal { }   // erlaubt"],
      gut: true, text: "Übersetzt. Ab `PayPal` ist die Hierarchie wieder **offen** – `PayPalPlus` darf erben, ohne irgendwo zu stehen. Für den `switch` bleibt es trotzdem ein Fall: `case PayPal p` deckt auch `PayPalPlus` ab." },
    { id: "ohne", knopf: "ohne Angabe",
      zeilen: ["public class PayPal implements Zahlart { }"],
      gut: false, text: "`error: sealed, non-sealed or final modifiers expected` – eine erlaubte Unterart muss sich entscheiden." }
  ];
  const neuArten = [
    { id: "keine", knopf: "gibt es nicht", zeilen: [], permits: "" },
    { id: "ohne-permits", knopf: "ohne Eintrag in permits",
      zeilen: ["public record Gutschein(int betrag) implements Zahlart { }"], permits: "" },
    { id: "mit-permits", knopf: "in permits eingetragen",
      zeilen: ["public record Gutschein(int betrag) implements Zahlart { }"], permits: ", Gutschein" }
  ];
  const fälle = [
    { id: "r", typ: "Rechnung", zeile: "case Rechnung r -> \"Rechnung, zahlbar in \" + r.zahlungszielTage() + \" Tagen\";" },
    { id: "l", typ: "Lastschrift", zeile: "case Lastschrift l -> \"Lastschrift von \" + l.iban();" },
    { id: "k", typ: "Kreditkarte", zeile: "case Kreditkarte k -> \"Kreditkarte\";" },
    { id: "p", typ: "PayPal", zeile: "case PayPal p -> \"PayPal\";" }
  ];

  const zustand = { paypal: "final", neu: "keine", fälle: "rlkp", mitDefault: false };

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

  function hierarchieZeichnen() {
    const pp = payPalArten.find(function (a) { return a.id === zustand.paypal; });
    const neu = neuArten.find(function (a) { return a.id === zustand.neu; });
    const zeilen = [
      "public sealed interface Zahlart permits Rechnung, Lastschrift, Kreditkarte, PayPal" + neu.permits + " { }",
      "",
      "public record Rechnung(int zahlungszielTage) implements Zahlart { }",
      "public record Lastschrift(String iban) implements Zahlart { }",
      "public sealed class Kreditkarte implements Zahlart permits Firmenkarte { }",
      "public final class Firmenkarte extends Kreditkarte { }"
    ].concat(pp.zeilen, neu.zeilen);
    document.getElementById("sk-code-hierarchie").innerHTML = färben(zeilen);

    let gut = pp.gut;
    let inhalt = text(pp.text);
    if (gut && neu.id === "ohne-permits") {
      gut = false;
      inhalt = text("`error: class is not allowed to extend sealed class: Zahlart (as it is not listed in its 'permits' clause)` – wer nicht in der Liste steht, darf nicht erben.");
    } else if (gut && neu.id === "mit-permits") {
      inhalt += " " + text("Mit `Gutschein` in `permits` übersetzt auch die neue Unterart – dafür meldet der Compiler jetzt **jeden** `switch`, der sie noch nicht behandelt (siehe Teil 2).");
    }
    document.getElementById("sk-urteil-hierarchie").innerHTML = urteil(gut, inhalt);
    knöpfe("sk-paypal", payPalArten, function (id) { return id === zustand.paypal; }, function (id) { setzen("paypal", id); });
    knöpfe("sk-neu", neuArten, function (id) { return id === zustand.neu; }, function (id) { setzen("neu", id); });
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
    hierarchieZeichnen();
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
    st.register({ key: "paypal",
      read: function () { return zustand.paypal; },
      apply: function (w) { zustand.paypal = payPalArten.some(function (a) { return a.id === w; }) ? w : "final"; zeichnen(); } });
    st.register({ key: "neu",
      read: function () { return zustand.neu; },
      apply: function (w) { zustand.neu = neuArten.some(function (a) { return a.id === w; }) ? w : "keine"; zeichnen(); } });
    st.register({ key: "faelle",
      read: function () { return zustand.fälle; },
      apply: function (w) { zustand.fälle = typeof w === "string" ? w.replace(/[^rlkp]/g, "") : "rlkp"; zeichnen(); } });
    st.register({ key: "default",
      read: function () { return zustand.mitDefault ? "ja" : "nein"; },
      apply: function (w) { zustand.mitDefault = w === "ja"; zeichnen(); } });
  }

  function start() {
    zeichnen();
    anmelden();
  }
  if (!(window.skr && window.skr.highlight)) {
    document.addEventListener("skr-highlight-ready", function () { zeichnen(); }, { once: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
