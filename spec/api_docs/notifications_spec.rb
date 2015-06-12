require 'spec_helper'

resource "Notifications" do
  let(:user) { users(:owner) }

  before do
    log_in user
  end

  get "/notifications" do
    pagination

    example_request "Get a list of notifications for the current user" do
      status.should == 200
    end
  end

  put "/notifications/read" do
    parameter :'notification_ids[]', "IDs of events to be marked as read"

    let(:'notification_ids[]') { user.notifications[0..1].map(&:event_id) }

    required_parameters :'notification_ids[]'

    example_request "Mark notifications as read" do
      status.should == 200
    end
  end

  delete "/notifications/:id" do
    parameter :id, "ID of notification to be marked as deleted"

    let(:id) { user.notifications[0].id }

    required_parameters :id

    example_request "Mark notifications as deleted" do
      status.should == 200
    end
  end
end
