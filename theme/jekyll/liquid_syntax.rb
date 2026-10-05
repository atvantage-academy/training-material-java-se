# frozen_string_literal: true

# =============================================================================
# Liquid-Syntax in einem Text finden – die EINE Stelle dafür.
#
# DAS THEME IST DIE QUELLE. Genutzt von `liquid.rb` (Quellen einer Site mit
# abgeschaltetem Liquid). ATLAS prüft Einreichungen mit derselben Regel (Regel 35);
# es kann diese Datei aus dem gepinnten Paket laden
# (`node_modules/@avd-academy-tools/academy-theme/jekyll/liquid_syntax.rb`), statt
# eine eigene Kopie zu führen. Zwei Werkzeuge, die über dieselbe Datei verschieden
# urteilen, sind schlimmer als eines.
#
# WARUM `/m` SEIN MUSS: Liquid erlaubt Zeilenumbrüche IM Tag. Ein mehrzeiliges
#
#     {%- include baustein.html
#         titel="…" -%}
#
# entginge einer zeilenweisen Suche vollständig. Maßgeblich ist, was Liquids eigener
# Lexer als Tag liest, nicht, was bequem zu suchen ist.
#
# KEINE SCHRANKE ÜBER DIE LEERZEILE. Fließtext mit einer `{{` im einen und einer `}}`
# im übernächsten Absatz gibt es faktisch nicht; ein Tag, das der Prüfung entgeht,
# geht dagegen ungesehen auf die Seite. Liquid selbst liest ebenfalls über die
# Leerzeile hinweg.
#
# `.*?` bleibt nicht-gierig: Gesucht wird der NÄCHSTE Schließer, nicht der letzte.
#
# EIN BEFUND JE TEXT, nicht je Fundstelle: Wer zehn Verzweigungen in einer Datei
# hat, hat ein Problem und nicht zehn. Die Zeile der ersten Fundstelle genügt zum
# Finden, die Anzahl sagt, wie viel Arbeit wartet.
# =============================================================================
module AvdAcademy
  module LiquidSyntax
    PATTERN = /\{\{.*?\}\}|\{%.*?%\}/m.freeze

    # `[zeile, anzahl]` der ersten Fundstelle und aller Fundstellen, oder `nil`.
    # Gesucht wird über den GANZEN Text; die Zeile kommt aus dem Offset.
    def self.first_finding(text)
      first = text.index(PATTERN)
      return nil if first.nil?

      [text[0...first].count("\n") + 1, text.scan(PATTERN).length]
    end
  end
end
