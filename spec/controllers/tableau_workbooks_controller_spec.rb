require 'spec_helper'

describe TableauWorkbooksController do
  let(:user) { users(:owner) }
  let(:save_status) { true }

  before do
    log_in user
    any_instance_of(TableauWorkbook) do |wb|
      mock(wb).save.times(any_times) { save_status }
    end
  end

  describe '#create' do
    let(:dataset) { datasets(:default_table) }
    let(:workspace) { workspaces(:public)}
    let(:name) { 'myTableauWorkbook' }
    let(:params) { extra_options.merge( {
                      :dataset_id => dataset.id,
                      :workspace_id => workspace.id,
                      :name => name,
                      :tableau_username => 'chorusadmin',
                      :tableau_password => 'secret',
                      :tableau_site_name => 'myCustomSite',
                      :tableau_project_name => 'Default'})
                 }

    let(:extra_options) { {} }

    generate_fixture 'tableauWorkbook.json' do
      post :create, params
    end

    context 'when the dataset is a table' do
      let(:dataset) { datasets(:default_table) }

      it 'instantiates the workbook with the table name' do
        mock.proxy(TableauWorkbook).new(hash_including(:db_relname => dataset.name))
        post :create, params
      end
    end

    context 'when the dataset is a chorus view' do
      let(:dataset) { datasets(:chorus_view) }

      it 'instantiates the workbook with the sql query' do
        mock.proxy(TableauWorkbook).new(hash_including(:query => dataset.query))
        post :create, params
      end
    end

    it 'is authenticated' do
      mock(subject).authorize! :can_edit_sub_objects, workspace
      post :create, params
      response.code.should == '201'
    end

    it 'returns 201 created with data when the save succeeds' do
      any_instance_of(TableauWorkbookPublication) do |workbook|
        stub(workbook).workbook_url { 'foo.com' }
        stub(workbook).project_url { 'foo.com/projects' }
      end
      post :create, params
      response.code.should == '201'
      decoded_response.name.should == 'myTableauWorkbook'
      decoded_response.url.should == 'foo.com'
      decoded_response.project_url.should == 'foo.com/projects'
    end

    it 'should create a TableauWorkbookPublished event' do
      post :create, params
      the_event = Events::Base.last
      the_event.action.should == 'TableauWorkbookPublished'
      the_event.dataset.should == dataset
      the_event.workspace.should == workspace
      the_event.workbook_name.should == 'myTableauWorkbook'
      the_event.site_name.should == 'myCustomSite'
    end

    it 'creates a tableau publication when the save succeeds' do
      post :create, params
      twp = dataset.tableau_workbook_publications.find_by_name('myTableauWorkbook')
      twp.dataset_id.should == dataset.id
      twp.workspace_id.should == workspace.id
    end

    context 'when not creating a tableau workfile' do
      let(:extra_options) { { :create_work_file => false } }

      it 'should not create a tableau workfile' do
        expect {
          post :create, params
        }.not_to change { Workfile.count }
      end

      it 'should only create one event, for publishing the tableau workbook' do
        expect {
          post :create, params
        }.to change { Events::Base.count }.by(1)
      end
    end

    context 'when also creating tableau workfile' do
      let(:extra_options) { { :create_work_file => true } }

      it 'should save a workfile' do
        expect {
          post :create, params
        }.to change { LinkedTableauWorkfile.count }.by(1)
      end

      it 'should associate the publication with the workfile' do
        post :create, params
        publication = TableauWorkbookPublication.find(decoded_response.id)
        LinkedTableauWorkfile.last.tableau_workbook_publication.should == publication
      end

      context 'when the name conflicts with an existing workfile' do
        it 'does not save the workbook to the tableau server and returns 422' do
          post :create, params
          response.code.should == '201'
          post :create, params
          response.code.should == '422'
          decoded_errors.fields.file_name.should have_key('TAKEN')
        end
      end

      it 'should add two events, for both publishing the workbook and creating the workfile' do
        any_instance_of(TableauWorkbookPublication) do |workbook|
          stub(workbook).workbook_url { 'foo.com' }
        end

        expect {
          post :create, params
        }.to change { Events::Base.count }.by(2)
        event = Events::TableauWorkfileCreated.last
        event.dataset.should == dataset
        event.workfile.should == LinkedTableauWorkfile.last
        event.workspace.should == workspace
        event.workbook_name.should == 'myTableauWorkbook'
      end
    end

    context 'when the save fails' do
      let(:save_status) { false }

      before do
        any_instance_of(TableauWorkbook) do |wb|
          mock(wb).save.times(any_times) { false }
          mock(wb).errors.times(any_times) {
            errors = ActiveModel::Errors.new(wb)
            errors.add(:base, 'tableau is down')
            errors
          }
        end
      end

      it 'responds with error' do
        post :create, params
        response.code.should == '422'
        decoded_response = JSON.parse(response.body)
        error_message = decoded_response['errors']['fields']['general']['GENERIC']['message']
        error_message.should == 'tableau is down'
      end
    end
  end
end
