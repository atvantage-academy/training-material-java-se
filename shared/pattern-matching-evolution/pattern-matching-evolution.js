(function () {
  const klassen = "public interface Zahlart { }   // Rechnung, Lastschrift, … sind Klassen mit Gettern";
  const versiegelt = [
    "public sealed interface Zahlart permits Rechnung, Lastschrift, Kreditkarte, PayPal { }",
    "// Rechnung, Lastschrift, … sind finale Klassen mit Gettern"
  ];
  const records = [
    "public interface Zahlart { }",
    "public record Rechnung(int zahlungszielTage) implements Zahlart { }   // und drei weitere"
  ];
  const unbekannt = "        default -> throw new IllegalArgumentException(\"Unbekannte Zahlart: \" + zahlart);";

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
    unbekannt,
    "    };",
    "}"
  ];
  const kette16 = [
    "public static String beschreibe(Zahlart zahlart) {",
    "    if (zahlart instanceof Rechnung rechnung) {",
    "        return \"Rechnung, zahlbar innerhalb von \" + rechnung.getZahlungszielTage() + \" Tagen\";",
    "    } else if (zahlart instanceof Lastschrift lastschrift) {",
    "        return \"Lastschrift von \" + maskiere(lastschrift.getIban());",
    "    } else if (zahlart instanceof Kreditkarte kreditkarte) {",
    "        return \"Kreditkarte \" + maskiere(kreditkarte.getKartennummer())",
    "                + \", gültig bis \" + kreditkarte.getGültigBis().format(MONAT_JAHR);",
    "    } else if (zahlart instanceof PayPal payPal) {",
    "        return \"PayPal (\" + payPal.getKonto() + \")\";",
    "    } else {",
    "        throw new IllegalArgumentException(\"Unbekannte Zahlart: \" + zahlart);",
    "    }",
    "}"
  ];
  // 21/1 und 21/2 unterscheiden sich nur im `default`.
  const typmuster = [
    "public static String beschreibe(Zahlart zahlart) {",
    "    return switch (zahlart) {",
    "        case Rechnung rechnung when rechnung.getZahlungszielTage() == 0 -> \"Rechnung, sofort zahlbar\";",
    "        case Rechnung rechnung -> \"Rechnung, zahlbar innerhalb von \" + rechnung.getZahlungszielTage() + \" Tagen\";",
    "        case Lastschrift lastschrift -> \"Lastschrift von \" + maskiere(lastschrift.getIban());",
    "        case Kreditkarte kreditkarte -> \"Kreditkarte \" + maskiere(kreditkarte.getKartennummer())",
    "                + \", gültig bis \" + kreditkarte.getGültigBis().format(MONAT_JAHR);",
    "        case PayPal payPal -> \"PayPal (\" + payPal.getKonto() + \")\";"
  ];
  const recordMuster = [
    "public static String beschreibe(Zahlart zahlart) {",
    "    return switch (zahlart) {",
    "        case Rechnung(int tage) when tage == 0 -> \"Rechnung, sofort zahlbar\";",
    "        case Rechnung(int tage) when tage <= 14 -> \"Rechnung, zahlbar innerhalb von \" + tage + \" Tagen\";",
    "        case Rechnung(int tage) -> \"Rechnung mit langem Zahlungsziel (\" + tage + \" Tage)\";",
    "        case Lastschrift(var iban) -> \"Lastschrift von \" + maskiere(iban);",
    "        case Kreditkarte(var nummer, var gültigBis) ->",
    "                \"Kreditkarte \" + maskiere(nummer) + \", gültig bis \" + gültigBis.format(MONAT_JAHR);",
    "        case PayPal(var konto) -> \"PayPal (\" + konto + \")\";",
    unbekannt,
    "    };",
    "}"
  ];
  const sofort22 = [
    "",
    "public static boolean sofortBezahlt(Zahlart zahlart) {",
    "    return switch (zahlart) {",
    "        case Rechnung _ -> false;",
    "        case Lastschrift _, Kreditkarte _, PayPal _ -> true;",
    unbekannt,
    "    };",
    "}"
  ];
  const ausblickPrimitiv = [
    "public static String zahlungsziel(int tage) {",
    "    return switch (tage) {",
    "        case 0 -> \"sofort zahlbar\";",
    "        case int t when t <= 14 -> \"zahlbar innerhalb von \" + t + \" Tagen\";",
    "        case int t -> \"langes Zahlungsziel (\" + t + \" Tage)\";",
    "    };",
    "}"
  ];

  // Stufen mit `teil` und gleichem `label` stehen im Regler in einer Spalte: oben das
  // Release, darunter je Teil ein Knopf.
  // `vergleich`: Stufe, gegenüber der die Zeilen als neu markiert werden – sonst die vorige.
  // Die Spezialfälle 21/2 und 21/3 bauen beide auf 21/1 auf, nicht aufeinander.
  const stufen = [
    { id: "8", label: "8", unter: "2014", titel: "Java 8: Kette mit Casts", marken: ["Java 8", "LTS 8"],
      code: [klassen, ""].concat(kette8) },
    { id: "14", label: "14", unter: "LTS 17", titel: "Switch-Expressions – Umweg über den Klassennamen", marken: ["Java 14", "JEP 361", "LTS 17"],
      code: [klassen, ""].concat(switch14) },
    { id: "16", label: "16", unter: "LTS 17", titel: "instanceof mit Muster", marken: ["Java 16", "JEP 394", "LTS 17"],
      code: [klassen, ""].concat(kette16) },
    { id: "21", label: "21", unter: "LTS 21", teil: "Typmuster", titel: "Typmuster im switch", marken: ["Java 21", "JEP 441", "LTS 21"],
      code: [klassen, ""].concat(typmuster, [unbekannt, "    };", "}"]) },
    { id: "21-sealed", label: "21", unter: "LTS 21", teil: "sealed", vergleich: "21", titel: "Spezialfall: versiegelte Hierarchie", marken: ["Java 21", "JEP 441", "JEP 409", "LTS 21"],
      code: versiegelt.concat([""], typmuster, ["    };", "}"]) },
    { id: "21-records", label: "21", unter: "LTS 21", teil: "Records", vergleich: "21", titel: "Spezialfall: Record-Patterns", marken: ["Java 21", "JEP 440", "LTS 21"],
      code: records.concat([""], recordMuster) },
    { id: "22", label: "22", unter: "LTS 25", titel: "Unbenannte Muster _", marken: ["Java 22", "JEP 456", "LTS 25"],
      code: records.concat([""], recordMuster, sofort22) },
    { id: "ausblick", label: "Ausblick", unter: "Preview", titel: "Ausblick: primitive Muster", marken: ["Preview 23–27", "JEP 532"],
      code: ausblickPrimitiv }
  ];

  let aktuell = 0;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
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
    const spalten = [];
    stufen.forEach(function (s, i) {
      const letzte = spalten[spalten.length - 1];
      if (s.teil && letzte && stufen[letzte[0]].teil && stufen[letzte[0]].label === s.label) letzte.push(i);
      else spalten.push([i]);
    });
    box.innerHTML = spalten.map(function (teile) {
      const s = stufen[teile[0]];
      return '<div class="pme-spalte' + (s.teil ? " pme-spalte--" + teile.length : "") + '">'
        + '<button type="button" class="pme-stufe" data-i="' + teile[0] + '" data-teile="' + teile.join(" ") + '"><b>' + esc(s.label) + "</b><span>" + esc(s.unter) + "</span></button>"
        + (s.teil ? '<div class="pme-teile" role="group" aria-label="' + esc(s.label) + '">' + teile.map(function (i) {
            return '<button type="button" class="pme-teil" data-i="' + i + '">' + esc(stufen[i].teil) + "</button>";
          }).join("") + "</div>" : "")
        + "</div>";
    }).join("");
    box.addEventListener("click", function (e) {
      const k = e.target.closest(".pme-stufe, .pme-teil");
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
      druck += "<section><h3>" + esc(s.titel) + " (" + esc(s.marken.join(" · ")) + ")</h3><pre>" + esc(s.code.join("\n")) + "</pre></section>";
    });
    document.getElementById("pme-druck").innerHTML = druck;
  }

  function wählen(i) {
    if (i < 0 || i >= stufen.length || i === aktuell) return;
    aktuell = i;
    zeichnen();
    if (window.skr.state) window.skr.state.update();
    const box = document.getElementById("pme-stufen");
    const knopf = box.querySelector('.pme-teil[data-i="' + i + '"]') || box.querySelector('.pme-stufe[data-i="' + i + '"]');
    if (knopf && box.contains(document.activeElement)) knopf.focus();
  }

  function zeichnen() {
    const s = stufen[aktuell];
    const basis = s.vergleich ? stufen.find(function (x) { return x.id === s.vergleich; })
                              : stufen[aktuell - 1];
    const vorher = basis ? basis.code : null;
    document.querySelectorAll(".pme-stufe").forEach(function (k) {
      const teile = k.dataset.teile.split(" ").map(Number);
      k.setAttribute("aria-pressed", String(teile.indexOf(aktuell) !== -1));
      k.classList.toggle("is-vorbei", Math.max.apply(null, teile) < aktuell);
    });
    document.querySelectorAll(".pme-teil").forEach(function (k) {
      k.setAttribute("aria-pressed", String(Number(k.dataset.i) === aktuell));
    });
    document.getElementById("pme-zurueck").disabled = aktuell === 0;
    document.getElementById("pme-weiter").disabled = aktuell === stufen.length - 1;

    document.getElementById("pme-code").innerHTML = s.code.map(function (z) {
      const neu = vorher && z.trim() !== "" && vorher.indexOf(z) === -1;
      return '<span class="pme-zeile' + (neu ? " is-neu" : "") + '">' + färben(z) + "</span>";
    }).join("");

    document.getElementById("pme-info").innerHTML =
      "<h2>" + esc(s.titel) + "</h2>"
      + '<p class="pme-marken">' + s.marken.map(function (m) {
          return '<span class="pme-marke' + (/^LTS/.test(m) ? " pme-marke--lts" : "") + '">' + esc(m) + "</span>";
        }).join("") + "</p>"
      ;
    document.getElementById("pme-vergleich").textContent = basis ? "neu gegenüber " + basis.label + (basis.teil ? " · " + basis.teil : "") : "";
    document.querySelector(".pme-legende").hidden = !basis;
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
