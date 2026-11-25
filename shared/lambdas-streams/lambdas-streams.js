(function () {
  // Jede Auswahl (.ls-wahl) hat einen Schlüssel für die Adresse (data-ls-key), Knöpfe
  // mit data-ls-wert und Teile mit data-ls-id. Ohne Skript bleiben alle Teile sichtbar;
  // das Skript zeigt je Auswahl nur den gewählten und schreibt ihn in die Adresse.
  const auswahlen = [];

  function wahlEinrichten(wahl) {
    const knöpfe = Array.from(wahl.querySelectorAll(".ls-knopf[data-ls-wert]"));
    const teile = Array.from(wahl.querySelectorAll(".ls-panel[data-ls-id]"));
    if (!knöpfe.length || !teile.length) return;
    const eintrag = { wahl: wahl, knöpfe: knöpfe, teile: teile, aktuell: teile[0].dataset.lsId };

    eintrag.zeigen = function (wert) {
      if (!teile.some(function (t) { return t.dataset.lsId === wert; })) wert = teile[0].dataset.lsId;
      eintrag.aktuell = wert;
      teile.forEach(function (t) { t.hidden = t.dataset.lsId !== wert; });
      knöpfe.forEach(function (k) { k.setAttribute("aria-pressed", String(k.dataset.lsWert === wert)); });
    };

    wahl.addEventListener("click", function (e) {
      const k = e.target.closest(".ls-knopf[data-ls-wert]");
      if (!k || !wahl.contains(k) || k.dataset.lsWert === eintrag.aktuell) return;
      eintrag.zeigen(k.dataset.lsWert);
      if (window.skr && window.skr.state) window.skr.state.update();
    });

    eintrag.zeigen(eintrag.aktuell);
    auswahlen.push(eintrag);

    if (window.skr && window.skr.state) {
      window.skr.state.register({
        key: wahl.dataset.lsKey,
        read: function () { return eintrag.aktuell; },
        apply: function (wert) { eintrag.zeigen(wert || teile[0].dataset.lsId); }
      });
    }
  }

  function start() {
    document.body.classList.add("ls-aktiv");
    document.querySelectorAll(".ls-wahl[data-ls-key]").forEach(wahlEinrichten);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
