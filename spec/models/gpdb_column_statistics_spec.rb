require 'spec_helper'

describe GpdbColumnStatistics do
  subject { GpdbColumnStatistics.new(null_frac, n_distinct, most_common_vals, most_common_freqs, histogram_bounds, row_count, treat_as_enumerable) }
  let(:null_frac) { nil }
  let(:n_distinct) { nil }
  let(:most_common_vals) { nil }
  let(:most_common_freqs) { nil }
  let(:histogram_bounds) { nil }
  let(:row_count) { nil }
  let(:treat_as_enumerable) { false }

  context "if we have no data" do
    its(:null_fraction) { should be_nil }
    its(:common_values) { should be_nil }
    its(:number_distinct) { should be_nil }
    its(:min) { should be_nil }
    its(:max) { should be_nil }

    context "pseudo nil histogram bounds, but the column should be treated as enumerable" do
      let(:histogram_bounds) { "{}" }
      let(:treat_as_enumerable) { true }
      its(:min) { should be_nil }
      its(:max) { should be_nil }
    end
  end

  describe "#null_fraction" do
    let(:null_frac) { '0.33' }

    it "converts the raw fraction string to a float" do
      subject.null_fraction.should == 0.33
    end
  end

  describe "#common_values" do
    context "when common values include spaces" do
      let(:most_common_vals) { '{one,"two and three",four}' }

      it "converts the raw common values string to an array" do
        subject.common_values.should == ["one", "two and three", "four"]
      end
    end

    context "when there are more than five common values" do
      let(:most_common_vals) { '{1,2,3,4,5,6}' }

      it "returns the first five" do
        common_values = subject.common_values
        common_values.should have(5).items
        common_values.first.should == '1'
        common_values.last.should == '5'
      end
    end

    context "with escaped quotes in quotes" do
      let(:most_common_vals) { '{"one", "and \"two\" or", "three"}' }

      it "returns the correct values" do
        common_values = subject.common_values
        common_values.should have(3).items
        common_values.first.should == 'one'
        common_values[1].should == 'and "two" or'
        common_values.last.should == 'three'
      end
    end

    context "with commas inside of quotes" do
      let(:most_common_vals) { '{"1","1,2","3"}' }

      it "returns three items" do
        common_values = subject.common_values
        common_values.should have(3).items
        common_values.first.should == '1'
        common_values[1].should == '1,2'
        common_values.last.should == '3'
      end
    end

    context "with escaped quotes" do
      let(:most_common_vals) { '{1,2,3,\"4\",5,6}' }

      it "returns the first five" do
        common_values = subject.common_values
        common_values.should have(5).items
        common_values.first.should == '1'
        common_values.last.should == '5'
      end
    end
  end

  describe "#number_distinct" do
    context "when the raw value is positive" do
      let(:n_distinct) { '25' }

      it "converts into an integer" do
        subject.number_distinct.should == 25
      end
    end

    context "when the raw value is negative" do
      let(:n_distinct) { '-0.33' }
      let(:row_count) { '525' }

      it "interprets the raw value as a percentage of the number of rows in the table" do
        subject.number_distinct.should == (525 * 0.33).round
      end
    end
  end

  describe "#min" do
    let(:histogram_bounds) { '{1,2,3,4,5,6}' }
    let(:treat_as_enumerable) { true }

    it "is the first element of the histogram" do
      subject.min.should == "1"
    end

    context "when the column is neither a date nor a number" do
      let(:histogram_bounds) { '{a,b,c}' }
      let(:treat_as_enumerable) { false }

      it "should be nil" do
        subject.min.should be_nil
      end
    end
  end

  describe "#max" do
    let(:histogram_bounds) { '{1,2,3,4,5,6}' }
    let(:treat_as_enumerable) { true }

    it "is the last element of the histogram" do
      subject.max.should == "6"
    end

    context "when the column is neither a date nor a number" do
      let(:histogram_bounds) { '{a,b,c}' }
      let(:treat_as_enumerable) { false }

      it "should be nil" do
        subject.max.should be_nil
      end
    end
  end
end