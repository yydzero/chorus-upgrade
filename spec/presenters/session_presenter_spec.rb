require 'spec_helper'

describe SessionPresenter, :type => :view do
  let(:user) { users(:owner) }
  let(:session) { Session.create!(:username => user.username, :password => SPEC_PASSWORD) }
  let(:options) { {} }
  let(:presenter) { SessionPresenter.new(session, view, options) }
  before(:each) do
    stub(LdapClient).enabled? { false } # We should have a separate test config to avoid stuff like this
  end

  describe "#to_hash" do
    let(:hash) { presenter.to_hash }

    it "includes the right keys" do
      hash.should have_key(:session_id)
      hash.should have_key(:user)
    end

    it "uses the user presenter to present the user" do
      hash[:user].should == (UserPresenter.new(session.user, view).presentation_hash)
    end
  end

  describe "complete_json?" do
    it "is true" do
      presenter.complete_json?.should be_true
    end
  end
end
