(function () {
  // Jede Auswahl (.an-wahl) hat einen Schlüssel für die Adresse (data-an-key), Knöpfe
  // mit data-an-wert und Teile mit data-an-id. Ohne Skript bleiben alle Teile sichtbar;
  // das Skript zeigt je Auswahl nur den gewählten und schreibt ihn in die Adresse.
  function wahlEinrichten(wahl) {
    const knöpfe = Array.from(wahl.querySelectorAll(".an-knopf[data-an-wert]"));
    const teile = Array.from(wahl.querySelectorAll(".an-panel[data-an-id]"));
    if (!knöpfe.length || !teile.length) return;
    const eintrag = { aktuell: teile[0].dataset.anId };

    eintrag.zeigen = function (wert) {
      if (!teile.some(function (t) { return t.dataset.anId === wert; })) wert = teile[0].dataset.anId;
      eintrag.aktuell = wert;
      teile.forEach(function (t) { t.hidden = t.dataset.anId !== wert; });
      knöpfe.forEach(function (k) { k.setAttribute("aria-pressed", String(k.dataset.anWert === wert)); });
    };

    wahl.addEventListener("click", function (e) {
      const k = e.target.closest(".an-knopf[data-an-wert]");
      if (!k || !wahl.contains(k) || k.dataset.anWert === eintrag.aktuell) return;
      eintrag.zeigen(k.dataset.anWert);
      if (window.skr && window.skr.state) window.skr.state.update();
    });

    eintrag.zeigen(eintrag.aktuell);

    if (window.skr && window.skr.state) {
      window.skr.state.register({
        key: wahl.dataset.anKey,
        read: function () { return eintrag.aktuell; },
        apply: function (wert) { eintrag.zeigen(wert || teile[0].dataset.anId); }
      });
    }
  }

  function start() {
    document.body.classList.add("an-aktiv");
    document.querySelectorAll(".an-wahl[data-an-key]").forEach(wahlEinrichten);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
