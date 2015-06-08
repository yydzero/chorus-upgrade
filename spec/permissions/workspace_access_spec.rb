require "spec_helper"

describe WorkspaceAccess do
  let(:non_member) { users(:no_collaborators) }
  let(:admin) { users(:admin) }
  let(:member) { users(:the_collaborator) }
  let(:owner) { users(:owner) }
  let(:workspace) { workspaces(:public) }
  let(:private_workspace) { workspaces(:private) }
  let(:workspace_access) {
    controller = WorkspacesController.new
    stub(controller).current_user { user }
    WorkspaceAccess.new(controller)
  }

  let(:user) { non_member }

  describe ".members_for" do
    let(:workspace) { Object.new }

    context "user is admin" do
      it "returns all members" do
        mock(workspace).members

        described_class.members_for(admin, workspace)
      end
    end

    context "user is not admin" do
      it "calls workspace.members_accessible_to" do
        mock(workspace).members_accessible_to(user)
        described_class.members_for(user, workspace)
      end
    end
  end

  describe "#show?" do
    context "in a public workspace" do
      it "always allows access" do
        workspace_access.can?(:show, workspace).should be_true
      end
    end

    context "in a private workspace" do
      it "forbids access when the user is not a member nor admin" do
        workspace_access.can?(:show, private_workspace).should be_false
      end

      context "for a member" do
        let(:user) { member }
        it "allows access" do
          workspace_access.can?(:show, private_workspace).should be_true
        end
      end
    end
  end

  describe "#can_edit_sub_objects?" do
    it "doesn't allow non-members to edit workspace sub objects'" do
      workspace_access.can?(:can_edit_sub_objects, private_workspace).should be_false
    end

    context "for a member" do
      let(:user) { member }

      it "allows them to edit workspace sub objects" do
        workspace_access.can?(:can_edit_sub_objects, private_workspace).should be_true
      end

      it "does not allow archived workspace to have its sub objects edited" do
        private_workspace.archived = true
        workspace_access.can?(:can_edit_sub_objects, private_workspace).should be_false
      end
    end
  end

  describe "#update?" do
    it "doesn't allow non-members to edit'" do
      workspace_access.can?(:update, workspace).should be_false
    end

    context "for members" do
      let(:user) { member }
      it "allows edit of name and summary" do
        workspace.attributes = {:name => 'aardvark', :summary => 'not a summary'}
        workspace_access.can?(:update, workspace).should be_true
      end

      it "does not allow edit of other attributes" do
        workspace.attributes = {:public => false}
        workspace_access.can?(:update, workspace).should be_false
      end

      it "does not allow edit of show_sandbox_datasets" do
        workspace.attributes = {:show_sandbox_datasets => false}
        workspace_access.can?(:update, workspace).should be_false
      end
    end

    context "for owners" do
      let(:user) { owner }
      it "allows the owner to edit anything" do
        workspace.attributes = {:public => false}
        workspace_access.can?(:update, workspace).should be_true
      end

      it "allows the owner to change the owner" do
        workspace.attributes = {:owner_id => member.id}
        workspace_access.can?(:update, workspace).should be_true
      end

      context "with an updated sandbox" do
        context "when user can show_contents? of the dataset data source" do
          it "allows update" do
            schema = schemas(:other_schema)
            any_instance_of(GpdbDataSourceAccess) do |data_source_access|
              mock(data_source_access).show_contents?(schema.data_source) { true }
            end
            workspace.sandbox_id = schema.id
            workspace_access.can?(:update, workspace).should be_true
          end
        end

        context "when user can not show_contents? of the dataset data source" do
          it "does not allow update" do
            schema = schemas(:other_schema)
            any_instance_of(GpdbDataSourceAccess) do |data_source_access|
              mock(data_source_access).show_contents?(schema.data_source) { false }
            end
            workspace.sandbox_id = schema.id
            workspace_access.can?(:update, workspace).should be_false
          end
        end
      end
    end
  end

  describe "#owner?" do
    context "the owner" do
      let(:user) { owner }
      it "allows the owner" do
        workspace_access.can?(:owner, workspace).should be_true
      end
    end

    context "a member" do
      let(:user) { member }
      it "does not allow a member" do
        workspace_access.can?(:owner, workspace).should be_false
      end
    end

    context "a non-member" do
      let(:user) { non_member }
      it "does not allow a member" do
        workspace_access.can?(:owner, workspace).should be_false
      end
    end
  end
end
