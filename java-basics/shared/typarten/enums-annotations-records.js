/* Gleich hohe Reiter: Je Gruppe (.ear-reiter) wird jeder Inhalt als unsichtbare Kopie
   in der Breite des offenen Reiters gemessen; der höchste Wert wird min-height aller
   Inhalte. Die Kopie ist kein <details> und trägt keine ids – sie löst also keine
   Reiter-Ereignisse aus und gerät nicht in die Adresse. */
(function () {
  "use strict";
  var gruppen = Array.prototype.slice.call(document.querySelectorAll(".ear-reiter"));

  function angleichen(gruppe) {
    var inhalte = Array.prototype.slice.call(gruppe.querySelectorAll(".ear-reiter__inhalt"));
    /* Maßgeblich ist der OFFENE Reiter: Geschlossene haben im Theme eine Breite, aber
       ohne den Innenabstand des Reiters – dort gemessen fiele die Höhe zu klein aus. */
    var sichtbar = inhalte.filter(function (i) { return i.parentElement.open && i.offsetWidth > 0; })[0];
    if (!sichtbar) return;
    var breite = sichtbar.clientWidth;
    var höhe = 0;
    inhalte.forEach(function (inhalt) {
      var kopie = inhalt.cloneNode(true);
      kopie.removeAttribute("style");
      kopie.querySelectorAll("[id]").forEach(function (e) { e.removeAttribute("id"); });
      kopie.classList.add("ear-reiter__mess");
      kopie.style.width = breite + "px";
      gruppe.appendChild(kopie);
      höhe = Math.max(höhe, kopie.offsetHeight);
      gruppe.removeChild(kopie);
    });
    inhalte.forEach(function (inhalt) { inhalt.style.minHeight = höhe + "px"; });
  }

  function alleAngleichen() { gruppen.forEach(angleichen); }

  gruppen.forEach(function (g) { g.style.position = "relative"; });
  alleAngleichen();
  window.addEventListener("load", alleAngleichen);
  window.addEventListener("resize", alleAngleichen);
  /* Ein Reiter in einem bisher verborgenen äußeren Reiter hat erst nach dem
     Umschalten eine Breite – deshalb auch nach jedem Öffnen eines Reiters. */
  document.addEventListener("toggle", function (e) { if (e.target.open) alleAngleichen(); }, true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alleAngleichen);
  /* Das Theme färbt den Code erst nachträglich ein (highlight.js, Klasse „hljs“) – danach
     ist er kleiner gesetzt. Deshalb neu messen, sobald sich an einem <code> die Klasse
     ändert; gebündelt auf einen Durchgang je Bild. */
  var geplant = false;
  if ("MutationObserver" in window) {
    new MutationObserver(function (änderungen) {
      var betrifftCode = änderungen.some(function (ä) { return ä.target.tagName === "CODE"; });
      if (!betrifftCode || geplant) return;
      geplant = true;
      requestAnimationFrame(function () { geplant = false; alleAngleichen(); });
    }).observe(document.querySelector(".ear-root"), { attributes: true, attributeFilter: ["class"], subtree: true });
  }
})();
