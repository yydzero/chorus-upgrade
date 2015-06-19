
ActiveAdmin.register User do

  active_admin_importable

  #belongs_to :group

  menu priority: 1 # so it's on the very left
  # Turn of commenting feature
  config.comments = false
# See permitted parameters documentation:
# https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
#
permit_params :first_name, :last_name, :email, :username, :created_at

# sidebar 'Roles for this User', :only => :show do
#   table_for Role.joins(:user).where(:user_id => user.id) do |t|
#     t.column("Role") { |role| role.name }
#   end
# end

  show do
    attributes_table do
      row :full_name
      row :description
      row 'Groups' do
        table_for resource.groups do
          column :name
          column :description
        end
      end
      row 'Roles' do
        table_for resource.roles do
          column :name
          column :description
        end
      end
      row 'Workspaces' do
        table_for resource.owned_workspaces do
          column :name
          column :summary
        end
      end

    end
    # panel "Users in Group" do
    #   table_for group.users do
    #     column :full_name
    #     column :username
    #     column :created_at
    #   end
    # end
  end

index do
  column 'User Name' do |user|
    link_to "#{user.username}", admin_user_path(user.id)
  end
  column :first_name
  column :last_name
  column :email
  column :created_at

  column :groups do |user|
    attributes_table_for user do
      user.groups.each do |group|
        a group.name, href: "/admin/groups/#{group.id}"
        #text_node "#{group.name.titleize}&nbsp;".html_safe
      end
    end
  end

  column :roles do |user|
    attributes_table_for user do
      user.roles.each do |role|
        a role.name, href: "/admin/roles/#{role.id}"
        #text_node "#{role.name.titleize}&nbsp;".html_safe
      end
    end
  end

  # column :groups do |user|
  #   table_for user.groups do
  #     column '', :name
  #   end
  # end
end

filter :username
filter :roles_id, :as => :check_boxes, :collection => proc {Role.select([:name, :id]).collect{ |r| [r.name, r.id] }}
#filter :roles
filter :groups_id, :as => :check_boxes, :collection => proc {Group.select([:name, :id]).collect{ |r| [r.name, r.id] }}
filter :workspaces

# Avoids n+1 queries.
controller do
  def scoped_collection
    super.includes :groups, :roles
  end

  def show

  end


  def update
    user = User.find(params[:id])
    user.update_attributes(params[:user])
    group_ids = params[:user][:group_ids]
    group_ids.delete("")
    user.groups.delete_all
    group_ids.each do |id|
      user.groups << Group.find(id)
    end
    user.roles.delete_all
    role_ids = params[:user][:role_ids]
    role_ids.delete("")
    role_ids.each do |id|
      user.roles << Role.find(id)
    end
    user.save!
    redirect_to "/admin/users/#{params[:id]}"
  end


end

csv do
  column :first_name
  column :last_name
  column :username
  column :email
  column :created_at
end

index download_links: [:xml, :json]

form do |f|
  f.semantic_errors *f.object.errors.keys
  f.inputs "Required Information" do
    f.input :first_name, :input_html => { :maxlength => 30 }
    f.input :last_name, :input_html => { :size => 30 }
    f.input :username, :input_html => { :size => 16 }
    f.input :email, :input_html => { :size => 30 }
    f.input :admin, :as => :radio
    f.input :developer, :as => :radio
    f.input :password, :input_html => { :size => 16 }
    f.input :password_confirmation, :input_html => { :size => 16 }
    f.input :groups, :as => :check_boxes
    f.input :roles, :as => :check_boxes
  end

   # f.inputs do
   #   f.has_many :roles, heading: 'Roles', allow_destroy: true, new_record: 'Add Roles' do |a|
   #     a.input :name
   #   end
   # end

  f.actions
end

end
