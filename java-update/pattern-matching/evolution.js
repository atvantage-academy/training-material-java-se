(function () {
  const sealed = "public sealed interface Zahlart permits Rechnung, Lastschrift, Kreditkarte, PayPal { }";
  const record = "public record Rechnung(int zahlungszielTage) implements Zahlart { }   // und drei weitere";
  const klassen = "public interface Zahlart { }   // Rechnung, Lastschrift, … sind Klassen mit Gettern";

  const kette8 = [
    "public static String beschreibe(Zahlart zahlart) {",
    "    if (zahlart instanceof Rechnung) {",
    "        Rechnung rechnung = (Rechnung) zahlart;",
    "        return \"Rechnung, zahlbar innerhalb von \" + rechnung.getZahlungszielTage() + \" Tagen\";",
    "    } else if (zahlart instanceof Lastschrift) {",
    "        Lastschrift lastschrift = (Lastschrift) zahlart;",
    "        return \"Lastschrift von \" + maskiere(lastschrift.getIban());",
    "    } else if (zahlart instanceof Kreditkarte) {",
    "        Kreditkarte kreditkarte = (Kreditkarte) zahlart;",
    "        return \"Kreditkarte \" + maskiere(kreditkarte.getKartennummer())",
    "                + \", gültig bis \" + kreditkarte.getGültigBis().format(MONAT_JAHR);",
    "    } else if (zahlart instanceof PayPal) {",
    "        PayPal payPal = (PayPal) zahlart;",
    "        return \"PayPal (\" + payPal.getKonto() + \")\";",
    "    } else {",
    "        throw new IllegalArgumentException(\"Unbekannte Zahlart: \" + zahlart);",
    "    }",
    "}"
  ];
  const switch14 = [
    "public static String beschreibe(Zahlart zahlart) {",
    "    return switch (zahlart.getClass().getSimpleName()) {",
    "        case \"Rechnung\" -> \"Rechnung, zahlbar innerhalb von \"",
    "                + ((Rechnung) zahlart).getZahlungszielTage() + \" Tagen\";",
    "        case \"Lastschrift\" -> \"Lastschrift von \" + maskiere(((Lastschrift) zahlart).getIban());",
    "        case \"Kreditkarte\" -> {",
    "            Kreditkarte kreditkarte = (Kreditkarte) zahlart;",
    "            yield \"Kreditkarte \" + maskiere(kreditkarte.getKartennummer())",
    "                    + \", gültig bis \" + kreditkarte.getGültigBis().format(MONAT_JAHR);",
    "        }",
    "        case \"PayPal\" -> \"PayPal (\" + ((PayPal) zahlart).getKonto() + \")\";",
    "        default -> throw new IllegalArgumentException(\"Unbekannte Zahlart: \" + zahlart);",
    "    };",
    "}"
  ];
  const kette16 = [
    "public static String beschreibe(Zahlart zahlart) {",
    "    if (zahlart instanceof Rechnung rechnung) {",
    "        return \"Rechnung, zahlbar innerhalb von \" + rechnung.zahlungszielTage() + \" Tagen\";",
    "    } else if (zahlart instanceof Lastschrift lastschrift) {",
    "        return \"Lastschrift von \" + maskiere(lastschrift.iban());",
    "    } else if (zahlart instanceof Kreditkarte kreditkarte) {",
    "        return \"Kreditkarte \" + maskiere(kreditkarte.kartennummer())",
    "                + \", gültig bis \" + kreditkarte.gültigBis().format(MONAT_JAHR);",
    "    } else if (zahlart instanceof PayPal payPal) {",
    "        return \"PayPal (\" + payPal.konto() + \")\";",
    "    } else {",
    "        throw new IllegalArgumentException(\"Unbekannte Zahlart: \" + zahlart);",
    "    }",
    "}"
  ];
  const switch21 = [
    "public static String beschreibe(Zahlart zahlart) {",
    "    return switch (zahlart) {",
    "        case Rechnung(var tage) when tage == 0 -> \"Rechnung, sofort zahlbar\";",
    "        case Rechnung(var tage) -> \"Rechnung, zahlbar innerhalb von \" + tage + \" Tagen\";",
    "        case Lastschrift(var iban) -> \"Lastschrift von \" + maskiere(iban);",
    "        case Kreditkarte(var nummer, var gültigBis) ->",
    "                \"Kreditkarte \" + maskiere(nummer) + \", gültig bis \" + gültigBis.format(MONAT_JAHR);",
    "        case PayPal(var konto) -> \"PayPal (\" + konto + \")\";",
    "    };",
    "}"
  ];
  const sofort22 = [
    "",
    "public static boolean sofortBezahlt(Zahlart zahlart) {",
    "    return switch (zahlart) {",
    "        case Rechnung _ -> false;",
    "        case Lastschrift _, Kreditkarte _, PayPal _ -> true;",
    "    };",
    "}"
  ];
  const ausblick = [
    "public static String beschreibe(Zahlart zahlart) {",
    "    return switch (zahlart) {",
    "        case Rechnung(var tage) -> switch (tage) {",
    "            case 0 -> \"Rechnung, sofort zahlbar\";",
    "            case int t when t <= 14 -> \"Rechnung, zahlbar innerhalb von \" + t + \" Tagen\";",
    "            case int t -> \"Rechnung mit langem Zahlungsziel (\" + t + \" Tage)\";",
    "        };",
    "        case Lastschrift(var iban) -> \"Lastschrift von \" + maskiere(iban);",
    "        case Kreditkarte(var nummer, var gültigBis) ->",
    "                \"Kreditkarte \" + maskiere(nummer) + \", gültig bis \" + gültigBis.format(MONAT_JAHR);",
    "        case PayPal(var konto) -> \"PayPal (\" + konto + \")\";",
    "    };",
    "}"
  ];

  // Prüft der Compiler, ob ein Fall fehlt? Gemessen mit javac 25 und --release der Stufe.
  const stufen = [
    { id: "8", label: "8", unter: "2014", titel: "Java 8: Kette mit Casts", marken: ["Java 8", "LTS 8"],
      code: [klassen, ""].concat(kette8),
      neu: "Der Ausgangsstand im Altbestand: `instanceof`, dann ein Cast in eine Hilfsvariable – viermal.",
      weg: "–",
      probe: "Kommt eine fünfte Zahlart dazu, übersetzt alles weiter. Sie fällt erst **zur Laufzeit** in den `else`-Zweig." },
    { id: "14", label: "14", unter: "LTS 17", titel: "Switch-Expressions", marken: ["Java 14", "JEP 361", "LTS 17"],
      code: [klassen, ""].concat(switch14),
      neu: "`switch` als Ausdruck: `case … ->`, kein `break`, kein Durchfallen, `yield` für einen Block. Aber nur über **Konstanten** – hier ein bewusster Umweg über den Klassennamen.",
      weg: "Die `else if`-Treppe. Die Casts bleiben, und `default` ist Pflicht.",
      probe: "Mit `--release 13`: `switch expressions are not supported in -source 13`. Eine fünfte Zahlart landet weiter erst zur Laufzeit im `default`." },
    { id: "16", label: "16", unter: "LTS 17", titel: "instanceof mit Muster", marken: ["Java 16", "JEP 394", "LTS 17"],
      code: ["public interface Zahlart { }", record, ""].concat(kette16),
      neu: "`zahlart instanceof Rechnung rechnung` prüft und bindet in einem Schritt. Die Zahlarten sind jetzt Records (JEP 395), daher `zahlungszielTage()` statt Getter.",
      weg: "Alle Casts und die Zeile mit der Hilfsvariable – je Zahlart eine.",
      probe: "Mit `--release 15`: `records are not supported in -source 15`. Eine fünfte Zahlart bemerkt der Compiler weiterhin nicht." },
    { id: "17", label: "17", unter: "LTS 17", titel: "Versiegelte Hierarchie", marken: ["Java 17", "JEP 409", "LTS 17"],
      code: [sealed, record, ""].concat(kette16),
      neu: "`sealed … permits` – der Compiler weiß jetzt, dass es genau vier Zahlarten gibt.",
      weg: "Nichts. Die `if`-Kette fragt den Compiler nicht.",
      probe: "Lässt man den `else`-Zweig weg, meldet der Compiler `missing return statement` – obwohl alle vier Fälle behandelt sind. Sein Wissen nutzt erst der `switch`." },
    { id: "21", label: "21", unter: "LTS 21", titel: "Record-Patterns im switch", marken: ["Java 21", "JEP 441", "JEP 440", "LTS 21"],
      code: [sealed, record, ""].concat(switch21),
      neu: "`switch` über den Typ mit **Record-Patterns**: `case Rechnung(var tage)` zerlegt den Record gleich. Ein **Wächter** mit `when` trennt „sofort zahlbar“ ab – er muss vor dem allgemeinen Fall stehen.",
      weg: "Die Kette, die Hilfsvariablen, die Zugriffsmethoden – und der `default`-Zweig.",
      probe: "Fehlt der PayPal-Fall: `the switch expression does not cover all possible input values`. Eine fünfte Zahlart ist jetzt ein **Übersetzungsfehler** an jeder unvollständigen Stelle." },
    { id: "22", label: "22", unter: "LTS 25", titel: "Unbenannte Muster _", marken: ["Java 22", "JEP 456", "LTS 25"],
      code: [sealed, record, ""].concat(switch21, sofort22),
      neu: "`_` für Muster, deren Wert man nicht braucht – und mehrere davon in einem `case`. Gezeigt an einer zweiten Methode, weil `beschreibe` jeden Wert nutzt.",
      weg: "Namen für Variablen, die niemand liest.",
      probe: "Mit `--release 21`: `unnamed variables are not supported in -source 21`. Vollständig muss auch dieser `switch` sein." },
    { id: "ausblick", label: "Ausblick", unter: "Preview", titel: "Primitive Muster", marken: ["Preview 23–27", "JEP 532"],
      code: [sealed, record, ""].concat(ausblick),
      neu: "Muster auch für primitive Typen: `case int t when t <= 14`. Noch **Preview** (fünfte Fassung in Java 27) – im Kurs nur als Ausblick.",
      weg: "Die `if`-Kette über einen Zahlenwert innerhalb eines Falls.",
      probe: "Ohne `--enable-preview`: `primitive patterns are a preview feature and are disabled by default`. Preview-Code bricht womöglich beim nächsten Release." }
  ];

  let aktuell = 0;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function text(s) {
    return esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function casts(zeilen) {
    return zeilen.join("\n").match(/\((Rechnung|Lastschrift|Kreditkarte|PayPal)\) zahlart/g)?.length || 0;
  }
  function methodenzeilen(zeilen) {
    const start = zeilen.findIndex(function (z) { return z.startsWith("public static String beschreibe"); });
    let ende = start;
    while (ende < zeilen.length && zeilen[ende] !== "}") ende++;
    return ende - start + 1;
  }
  function färben(zeile) {
    if (!zeile) return " ";
    // Zeile für Zeile über die Hervorhebung des Skriptoriums: Jede Zeile behält so ihre
    // Marke (`is-neu`). Steht sie noch nicht bereit, bleibt die Zeile vorerst ungefärbt,
    // und `skr-highlight-ready` zeichnet neu.
    if (window.skr && window.skr.highlight) return window.skr.highlight.code(zeile, "java");
    return esc(zeile);
  }
  if (!(window.skr && window.skr.highlight)) {
    document.addEventListener("skr-highlight-ready", function () { if (aktuell >= 0) zeichnen(); }, { once: true });
  }

  function aufbauen() {
    const box = document.getElementById("pme-stufen");
    box.innerHTML = stufen.map(function (s, i) {
      return '<button type="button" class="pme-stufe" data-i="' + i + '"><b>' + esc(s.label) + "</b><span>" + esc(s.unter) + "</span></button>";
    }).join("");
    box.addEventListener("click", function (e) {
      const k = e.target.closest(".pme-stufe");
      if (k) wählen(Number(k.dataset.i));
    });
    document.getElementById("pme-zurueck").addEventListener("click", function () { wählen(aktuell - 1); });
    document.getElementById("pme-weiter").addEventListener("click", function () { wählen(aktuell + 1); });
    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { wählen(aktuell + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { wählen(aktuell - 1); e.preventDefault(); }
    });

    let druck = "";
    stufen.forEach(function (s) {
      druck += "<section><h3>" + esc(s.titel) + " (" + esc(s.marken.join(" · ")) + ")</h3><p>" + text(s.neu) + "</p><p>" + text(s.probe) + "</p><pre>" + esc(s.code.join("\n")) + "</pre></section>";
    });
    document.getElementById("pme-druck").innerHTML = druck;
  }

  function wählen(i) {
    if (i < 0 || i >= stufen.length || i === aktuell) return;
    aktuell = i;
    zeichnen();
    if (window.skr.state) window.skr.state.update();
    const knopf = document.querySelector('.pme-stufe[data-i="' + i + '"]');
    if (knopf && document.activeElement && document.activeElement.classList.contains("pme-stufe")) knopf.focus();
  }

  function zeichnen() {
    const s = stufen[aktuell];
    const vorher = aktuell > 0 ? stufen[aktuell - 1].code : null;
    document.querySelectorAll(".pme-stufe").forEach(function (k, i) {
      k.setAttribute("aria-pressed", String(i === aktuell));
      k.classList.toggle("is-vorbei", i < aktuell);
    });
    document.getElementById("pme-zurueck").disabled = aktuell === 0;
    document.getElementById("pme-weiter").disabled = aktuell === stufen.length - 1;

    document.getElementById("pme-code").innerHTML = s.code.map(function (z) {
      const neu = vorher && z.trim() !== "" && vorher.indexOf(z) === -1;
      return '<span class="pme-zeile' + (neu ? " is-neu" : "") + '">' + färben(z) + "</span>";
    }).join("");

    const z = methodenzeilen(s.code);
    document.getElementById("pme-info").innerHTML =
      "<h2>" + esc(s.titel) + "</h2>"
      + '<p class="pme-marken">' + s.marken.map(function (m) {
          return '<span class="pme-marke' + (/^LTS/.test(m) ? " pme-marke--lts" : "") + '">' + esc(m) + "</span>";
        }).join("") + "</p>"
      + "<h3>Neu</h3><p>" + text(s.neu) + "</p>"
      + "<h3>Fällt weg</h3><p>" + text(s.weg) + "</p>"
      + '<div class="pme-zahlen">'
      + '<div class="pme-zahl"><b>' + casts(s.code) + "</b><span>Casts</span></div>"
      + '<div class="pme-zahl"><b>' + z + "</b><span>Zeilen in <code>beschreibe</code></span></div>"
      + '<div class="pme-zahl"><b>' + (["21", "22", "ausblick"].indexOf(s.id) !== -1 ? "ja" : "nein") + "</b><span>Compiler prüft Vollständigkeit</span></div>"
      + "</div>"
      + '<p class="pme-probe">' + text(s.probe) + "</p>";
  }

  function anmelden() {
    if (!window.skr.state) return;
    window.skr.state.register({
      key: "stufe",
      read: function () { return stufen[aktuell].id; },
      apply: function (wert) {
        const i = stufen.findIndex(function (s) { return s.id === wert; });
        aktuell = i >= 0 ? i : 0;
        zeichnen();
      }
    });
  }

  function start() {
    aufbauen();
    zeichnen();
    anmelden();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
