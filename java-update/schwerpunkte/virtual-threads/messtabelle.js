(function () {
  "use strict";
  // Die Werte bleiben im localStorage dieses Browsers. Ist er gesperrt (privates
  // Fenster, Einstellungen), arbeitet die Tabelle weiter und sagt, dass sie vergisst.
  const SCHLÜSSEL = "java-update/virtual-threads/messtabelle";

  function lesen() {
    try {
      const text = window.localStorage.getItem(SCHLÜSSEL);
      return text ? JSON.parse(text) : {};
    } catch (e) {
      return null;
    }
  }

  function schreiben(werte) {
    try {
      window.localStorage.setItem(SCHLÜSSEL, JSON.stringify(werte));
      return true;
    } catch (e) {
      return false;
    }
  }

  function löschen() {
    try {
      window.localStorage.removeItem(SCHLÜSSEL);
      return true;
    } catch (e) {
      return false;
    }
  }

  function start() {
    const felder = Array.prototype.slice.call(document.querySelectorAll("[data-mt-feld]"));
    const status = document.getElementById("mt-status");
    const gelesen = lesen();
    const speicherbar = gelesen !== null;
    const werte = gelesen || {};

    function melden(text) { status.textContent = text; }

    felder.forEach(function (feld) {
      const name = feld.dataset.mtFeld;
      if (werte[name] !== undefined) feld.value = werte[name];
      feld.addEventListener("input", function () {
        if (feld.value === "") delete werte[name];
        else werte[name] = feld.value;
        if (schreiben(werte)) melden("Gespeichert in diesem Browser.");
        else melden("Dieser Browser speichert nichts – die Werte gehen beim Neuladen verloren.");
      });
    });

    document.getElementById("mt-leeren").addEventListener("click", function () {
      felder.forEach(function (feld) { feld.value = ""; });
      Object.keys(werte).forEach(function (name) { delete werte[name]; });
      melden(löschen() ? "Alle Werte gelöscht." : "Alle Werte geleert.");
    });

    if (!speicherbar) melden("Dieser Browser speichert nichts – die Werte gehen beim Neuladen verloren.");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
