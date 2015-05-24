require 'spec_helper'

describe CommentsController do
  let(:event) { events(:note_on_public_workfile) }
  let(:event_author) { users(:owner) }
  let(:first_commenter) { users(:the_collaborator) }
  let(:second_commenter) { users(:admin) }

  before do
    log_in commenter
  end

  let(:commenter) { event_author }

  describe "#create" do
    let(:params) do
      {
        event_id: event.id,
        body: 'hello world in jasmine test!'
      }
    end

    it "uses authorization" do
      mock(subject).authorize! :create_comment_on, Comment, event
      post :create, params
    end

    it "should post with appropriate response" do
      post :create, params
      response.code.should == "201"
    end

    it "should create make the current user the author" do
      post :create, params
      Comment.find_by_body(params[:body]).author.should == commenter
    end
    
    it 'sanitizes the body of the note' do
      params[:body] = "<b>not evil</b><script>alert('evil')</script>"
      post :create, params
      decoded_response.body.should == '<b>not evil</b>'
    end

    context "when event author comments" do
      before do
        Comment.create!({:event => event, :author => first_commenter, :body => "Nice event"}, :without_protection => true)
        Comment.create!({:event => event, :author => second_commenter, :body => "Great event"}, :without_protection => true)
        post :create, params
      end

      it "notifies the other commenters" do
        [first_commenter, second_commenter].each do |recipient|
          Notification.where(:recipient_id => recipient.id,
                             :event_id => event.id,
                             :comment_id => Comment.last.id
          ).should exist
        end
      end

      it "doesn't notify the event author" do
        Notification.where(:recipient_id => event_author.id, :event_id => event.id).should_not exist
      end
    end

    context "when someone else comments" do
      let(:commenter) { first_commenter }

      before do
        Comment.create!({:event => event, :author => second_commenter, :body => "I am a second comment"}, :without_protection => true)
        post :create, params
      end

      it "notifies the event author" do
        Notification.where(:recipient_id => event_author.id, :event_id => event.id).should exist
      end

      it "doesn't notify the current commenter" do
        Notification.where(:recipient_id => commenter.id, :event_id => event.id).should_not exist
      end

      it "notifies other commenters" do
        Notification.where(:recipient_id => second_commenter.id, :event_id => event.id).should exist
      end
    end

    context "when some user's have commented multiple times" do
      before do
        Comment.create!(:event_id => event.id, :author_id => event_author.id, :body => "I comment on myself")
        Comment.create!(:event_id => event.id, :author_id => first_commenter.id, :body => "Great event")
        Comment.create!(:event_id => event.id, :author_id => first_commenter.id, :body => "Great event again")
      end

      let(:commenter) { second_commenter }

      it "only notifies the same user once" do
        expect {
          expect {
            post :create, params
          }.to change {
            Notification.where(:recipient_id => event_author.id, :event_id => event.id).count
          }.by(1)
        }.to change {
          Notification.where(:recipient_id => first_commenter.id, :event_id => event.id).count
        }.by(1)
      end
    end

    context "when the event is not a note" do
      let(:event) { events(:owner_creates_gpdb_data_source) }
      let(:commenter) { users(:the_collaborator) }

      before do
        Comment.create!({:event => event, :author => commenter, :body => "I am a comment"}, :without_protection => true)
        post :create, params
      end

      it "does not notify the event actor" do
        Notification.where(:recipient_id => event_author.id, :event_id => event.id).should_not exist
      end
    end
  end

  describe "#show" do
    let(:comment) { Comment.new({:event_id => event.id, :body => "Comment on a note", :author_id => commenter.id}) }
    before do
      comment.save!
    end

    it "uses authorization" do
      mock(subject).authorize! :show, comment
      get :show, :id => comment.id
    end

    it "presents the comment" do
      get :show, :id => comment.id
      decoded_response.body.should == "Comment on a note"
    end

    generate_fixture "comment.json" do
      get :show, :id => comment.id
    end
  end

  describe "#destroy" do
    before do
      @comment = Comment.new({:event_id => event.id, :author_id => commenter.id, :body => "Delete me!"})
      @comment.save!
    end

    it "uses authorization" do
      mock(subject).authorize! :destroy, @comment
      delete :destroy, :id => @comment.id
    end

    describe "deleting" do
      before do
        delete :destroy, :id => @comment.id
      end

      it "should soft delete the comment" do
        comment = Comment.find_with_destroyed(@comment.id)
        comment.deleted_at.should_not be_nil
      end

      it "should respond with success" do
        response.should be_success
      end
    end
  end
end