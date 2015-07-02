ActiveAdmin.register ChorusClass do

  menu priority: 4, label: 'Permissions'
#  menu label: 'Permissions'

  permit_params :name, :description

# See permitted parameters documentation:
# https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
#
# permit_params :list, :of, :attributes, :on, :model
#
# or
#
# permit_params do
#   permitted = [:permitted, :attributes]
#   permitted << :other if resource.something?
#   permitted
# end
  show do
    attributes_table do
      row :name
      row 'Parent Class',  chorus_class.parent_class_name
      row :created_at
    end
    panel "Operations for Class" do
      table_for chorus_class.operations do
        column :name
        column :description
      end
    end
  end

  index do
    # column 'User Name' do |user|
    #   link_to "#{user.username}", "/admin/users/#{user.id}"
    # end
    column 'Chorus Class' do |chorus_class|
      link_to "#{chorus_class.name}", admin_chorus_class_path(chorus_class.id)
    end
    column :operations do |chorus_class|
      attributes_table_for chorus_class do
        chorus_class.operations.each do |operation|
          a operation.name, href: "/admin/operations/#{operation.id}"
          #text_node "#{group.name.titleize}&nbsp;".html_safe
        end
      end
    end
  end

  form do |f|
    f.semantic_errors *f.object.errors.keys
    f.inputs 'Required Information' do
      f.input :id, :as => :hidden
      f.input :name, :input_html => { :style => 'width:200px;' }
      f.input :description,  :input_html => { :style => 'width:500px;' }
    end
    f.has_many :operations do |f_opr|
        if !f_opr.object.nil?
          # show the destroy checkbox only if it is an existing appointment
          # else, there's already dynamic JS to add / remove new appointments
          f_opr.input :_destroy, :as => :boolean, :label => "Destroy?"
        end
        f_opr.input :name, :input_html => { :style => 'width:200px;' }
        f_opr.input :description, :input_html => { :style => 'width:500px;' }
    end
    # f.inputs do
    #   f.has_many :roles, heading: 'Roles', allow_destroy: true, new_record: 'Add Roles' do |a|
    #     a.input :name
    #   end
    # end

    f.actions
  end

end
