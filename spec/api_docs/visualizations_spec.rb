require 'spec_helper'

resource "Visualizations" do
  let(:dataset) { datasets(:default_table) }
  let(:owner) { users(:owner) }

  before do
    log_in owner
    stub(CancelableQuery).cancel.with_any_args { status }
    any_instance_of("Visualization::#{type.to_s.capitalize}".constantize) { |visualization|
      stub(visualization).rows { rows }
      stub(visualization).fetch!.with_any_args {}
    }
  end

  # Frequency
  post "/datasets/:dataset_id/visualizations" do
    parameter :dataset_id, "Table / View ID"
    parameter :check_id, "A client-generated identifier which can be used to cancel this visualization later"
    parameter :type, "The type of visualization to be created ('frequency')"
    parameter :bins, "Category limit"
    parameter :y_axis, "Categorical column"
    parameter :'filters[]', "SQL filters to restrict data available to the visualization"

    required_parameters :dataset_id, :check_id, :type, :bins, :y_axis

    let(:dataset_id) { dataset.id }
    let(:check_id) { "1234" }
    let(:type) { "frequency" }
    let(:bins) { "3" }
    let(:y_axis) { "category" }
    let(:'filters[]') { ['"base_table1"."column1" > 0', '"base_table1"."column2" < 5'] }
    let!(:rows) { [
        {:count => 2, :bucket => "orange"},
        {:count => 1, :bucket => 'apple'}
    ] }

    example_request "Create a new frequency visualization" do
      status.should == 200
    end
  end

  # Heatmap
  post "/datasets/:dataset_id/visualizations" do
    parameter :dataset_id, "Table / View ID"
    parameter :check_id, "A client-generated identifier which can be used to cancel this visualization later"
    parameter :type, "The type of visualization to be created ('heatmap')"
    parameter :x_bins, "Number of x bins"
    parameter :y_bins, "Number of y bins"
    parameter :x_axis, "X-Axis column ( numerical )"
    parameter :y_axis, "Y-Axis column ( numerical )"
    parameter :'filters[]', "SQL filters to restrict data available to the visualization"

    required_parameters :dataset_id, :check_id, :type, :x_bins, :y_bins, :x_axis, :y_axis

    let(:dataset_id) { dataset.id }
    let(:check_id) { "1234" }
    let(:type) { "heatmap" }
    let(:x_bins) { "3" }
    let(:y_bins) { "3" }
    let(:x_axis) { "column1" }
    let(:y_axis) { "column2" }
    let(:filters) { ['"heatmap_table"."category" != \'green\'', '"heatmap_table"."category" != \'cornflower blue\''] }
    let!(:rows) { [
        {:x => 1, :y => 1, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [2.0, 3.33]},
        {:x => 1, :y => 2, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [3.33, 4.67]},
        {:x => 1, :y => 3, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [4.67, 6.0]},
        {:x => 2, :y => 1, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [2.0, 3.33]},
        {:x => 2, :y => 2, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [3.33, 4.67]},
        {:x => 2, :y => 3, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [4.67, 6.0]},
        {:x => 3, :y => 1, :value => 1, :xLabel => [4.67, 6.0], :yLabel => [2.0, 3.33]},
        {:x => 3, :y => 2, :value => 1, :xLabel => [4.67, 6.0], :yLabel => [3.33, 4.67]},
        {:x => 3, :y => 3, :value => 2, :xLabel => [4.67, 6.0], :yLabel => [4.67, 6.0]}
    ] }

    example_request "Create a new heatmap visualization" do
      status.should == 200
    end
  end

  # Histogram
  post "/datasets/:dataset_id/visualizations" do
    parameter :dataset_id, "Table / View ID"
    parameter :check_id, "A client-generated identifier which can be used to cancel this visualization later"
    parameter :type, "The type of visualization to be created ('histogram')"
    parameter :bins, "Number of bins"
    parameter :x_axis, "X-Axis column ( categorical )"
    parameter :'filters[]', "SQL filters to restrict data available to the visualization"

    required_parameters :dataset_id, :check_id, :type, :bins, :x_axis

    let(:dataset_id) { dataset.id }
    let(:check_id) { "1234" }
    let(:type) { "histogram" }
    let(:bins) { "2" }
    let(:x_axis) { "category" }
    let(:'filters[]') { ['"base_table1"."category" = \'papaya\''] }
    let!(:rows) { [
        {:bin => [0, 0.5], :frequency => 3},
        {:bin => [0.5, 1.0], :frequency => 6}
    ] }

    example_request "Create a new histogram visualization" do
      status.should == 200
    end
  end

  # Time Series
  post "/datasets/:dataset_id/visualizations" do
    parameter :dataset_id, "Table / View ID"
    parameter :check_id, "A client-generated identifier which can be used to cancel this visualization later"
    parameter :type, "The type of visualization to be created ('timeseries')"
    parameter :x_axis, "X-Axis column ( Date or Time column )"
    parameter :aggregation, "Aggregation for x-axis column ( sum, minimum, maximum, average, count )"
    parameter :y_axis, "Y-Axis column ( categorical column )"
    parameter :time_interval, "Time interval ( minute, hour, day, week, month, year )"
    parameter :'filters[]', "SQL filters to restrict data available to the visualization"

    required_parameters :dataset_id, :check_id, :type, :x_axis, :y_axis, :aggregation, :time_interval
    let(:dataset_id) { dataset.id }
    let(:check_id) { "1234" }
    let(:type) { "timeseries" }
    let(:x_axis) { "time_value" }
    let(:y_axis) { "column1" }
    let(:time_interval) { "month" }
    let(:aggregation) { "sum" }
    let(:'filters[]') { ['"base_table1"."time_value" > \'2012-03-03\'', '"base_table1"."column1" < 5'] }
    let!(:rows) { [
        {:value => 2, :time => "2012-03"},
        {:value => 2, :time => "2012-04"},
        {:value => 1, :time => "2012-05"}
    ] }

    example_request "Create a new time series visualization" do
      status.should == 200
    end
  end

  # Boxplot
  post "/datasets/:dataset_id/visualizations" do
    parameter :dataset_id, "Table / View ID"
    parameter :check_id, "A client-generated identifier which can be used to cancel this visualization later"
    parameter :type, "The type of visualization to be created ('boxplot')"
    parameter :x_axis, "X-Axis column ( categorical )"
    parameter :y_axis, "Y-Axis column ( numerical )"
    parameter :bins, "Category Limit"
    parameter :'filters[]', "SQL filters to restrict data available to the visualization"

    required_parameters :dataset_id, :check_id, :type, :x_axis, :y_axis, :bins

    let(:dataset_id) { dataset.id }
    let(:check_id) { "1234" }
    let(:type) { "boxplot" }
    let(:x_axis) { "category" }
    let(:y_axis) { "column2" }
    let(:bins) { "3" }
    let(:'filters[]') { ["category != 'apple'"] }
    let!(:rows) { [
        {:bucket => "papaya", :min => 5.0, :median => 6.5, :max => 8.0, :first_quartile => 5.5, :third_quartile => 7.5, :percentage => "57.14%", :count => 4},
        {:bucket => "orange", :min => 2.0, :median => 3.0, :max => 4.0, :first_quartile => 2.5, :third_quartile => 3.5, :percentage => "42.86%", :count => 3}
    ] }

    example_request "Create a new boxplot visualization" do
      status.should == 200
    end
  end

  delete "/datasets/:dataset_id/visualizations/:id" do
    parameter :dataset_id, "Table / View ID"
    parameter :id, "A client-generated identifier, previously passed as 'check_id' to a visualization method to identify a query"

    required_parameters :id, :dataset_id

    let(:dataset_id) { dataset.id }
    let(:id) { "1234" }
    let(:type) { "frequency" }

    example_request "Cancel visualization" do
      status.should == 200
    end
  end
end
