(function () {
  // Jede Auswahl (.di-wahl) hat einen Schlüssel für die Adresse (data-di-key), Knöpfe
  // mit data-di-wert und Teile mit data-di-id. Ohne Skript bleiben alle Teile sichtbar;
  // das Skript zeigt je Auswahl nur den gewählten und schreibt ihn in die Adresse.
  const auswahlen = [];

  function wahlEinrichten(wahl) {
    const knöpfe = Array.from(wahl.querySelectorAll(".di-knopf[data-di-wert]"));
    const teile = Array.from(wahl.querySelectorAll(".di-panel[data-di-id]"));
    if (!knöpfe.length || !teile.length) return;
    const eintrag = { wahl: wahl, knöpfe: knöpfe, teile: teile, aktuell: teile[0].dataset.diId };

    eintrag.zeigen = function (wert) {
      if (!teile.some(function (t) { return t.dataset.diId === wert; })) wert = teile[0].dataset.diId;
      eintrag.aktuell = wert;
      teile.forEach(function (t) { t.hidden = t.dataset.diId !== wert; });
      knöpfe.forEach(function (k) { k.setAttribute("aria-pressed", String(k.dataset.diWert === wert)); });
    };

    wahl.addEventListener("click", function (e) {
      const k = e.target.closest(".di-knopf[data-di-wert]");
      if (!k || !wahl.contains(k) || k.dataset.diWert === eintrag.aktuell) return;
      eintrag.zeigen(k.dataset.diWert);
      if (window.skr && window.skr.state) window.skr.state.update();
    });

    eintrag.zeigen(eintrag.aktuell);
    auswahlen.push(eintrag);

    if (window.skr && window.skr.state) {
      window.skr.state.register({
        key: wahl.dataset.diKey,
        read: function () { return eintrag.aktuell; },
        apply: function (wert) { eintrag.zeigen(wert || teile[0].dataset.diId); }
      });
    }
  }

  function start() {
    document.body.classList.add("di-aktiv");
    document.querySelectorAll(".di-wahl[data-di-key]").forEach(wahlEinrichten);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
