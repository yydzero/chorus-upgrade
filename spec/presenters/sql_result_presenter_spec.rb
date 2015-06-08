require 'spec_helper'

describe SqlResultPresenter, :type => :view do
  let(:schema) { schemas(:default) }
  let(:result) do
    GreenplumSqlResult.new.tap do |result|
      result.add_column("size", "real")
      result.add_column("is_cool", "boolean")
      result.add_row(["11", "t"])
      result.add_row(["21", "f"])
      result.add_row(["31", "f"])
      result.warnings = ['warning1', 'warning2']
    end
  end
  let(:hash) { subject.to_hash }

  before do
    set_current_user(users(:owner))
  end

  subject { SqlResultPresenter.new(result, view) }

  describe "#to_hash" do
    it "presents the columns" do
      hash[:columns].should == [
          GpdbDatasetColumnPresenter.new(GpdbDatasetColumn.new({:name => "size", :data_type => "real"}), view).presentation_hash,
          GpdbDatasetColumnPresenter.new(GpdbDatasetColumn.new({:name => "is_cool", :data_type => "boolean"}), view).presentation_hash
      ]
    end

    it "presents the rows" do
      hash[:rows].should == [
          ["11", "t"],
          ["21", "f"],
          ["31", "f"]
      ]
    end

    it "presents the warnings" do
      hash[:warnings].should == ['warning1', 'warning2']
    end
  end
end
