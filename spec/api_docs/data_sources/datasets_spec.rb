require 'spec_helper'

resource "Datasets" do
  let(:dataset) { datasets(:default_table) }
  let(:owner) { users(:owner) }

  let(:owner_account) { dataset.data_source.owner_account }
  let(:dataset_id) { dataset.id }
  let!(:statistics) { FactoryGirl.build(:dataset_statistics) }

  let(:result) do
    GreenplumSqlResult.new.tap do |r|
      r.add_column("column_1", "integer")
      r.add_column("column_2", "double")
      r.add_rows([
        [1, 2.0],
        [5, 2.5]
      ])
    end
  end

  before do
    log_in owner
    any_instance_of(CancelableQuery) do |query|
      stub(query).execute.with_any_args { result }
    end
    stub(CancelableQuery).cancel.with_any_args { status }
    stub(DatasetColumn).columns_for.with_any_args { [FactoryGirl.build(:gpdb_dataset_column), FactoryGirl.build(:gpdb_dataset_column)] }
    any_instance_of(GpdbTable) do |dataset|
      stub(dataset).verify_in_source(anything) { true }
    end

  end

  get "/datasets/:id" do
    parameter :id, "The id of a dataset"
    let(:id) { dataset.id }
    example_request "Get a dataset" do
      status.should == 200
    end
  end

  post "/datasets/:dataset_id/previews" do
    parameter :dataset_id, "Table / View ID"
    parameter :check_id, "A client-generated identifier which can be used to cancel this preview later"
    required_parameters :dataset_id, :check_id

    let(:check_id) { '42' }

    example_request "Preview 100 rows from a dataset" do
      status.should == 201
    end
  end

  delete "/datasets/:dataset_id/previews/:id" do
    parameter :dataset_id, "Table / View ID"
    parameter :id, "A client-generated identifier, previously passed as 'check_id' to a preview method to identify a query"

    let(:id) { "12345" }

    example_request "Cancel a preview task on a dataset" do
      status.should == 200
    end
  end

  get "/datasets/:dataset_id/columns" do
    parameter :dataset_id, "The id of a dataset"
    pagination

    example_request "Get all columns for a dataset" do
      status.should == 200
    end
  end

  get "/datasets/:dataset_id/statistics" do
    parameter :dataset_id, "The id of a dataset"

    before do
      stub(DatasetStatistics).build_for(
          satisfy { |arg| arg.id == dataset.id && arg.class == GpdbTable },
          satisfy { |arg| arg.id == owner_account.id && arg.class == DataSourceAccount }
      ).returns(statistics)
    end

    example_request "Get statistics for a dataset" do
      status.should == 200
    end
  end

  get "/datasets/:dataset_id/download" do
    parameter :dataset_id, "The id of a dataset"
    parameter :row_limit, "Number of rows to download (optional)"

    let(:row_limit) { 100 }

    example_request "Download a dataset as CSV file" do
      status.should == 200
    end
  end
end
