(function () {
  // Jede Auswahl (.dp-wahl) hat einen Schlüssel für die Adresse (data-dp-key), Knöpfe
  // mit data-dp-wert und Teile mit data-dp-id. Ohne Skript bleiben alle Teile sichtbar;
  // das Skript zeigt je Auswahl nur den gewählten und schreibt ihn in die Adresse.
  function wahlEinrichten(wahl) {
    const knöpfe = Array.from(wahl.querySelectorAll(".dp-knopf[data-dp-wert]"));
    const teile = Array.from(wahl.querySelectorAll(".dp-panel[data-dp-id]"));
    if (!knöpfe.length || !teile.length) return;
    const eintrag = { aktuell: teile[0].dataset.dpId };

    eintrag.zeigen = function (wert) {
      if (!teile.some(function (t) { return t.dataset.dpId === wert; })) wert = teile[0].dataset.dpId;
      eintrag.aktuell = wert;
      teile.forEach(function (t) { t.hidden = t.dataset.dpId !== wert; });
      knöpfe.forEach(function (k) { k.setAttribute("aria-pressed", String(k.dataset.dpWert === wert)); });
    };

    wahl.addEventListener("click", function (e) {
      const k = e.target.closest(".dp-knopf[data-dp-wert]");
      if (!k || !wahl.contains(k) || k.dataset.dpWert === eintrag.aktuell) return;
      eintrag.zeigen(k.dataset.dpWert);
      if (window.skr && window.skr.state) window.skr.state.update();
    });

    eintrag.zeigen(eintrag.aktuell);

    if (window.skr && window.skr.state) {
      window.skr.state.register({
        key: wahl.dataset.dpKey,
        read: function () { return eintrag.aktuell; },
        apply: function (wert) { eintrag.zeigen(wert || teile[0].dataset.dpId); }
      });
    }
  }

  function start() {
    document.body.classList.add("dp-aktiv");
    document.querySelectorAll(".dp-wahl[data-dp-key]").forEach(wahlEinrichten);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
