# frozen_string_literal: true

# =============================================================================
# Pfadmuster der Prüfer – EINE Schreibweise und EINE Regel für `--include`,
# `--exclude` und `--ignore` in links.rb, components.rb und contrast.rb.
#
# Das Gegenstück für die Node-Werkzeuge (a11y.mjs, readability.mjs) ist
# `path-scope.mjs` neben dieser Datei. Beide urteilen über dieselbe Tabelle gleich –
# geprüft in test/ruby/tools/pfadmuster_test.rb. Zwei Werkzeuge, die über dieselbe
# Angabe verschieden urteilen, sind schlimmer als eines.
#
# `theme`, `/theme`, `theme/`, `/theme/` und `/theme/**` meinen DASSELBE. Wer
# `links` und `contrast` nebeneinander aufruft, soll nicht zweimal nachdenken
# müssen, und wer ein Muster hinschreibt, soll nicht raten, ob der Schrägstrich
# zählt.
#
# VERGLICHEN WIRD SEGMENTWEISE, nicht als roher Präfix: `path.start_with?("/theme")`
# träfe auch `/themes-overview/` – eine Seite, die niemand ausnehmen wollte, und sie
# fiele still aus der Prüfung. Gleichzeitig muss eine Adresse, die GENAU `/theme` ist,
# getroffen werden. Deshalb: Gleichheit ODER Präfix samt trennendem Schrägstrich.
#
# LEERE ANGABEN FALLEN WEG. Ein leeres Muster würde sonst zu `/`, und weil jeder Pfad
# damit anfängt, wäre alles ausgenommen – der Lauf meldete „keine einzige gebaute
# Seite“ und sähe aus wie ein kaputtes Bundle.
# =============================================================================
module AvdAcademy
  module PathScope
    module_function

    # Muster in eine Schreibweise bringen: führender Schrägstrich, keiner am Ende,
    # kein `/**`. Kommagetrennte Angaben teilt der Aufrufer selbst.
    def normalize(patterns)
      Array(patterns).compact.map { |p| p.to_s.strip }.reject(&:empty?).map do |p|
        p = p.sub(%r{/\*\*\z}, '')
        p = p.sub(%r{/+\z}, '')
        p = "/#{p}" unless p.start_with?('/')
        p
      end.reject { |p| p == '/' }.uniq
    end

    # Trifft eines der (normalisierten) Muster den Pfad? `path` beginnt mit `/`.
    def covered?(path, patterns)
      patterns.any? { |p| path == p || path.start_with?("#{p}/") }
    end

    # WAS EINE PRÜFUNG ANSIEHT – zwei Listen, eine Regel. `only` leer: alles ist
    # erfasst. `only` gesetzt: erfasst ist nur, was darauf passt. `ignore` nimmt in
    # BEIDEN Fällen danach noch heraus.
    #
    # WARUM DER AUSSCHLUSS DEN EINSCHLUSS SCHLÄGT: Anders herum ließe sich ein einmal
    # ausgenommener Zweig durch ein weiteres Einschlussmuster wieder hereinholen –
    # welche der beiden Angaben dann gilt, entschiede die Reihenfolge, und die steht
    # in einer Eingabe nirgends verlässlich fest.
    Scope = Struct.new(:only, :ignore) do
      def skips?(path)
        return true unless only.empty? || PathScope.covered?(path, only)

        PathScope.covered?(path, ignore)
      end
    end
  end
end
