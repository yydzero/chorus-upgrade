ActiveAdmin.register Group do

  menu priority: 2

#  belongs_to :chorus_scope

# See permitted parameters documentation:
# https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
#
permit_params :name, :description, :users

  show do
    attributes_table do
      row :name
      row :description
      row 'Scope' do
        resource.chorus_scope.name if resource.chorus_scope != nil
      end
    end
    panel "Users in Group" do
      table_for group.users do
        column :full_name
        column :username
        column :created_at
      end
    end
  end

  index do
    selectable_column
    column 'Group' do |group|
      link_to "#{group.name}", admin_group_path(group.id)
    end
    column 'Scope' do |group|
      link_to "#{group.chorus_scope.name}", "/admin/chorus_scopes/#{group.chorus_scope.id}" if group.chorus_scope.nil? == false
    end
    column 'Users' do |group|
      str = ''
      group.users.each do |user|
        str << user.full_name  + ',&nbsp;'
      end
      text_node "#{str}".html_safe
    end
#    actions
  end

  filter :name
  filter :chorus_scope_id,  :as => :check_boxes, :collection => proc {ChorusScope.select([:name, :id]).collect{ |r| [r.name, r.id] }}

  controller do
    def new
      @group = Group.new
      @scopes = ChorusScope.all
      @users = User.all
    end


    def create
      group = Group.create!(:name => params[:group][:name], :description => params[:group][:description])

      users = params[:group][:users]
      users.each do |key, value|
        group.users << User.find(key)
      end
      redirect_to '/admin/groups'
    end

    def update
      group = Group.find(params[:group][:id])
      group.update!(:name => params[:group][:name], :description => params[:group][:description])
      group.users.delete_all
      users = params[:group][:users]
      users.each do |key, value|
        group.users << User.find(key)
      end
      scope = ChorusScope.find_by_name(params[:group][:scope])
      if scope != nil
        group.chorus_scope = scope
      end
      group.save!
      redirect_to "/admin/groups/#{params[:group][:id]}"
    end

    # def show
    #   @group =  Group.find(params[:id])
    #   @users = @group.users
    # end

    def edit
      @group = Group.find(params[:id])
      @scopes = ChorusScope.all
      @users = User.all
    end

  end



  form(:html => { :multipart => true }) do |f|
    f.semantic_errors *f.object.errors.keys

    f.inputs 'Required Information' do
      f.input :id, :as => :hidden
      f.input :name
      f.input :description
    end
    f.inputs 'Add to Scope' do
      f.template.render  partial: 'scope'
    end
    f.inputs 'Add Users' do
      f.template.render  partial: 'users'
    end
    actions
  end



#
# or
#
# permit_params do
#   permitted = [:permitted, :attributes]
#   permitted << :other if resource.something?
#   permitted
# end


end
