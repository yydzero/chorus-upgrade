require 'spec_helper'

resource "Notes" do
  let(:user) { users(:owner) }
  let(:note) { events(:note_on_hdfs_file) }
  let(:hdfs_file) { HdfsEntry.files.first }
  let(:attachment) { attachments(:sql) }

  before do
    log_in user
  end

  post "/notes" do
    parameter :body, "Text body of the note"
    parameter :entity_type, "Type of object the note is being posted on"
    parameter :entity_id, "Id of the object the note is being posted on"
    parameter :is_insight, "Promote this note to an insight?"

    let(:body) { note.body }
    let(:gpdb_data_source) { data_sources(:owners) }
    let(:entity_type) { "gpdb_data_source" }
    let(:entity_id) { gpdb_data_source.id }

    example_request "Post a new note/insight on an entity" do
      status.should == 201
    end
  end

  put "/notes/:id" do
    parameter :id, "Note id"
    parameter :body, "New text body of the note"

    required_parameters :id

    let(:id) { note.id }
    let(:body) { "New text" }

    example_request "Changes the body of a note" do
      status.should == 200
    end
  end

  delete "/notes/:id" do
    parameter :id, "Note id"

    required_parameters :id

    let(:id) { note.id }

    example_request "Delete a note" do
      status.should == 200
    end
  end

  post "/notes/:note_id/attachments" do
    parameter :note_id, "Note id"
    parameter :contents, "File contents"

    required_parameters :note_id, :contents

    let(:note_id) { note.id }
    let(:contents) { test_file("small1.gif") }

    example_request "Attach the contents of a file to a note" do
      status.should == 200
    end
  end

  post "/notes/:note_id/attachments" do
    parameter :note_id, "Note id"
    parameter :svg_data, "SVG File contents"

    required_parameters :note_id, :svg_data

    let(:note_id) { note.id }
    let(:svg_data) { test_file("SVG-logo.svg").read }

    example_request "Attach a visualization to a note" do
      status.should == 200
    end
  end

  get "/notes/:note_id/attachments/:id" do
    parameter :note_id, "Note id"
    parameter :id, "Attachment id"

    required_parameters :note_id, :id

    let(:note_id) { note.id }
    let(:id) { attachment.id }

    example_request "Get the contents of an attachment" do
      status.should == 200
    end
  end
end
