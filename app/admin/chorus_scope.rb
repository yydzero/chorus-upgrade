ActiveAdmin.register ChorusScope do

  menu priority: 4

# See permitted parameters documentation:
# https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
#
permit_params :name, :description
#
# or
#
# permit_params do
#   permitted = [:permitted, :attributes]
#   permitted << :other if resource.something?
#   permitted
# end

  index do
    column 'id' do |chorus_scope|
      link_to "#{chorus_scope.id}", "/admin/chorus_scopes/#{chorus_scope.id}"
    end
    column :name
    column :group

    # column 'group' do |chorus_scope|
    #   link_to "#{chorus_scope.group.name}", "/admin/group/#{chorus_scope.id}"
    # end

    column :description


    #actions

  end

  controller do
    def scoped_collection
      super.includes :group
    end
  end

end
