require 'spec_helper'

describe PgDataSourcePresenter, :type => :view do
  let(:pg_data_source) { data_sources(:postgres) }
  let(:user) { pg_data_source.owner }
  let(:presenter) { PgDataSourcePresenter.new(pg_data_source, view, options) }
  let(:options) { {} }

  before do
    set_current_user(user)
  end

  describe '#to_hash' do
    let(:hash) { presenter.to_hash }

    it 'includes the right keys' do
      hash.should have_key(:name)
      hash.should have_key(:port)
      hash.should have_key(:host)
      hash.should have_key(:id)
      hash.should have_key(:owner)
      hash.should have_key(:shared)
      hash.should have_key(:online)
      hash.should have_key(:db_name)
      hash.should have_key(:description)
      hash.should have_key(:data_source_provider)
      hash.should have_key(:version)
      hash.should have_key(:is_deleted)
      hash[:entity_type].should == 'pg_data_source'
    end

    it 'should use ownerPresenter Hash method for owner' do
      owner = hash[:owner]
      owner.to_hash.should == (UserPresenter.new(user, view).presentation_hash)
    end

    it_behaves_like 'activity stream data source presenter'
    it_behaves_like :succinct_data_source_presenter
  end
end
