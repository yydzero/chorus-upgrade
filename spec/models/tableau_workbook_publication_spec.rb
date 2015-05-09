require "spec_helper"

describe TableauWorkbookPublication do
  let(:model) { tableau_workbook_publications(:default) }
  let(:tableau_base_url) { 'fake.domain.com' }

  context "tableau is configured" do
    before do
      stub(ChorusConfig).instance { {'tableau.url' => tableau_base_url} }
    end

    describe "#workbook_url" do
      it "should return the correct url" do
        model.workbook_url.should == "http://#{tableau_base_url}/workbooks/#{model.name}"
      end
    end

    describe "#project_url" do
      it "should return the correct url" do
        model.project_url.should == "http://#{tableau_base_url}/workbooks?fe_project.name=#{model.project_name}"
      end
    end
  end

  context "tableau is configured with a port" do
    before do
      stub(ChorusConfig).instance { {'tableau.url' => tableau_base_url, 'tableau.port' => 8000} }
    end

    describe "#workbook_url" do
      it "should return the correct url" do
        model.workbook_url.should == "http://#{tableau_base_url}:8000/workbooks/#{model.name}"
      end
    end

    describe "#project_url" do
      it "should return the correct url" do
        model.project_url.should == "http://#{tableau_base_url}:8000/workbooks?fe_project.name=#{model.project_name}"
      end
    end
  end
end
