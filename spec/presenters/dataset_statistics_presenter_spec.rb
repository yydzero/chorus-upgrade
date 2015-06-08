require 'spec_helper'

describe DatasetStatisticsPresenter, :type => :view do
  let(:statistics) { FactoryGirl.build(:dataset_statistics) }

  describe "#to_hash" do
    subject { described_class.new(statistics, view) }

    it "includes the fields" do
      hash = subject.to_hash

      hash[:object_type].should == 'BASE_TABLE'
      hash[:rows].should == 1000
      hash[:columns].should == 5
      hash[:description].should == 'This is a nice table.'
      hash[:last_analyzed_time].to_s.should == "2012-06-06 23:02:42 UTC"
      hash[:on_disk_size].should == 2097152
      hash[:partitions].should == 0
      hash[:definition].should == "SELECT * FROM foo"
    end
  end
end