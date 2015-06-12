ActiveAdmin.register Role do

  active_admin_importable

  menu priority: 3

  config.comments = false

  #belongs_to :user

  # See permitted parameters documentation:
  # https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
  #
  permit_params :name, :description

  index do
    column 'Role' do |role|
      link_to "#{role.name}", admin_role_path(role.id)
    end
    column 'Permissions' do |role|
      str = "<ul>"
      role.permissions.each do |p|
        str << "<li><b>#{p.chorus_class.name}:&nbsp;</b>"
        perms = role.permissions_for(p.chorus_class.name)
        perms.each do |p|
          str << p.to_s + "&nbsp;|&nbsp;"
        end
        str << "</li>"
      end
      str << "</ul>"
      text_node "#{str}".html_safe
    end
  end

  controller do
    def new
      @role = Role.new
      @operations = {}
      @operations['workspace'] = ChorusClass.find_by_name('Workspace').operations
      @operations['user'] = ChorusClass.find_by_name('User').operations
    end

    def create
      role = Role.create!(:name => params[:role][:name], :description => params[:role][:description])
      %w(workspace user).each do |class_name|
        sym_array = []
        clazz = class_name.camelize.constantize
        permissions = params[:role]["#{class_name}-permissions"]
        if permissions != nil
          permissions.each do |key, value|
            sym_array << value.to_sym
          end
          puts   "---- permissions for #{class_name} -------"
          puts sym_array.inspect
          puts "---------------------------------------"

          clazz.set_permissions_for(role, sym_array)
        end
      end
      redirect_to '/admin/roles'
    end



  end
  #
  # or
  #
  # permit_params do
  #   permitted = [:permitted, :attributes]
  #   permitted << :other if resource.something?
  #   permitted
  # end

filter :name
filter :groups_id,  :as => :check_boxes, :collection => proc {Group.select([:name, :id]).collect{ |r| [r.name, r.id] }}


  form(:html => { :multipart => true }) do |f|
    f.semantic_errors *f.object.errors.keys

    f.inputs "Required Information" do
      f.input :name
      f.input :description
    end
    f.inputs "Permissions" do
      f.template.render  partial: 'permissions'
    end

    actions

    # f.inputs do
    #   f.has_many :permissions, heading: 'Permissions', new_record: 'Add Permissions' do |p|
    #     p.input :permissions_mask
    #     #p.input :permissions_mask, :as => :select, :collection => Operation.where("chorus_class_id = 10734").pluck('name')
    #     #p.input :permissions_mask, :as => :check_boxes, :collection => Operation.where(:ChorusClass => p.ChorusClass).all.pluck('name')
    #     #p.input :chorus_class_id
    #   end
    # end

  end

end
