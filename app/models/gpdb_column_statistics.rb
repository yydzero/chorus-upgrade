require 'csv'

class GpdbColumnStatistics
  def initialize(null_frac, n_distinct, most_common_vals, most_common_freqs, histogram_bounds, row_count, treat_as_enumerable)
    @raw_null_fraction = null_frac
    @raw_number_distinct = n_distinct
    @raw_most_common_vals = most_common_vals
    @raw_most_common_freqs = most_common_freqs
    @raw_histogram_bounds = histogram_bounds
    @raw_row_count = row_count
    @treat_as_enumerable = treat_as_enumerable
  end

  def null_fraction
    @raw_null_fraction.to_f unless @raw_null_fraction.blank?
  end

  def common_values
    return nil unless @raw_most_common_vals.present?
    parse_pseudo_csv(@raw_most_common_vals)[0..4]
  end

  def number_distinct
    return nil unless @raw_number_distinct.present?

    if @raw_number_distinct.to_f < 0
      (@raw_number_distinct.to_f * -1 * @raw_row_count.to_i).round
    else
      @raw_number_distinct.to_i
    end
  end

  def min
    return nil unless histogram_enumerable?
    bounds = histogram_bounds
    bounds.first if bounds
  end

  def max
    return nil unless histogram_enumerable?
    bounds = histogram_bounds
    bounds.last if bounds
  end

  def entity_type_name
    'gpdb_column_statistics'
  end

  private

  def histogram_enumerable?
    @raw_histogram_bounds.present? && @treat_as_enumerable
  end

  def histogram_bounds
    parse_pseudo_csv(@raw_histogram_bounds)
  end

  def parse_pseudo_csv(list_with_brackets)
    regex = /(?:"((?:[^"\\]|\\.)+)"|((?:[^"\\,\s]|\\.)+))/
    list_without_brackets = list_with_brackets[1...-1]

    matches = list_without_brackets.scan(regex).map { |s|
      s.reject(&:nil?)
    }.flatten

    matches.map do |l|
      line = l.strip.gsub('\"', '"')
      strip_quotes(line)
    end
  end

  def strip_quotes(string)
    return string[1...-1] if in_quotes(string)
    string
  end

  def in_quotes(string)
    string[0] == '"' && string[-1] == '"'
  end
end